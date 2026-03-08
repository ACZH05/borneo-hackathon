import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { rawInput, location } = await request.json();

    if (!rawInput) {
      return NextResponse.json({ error: "Missing raw input" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" } 
    });

    const prompt = `
      You are the "Aegis Early Warning System" for Borneo. 
      An admin has provided this raw hazard update: "${rawInput}" for the location: "${location || 'Unknown'}".

      Convert this into a professional emergency broadcast.
      You MUST respond in valid JSON matching this exact structure:
      {
        "topic": "A short, professional title (e.g., Flood Advisory: Kulai Basin)",
        "priority": "Must be exactly one of: 'priority', 'warning', or 'monitor'",
        "category": "Must be exactly one of: 'flood', 'landslide', 'tidal', or 'other'",
        "english": "A professional 2-sentence description of the threat.",
        "malay": "The exact translation of the english text in Bahasa Melayu.",
        "chinese": "The exact translation of the english text in Simplified Chinese.",
        "actionSteps": "1 or 2 short, direct instructions (e.g., 'Evacuate to high ground immediately.')"
      }
    `;

    const result = await model.generateContent(prompt);
    const aiDraft = JSON.parse(result.response.text());

    // Combine the translations and actions into the exact 'description' format the frontend expects
    const formattedDescription = `
ENG: ${aiDraft.english}
BM: ${aiDraft.malay}
中文: ${aiDraft.chinese}

⚠️ ACTION: ${aiDraft.actionSteps}
    `.trim();

    return NextResponse.json({ 
      success: true, 
      draft: {
        title: aiDraft.topic,        // Mapped for the database 'title'
        severity: aiDraft.priority,  // Mapped for the database 'severity'
        hazardType: aiDraft.category,// Mapped for the database 'hazardType'
        body: formattedDescription   // Mapped for the database 'body'
      }
    });

  } catch (error) {
    console.error("AI Draft Error:", error);
    return NextResponse.json({ error: 'Failed to draft alert' }, { status: 500 });
  }
}