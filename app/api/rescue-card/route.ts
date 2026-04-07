import crypto from "crypto";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { sendEmail } from "@/app/lib/server/email";
import {
  buildGoogleMapsUrl,
  generateRescueCardQrCode,
} from "@/app/lib/server/rescue-card";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function normalizeEmail(value?: string | null) {
  const trimmed = value?.trim().toLowerCase();
  return trimmed ? trimmed : null;
}

function buildConsentLink(token: string) {
  const appUrl = process.env.URL || "http://localhost:3000";
  return `${appUrl}/emergency-contact-consent?token=${encodeURIComponent(token)}`;
}

async function getLatestPendingConsent(requesterUserId: string) {
  const consentRequest = await prisma.emergencyContactConsentRequest.findFirst({
    where: {
      requesterUserId,
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

// This API route handles both GET and POST requests related to the user's rescue card.
// GET: Used by the user to fetch their rescue card and any pending emergency contact consent.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { rescueCard: true },
    });

    if (!user || !user.rescueCard) {
      return NextResponse.json({ message: "No card found" }, { status: 404 });
    }

    const pendingEmergencyContactConsent = await getLatestPendingConsent(user.id);

    return NextResponse.json({
      success: true,
      rescueCard: user.rescueCard,
      pendingEmergencyContactConsent,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// POST: Used by the user to create or update their rescue card. If the emergency contact Gmail is changed, it will trigger a new consent request.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      bloodType,
      allergies,
      medicalConditions,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactGmail,
      homeLat,
      homeLng,
      homeAddress,
    } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const existingRescueCard = await prisma.rescueCard.findUnique({
      where: { userId: user.id },
    });

    let formattedAddress = homeAddress?.trim() || "Address not found";

    if (homeLat && homeLng && process.env.GOOGLE_MAPS_API_KEY) {
      try {
        const geoRes = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${homeLat},${homeLng}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );
        const geoData = await geoRes.json();

        if (geoData.status === "OK" && geoData.results.length > 0) {
          formattedAddress = geoData.results[0].formatted_address;
        }
      } catch (geoError) {
        console.error("Geocoding failed:", geoError);
      }
    }

    const normalizedRequestedGmail = normalizeEmail(emergencyContactGmail);
    const approvedGmail = existingRescueCard?.emergencyContactGmail ?? null;
    const shouldRequestConsent = Boolean(
      normalizedRequestedGmail && normalizedRequestedGmail !== approvedGmail
    );

    const qrCodeData = await generateRescueCardQrCode({
      email,
      bloodType,
      allergies,
      medicalConditions,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactGmail: shouldRequestConsent
        ? approvedGmail
        : normalizedRequestedGmail,
      homeAddress: formattedAddress,
    });

    const shareableUrl = buildGoogleMapsUrl(homeLat, homeLng);

    const rescueCard = await prisma.rescueCard.upsert({
      where: { userId: user.id },
      update: {
        bloodType,
        allergies,
        medicalConditions,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactGmail: shouldRequestConsent
          ? approvedGmail
          : normalizedRequestedGmail,
        homeLat,
        homeLng,
        homeAddress: formattedAddress,
        shareableUrl,
        qrCodeData,
      },
      create: {
        userId: user.id,
        bloodType,
        allergies,
        medicalConditions,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactGmail: shouldRequestConsent ? null : normalizedRequestedGmail,
        homeLat,
        homeLng,
        homeAddress: formattedAddress,
        shareableUrl,
        qrCodeData,
      },
    });

    if (!shouldRequestConsent) {
      await prisma.emergencyContactConsentRequest.updateMany({
        where: {
          requesterUserId: user.id,
          status: "pending",
        },
        data: {
          status: "replaced",
        },
      });

      return NextResponse.json({
        success: true,
        rescueCard,
        pendingEmergencyContactConsent: null,
      });
    }

    await prisma.emergencyContactConsentRequest.updateMany({
      where: {
        requesterUserId: user.id,
        status: "pending",
      },
      data: {
        status: "replaced",
      },
    });

    const token = crypto.randomUUID();
    const consentLink = buildConsentLink(token);
    const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const consentRequest = await prisma.emergencyContactConsentRequest.create({
      data: {
        requesterUserId: user.id,
        requesterEmail: email,
        requesterName: user.name,
        emergencyContactName: emergencyContactName?.trim() || null,
        pendingEmail: normalizedRequestedGmail!,
        token,
        expiresAt,
      },
    });

    try {
      await sendEmail({
        to: normalizedRequestedGmail!,
        subject: "Emergency contact consent request",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Emergency Contact Consent Request</h2>
            <p>${user.name || email} wants to add this Gmail address as an emergency contact in BorNEO AI.</p>
            <p>If you agree, please review and confirm the request below:</p>
            <p><a href="${consentLink}" style="display:inline-block;padding:12px 18px;background:#0f766e;color:#fff;text-decoration:none;border-radius:8px;">Review Request</a></p>
            <p>If you do not recognize this request, you can ignore this email.</p>
          </div>
        `,
        text: `${user.name || email} wants to add ${normalizedRequestedGmail} as an emergency contact Gmail in BorNEO AI. Review the request here: ${consentLink}`,
      });
    } catch (emailError) {
      await prisma.emergencyContactConsentRequest.delete({
        where: { id: consentRequest.id },
      });

      throw emailError;
    }

    return NextResponse.json({
      success: true,
      rescueCard,
      pendingConsent: true,
      pendingEmergencyContactConsent: {
        email: consentRequest.pendingEmail,
        status: consentRequest.status,
        expiresAt: consentRequest.expiresAt,
        createdAt: consentRequest.createdAt,
      },
      message: "Consent email sent. The Gmail will be saved after approval.",
    });
  } catch (error) {
    console.error("Rescue Card Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create Rescue Card";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
