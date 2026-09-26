import { z } from "zod";

export const ScanInputSchema = z.object({
  imageUrl: z.string().optional(),
  imageBase64: z.string().optional(),
  barcode: z.string().optional(),
  rawText: z.string().optional(),
  productName: z.string().optional(),
});

export const HealthProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  patientId: z.string().default("CDS-8842"),
  conditions: z.array(z.string()).min(1, "Select at least one health profile condition"),
  maxGlycemicLoad: z.number().min(1).max(50).default(10),
  maxSodiumMg: z.number().min(50).max(2500).default(400),
  prohibitedAllergens: z.array(z.string()).default([]),
});

export const FoodAnalysisResultSchema = z.object({
  productName: z.string(),
  brand: z.string().optional(),
  category: z.string().optional(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      category: z.string(),
      riskSeverity: z.enum(["low", "moderate", "high", "critical"]),
      clinicalNote: z.string().optional(),
    })
  ),
  nutrition: z.object({
    servingSize: z.string(),
    calories: z.number(),
    totalCarbs: z.number(),
    dietaryFiber: z.number(),
    sugars: z.number(),
    sodiumMg: z.number(),
    glycemicLoad: z.number(),
  }),
  overallRisk: z.enum(["safe", "caution", "flagged"]),
});
