import { NextResponse } from 'next/server';
import { generateGeminiText } from '@/lib/server/gemini';

export async function POST(request: Request) {
  try {
    const { hazardType, region } = await request.json();

    if (!hazardType) {
      return NextResponse.json({ error: "Missing hazardType" }, { status: 400 });
    }

const prompt = `
      SYSTEM DIRECTIVE:
      You are the Lead Crisis Simulation Engine for the BorNEO AI System. Your objective is to generate a highly engaging, localized, single-turn survival scenario to educate residents on disaster preparedness.

      SCENARIO PARAMETERS:
      - Hazard Type: ${hazardType}
      - Target Region: ${region || 'Southeast Asia / Borneo'}

      GENERATION CONSTRAINTS:
      1. Narrative: Craft a tense, realistic 2-3 sentence scenario where the user faces an immediate threat from the specified hazard in the target region. The user must make a critical, split-second survival decision.
      2. Options: Generate exactly 3 concise, distinct action choices. 
         - ONE option must be the scientifically and practically correct survival protocol.
         - TWO options must represent common, plausible, but dangerous misconceptions or fatal mistakes.
      3. Explanation: Provide a brief, educational breakdown of WHY the correct answer is safe and why the others pose severe risks.
      4. Formatting: Do not include letters like "A)", "B)", or "C)" in the options. Just provide the action text.

      EXPECTED OUTPUT:
      You must respond with ONLY a valid JSON object matching the exact schema below. Do not include markdown formatting, code blocks, or conversational filler.

      {
        "scenario": "The floodwaters have suddenly breached the ground floor of your home in Johor. The water is rising fast and the main power is still active. What is your immediate priority?",
        "options": [
          "Wade through the water to grab your TV and important documents.",
          "Immediately head to the roof or highest floor, avoiding all contact with the water.",
          "Swim outside into the current to check on your parked vehicle."
        ],
        "correctOptionIndex": 1, 
        "explanation": "Option 2 is correct. Floodwater in homes carries a severe risk of electrocution if the power is still active. Moving to higher ground immediately without touching the water is the only safe priority."
      }
    `;

    const responseText = await generateGeminiText(prompt);
    const quizData = JSON.parse(responseText);

    return NextResponse.json({ success: true, quiz: quizData }, { status: 200 });

  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
  }
}
