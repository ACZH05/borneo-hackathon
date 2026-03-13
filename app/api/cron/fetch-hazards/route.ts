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

    // 3. MOCK DATA: 5 Fake Alerts with EXACT Region Codes!
    const weatherData = {
      alerts: {
        alert: [
          {
            event: "Severe Flood Warning",
            desc: "Heavy monsoon rains have caused the Skudai River to overflow. Evacuate immediately.",
            severity: "Priority",
            lat: 1.4927,
            lon: 103.7414,
            regionCode: "MY-01" // Johor
          },
          {
            event: "Landslide Alert",
            desc: "Soil erosion detected near Bukit Bendera due to continuous rain. Avoid the area.",
            severity: "Warning",
            lat: 5.4141,
            lon: 100.3288,
            regionCode: "MY-07" // Pulau Pinang
          },
          {
            event: "Flash Flood Watch",
            desc: "Rapid water rise reported in the city center near Masjid Jamek. Traffic is at a standstill.",
            severity: "Warning",
            lat: 3.1390,
            lon: 101.6869,
            regionCode: "MY-14" // Kuala Lumpur
          },
          {
            event: "Strong Winds & Rough Seas",
            desc: "Wind speeds exceeding 60km/h expected along the east coast. Small boats should not go out to sea.",
            severity: "Monitor",
            lat: 3.8126,
            lon: 103.3256,
            regionCode: "MY-06" // Pahang
          },
          {
            event: "Unhealthy Air Quality",
            desc: "API levels have crossed the unhealthy threshold due to local hotspots. Wear masks outdoors.",
            severity: "Monitor",
            lat: 1.5535,
            lon: 110.3593,
            regionCode: "MY-13" // Sarawak
          }
        ]
      }
    };

    // 4. PROCESS ALERTS
    if (weatherData.alerts && weatherData.alerts.alert.length > 0) {
      
      let newAlertCount = 0;

      for (const alertData of weatherData.alerts.alert) {
        // Prevent saving duplicates
        const existingAlert = await prisma.alert.findFirst({
          where: { title: alertData.event }
        });

        if (!existingAlert) {
          await prisma.alert.create({
            data: {
              createdBy: systemAdmin.id,
              regionCode: alertData.regionCode, // 🚨 Now using the specific Region Code!
              hazardType: "weather",
              severity: alertData.severity, 
              title: alertData.event,
              body: alertData.desc,
              status: "draft",
              lat: alertData.lat, 
              lng: alertData.lon, 
            }
          });
          newAlertCount++;
        }
      }

      return NextResponse.json({ success: true, message: `Ingested ${newAlertCount} new Malaysian map test alerts.` });
    }

    return NextResponse.json({ success: true, message: "No active weather alerts at this time." });

  } catch (error) {
    console.error("Cron Ingestion Error:", error);
    return NextResponse.json({ error: 'Failed to ingest hazard data' }, { status: 500 });
  }
}