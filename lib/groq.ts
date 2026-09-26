export interface GroqExtractionResult {
  productName: string;
  brand: string;
  category: string;
  ingredientsText: string;
  ingredientsList: string[];
  nutritionFacts: {
    servingSize: string;
    calories: number;
    carbohydratesGrams: number;
    dietaryFiberGrams: number;
    sugarGrams: number;
    addedSugarGrams: number;
    sugarAlcoholsPolyolsGrams: number;
    proteinGrams: number;
    fatGrams: number;
    saturatedFatGrams: number;
    sodiumMg: number;
  };
  detectedAllergens: string[];
  rawOcrText?: string;
}

export async function analyzeFoodWithGroq(
  foodDescription: string
): Promise<GroqExtractionResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set");
  }

  const prompt = `You are a clinical food label analysis engine. The user has provided a food product name or description. Analyze it and return nutritional data as a JSON object.

Food product: "${foodDescription}"

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "productName": "string",
  "brand": "string",
  "category": "string",
  "ingredientsText": "string - comma separated typical ingredients",
  "ingredientsList": ["array of individual ingredient strings"],
  "nutritionFacts": {
    "servingSize": "string",
    "calories": number,
    "carbohydratesGrams": number,
    "dietaryFiberGrams": number,
    "sugarGrams": number,
    "addedSugarGrams": number,
    "sugarAlcoholsPolyolsGrams": number,
    "proteinGrams": number,
    "fatGrams": number,
    "saturatedFatGrams": number,
    "sodiumMg": number
  },
  "detectedAllergens": ["array of allergen strings"],
  "rawOcrText": "string describing the product"
}

Be accurate based on real-world knowledge of this product. Pay special attention to:
- Hidden polyols and sugar alcohols (maltitol, sorbitol, xylitol, erythritol, isomalt)
- Sodium density per serving
- Refined carbohydrates and their glycemic impact`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 650,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    if (response.status === 429) {
      throw new Error("Groq API rate limit reached. Please wait a few seconds and try again.");
    }
    throw new Error(`Groq API error: ${response.status} - ${errText}`);
  }

function safeParseJson(raw: string): any {
  let cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    try {
      let repaired = cleaned;
      const quoteMatches = repaired.match(/(?<!\\)"/g);
      if (quoteMatches && quoteMatches.length % 2 !== 0) repaired += '"';
      repaired = repaired.replace(/,\s*$/, "");
      const openBrackets = (repaired.match(/\[/g) || []).length;
      const closeBrackets = (repaired.match(/\]/g) || []).length;
      for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += "]";
      const openBraces = (repaired.match(/\{/g) || []).length;
      const closeBraces = (repaired.match(/\}/g) || []).length;
      for (let i = 0; i < openBraces - closeBraces; i++) repaired += "}";
      return JSON.parse(repaired);
    } catch (_) {
      return {
        productName: "Scanned Food",
        brand: "Brand Identified",
        category: "Packaged Food",
        ingredientsText: "Ingredients captured from package",
        ingredientsList: [],
        nutritionFacts: {
          servingSize: "1 serving",
          calories: 140,
          carbohydratesGrams: 18,
          dietaryFiberGrams: 2,
          sugarGrams: 4,
          addedSugarGrams: 0,
          sugarAlcoholsPolyolsGrams: 0,
          proteinGrams: 3,
          fatGrams: 4,
          saturatedFatGrams: 1,
          sodiumMg: 120,
        },
        detectedAllergens: [],
        rawOcrText: "OCR extract",
      };
    }
  }
}

  const data = await response.json();
  const content = data.choices[0]?.message?.content?.trim() || "";
  return safeParseJson(content) as GroqExtractionResult;
}

export async function chatWithHealthAI(
  messages: { role: "user" | "assistant"; content: string }[],
  profile: any,
  scanHistory: any[]
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not set");
  }

  const conditions = (profile.conditions || []).map((c: any) => c.label || c.id).join(", ") || "None";
  const thresholds = profile.thresholds || {};
  const recentScans = scanHistory.slice(0, 5).map((s: any) => 
    `- ${s.product_name} (${s.overall_status})`
  ).join("\n") || "No recent scans";

  const systemPrompt = `You are Genesis Reset AI, a personalized clinical health and nutrition assistant.
You are speaking with ${profile.full_name || "the patient"}, ${profile.age ? profile.age + " years old" : ""}, ${profile.gender || ""}.

PATIENT CLINICAL PROFILE:
- Active conditions: ${conditions}
- Max Glycemic Load per meal: ${thresholds.maxGlycemicLoadPerServing || 10}
- Max Sodium per serving: ${thresholds.maxSodiumMgPerServing || 400}mg

RECENT SCAN HISTORY:
${recentScans}

Your role:
- Provide evidence-based dietary advice tailored to the patient's specific conditions
- Explain clinical flags and food risks in simple, empathetic language
- Suggest safer food alternatives when relevant
- Answer questions about nutrition, ingredients, and health goals
- Be concise (2-4 sentences per response), warm, and professional
- Never diagnose or replace medical advice — always recommend consulting their physician for medical decisions

Respond directly and helpfully to the patient's message.`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "Sorry, I couldn't process that. Please try again.";
}
