export const dynamic = 'force-dynamic'; // <-- This stops Next.js from caching!

import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { serializeAlert } from '@/app/api/alert/util/serializeAlert';
import {
  ensureAlertSourceSchema,
  formatPrismaDebugError,
  isMissingAlertSourceColumnError,
} from '@/app/api/alert/util/ensureAlertSourceSchema';
import { isAlertSource, isAlertStatus } from '@/app/api/alert/util/types';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function parseOptionalNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

// --- POST: Admin creates a new broadcast alert ---
export async function POST(request: Request) {
  try {
    const { userId, regionCode, hazardType, severity, title, body, lat, lng, source } = await request.json();

    // Verify the user is an admin
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const nextSource = isAlertSource(source) ? source : "user_report";
    let alert;

    try {
      alert = await prisma.alert.create({
        data: {
          createdBy: user.id,
          regionCode: regionCode || "ALL", // Default to broadcasting to everyone if not specified
          source: nextSource,
          hazardType, // "flood", "landslide", etc.
          severity,   // "priority", "warning", or "monitor"
          title,
          body,
          lat: parseOptionalNumber(lat),
          lng: parseOptionalNumber(lng),
          notes: nextSource === "user_report" ? "Generated via Aegis System" : undefined,
        }
      });
    } catch (error) {
      if (!isMissingAlertSourceColumnError(error)) {
        throw error;
      }

      await ensureAlertSourceSchema((query) => prisma.$executeRawUnsafe(query));

      alert = await prisma.alert.create({
        data: {
          createdBy: user.id,
          regionCode: regionCode || "ALL",
          source: nextSource,
          hazardType,
          severity,
          title,
          body,
          lat: parseOptionalNumber(lat),
          lng: parseOptionalNumber(lng),
          notes: nextSource === "user_report" ? "Generated via Aegis System" : undefined,
        }
      });
    }

    const formattedAlert = await serializeAlert(alert);
    return NextResponse.json({ success: true, alert: formattedAlert }, { status: 201 });
  } catch (error) {
    console.error("Error saving alert:", error);
    return NextResponse.json({ error: 'Failed to save alert' }, { status: 500 });
  }
}

// --- GET: Frontend fetches all alerts for the Feed ---
export async function GET(request: Request) {
  let stage = "init";

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const source = searchParams.get("source");

    if (status && !isAlertStatus(status)) {
      return NextResponse.json({ error: "Invalid status filter." }, { status: 400 });
    }

    if (source && !isAlertSource(source)) {
      return NextResponse.json({ error: "Invalid source filter." }, { status: 400 });
    }

    const where: Prisma.AlertWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (source) {
      where.source = source;
    }

    let alerts;
    stage = "findMany";

    try {
      alerts = await prisma.alert.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      if (!isMissingAlertSourceColumnError(error)) {
        throw error;
      }

      await ensureAlertSourceSchema((query) => prisma.$executeRawUnsafe(query));

      alerts = await prisma.alert.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });
    }

    stage = "serialize";
    const formattedAlerts = await Promise.all(alerts.map((alert) => serializeAlert(alert)));

    return NextResponse.json({ success: true, alerts: formattedAlerts });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      {
        error: 'Failed to fetch alerts',
        ...(process.env.NODE_ENV !== "production"
          ? {
              debug: {
                stage,
                ...formatPrismaDebugError(error),
              },
            }
          : {}),
      },
      { status: 500 }
    );
  }
}
