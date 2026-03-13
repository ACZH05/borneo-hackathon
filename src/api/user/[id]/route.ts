import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg'; 

// 🚨 KILLS NEXT.JS SERVER CACHING FOREVER FOR THIS ROUTE
export const dynamic = 'force-dynamic'; 

// 1. Initialize Database Adapter
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!, 
});
const prisma = new PrismaClient({ adapter });  

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Fetch the user from your database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      // 🚨 CHANGED FROM 'select' TO 'include' TO GUARANTEE THE RESCUE CARD LOADS
      include: {
        rescueCard: true, 
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user }, { status: 200 });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // 1. Get the new data from the frontend
    const body = await request.json();
    const { name, regionCode } = body;

    // 2. Update the user in the Prisma database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(regionCode && { regionCode }),
      },
      include: {
        rescueCard: true, // Keep the rescue card attached when returning updated user
      }
    });

    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}