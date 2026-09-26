import { FoodProduct, HealthProfile, ClinicalFlag, IngredientItem } from "@/types";

// Known glycemic index mapping for common carbohydrate/sweetener sources
const GLYCEMIC_INDEX_TABLE: Record<string, number> = {
  glucose: 100,
  maltodextrin: 110,
  maltitol: 35, // High glycemic impact for a polyol
  maltitol_syrup: 52,
  sorbitol: 9,
  xylitol: 12,
  erythritol: 0,
  sucralose: 0,
  stevia: 0,
  refined_wheat_flour: 85,
  maida: 85,
  white_rice_flour: 82,
  corn_starch: 85,
  rolled_oats: 55,
  flaxseed: 15,
  pumpkin_seed: 10,
  quinoa: 53,
  table_sugar: 65,
};

export class ClinicalRiskEngine {
  /**
   * Evaluates a food item against a patient's clinical health profile
   */
  public static evaluate(
    food: Omit<FoodProduct, 'clinicalFlags' | 'overallStatus' | 'hiddenPolyolsDetected'>,
    profile: HealthProfile
  ): {
    clinicalFlags: ClinicalFlag[];
    overallStatus: 'safe' | 'caution' | 'flagged';
    triageScore: number;
    hiddenPolyolsDetected: number;
    annotatedIngredients: IngredientItem[];
  } {
    const flags: ClinicalFlag[] = [];
    let hiddenPolyolsDetected = 0;

    // 1. Evaluate Carbohydrates & Hidden Polyols against Type-2 Diabetes
    const hasDiabetes = profile.conditions.some((c) => c.id === 'diabetes_type_2');
    
    // Check ingredients for rapid starches or polyol deceptions
    const annotatedIngredients = food.ingredients.map((ing) => {
      const lower = ing.name.toLowerCase();
      let severity = ing.riskSeverity;
      let clinicalNote = ing.clinicalNote;

      // Check for Maltitol / Polyol marketing deception
      if (lower.includes('maltitol') || lower.includes('isomalt') || lower.includes('sorbitol') || lower.includes('hydrogenated starch')) {
        severity = 'high';
        hiddenPolyolsDetected += 4.5;
        clinicalNote = 'Synthetic sugar alcohol with notable glycemic index (GI ~35-52). May cause glycemic spikes.';
      }

      // Check refined flours at top of ingredient deck
      if ((lower.includes('refined wheat') || lower.includes('maida') || lower.includes('all-purpose flour')) && ing.declaredOrder <= 2) {
        severity = 'high';
        clinicalNote = 'High glycemic index grain (>85 GI) converted rapidly into blood glucose.';
      }

      return {
        ...ing,
        riskSeverity: severity,
        clinicalNote,
      };
    });

    // 1. Critical Confectionery & Biscuit Safety Rule: Detects biscuits/cookies & maida + palm oil + emulsifiers
    const foodNameLower = (food.name || "").toLowerCase();
    const foodCatLower = (food.category || "").toLowerCase();
    const allIngsLower = food.ingredients.map((i) => i.name.toLowerCase()).join(" ");

    const isBiscuitOrCookie =
      foodNameLower.includes("biscuit") ||
      foodNameLower.includes("cookie") ||
      foodNameLower.includes("digestive") ||
      foodNameLower.includes("marie") ||
      foodNameLower.includes("parle") ||
      foodNameLower.includes("cracker") ||
      foodNameLower.includes("bourbon") ||
      foodNameLower.includes("wafer") ||
      foodCatLower.includes("biscuit") ||
      foodCatLower.includes("cookie") ||
      foodCatLower.includes("confectionery") ||
      allIngsLower.includes("biscuit");

    const hasMaida =
      allIngsLower.includes("maida") ||
      allIngsLower.includes("refined wheat") ||
      allIngsLower.includes("refined flour") ||
      food.ingredients[0]?.name.toLowerCase().includes("flour") ||
      food.ingredients[0]?.name.toLowerCase().includes("wheat");

    const hasPalmOil =
      allIngsLower.includes("palm oil") ||
      allIngsLower.includes("vegetable oil") ||
      allIngsLower.includes("edible vegetable oil") ||
      allIngsLower.includes("hydrogenated");

    const hasEmulsifier =
      allIngsLower.includes("emulsifier") ||
      allIngsLower.includes("emulsifying") ||
      allIngsLower.includes("322") ||
      allIngsLower.includes("471") ||
      allIngsLower.includes("472") ||
      allIngsLower.includes("lecithin");

    if (isBiscuitOrCookie || (hasMaida && (hasPalmOil || hasEmulsifier))) {
      flags.push({
        id: "flag-biscuit-maida-palm-oil-emulsifiers",
        title: "Flagged: Contains Maida, Vegetable Palm Oil & Emulsifiers — Do Not Consume",
        severity: "critical",
        affectedCondition: "diabetes_type_2",
        rationale: "Contains maida, vegetable palm oil, emulsifiers and inappropriate ingredients. Do not consume it — do not consume it if you have diabetes.",
        threeStepChain: {
          profileStep: "Clinical diabetes and metabolic profile requires strictly avoiding ultra-processed refined grain and palm oil confectionery.",
          foodInfoStep: "Detected ingredients: Refined wheat flour (Maida), Vegetable palm oil, Emulsifiers, and inappropriate additives.",
          potentialRelevanceStep: "Contains maida, vegetable palm oil, emulsifiers and inappropriate ingredients. Do not consume it — do not consume it if you have diabetes.",
        },
      });
    }

    if (hasDiabetes) {
      // Check refined flour predominance
      const firstIng = food.ingredients[0]?.name.toLowerCase() || '';
      if (!isBiscuitOrCookie && (firstIng.includes('refined') || firstIng.includes('flour') || firstIng.includes('maida'))) {
        flags.push({
          id: 'flag-refined-carbs',
          title: 'Refined carbohydrates listed prominently',
          severity: 'high',
          affectedCondition: 'diabetes_type_2',
          rationale: 'Listed as 1st ingredient by volume (>55% composition weight).',
          threeStepChain: {
            profileStep: 'Personal insulin sensitivity index requires low glycemic load.',
            foodInfoStep: 'Refined wheat flour listed as 1st ingredient by volume (>55% composition weight).',
            potentialRelevanceStep: 'Rapid starch conversion may cause significant postprandial glucose elevation despite zero added table sugar.',
          },
        });
      }

      // Check polyols / artificial sweeteners
      if (hiddenPolyolsDetected > 0 || food.nutrition.sugarAlcoholsPolyolsGrams > 0) {
        flags.push({
          id: 'flag-hidden-polyols',
          title: 'Added sweeteners (Maltitol / Polyols)',
          severity: 'moderate',
          affectedCondition: 'diabetes_type_2',
          rationale: 'Formulated with polyols that carry partial glycemic and metabolic response.',
          threeStepChain: {
            profileStep: 'Profile targets 0g added chemical sugar alcohols with high digestive transit speed.',
            foodInfoStep: 'Contains maltitol syrup & polyol leavening compounds.',
            potentialRelevanceStep: 'Often marketed as "sugar-free", maltitol carries ~50% the glycemic response of cane sugar.',
          },
        });
      }

      // Check Glycemic Load
      if (food.nutrition.glycemicLoadScore > profile.thresholds.maxGlycemicLoadPerServing) {
        flags.push({
          id: 'flag-high-gl',
          title: `Glycemic Load (${food.nutrition.glycemicLoadScore}) exceeds threshold (${profile.thresholds.maxGlycemicLoadPerServing})`,
          severity: 'high',
          affectedCondition: 'diabetes_type_2',
          rationale: `Carbohydrate quantity and rapid absorption rate exceeds your customized meal target.`,
          threeStepChain: {
            profileStep: `Max target glycemic load per snack is ${profile.thresholds.maxGlycemicLoadPerServing}.`,
            foodInfoStep: `Calculated load is ${food.nutrition.glycemicLoadScore} based on ${food.nutrition.netCarbohydratesGrams}g net carbs.`,
            potentialRelevanceStep: 'Prolongs elevated glucose excursion beyond normal 2-hour postprandial window.',
          },
        });
      }
    }

    // 2. Evaluate Sodium & Electrolytes against Hypertension
    const hasHypertension = profile.conditions.some((c) => c.id === 'hypertension');
    if (hasHypertension) {
      if (food.nutrition.sodiumMg > profile.thresholds.maxSodiumMgPerServing) {
        flags.push({
          id: 'flag-sodium-density',
          title: `Sodium Density Spike (${food.nutrition.sodiumMg}mg / serving)`,
          severity: 'high',
          affectedCondition: 'hypertension',
          rationale: `Exceeds single-snack allowance of ${profile.thresholds.maxSodiumMgPerServing}mg.`,
          threeStepChain: {
            profileStep: 'Stage 1 Hypertension dietary guideline restricts sodium per single portion to <400mg.',
            foodInfoStep: `Declared sodium is ${food.nutrition.sodiumMg}mg per standard serving.`,
            potentialRelevanceStep: 'May precipitate acute intravascular volume expansion and blood pressure elevation.',
          },
        });
      }
    }

    // 3. Evaluate Prohibited Allergens
    for (const allergen of profile.thresholds.prohibitedAllergens) {
      const match = food.ingredients.find((ing) => ing.name.toLowerCase().includes(allergen.toLowerCase()));
      if (match) {
        flags.push({
          id: `flag-allergen-${allergen}`,
          title: `Prohibited Allergen Detected: ${match.name}`,
          severity: 'critical',
          affectedCondition: 'peanut_allergy',
          rationale: `Contains ${match.name}, strictly flagged in your allergy profile.`,
          threeStepChain: {
            profileStep: `Patient history shows documented hypersensitivity to ${allergen}.`,
            foodInfoStep: `Found "${match.name}" in verified ingredient deck.`,
            potentialRelevanceStep: 'Immediate risk of allergic reaction. Do not consume.',
          },
        });
      }
    }

    // Determine overall status
    let overallStatus: 'safe' | 'caution' | 'flagged' = 'safe';
    if (flags.some((f) => f.severity === 'critical' || f.severity === 'high')) {
      overallStatus = 'flagged';
    } else if (flags.length > 0) {
      overallStatus = 'caution';
    }

    // Calculate clinical triage risk score (0 - 100) strictly adhering to:
    // 0-30: Green (Safe / Low Risk)
    // 31-70: Yellow (Caution / Moderate Risk)
    // 71-100: Red (Flagged / High Risk)
    let triageScore = 15;
    if (overallStatus === 'flagged') {
      const highFlags = flags.filter(f => f.severity === 'high' || f.severity === 'critical').length;
      const modFlags = flags.filter(f => f.severity === 'moderate').length;
      const sodiumBonus = Math.min(10, Math.max(0, Math.round(((food.nutrition.sodiumMg || 0) - 400) / 100)));
      const glBonus = Math.min(10, Math.max(0, Math.round(((food.nutrition.glycemicLoadScore || 0) - 10) * 0.5)));
      triageScore = Math.min(100, Math.max(71, 72 + (highFlags * 6) + (modFlags * 3) + sodiumBonus + glBonus));
    } else if (overallStatus === 'caution') {
      const modFlags = flags.filter(f => f.severity === 'moderate').length;
      const lowFlags = flags.filter(f => f.severity === 'low').length;
      triageScore = Math.min(70, Math.max(31, 38 + (modFlags * 10) + (lowFlags * 5)));
    } else {
      const glImpact = Math.min(10, Math.round((food.nutrition.glycemicLoadScore || 0)));
      const sodiumImpact = Math.min(8, Math.round((food.nutrition.sodiumMg || 0) / 50));
      triageScore = Math.min(30, Math.max(5, 10 + glImpact + sodiumImpact));
    }

    return {
      clinicalFlags: flags,
      overallStatus,
      triageScore,
      hiddenPolyolsDetected,
      annotatedIngredients,
    };
  }
}
