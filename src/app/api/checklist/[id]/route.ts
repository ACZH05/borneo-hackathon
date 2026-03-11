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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const planId = resolvedParams.id;
    const body = await request.json();
    const checklist = normalizeChecklist(body.checklist);

    if (!planId) {
      return NextResponse.json({ error: "Missing plan id" }, { status: 400 });
    }

    const updatedPlan = await prisma.emergencyPlan.update({
      where: { id: planId },
      data: { checklist },
    });

    return NextResponse.json({
      success: true,
      plan: {
        ...updatedPlan,
        checklist: normalizeChecklist(updatedPlan.checklist),
      },
    });
  } catch (error) {
    console.error("Error updating checklist:", error);
    return NextResponse.json({ error: "Failed to update checklist" }, { status: 500 });
  }
}
