import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // Securely check Prisma for the user (bypasses Supabase frontend RLS)
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (user) {
      return NextResponse.json({ exists: true });
    } else {
      return NextResponse.json({ exists: false });
    }
  } catch (error) {
    return NextResponse.json({ exists: false, error: "Failed to check email" }, { status: 500 });
  }
}