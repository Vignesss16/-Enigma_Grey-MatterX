import { NextRequest, NextResponse } from "next/server";
import { ClinicalRiskEngine } from "@/lib/risk-engine";
import { DEFAULT_PATIENT_PROFILE } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  try {
    const { food, profile } = await req.json();

    if (!food) {
      return NextResponse.json({ error: "Missing food data" }, { status: 400 });
    }

    const patientProfile = profile || DEFAULT_PATIENT_PROFILE;
    const result = ClinicalRiskEngine.evaluate(food, patientProfile);

    return NextResponse.json({
      success: true,
      evaluation: result,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Evaluation failed", message: (error as Error).message },
      { status: 500 }
    );
  }
}
