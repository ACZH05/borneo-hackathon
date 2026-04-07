import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export const dynamic = "force-dynamic";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function getLatestPendingConsent(userId: string) {
  const consentRequest = await prisma.emergencyContactConsentRequest.findFirst({
    where: {
      requesterUserId: userId,
      status: "pending",
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!consentRequest) {
    return null;
  }

  return {
    email: consentRequest.pendingEmail,
    status: consentRequest.status,
    expiresAt: consentRequest.expiresAt,
    createdAt: consentRequest.createdAt,
  };
}

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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        rescueCard: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const pendingEmergencyContactConsent = await getLatestPendingConsent(user.id);

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        pendingEmergencyContactConsent,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
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

    const body = await request.json();
    const { name, regionCode } = body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(regionCode && { regionCode }),
      },
      include: {
        rescueCard: true,
      },
    });

    const pendingEmergencyContactConsent = await getLatestPendingConsent(updatedUser.id);

    return NextResponse.json({
      success: true,
      user: {
        ...updatedUser,
        pendingEmergencyContactConsent,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
