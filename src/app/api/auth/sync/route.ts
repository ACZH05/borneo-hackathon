import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // These come straight from the Supabase session on the frontend
    const { id, email, name } = body;

    if (!id || !email) {
      return NextResponse.json({ error: "Missing required user data." }, { status: 400 });
    }

    // UPSERT: If they already exist, update them. If it's their first time, create them!
    const user = await prisma.user.upsert({
      where: { id: id }, // We use the exact Supabase Auth UUID here
      update: {
        email: email,
        name: name,
      },
      create: {
        id: id,
        email: email,
        name: name || "Resident",
        role: "resident", // Automatically assigns them the resident role!
      }
    });

    return NextResponse.json({ success: true, message: "User synced to database!", user }, { status: 200 });

  } catch (error) {
    console.error("Auth sync error:", error);
    return NextResponse.json({ error: 'Failed to sync user data' }, { status: 500 });
  }
}