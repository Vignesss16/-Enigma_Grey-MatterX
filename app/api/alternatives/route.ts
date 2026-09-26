import { NextRequest, NextResponse } from "next/server";
import { SAFER_ALTERNATIVES } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const maxGl = Number(searchParams.get("maxGl") || "10");

  const filtered = SAFER_ALTERNATIVES.filter(
    (alt) => alt.glycemicLoad <= maxGl
  );

  return NextResponse.json({
    success: true,
    total: filtered.length,
    alternatives: filtered,
  });
}
