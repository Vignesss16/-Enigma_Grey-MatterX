export type HealthCondition = 
  | 'diabetes_type_2'
  | 'hypertension'
  | 'celiac_gluten'
  | 'peanut_allergy'
  | 'renal_chronic'
  | 'hyperlipidemia'
  | 'lactose_intolerance';

export interface HealthProfile {
  id: string;
  name: string;
  patientId: string;
  age: number;
  gender: string;
  conditions: {
    id: HealthCondition;
    label: string;
    status: 'active' | 'monitored';
    criticality: 'high' | 'medium' | 'low';
  }[];
  thresholds: {
    maxGlycemicLoadPerServing: number;
    maxSodiumMgPerServing: number;
    dailySodiumMgCeiling: number;
    maxAddedSugarGrams: number;
    prohibitedSweeteners: string[];
    prohibitedAllergens: string[];
  };
  notes?: string;
  updatedAt: string;
}

export type RiskSeverity = 'low' | 'moderate' | 'high' | 'critical';

export interface IngredientItem {
  id: string;
  name: string;
  declaredOrder: number;
  percentageEstimate?: number;
  category: 'sweetener' | 'starch_flour' | 'additive' | 'preservative' | 'protein' | 'fat_oil' | 'flavoring' | 'whole_food';
  glycemicImpact: 'low' | 'medium' | 'high';
  isPolyolOrArtificialSweetener?: boolean;
  eNumber?: string;
  riskSeverity: RiskSeverity;
  clinicalNote?: string;
}

export interface NutritionFacts {
  servingSize: string;
  servingsPerContainer?: number;
  calories: number;
  totalCarbohydratesGrams: number;
  dietaryFiberGrams: number;
  totalSugarsGrams: number;
  addedSugarsGrams: number;
  sugarAlcoholsPolyolsGrams: number;
  netCarbohydratesGrams: number;
  proteinGrams: number;
  totalFatGrams: number;
  saturatedFatGrams: number;
  sodiumMg: number;
  potassiumMg?: number;
  glycemicLoadScore: number; // Calculated GL
}

export interface ClinicalFlag {
  id: string;
  title: string;
  severity: RiskSeverity;
  affectedCondition: HealthCondition;
  rationale: string;
  threeStepChain: {
    profileStep: string;
    foodInfoStep: string;
    potentialRelevanceStep: string;
  };
}

export interface FoodProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  imageUrl: string;
  batchNumber?: string;
  barcode?: string;
  confidenceScore: number;
  scannedAt: string;
  overallStatus: 'safe' | 'caution' | 'flagged';
  nutrition: NutritionFacts;
  ingredients: IngredientItem[];
  clinicalFlags: ClinicalFlag[];
  hiddenPolyolsDetected: number; // in grams
}

export interface AlternativeProduct {
  id: string;
  name: string;
  brand: string;
  code: string;
  imageUrl: string;
  compatibilityPercentage: number;
  netCarbsGrams: number;
  glycemicCategory: 'Very Low Glycemic' | 'Low Glycemic' | 'Moderate';
  glycemicLoad: number;
  addedSweetenersGrams: number;
  sweetenerNote: string;
  sodiumMg: number;
  sodiumNote: string;
  clinicalRationale: string;
  fiberDensity: string;
  detailsSummary: string;
}

export interface ScanProcessingStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  progressPercentage: number;
}

export interface DiningOutDish {
  id: string;
  dishName: string;
  venueType: 'Restaurant' | 'Tiffin Service' | 'Wedding / Buffet' | 'Street Food' | 'Home-cooked';
  imageUrl: string;
  estimatedCalories: number;
  confidenceLevel: 'High' | 'Partial' | 'Low';
  uncertaintyDescription: string;
  concerns: {
    title: string;
    level: RiskSeverity;
    description: string;
  }[];
  customizationTips: string[];
}

export interface DoctorPatient {
  id: string;
  name: string;
  patientId: string;
  age: number;
  gender: string;
  avatarUrl?: string;
  conditions: string[];
  riskLevel: 'high' | 'moderate' | 'low';
  lastEvaluated: string;
  todayIntake: {
    sodiumMg: number;
    glycemicLoadAvg: number;
    flagsCount: number;
  };
}

export interface DoctorAssessmentRow {
  id: string;
  foodName: string;
  brand: string;
  category: string;
  imageUrl: string;
  detectedDate: string;
  riskFlag: 'High Hazard' | 'Moderate Trigger' | 'Partial Alert' | 'Low Risk / Safe';
  riskSeverity: 'critical' | 'high' | 'moderate' | 'low';
  keyIngredient: string;
  keyIngredientDetail: string;
  infoQuality: string;
  infoQualityScore: number;
}
