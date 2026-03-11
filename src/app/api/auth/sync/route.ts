import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// --- HELPER: Map Google Maps State to your Region Code ---
function getRegionCodeFromState(stateName: string): string {
  const map: Record<string, string> = {
    "Johor": "MY-01",
    "Kedah": "MY-02",
    "Kelantan": "MY-03",
    "Melaka": "MY-04",
    "Negeri Sembilan": "MY-05",
    "Pahang": "MY-06",
    "Pulau Pinang": "MY-07",
    "Perak": "MY-08",
    "Perlis": "MY-09",
    "Selangor": "MY-10",
    "Terengganu": "MY-11",
    "Sabah": "MY-12",
    "Sarawak": "MY-13",
    "Kuala Lumpur": "MY-14",
    "Kalimantan Timur": "ID-KI", // East Kalimantan (Indonesia)
    "Kalimantan Barat": "ID-KB"  // West Kalimantan (Indonesia)
  };
  
  // Look for a match (e.g., if Google returns "State of Johor", it still catches "Johor")
  for (const [key, code] of Object.entries(map)) {
    if (stateName.toLowerCase().includes(key.toLowerCase())) {
      return code;
    }
  }
  
  // Fallback to Kedah (MY-02) for the Kulai hackathon demo if it gets confused!
  return "MY-02"; 
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Notice we now accept lat and lng from the frontend!
    const { id, email, name, lat, lng } = body;

    if (!id || !email) {
      return NextResponse.json({ error: "Missing required user data." }, { status: 400 });
    }

    let detectedRegionCode = "MY-02"; // Default starting point

    // --- 1. REVERSE GEOCODING (If GPS is provided) ---
    if (lat && lng && process.env.GOOGLE_MAPS_API_KEY) {
      try {
        const geoRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`);
        const geoData = await geoRes.json();
        
        if (geoData.status === "OK" && geoData.results.length > 0) {
          // Google Maps stores the "State" in administrative_area_level_1
          const addressComponents = geoData.results[0].address_components;
          const stateComponent = addressComponents.find((comp: any) => 
            comp.types.includes("administrative_area_level_1")
          );

          if (stateComponent) {
            detectedRegionCode = getRegionCodeFromState(stateComponent.long_name);
            console.log(`🌍 Detected State: ${stateComponent.long_name} -> Mapped to: ${detectedRegionCode}`);
          }
        }
      } catch (geoError) {
        console.error("Geocoding failed during sync:", geoError);
      }
    }

    // --- 2. UPSERT USER INTO DATABASE ---
    const user = await prisma.user.upsert({
      where: { id: id },
      update: {
        // We completely removed `name: name` from here! 
        // Now, when they log back in, the database will not overwrite their custom profile.
        ...(lat && lng ? { regionCode: detectedRegionCode } : {})
      },
      create: {
        id: id,
        email: email,
        name: name || "Resident", // New users still get this default name!
        role: "resident",
        regionCode: detectedRegionCode, 
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "User synced and region auto-detected!", 
      user 
    }, { status: 200 });

  } catch (error) {
    console.error("Auth sync error:", error);
    return NextResponse.json({ error: 'Failed to sync user data' }, { status: 500 });
  }
}