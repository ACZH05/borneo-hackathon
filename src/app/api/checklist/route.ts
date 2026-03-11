import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function normalizeChecklist(checklist: unknown): Array<{ task: string; isCompleted: boolean }> {
  if (!Array.isArray(checklist)) return [];

  return checklist
    .filter((item) => typeof item === "object" && item !== null)
    .map((item) => {
      const typed = item as { task?: unknown; isCompleted?: unknown };
      return {
        task: typeof typed.task === "string" ? typed.task : "",
        isCompleted: Boolean(typed.isCompleted),
      };
    })
    .filter((item) => item.task.length > 0);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const plans = await prisma.emergencyPlan.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      plans: plans.map((plan) => ({
        ...plan,
        checklist: normalizeChecklist(plan.checklist),
      })),
    });
  } catch (error) {
    console.error("Error fetching checklist history:", error);
    return NextResponse.json({ error: "Failed to fetch checklist history" }, { status: 500 });
  }
}
