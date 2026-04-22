import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { serializeAlert } from "@/app/api/alert/util/serializeAlert";
import { isAlertStatus } from "@/app/api/alert/util/types";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const alertId = resolvedParams.id;
    const { userId, status } = await request.json();

    if (!alertId) {
      return NextResponse.json({ error: "Alert ID is required." }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Admin user ID is required." }, { status: 400 });
    }

    if (!isAlertStatus(status)) {
      return NextResponse.json({ error: "Invalid alert status." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const updatedAlert = await prisma.alert.update({
      where: { id: alertId },
      data: { status },
    });

    const formattedAlert = await serializeAlert(updatedAlert);

    return NextResponse.json({
      success: true,
      message: `Alert moved to ${status}.`,
      alert: formattedAlert,
    });
  } catch (error) {
    console.error("Error updating alert status:", error);
    return NextResponse.json({ error: "Failed to update alert status." }, { status: 500 });
  }
}
