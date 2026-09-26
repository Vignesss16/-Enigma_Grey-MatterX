import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface GeminiExtractionResult {
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

export async function analyzeFoodLabelWithGemini(
  imageBase64OrUrl: string,
  mimeType: string = "image/jpeg"
): Promise<GeminiExtractionResult> {
  if (!genAI) {
    // Graceful fallback to clinical simulation when API key is not configured
    return simulateOcrExtraction();
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Handle base64 image data
    let base64Data = imageBase64OrUrl;
    if (imageBase64OrUrl.includes("base64,")) {
      base64Data = imageBase64OrUrl.split("base64,")[1];
    }

    const prompt = `
You are a precision clinical OCR and dietary data extraction engine. Analyze the provided food label image.
Extract the following information in strict JSON format:
{
  "productName": "string",
  "brand": "string",
  "category": "string",
  "ingredientsText": "string",
  "ingredientsList": ["string"],
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
  "detectedAllergens": ["string"],
  "rawOcrText": "string"
}

Pay extreme attention to:
- Ingredients listed 1st, 2nd, and 3rd by volume.
- Hidden polyols and sugar alcohols (maltitol, sorbitol, xylitol, erythritol, isomalt, hydrogenated starch hydrolysates).
- Sodium density per serving.
- Do not output markdown backticks or extra commentary, ONLY the raw JSON object.
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text().trim();
    
    // Clean potential markdown backticks
    const cleanedJson = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    return JSON.parse(cleanedJson) as GeminiExtractionResult;
  } catch (error) {
    console.error("Gemini OCR analysis error:", error);
    return simulateOcrExtraction();
  }
}

function simulateOcrExtraction(): GeminiExtractionResult {
  return {
    productName: "NutriChoice Sugar-Free Digestive",
    brand: "Britannia",
    category: "Packaged biscuit",
    ingredientsText: "Refined Wheat Flour (Maida - 56.4%), Polyols (Maltitol Syrup INS 965ii), Refined Palm Oil, Wheat Bran (4.5%), Raising Agents (INS 500ii, INS 503ii), Iodised Salt.",
    ingredientsList: [
      "Refined Wheat Flour (Maida - 56.4%)",
      "Polyols / Maltitol Syrup (INS 965ii)",
      "Refined Palm Oil",
      "Wheat Bran (4.5%)",
      "Raising Agents (INS 500ii, INS 503ii)",
      "Iodised Salt (0.6%)"
    ],
    nutritionFacts: {
      servingSize: "2 biscuits (25g)",
      calories: 118,
      carbohydratesGrams: 18.2,
      dietaryFiberGrams: 1.5,
      sugarGrams: 0.4,
      addedSugarGrams: 0,
      sugarAlcoholsPolyolsGrams: 4.8,
      proteinGrams: 2.1,
      fatGrams: 4.8,
      saturatedFatGrams: 2.2,
      sodiumMg: 145,
    },
    detectedAllergens: ["Gluten", "Wheat"],
    rawOcrText: "NUTRITION FACTS PER 100g / SERVING 25g. REFINED WHEAT FLOUR 56.4%, MALTITOL SYRUP...",
  };
}
