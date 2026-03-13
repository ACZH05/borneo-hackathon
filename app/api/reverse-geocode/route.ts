import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lat, lng } = body;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json(
        { error: "Valid lat and lng are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Maps API key is missing." },
        { status: 500 }
      );
    }

    const url =
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK" || !data.results?.length) {
      return NextResponse.json(
        { error: "Address not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      formattedAddress: data.results[0].formatted_address,
      lat,
      lng,
    });
  } catch (error) {
    console.error("Reverse geocode error:", error);
    return NextResponse.json(
      { error: "Failed to reverse geocode coordinates." },
      { status: 500 }
    );
  }
}