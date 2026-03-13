import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Initialize Database Adapter
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

export async function PATCH(
  request: Request,
  // 1. Tell TypeScript that params is a Promise now
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 2. UNWRAP THE PROMISE (This is the Next.js 15+ fix!)
    const resolvedParams = await params;
    const reportId = resolvedParams.id;

    // 3. Get the new status from the Responder's request
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Missing required field: status" },
        { status: 400 },
      );
    }

    // 4. Update the specific report in the database using the unwrapped ID
    const updatedReport = await prisma.incidentReport.update({
      where: {
        id: reportId,
      },
      data: {
        status: status,
      },
    });

    // 5. Return success
    return NextResponse.json({
      success: true,
      message: "Report status updated successfully!",
      report: updatedReport,
    });
  } catch (error) {
    console.error("Error updating SOS report:", error);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Fetch ONLY the reports belonging to this user
    const reports = await prisma.incidentReport.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, regionCode: true } },
      },
    });

    return NextResponse.json({ success: true, reports }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch user reports" },
      { status: 500 },
    );
  }
}
