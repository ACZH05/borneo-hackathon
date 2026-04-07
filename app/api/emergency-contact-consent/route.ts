import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { buildGoogleMapsUrl, generateRescueCardQrCode } from "@/app/lib/server/rescue-card";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function isExpired(expiresAt: Date) {
  return expiresAt.getTime() < Date.now();
}

// This API route handles both GET and POST requests for emergency contact consent.
// GET: Used by the emergency contact to check the status of their consent request.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required." }, { status: 400 });
    }

    const consentRequest = await prisma.emergencyContactConsentRequest.findUnique({
      where: { token },
    });

    if (!consentRequest) {
      return NextResponse.json({ error: "Consent request not found." }, { status: 404 });
    }

    if (consentRequest.status === "pending" && isExpired(consentRequest.expiresAt)) {
      await prisma.emergencyContactConsentRequest.update({
        where: { id: consentRequest.id },
        data: { status: "expired" },
      });

      return NextResponse.json({
        success: true,
        consentRequest: {
          ...consentRequest,
          status: "expired",
        },
      });
    }

    return NextResponse.json({ success: true, consentRequest });
  } catch (error) {
    console.error("Consent request lookup error:", error);
    return NextResponse.json({ error: "Failed to load consent request." }, { status: 500 });
  }
}

// POST: Used by the emergency contact to approve or decline the consent request.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body?.token === "string" ? body.token : "";
    const action = typeof body?.action === "string" ? body.action : "";

    if (!token || !["approve", "decline"].includes(action)) {
      return NextResponse.json({ error: "A valid token and action are required." }, { status: 400 });
    }

    const consentRequest = await prisma.emergencyContactConsentRequest.findUnique({
      where: { token },
    });

    if (!consentRequest) {
      return NextResponse.json({ error: "Consent request not found." }, { status: 404 });
    }

    if (consentRequest.status !== "pending") {
      return NextResponse.json({
        success: true,
        message: `This request has already been ${consentRequest.status}.`,
        status: consentRequest.status,
      });
    }

    if (isExpired(consentRequest.expiresAt)) {
      await prisma.emergencyContactConsentRequest.update({
        where: { id: consentRequest.id },
        data: { status: "expired" },
      });

      return NextResponse.json({ error: "This consent request has expired." }, { status: 410 });
    }

    if (action === "decline") {
      await prisma.emergencyContactConsentRequest.update({
        where: { id: consentRequest.id },
        data: {
          status: "declined",
          declinedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        status: "declined",
        message: "You declined this emergency-contact request.",
      });
    }

    const requester = await prisma.user.findUnique({
      where: { id: consentRequest.requesterUserId },
      include: { rescueCard: true },
    });

    if (!requester) {
      return NextResponse.json({ error: "Requester not found." }, { status: 404 });
    }

    const rescueCard = requester.rescueCard;
    const qrCodeData = await generateRescueCardQrCode({
      email: requester.email || consentRequest.requesterEmail,
      bloodType: rescueCard?.bloodType,
      allergies: rescueCard?.allergies,
      medicalConditions: rescueCard?.medicalConditions,
      emergencyContactName: rescueCard?.emergencyContactName ?? consentRequest.emergencyContactName,
      emergencyContactPhone: rescueCard?.emergencyContactPhone,
      emergencyContactGmail: consentRequest.pendingEmail,
      homeAddress: rescueCard?.homeAddress,
    });

    const shareableUrl = buildGoogleMapsUrl(rescueCard?.homeLat, rescueCard?.homeLng);

    await prisma.$transaction([
      prisma.rescueCard.upsert({
        where: { userId: requester.id },
        update: {
          emergencyContactGmail: consentRequest.pendingEmail,
          qrCodeData,
          shareableUrl,
        },
        create: {
          userId: requester.id,
          emergencyContactName: consentRequest.emergencyContactName,
          emergencyContactGmail: consentRequest.pendingEmail,
          qrCodeData,
          shareableUrl,
        },
      }),
      prisma.emergencyContactConsentRequest.update({
        where: { id: consentRequest.id },
        data: {
          status: "approved",
          approvedAt: new Date(),
        },
      }),
      prisma.emergencyContactConsentRequest.updateMany({
        where: {
          requesterUserId: requester.id,
          status: "pending",
          id: { not: consentRequest.id },
        },
        data: {
          status: "replaced",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      status: "approved",
      message: "Consent approved. This Gmail is now saved as the emergency contact.",
    });
  } catch (error) {
    console.error("Consent action error:", error);
    return NextResponse.json({ error: "Failed to process consent action." }, { status: 500 });
  }
}
