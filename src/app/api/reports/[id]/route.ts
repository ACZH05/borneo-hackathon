import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Missing required field: status" },
        { status: 400 }
      );
    }

    const updatedReport = await prisma.incidentReport.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message: "Report status updated successfully!",
      report: updatedReport,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update report";

    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    if (message === "Forbidden") {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}