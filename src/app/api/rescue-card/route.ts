import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import QRCode from "qrcode";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rescueCard = await prisma.rescueCard.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({ success: true, rescueCard });
  } catch (error) {
    console.error("Error fetching rescue card:", error);
    return NextResponse.json(
      { error: "Failed to fetch rescue card" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const {
      bloodType,
      allergies,
      medicalConditions,
      emergencyContactName,
      emergencyContactPhone,
      homeLat,
      homeLng,
    } = body;

    let homeAddress: string | null = null;

    if (
      homeLat != null &&
      homeLng != null &&
      process.env.GOOGLE_MAPS_API_KEY
    ) {
      try {
        const geoRes = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${homeLat},${homeLng}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );
        const geoData = await geoRes.json();

        if (geoData.status === "OK" && geoData.results?.length > 0) {
          homeAddress = geoData.results[0].formatted_address;
        }
      } catch (geoError) {
        console.error("Reverse geocoding failed:", geoError);
      }
    }

    const shareablePayload = {
      userId: user.id,
      email: user.email ?? null,
      bloodType: bloodType ?? null,
      allergies: allergies ?? null,
      medicalConditions: medicalConditions ?? null,
      emergencyContactName: emergencyContactName ?? null,
      emergencyContactPhone: emergencyContactPhone ?? null,
      homeLat: homeLat != null ? Number(homeLat) : null,
      homeLng: homeLng != null ? Number(homeLng) : null,
      homeAddress,
    };

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const shareableUrl = `${baseUrl}/rescue-card/${user.id}`;

    const qrCodeData = await QRCode.toDataURL(
      JSON.stringify({
        shareableUrl,
        ...shareablePayload,
      })
    );

    const rescueCard = await prisma.rescueCard.upsert({
      where: { userId: user.id },
      update: {
        bloodType: bloodType ?? null,
        allergies: allergies ?? null,
        medicalConditions: medicalConditions ?? null,
        emergencyContactName: emergencyContactName ?? null,
        emergencyContactPhone: emergencyContactPhone ?? null,
        homeLat: homeLat != null ? Number(homeLat) : null,
        homeLng: homeLng != null ? Number(homeLng) : null,
        shareableUrl,
        qrCodeData,
      },
      create: {
        userId: user.id,
        bloodType: bloodType ?? null,
        allergies: allergies ?? null,
        medicalConditions: medicalConditions ?? null,
        emergencyContactName: emergencyContactName ?? null,
        emergencyContactPhone: emergencyContactPhone ?? null,
        homeLat: homeLat != null ? Number(homeLat) : null,
        homeLng: homeLng != null ? Number(homeLng) : null,
        shareableUrl,
        qrCodeData,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Rescue card saved successfully",
      rescueCard,
      homeAddress,
    });
  } catch (error) {
    console.error("Error saving rescue card:", error);
    return NextResponse.json(
      { error: "Failed to save rescue card" },
      { status: 500 }
    );
  }
}