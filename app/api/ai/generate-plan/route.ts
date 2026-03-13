import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { generateGeminiText } from '@/app/lib/server/gemini';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, hazardType, familySize, pets, specialNeeds } = body;

    // 1. Validate Input
    if (!userId || !hazardType) {
      return NextResponse.json({ error: "Missing userId or hazardType" }, { status: 400 });
    }

    // 3. The "Smart Engineer" Prompt
   const prompt = `
      SYSTEM DIRECTIVE: 
      You are the lead Disaster Preparedness AI for the BorNEO AI System, specializing in crisis management and survival protocols for the ASEAN and Borneo region. Your objective is to generate a highly actionable, customized Emergency Action Plan for a resident facing an imminent or potential hazard.

      USER PROFILE & HAZARD CONTEXT:
      - Primary Hazard: ${hazardType}
      - Household Size: ${familySize || 1} person(s)
      - Number of Pets: ${pets || 0}
      - Special Needs / Medical Notes: ${specialNeeds || 'None'}

      GENERATION GUIDELINES:
      1. Localization: Tailor the advice to a Southeast Asian context (e.g., monsoon realities, tropical climate, local infrastructure).
      2. Personalization: You MUST include specific checklist items that directly address the household size, pets, and special needs provided above. Calculate supplies accurately based on the family size.
      3. Actionability: Keep tasks concise, clear, and prioritize critical life-saving and evacuation steps. Avoid vague advice.
      4. Brevity: Limit the checklist to strictly 7 to 10 of the most critical tasks to prevent cognitive overload during a crisis.

      EXPECTED OUTPUT:
      You must respond with ONLY a valid JSON object matching the exact schema below. Do not include markdown formatting, code blocks, or conversational filler.
      
      {
        "title": "[Generate a concise, professional title, e.g., 'Targeted Flood Evacuation Protocol']",
        "checklist": [
          { "task": "[Clear, actionable task, e.g., 'Pack 12 liters of water (3-day supply for 4 people)']", "isCompleted": false }
        ]
      }
    `;

    // 4. Ask Gemini
    const responseText = await generateGeminiText(prompt);
    const generatedData = JSON.parse(responseText);

    // 5. Save directly to your PostgreSQL Database
    const newPlan = await prisma.emergencyPlan.create({
      data: {
        userId: userId,
        title: generatedData.title,
        hazardType: hazardType,
        checklist: generatedData.checklist, // Prisma handles the JSON perfectly!
      }
    });

    // 6. Send the saved plan back to frontend
    return NextResponse.json({ success: true, plan: newPlan }, { status: 201 });

  } catch (error) {
    console.error("Error generating plan:", error);
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 });
  }
}
