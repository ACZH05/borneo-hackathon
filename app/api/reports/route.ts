import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg'; 
import { generateGeminiText } from '@/app/lib/server/gemini';
import { sendEmail } from '@/app/lib/server/email';

// 1. Initialize Database Adapter
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!, 
});
const prisma = new PrismaClient({ adapter });

function formatSeverity(aiTriageData: unknown) {
  if (
    aiTriageData &&
    typeof aiTriageData === "object" &&
    "severity" in aiTriageData &&
    typeof (aiTriageData as { severity?: unknown }).severity === "string"
  ) {
    return (aiTriageData as { severity: string }).severity;
  }

  return "Unknown";
}

function getEmergencyContactNotificationStatus(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Failed to notify emergency contact.";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // 1. Add userId to the extracted body data
    const { userId, lat, lng, hazardType, description } = body;

    // 2. Require the userId to be present
    if (!userId || !lat || !lng || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

// --- 1. GOOGLE MAPS REVERSE GEOCODING ---
    let formattedAddress = "Address not found";
    if (process.env.GOOGLE_MAPS_API_KEY) {
      try {
        const geoRes = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`);
        const geoData = await geoRes.json();
        
        if (geoData.status === "OK" && geoData.results.length > 0) {
          formattedAddress = geoData.results[0].formatted_address;
          console.log("Geocoding success:", formattedAddress);
        }
      } catch (geoError) {
        console.error("Geocoding failed, but continuing:", geoError);
      }
    }

    // 3. ASK GEMINI TO TRIAGE THE EMERGENCY
    let aiTriageData = null;
    try {
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

      const responseText = await generateGeminiText(prompt);
      aiTriageData = JSON.parse(responseText);
      console.log("Gemini Triage successful:", aiTriageData); 
    } catch (aiError) {
      console.error("Gemini Triage failed, but saving report anyway:", aiError);
    }

    // 4. Default User Setup 
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { rescueCard: true },
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found. Please log in." }, { status: 404 });
    }

    // 5. Save to Database WITH the Gemini AI data
    const report = await prisma.incidentReport.create({
      data: {
        userId: user.id,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        address: formattedAddress,
        hazardType: hazardType || 'unknown',
        description: description,
        status: 'new',
        aiTriage: aiTriageData,
      },
    });

    const emergencyContactGmail = user.rescueCard?.emergencyContactGmail?.trim().toLowerCase();
    let emergencyContactNotified = false;
    let emergencyContactNotificationError: string | null = null;

    if (emergencyContactGmail) {
      try {
        const severity = formatSeverity(aiTriageData);
        const emergencyContactName = user.rescueCard?.emergencyContactName || "Emergency contact";
        const mapsLink = `https://www.google.com/maps?q=${parseFloat(lat)},${parseFloat(lng)}`;
        const victimName = user.name || user.email || "A BorNEO AI user";
        const bloodType = user.rescueCard?.bloodType || "Not provided";
        const allergies = user.rescueCard?.allergies || "None declared";
        const medicalConditions = user.rescueCard?.medicalConditions || "None declared";
        const contactPhone = user.rescueCard?.emergencyContactPhone || "Not provided";
        const contactGmail = user.rescueCard?.emergencyContactGmail || "Not provided";
        const homeAddress = user.rescueCard?.homeAddress || "Not provided";

        await sendEmail({
          to: emergencyContactGmail,
          subject: `SOS alert for ${victimName}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2>SOS Alert Notification</h2>
              <p>Hello ${emergencyContactName},</p>
              <p>${victimName} has triggered an SOS alert and listed your email as their approved emergency contact.</p>
              <p><strong>Hazard type:</strong> ${hazardType || "unknown"}</p>
              <p><strong>Severity:</strong> ${severity}</p>
              <p><strong>Description:</strong> ${description}</p>
              <p><strong>Address:</strong> ${formattedAddress}</p>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;" />
              <h3>Victim Personal Information</h3>
              <p><strong>Name:</strong> ${victimName}</p>
              <p><strong>Blood type:</strong> ${bloodType}</p>
              <p><strong>Allergies:</strong> ${allergies}</p>
              <p><strong>Medical conditions:</strong> ${medicalConditions}</p>
              <p><strong>Emergency contact name:</strong> ${emergencyContactName}</p>
              <p><strong>Emergency contact phone:</strong> ${contactPhone}</p>
              <p><strong>Emergency contact Gmail:</strong> ${contactGmail}</p>
              <p><strong>Home address:</strong> ${homeAddress}</p>
              <p><a href="${mapsLink}" style="display:inline-block;padding:12px 18px;background:#b91c1c;color:#fff;text-decoration:none;border-radius:8px;">Open Location</a></p>
            </div>
          `,
          text: `SOS Alert Notification\n\n${victimName} triggered an SOS alert.\nHazard type: ${hazardType || "unknown"}\nSeverity: ${severity}\nDescription: ${description}\nAddress: ${formattedAddress}\n\nVictim Personal Information\nName: ${victimName}\nBlood type: ${bloodType}\nAllergies: ${allergies}\nMedical conditions: ${medicalConditions}\nEmergency contact name: ${emergencyContactName}\nEmergency contact phone: ${contactPhone}\nEmergency contact Gmail: ${contactGmail}\nHome address: ${homeAddress}\n\nLocation: ${mapsLink}`,
        });
        emergencyContactNotified = true;
      } catch (emailError) {
        console.error("Emergency contact email failed, but SOS report was saved:", emailError);
        emergencyContactNotificationError = getEmergencyContactNotificationStatus(emailError);
      }
    }

    const message = emergencyContactGmail
      ? emergencyContactNotified
        ? "SOS Report analyzed and saved. Admin dashboard updated and emergency contact notified."
        : "SOS Report analyzed and saved. Admin dashboard updated, but emergency contact email could not be delivered."
      : "SOS Report analyzed and saved. Admin dashboard updated. No approved emergency contact Gmail was available.";

    return NextResponse.json({ 
      success: true, 
      message,
      report,
      emergencyContactNotification: {
        email: emergencyContactGmail ?? null,
        notified: emergencyContactNotified,
        error: emergencyContactNotificationError,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating SOS report:', error);
    return NextResponse.json({ error: 'Failed to submit SOS report' }, { status: 500 });
  }
}

// Keep the GET route exactly the same!
export async function GET() {
  try {
    const reports = await prisma.incidentReport.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, regionCode: true } }
      }
    });
    
    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
