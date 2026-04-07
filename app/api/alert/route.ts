export const dynamic = 'force-dynamic'; // <-- This stops Next.js from caching!

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { inferMalaysiaStateFromCoordinates, normalizeMalaysiaState } from '@/app/api/alert/util/malaysiaState';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// --- POST: Admin creates a new broadcast alert ---
export async function POST(request: Request) {
  try {
    const { userId, regionCode, hazardType, severity, title, body, lat, lng } = await request.json();

    // Verify the user is an admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const alert = await prisma.alert.create({
      data: {
        createdBy: user.id,
        regionCode: regionCode || "ALL", // Default to broadcasting to everyone if not specified
        hazardType, // "flood", "landslide", etc.
        severity,   // "priority", "warning", or "monitor"
        title,
        body,
        lat,
        lng,
        notes: "Generated via Aegis System"
      }
    });

    return NextResponse.json({ success: true, alert }, { status: 201 });
  } catch (error) {
    console.error("Error saving alert:", error);
    return NextResponse.json({ error: 'Failed to save alert' }, { status: 500 });
  }
}

// --- GET: Frontend fetches all alerts for the Feed ---
export async function GET() {
  try {
    const alerts = await prisma.alert.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const formattedAlerts = await Promise.all(alerts.map(async (alert) => {
      const dateObj = new Date(alert.createdAt);
      
      const dateStr = dateObj.toISOString().split('T')[0]; 
      
      const timeStr = dateObj.toLocaleTimeString('en-US', { 
        hour: '2-digit', minute: '2-digit', hour12: true 
      });
      const normalizedState =
        normalizeMalaysiaState(alert.regionCode) ??
        await inferMalaysiaStateFromCoordinates(alert.lat, alert.lng);

      return {
        id: alert.id,
        severity: alert.severity, 
        hazardType: alert.hazardType, 
        title: alert.title,
        body: alert.body,
        date: dateStr,
        time: timeStr,
        regionCode: alert.regionCode,
        stateName: normalizedState,
        lat: alert.lat,
        lng: alert.lng,
        status: alert.status 
      };
    }));

    return NextResponse.json({ success: true, alerts: formattedAlerts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}
