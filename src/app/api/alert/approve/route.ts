import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // 1. Get the ID of the draft alert we want to publish
    const { alertId } = await request.json();

    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 });
    }

    // 2. Update the status in the database
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