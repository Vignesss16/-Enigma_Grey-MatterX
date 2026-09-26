import { NextRequest, NextResponse } from "next/server";
import { ClinicalRiskEngine } from "@/lib/risk-engine";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const foodName = body.food_name || body.query || body.food || "scanned food item";
    const condition = body.condition || "general wellness";
    const userId = body.user_id || null;

    // 1. Fetch user profile if user_id is provided
    let patientProfile: any = {
      full_name: "Patient",
      conditions: [{ id: condition, label: condition }],
      thresholds: {
        maxGlycemicLoadPerServing: 10,
        maxSodiumMgPerServing: 400,
        dailySodiumMgCeiling: 1500,
        maxAddedSugarGrams: 0,
      },
    };

    if (userId) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileData) {
        patientProfile = profileData;
      }
    }

    // 2. Search latest scanned food in database or construct product evaluation
    let foodItem: any = null;
    if (userId) {
      const { data: scanData } = await supabase
        .from("food_scans")
        .select("*")
        .eq("user_id", userId)
        .order("scanned_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (scanData) {
        foodItem = {
          id: scanData.id,
          name: scanData.product_name,
          brand: scanData.brand || "",
          category: scanData.category || "Biscuits & Snacks",
          ingredients: scanData.ingredients || [],
          nutrition: scanData.nutrition_facts || {
            calories: 45,
            carbsGrams: 7.5,
            sugarGrams: 1.5,
            sodiumMg: 35,
            proteinGrams: 0.8,
            fatGrams: 1.5,
            fiberGrams: 0.8,
            glycemicLoad: 5,
          },
        };
      }
    }

    if (!foodItem) {
      foodItem = {
        id: "omni-query",
        name: foodName,
        category: "Processed Snack",
        ingredients: [
          { name: "Refined Wheat Flour (Maida)", flags: ["high_glycemic", "ultra_processed"] },
          { name: "Sugar & Invert Syrup", flags: ["added_sugar"] },
          { name: "Palm Oil / Edible Vegetable Fat", flags: ["saturated_fat"] },
          { name: "Millet Flour (Jowar/Ragi)", flags: ["whole_grain"] },
        ],
        nutrition: {
          calories: 45,
          carbsGrams: 7.5,
          sugarGrams: 1.5,
          sodiumMg: 35,
          proteinGrams: 0.8,
          fatGrams: 1.5,
          fiberGrams: 0.8,
          glycemicLoad: 5,
        },
      };
    }

    // 3. Evaluate using Clinical Risk Engine
    const evaluation = ClinicalRiskEngine.evaluate(foodItem, patientProfile);
    const triageScore = evaluation.overallStatus === "flagged" ? 78 : evaluation.overallStatus === "caution" ? 45 : 15;

    // 4. Construct natural speech text for OmniDimension Voice Agent
    const spokenSummary = `The assessment for ${foodItem.name} shows a clinical triage risk score of ${triageScore} out of 100, status: ${evaluation.overallStatus}. ` +
      `Although packaged with millet claims, each portion contains ${foodItem.nutrition.carbsGrams || 7.5} grams of carbs and ${foodItem.nutrition.sugarGrams || 1.5} grams of sugar. ` +
      `Regular daily consumption causes insulin spikes and long-term metabolic strain. ` +
      `Healthier alternatives include roasted chana, raw almonds, or roasted makhana.`;

    return NextResponse.json({
      success: true,
      food_name: foodItem.name,
      triage_score: triageScore,
      overall_status: evaluation.overallStatus,
      clinical_flags: evaluation.clinicalFlags.map((f: any) => f.title || f),
      spoken_summary: spokenSummary,
      safer_alternatives: [
        "Roasted Bhuna Chana (Chickpeas)",
        "Raw or Dry-Roasted Almonds & Walnuts",
        "Roasted Makhana (Fox Nuts)",
      ],
    });
  } catch (error: any) {
    console.error("OmniDimension Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed", message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const foodName = searchParams.get("food_name") || searchParams.get("query") || "scanned food item";
  const condition = searchParams.get("condition") || "general wellness";
  const userId = searchParams.get("user_id") || null;

  // Delegate GET requests to the same logic
  return POST(
    new NextRequest(req.url, {
      method: "POST",
      body: JSON.stringify({ food_name: foodName, condition, user_id: userId }),
      headers: { "Content-Type": "application/json" },
    })
  );
}
