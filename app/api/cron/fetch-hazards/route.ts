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
    // 2. FIND AN ADMIN
    const systemAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!systemAdmin) {
      return NextResponse.json({ error: 'No Admin user found to assign alerts to.' }, { status: 400 });
    }

    // 3. FETCH LIVE DATA: Real WeatherAPI connection
    const apiKey = process.env.WEATHER_API_KEY;
    const weatherRes = await fetch(`https://api.weatherapi.com/v1/alerts.json?key=${apiKey}&q=Malaysia`);
    const weatherData = await weatherRes.json();

    // Get the exact coordinates from the live API response
    const exactLat = weatherData.location?.lat || null; 
    const exactLng = weatherData.location?.lon || null;

    // 4. PROCESS ALERTS
    if (weatherData.alerts && weatherData.alerts.alert.length > 0) {
      
      let newAlertCount = 0;

      for (const alertData of weatherData.alerts.alert) {
        // Prevent saving duplicates by checking the title
        const existingAlert = await prisma.alert.findFirst({
          where: { title: alertData.event }
        });

        if (!existingAlert) {
          await prisma.alert.create({
            data: {
              createdBy: systemAdmin.id,
              regionCode: "MY-ALL", // Defaulting to ALL for live country-wide data
              hazardType: "weather",
              severity: alertData.severity || "warning", 
              title: alertData.event,
              body: alertData.desc,
              status: "draft",
              lat: exactLat, 
              lng: exactLng, 
            }
          });
          newAlertCount++;
        }
      }

      return NextResponse.json({ success: true, message: `Ingested ${newAlertCount} new live weather drafts.` });
    }

    return NextResponse.json({ success: true, message: "No active live weather alerts at this time." });

  } catch (error) {
    console.error("Cron Ingestion Error:", error);
    return NextResponse.json({ error: 'Failed to ingest hazard data' }, { status: 500 });
  }
}