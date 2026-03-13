import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Setup your specific PostgreSQL adapter so the database doesn't crash!
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  try {
    // 1. Get the ID of the draft alert we want to publish
    const { alertId } = await request.json();

    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 });
    }

    // 2. Update the status in the database to 'published'
    const publishedAlert = await prisma.alert.update({
      where: { id: alertId },
      data: { status: 'published' }
    });

    return NextResponse.json({ success: true, alert: publishedAlert });

  } catch (error) {
    console.error("Error publishing alert:", error);
    return NextResponse.json({ error: 'Failed to publish alert' }, { status: 500 });
  }
}