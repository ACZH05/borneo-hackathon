import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg'; 

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!, 
});
const prisma = new PrismaClient({ adapter });

export async function GET(request: Request) {
  // 1. SECURITY CHECK: Ensure only Vercel can trigger this route
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized. Invalid Cron Secret.' }, { status: 401 });
  }

  try {
    // 2. FIND AN ADMIN: We need an admin's ID to attach to the alert since 'createdBy' is required
    const systemAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!systemAdmin) {
      return NextResponse.json({ error: 'No Admin user found to assign alerts to.' }, { status: 400 });
    }

    // 3. FETCH LIVE DATA: Using WeatherAPI.com (Free tier works great for hackathons)
    // We are passing 'Malaysia' to get regional alerts
    const apiKey = process.env.WEATHER_API_KEY;
    const weatherRes = await fetch(`https://api.weatherapi.com/v1/alerts.json?key=${apiKey}&q=Japan`);
    const weatherData = await weatherRes.json();

    // 4. PROCESS ALERTS: Check if the API returned any active disaster warnings
    if (weatherData.alerts && weatherData.alerts.alert.length > 0) {
      
      let newAlertCount = 0;

      for (const alertData of weatherData.alerts.alert) {
        // We use 'upsert' or check existence so we don't save the same storm 50 times!
        const existingAlert = await prisma.alert.findFirst({
          where: { title: alertData.event }
        });

        if (!existingAlert) {
          await prisma.alert.create({
            data: {
              createdBy: systemAdmin.id,     // Assigned to our admin
              regionCode: "MY-ALL",          // Defaulting to a general code, can be parsed later
              hazardType: "weather",         // Generic hazard type
              severity: alertData.severity || "warning", 
              title: alertData.event,        // e.g., "Heavy Rain Warning"
              body: alertData.desc,          // The full description from the met department
              status: "draft",               // 🚨 SAVED AS DRAFT!
            }
          });
          newAlertCount++;
        }
      }

      return NextResponse.json({ success: true, message: `Ingested ${newAlertCount} new draft alerts.` });
    }

    return NextResponse.json({ success: true, message: "No active weather alerts at this time." });

  } catch (error) {
    console.error("Cron Ingestion Error:", error);
    return NextResponse.json({ error: 'Failed to ingest hazard data' }, { status: 500 });
  }
}