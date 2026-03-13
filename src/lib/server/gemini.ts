import { GoogleGenerativeAI } from "@google/generative-ai";

type GeminiRequestOptions = {
  model?: string;
  responseMimeType?: string;
};

function getGeminiApiKeys(): string[] {
  const env = process.env;
  const candidates = [
    env.GEMINI_API_KEY_1,
    env.GEMINI_API_KEY_2,
    env.GEMINI_API_KEY_3,
    env.GEMINI_API_KEY_4,
    env.GEMINI_API_KEY_5,
    env.GEMINI_API_KEY_6,
    env.GEMINI_API_KEY_7,
    env.GEMINI_API_KEY_8,
    env.GEMINI_API_KEY_9,
    env.GEMINI_API_KEY_10,
    env.GEMINI_API_KEY_11,
    env.GEMINI_API_KEY_12
  ];

  return [...new Set(candidates.filter((key): key is string => Boolean(key)))];
}

export async function generateGeminiText(
  prompt: string,
  options: GeminiRequestOptions = {},
): Promise<string> {
  const keys = getGeminiApiKeys();

  if (keys.length === 0) {
    throw new Error(
      "No Gemini API keys configured. Set GEMINI_API_KEY or GEMINI_API_KEY_1..5.",
    );
  }

  const modelName = options.model ?? "gemini-2.5-flash";
  const responseMimeType = options.responseMimeType ?? "application/json";

  let lastError: unknown;

  for (const [index, apiKey] of keys.entries()) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType },
      });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      lastError = error;
      console.error(
        `Gemini request failed with API key ${index + 1} of ${keys.length}.`,
        error,
      );
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("All Gemini API keys failed.");
}
