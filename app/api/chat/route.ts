import { NextRequest, NextResponse } from "next/server";
import { chatWithHealthAI } from "@/lib/groq";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { messages, userId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    let profile: any = { full_name: "Patient", conditions: [], thresholds: {} };
    let scanHistory: any[] = [];

    if (userId) {
      const [profileRes, historyRes] = await Promise.all([
        supabaseAdmin.from("profiles").select("*").eq("user_id", userId).single(),
        supabaseAdmin
          .from("food_scans")
          .select("product_name, overall_status, scanned_at")
          .eq("user_id", userId)
          .order("scanned_at", { ascending: false })
          .limit(10),
      ]);

      if (profileRes.data) profile = profileRes.data;
      if (historyRes.data) scanHistory = historyRes.data;
    }

    const reply = await chatWithHealthAI(messages, profile, scanHistory);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Chat failed", message: (error as Error).message },
      { status: 500 }
    );
  }
}
