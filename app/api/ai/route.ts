import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_MODEL = 'gemini-2.5-flash';

export async function POST(req: Request) {
  try {
    const { userPrompt, goals } = await req.json();

    const prompt = `
You are an assistant that ONLY returns valid JSON.
Rules:
- Do NOT change goalDate
- Do NOT add or remove array items
- Do NOT add extra text, markdown, or code fences
- Return raw JSON only
- Title: max 15 words
- Description: 1–2 or more actionable sentences
- If there are existing title and descriptions, replace them with newer ones according to the user intent

User intent:
"${userPrompt}"

Input JSON:
${JSON.stringify(goals, null, 2)}

Fill in or replace the old title and description fields only. Return the JSON array directly without any markdown formatting.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('Empty Gemini response');
    }

    // Strip markdown code fences if present
    let cleanedText = text.trim();
    
    // Remove ```json and ``` wrappers
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.slice(7); // Remove ```json
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.slice(3); // Remove ```
    }
    
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(0, -3); // Remove trailing ```
    }
    
    cleanedText = cleanedText.trim();

    const parsed = JSON.parse(cleanedText);
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}