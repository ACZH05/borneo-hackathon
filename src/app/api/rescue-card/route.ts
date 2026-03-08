import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import QRCode from 'qrcode'; // <-- Import the new library!

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // This fetches the user AND their rescue card in one go
    const user = await prisma.user.findUnique({
      where: { email },
      include: { rescueCard: true }
    });

    if (!user || !user.rescueCard) {
      return NextResponse.json({ message: "No card found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      rescueCard: user.rescueCard 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}



export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      email, bloodType, allergies, medicalConditions, 
      emergencyContactName, emergencyContactPhone, homeLat, homeLng
    } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // --- 1. GOOGLE MAPS REVERSE GEOCODING ---
    let formattedAddress = "Address not found";
    if (homeLat && homeLng && process.env.GOOGLE_MAPS_API_KEY) {
      try {
        const geoRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${homeLat},${homeLng}&key=${process.env.GOOGLE_MAPS_API_KEY}`);
        const geoData = await geoRes.json();
        
        if (geoData.status === "OK" && geoData.results.length > 0) {
          formattedAddress = geoData.results[0].formatted_address;
        }
      } catch (geoError) {
        console.error("Geocoding failed:", geoError);
      }
    }

    // --- 2. CREATE THE MEDICAL STRING (NOW WITH ADDRESS!) ---
    const medicalDataString = `
                        ━━━━━━━━━━━━━━━
                        🚑 BORNEO RESCUE CARD 🚑
                        ━━━━━━━━━━━━━━━
                        👤 USER: ${email}
                        🩸 BLOOD: ${bloodType || 'N/A'}
                        ⚠️ ALLERGIES: ${allergies || 'NONE'}
                        🏥 MEDICAL: ${medicalConditions || 'NONE'}

                        📞 EMERGENCY CONTACT:
                        ${emergencyContactName}
                        ${emergencyContactPhone}

                        📍 HOME:
                        ${formattedAddress}
                        ━━━━━━━━━━━━━━━
    `.trim();

    // --- 3. GENERATE THE QR CODE ---
    let generatedQrCode = null;
    try {
      generatedQrCode = await QRCode.toDataURL(medicalDataString, {
        errorCorrectionLevel: 'H', 
        width: 400,
        margin: 1
      });
    } catch (qrError) {
      console.error("QR Error:", qrError);
    }

    // --- 4. CREATE THE MAP URL (Using the universal Google Maps format) ---
    const googleMapsUrl = `https://www.google.com/maps?q=${homeLat},${homeLng}`;

    // --- 5. UPSERT TO DATABASE ---
    const rescueCard = await prisma.rescueCard.upsert({
      where: { userId: user.id },
      update: {
        bloodType, allergies, medicalConditions,
        emergencyContactName, emergencyContactPhone,
        homeLat, homeLng,
        homeAddress: formattedAddress, // Saving the real address!
        shareableUrl: googleMapsUrl,
        qrCodeData: generatedQrCode 
      },
      create: {
        userId: user.id,
        bloodType, allergies, medicalConditions,
        emergencyContactName, emergencyContactPhone,
        homeLat, homeLng,
        homeAddress: formattedAddress, // Saving the real address!
        shareableUrl: googleMapsUrl,
        qrCodeData: generatedQrCode
      }
    });

    return NextResponse.json({ success: true, rescueCard });
  } catch (error) {
    console.error("Rescue Card Error:", error);
    return NextResponse.json({ error: 'Failed to create Rescue Card' }, { status: 500 });
  }
}