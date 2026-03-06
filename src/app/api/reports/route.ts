import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { lat, lng, hazardType, description } = body;

    if (lat == null || lng == null || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let formattedAddress = "Address not found";

    if (process.env.GOOGLE_MAPS_API_KEY) {
      try {
        const geoRes = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`
        );
        const geoData = await geoRes.json();

        if (geoData.status === "OK" && geoData.results.length > 0) {
          formattedAddress = geoData.results[0].formatted_address;
        }
      } catch (geoError) {
        console.error("Geocoding failed:", geoError);
      }
    }

    let aiTriageData = null;

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });

      const prompt = `
                        You are the "Aegis Crisis Triage System", an advanced AI assistant designed for emergency dispatchers. 
                        Your primary function is to rapidly analyze inbound civilian SOS reports, extract critical incident parameters, and format actionable intelligence.

                        SITUATION: 
                        A civilian has activated an emergency SOS and provided the following raw description:
                        "${description}"

                        INSTRUCTIONS:
                        1. FIRST VALIDATION STEP: Determine if this is a genuine request for help. If the text is random letters (e.g., "asdf"), a test (e.g., "test 123"), a joke, or completely unrelated to an emergency (e.g., "I like pizza"), you MUST flag it as a false alarm.
                        2. If it is a real emergency, analyze the text for threats to life, property damage, and required medical attention.
                        3. You must respond ONLY with a valid, raw JSON object. Do not include markdown formatting like \`\`\`json.

                        JSON SCHEMA REQUIREMENT:
                        {
                        "isRealEmergency": "Boolean (true or false). Set to false if it is a prank, test, or irrelevant.",
                        "severity": "Must be exactly one of: 'False Alarm', 'Low', 'Medium', 'High', or 'Critical'. Use 'False Alarm' if isRealEmergency is false.",
                        "tags": "An array of 2 to 4 standardized tags. If a false alarm, use exactly ['Spam', 'Ignored'].",
                        "action": "A concise directive. If a false alarm, state 'No action required. Log as false positive.'",
                        "requiredAssets": "Array of vehicles to deploy. If a false alarm, return ['None']."
                        }
                        `;

      const result = await model.generateContent(prompt);
      aiTriageData = JSON.parse(result.response.text());
    } catch (aiError) {
      console.error("Gemini failed:", aiError);
    }

    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email ?? undefined,
        name: (user.user_metadata?.name as string | undefined) ?? undefined,
        regionCode:
          (user.user_metadata?.regionCode as string | undefined) ?? undefined,
      },
      create: {
        id: user.id,
        email: user.email ?? null,
        name: (user.user_metadata?.name as string | undefined) ?? null,
        regionCode:
          (user.user_metadata?.regionCode as string | undefined) ?? null,
        role: "resident",
      },
    });

    const report = await prisma.incidentReport.create({
      data: {
        userId: user.id,
        lat: Number(lat),
        lng: Number(lng),
        address: formattedAddress,
        hazardType: hazardType || "unknown",
        description,
        status: "new",
        aiTriage: aiTriageData,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "SOS Report analyzed and saved!",
        report,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating SOS report:", error);
    return NextResponse.json(
      { error: "Failed to submit SOS report" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const reports = await prisma.incidentReport.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, regionCode: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, reports });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}