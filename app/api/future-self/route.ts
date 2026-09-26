import { NextRequest, NextResponse } from "next/server";

function getDIDAuthHeader(apiKey: string): string {
  const trimmed = apiKey.trim();
  if (trimmed.startsWith("Basic ")) return trimmed;
  return `Basic ${trimmed}`;
}

async function callDIDFetch(url: string, options: RequestInit, apiKey: string) {
  const authHeader = getDIDAuthHeader(apiKey);
  const headers = { ...options.headers, Authorization: authHeader };
  return await fetch(url, { ...options, headers });
}

async function uploadImageToDID(
  base64Image: string,
  mimeType: string,
  apiKey: string
): Promise<string | null> {
  try {
    let cleanBase64 = base64Image;
    if (base64Image.includes("base64,")) {
      cleanBase64 = base64Image.split("base64,")[1];
    }
    const buffer = Buffer.from(cleanBase64, "base64");
    const blob = new Blob([buffer], { type: mimeType || "image/jpeg" });
    const formData = new FormData();
    formData.append("image", blob, "user-avatar.jpg");

    const res = await callDIDFetch(
      "https://api.d-id.com/images",
      {
        method: "POST",
        body: formData,
      },
      apiKey
    );

    if (res.ok) {
      const data = await res.json();
      if (data.url) return data.url;
    } else {
      const errText = await res.text();
      console.warn("D-ID image upload returned status", res.status, errText);
    }
  } catch (err) {
    console.error("D-ID image upload error:", err);
  }
  return null;
}

async function generateFutureSelfScript(
  userProfile: any,
  currentFood: any,
  riskAnalysis: any,
  userQuestion: string,
  context: string,
  conversationHistory: any[] = []
): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  const foodName = currentFood?.name || "this food item";
  const brandCategory = `${currentFood?.brand || ""} ${currentFood?.category || ""}`.trim();
  const calories = currentFood?.nutrition?.calories || currentFood?.nutritionFacts?.calories || 0;
  const sodium = currentFood?.nutrition?.sodiumMg || currentFood?.nutritionFacts?.sodiumMg || 0;
  const sugar = currentFood?.nutrition?.totalSugarsGrams || currentFood?.nutritionFacts?.sugarGrams || 0;
  const carbs = currentFood?.nutrition?.totalCarbohydratesGrams || currentFood?.nutritionFacts?.carbohydratesGrams || 0;
  
  const conditions = Array.isArray(userProfile?.conditions) 
    ? userProfile.conditions.map((c: any) => typeof c === "string" ? c : c.label || c.title || c.id).join(", ") 
    : "wellness goals";

  const concerns = Array.isArray(riskAnalysis?.concerns) && riskAnalysis.concerns.length > 0
    ? riskAnalysis.concerns.join(", ")
    : Array.isArray(currentFood?.clinicalFlags) && currentFood.clinicalFlags.length > 0
    ? currentFood.clinicalFlags.map((f: any) => f.title || f).join(", ")
    : "no urgent clinical flags";

  const systemPrompt = `You are the user's "Future Self" — a visualized version of them approximately 5 to 10 years older.
Your goal is to help the user think through their CURRENT food decision in a calm, supportive, and practical manner.

STRICT PERSONALITY & TONE GUIDELINES:
- Human, calm, supportive, personal, empathetic, non-judgmental, practical, concise.
- Speak directly as their future self (e.g., "Hey, it's me — a future version of you..." or "Hey there, looking at this choice with you from a few years down the line..."). Vary the intro naturally. Do NOT repeat the exact same intro every time.
- Spoken length: 20 to 60 seconds of natural speech (approx 50 to 110 words).
- MUST NOT use markdown formatting, bullet points, hashtags, emojis, or quotes because this text will be converted directly into speech audio.

STRICT SAFETY & MEDICAL RULES:
- NEVER claim to know the user's actual future or make definitive medical diagnoses or predictions.
- NEVER say "You will develop diabetes", "This will cause kidney failure", "In 10 years you will have this disease", or "If you eat this, your future health will be...".
- ALWAYS use scenario-based and observational language:
  * "This choice may be relevant to your current health goal because..."
  * "Based on the information available..."
  * "This option is relatively high in sodium..."
  * "You may want to consider..."
  * "Here are some alternatives..."
- Focus on helping the user pause, reflect, and make an informed decision right now.`;

  const prompt = `
CURRENT FOOD DECISION SCENARIO:
- Food Item: ${foodName} ${brandCategory ? `(${brandCategory})` : ""}
- Nutrition Overview: Calories: ${calories} kcal, Sodium: ${sodium} mg, Sugar: ${sugar} g, Carbs: ${carbs} g
- Key Clinical Considerations / Concerns: ${concerns}
- Dining Context: ${context || "packaged food"}

USER HEALTH CONTEXT:
- Health Conditions / Considerations: ${conditions || "General nutritional awareness"}
- Health Goals: ${Array.isArray(userProfile?.healthGoals) ? userProfile.healthGoals.join(", ") : "Balanced nutrition"}

USER QUESTION / REFLECTION:
"${userQuestion || "Before I make this food choice, what should I think about?"}"

Provide a warm, conversational 2-3 sentence response as their Future Self. Speak as if talking face to face.`;

  // Use Groq API
  if (groqApiKey) {
    try {
      const groqMessages = [
        { role: "system", content: systemPrompt },
        ...conversationHistory.map((m: any) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
        { role: "user", content: prompt },
      ];

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: groqMessages,
          temperature: 0.6,
          max_tokens: 250,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.choices[0]?.message?.content?.trim();
        if (text) return cleanScriptForSpeech(text);
      }
    } catch (err) {
      console.warn("Groq error in Future Self script generation:", err);
    }
  }

  // Fallback to Gemini if key exists
  if (geminiApiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: `${systemPrompt}\n\n${prompt}` }],
              },
            ],
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return cleanScriptForSpeech(text);
      }
    } catch (err) {
      console.warn("Gemini error in Future Self script generation:", err);
    }
  }

  return generateTemplateFallbackScript(foodName, sodium, sugar, concerns, conditions);
}

function cleanScriptForSpeech(text: string): string {
  return text
    .replace(/[\*\_~#`]/g, "")
    .replace(/^["']|["']$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function generateTemplateFallbackScript(
  foodName: string,
  sodium: number,
  sugar: number,
  concerns: string,
  conditions: string
): string {
  const intros = [
    `Hey, it's me — a future version of you. I can see you're thinking about having ${foodName}, so let's take a quick moment together before you decide.`,
    `Hey there, looking back at this food choice with you from a few years down the road.`,
    `Hey, it's future-you here! Before you dive into ${foodName}, let me share a quick reflection on how this fits our goals.`
  ];
  const selectedIntro = intros[Math.floor(Math.random() * intros.length)];

  let middleAdvice = `Based on the nutritional facts, this choice has ${sodium > 400 ? `${sodium} milligrams of sodium` : sugar > 15 ? `${sugar} grams of sugar` : "nutritional elements"} to consider regarding ${conditions}.`;

  if (concerns && concerns !== "no urgent clinical flags") {
    middleAdvice += ` In particular, we noticed ${concerns.toLowerCase()}.`;
  }

  const ending = `You don't necessarily have to skip it completely, but consider enjoying a smaller portion or pairing it with water. I just wanted you to have that perspective before you decide!`;

  return `${selectedIntro} ${middleAdvice} ${ending}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userProfile,
      currentFood,
      riskAnalysis,
      userQuestion,
      context,
      conversationHistory,
      userImageBase64,
      mimeType,
    } = body;

    if (!currentFood && !userQuestion) {
      return NextResponse.json(
        { error: "Please provide current food context or a question." },
        { status: 400 }
      );
    }

    // 1. Generate Future Self response script using Groq
    const scriptText = await generateFutureSelfScript(
      userProfile,
      currentFood,
      riskAnalysis,
      userQuestion,
      context,
      conversationHistory || []
    );

    const didApiKey = process.env.DID_API_KEY;
    let avatarImageUrl =
      process.env.AVATAR_IMAGE_URL ||
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80";

    // 2. If user image base64 is provided and D-ID key exists, upload to D-ID images endpoint first!
    if (didApiKey && userImageBase64) {
      const uploadedUrl = await uploadImageToDID(userImageBase64, mimeType || "image/jpeg", didApiKey);
      if (uploadedUrl) {
        avatarImageUrl = uploadedUrl;
      }
    }

    // 3. Create talk on D-ID API
    if (didApiKey) {
      try {
        const didResponse = await callDIDFetch(
          "https://api.d-id.com/talks",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              source_url: avatarImageUrl,
              script: {
                type: "text",
                input: scriptText,
                provider: {
                  type: "microsoft",
                  voice_id: "en-US-JennyNeural",
                },
              },
            }),
          },
          didApiKey
        );

        if (didResponse.ok) {
          const didData = await didResponse.json();
          return NextResponse.json({
            success: true,
            text: scriptText,
            talkId: didData.id,
            status: "processing",
            avatarImageUrl,
          });
        } else {
          const errText = await didResponse.text();
          console.error("D-ID talk creation error:", errText);
          return NextResponse.json({
            success: true,
            text: scriptText,
            talkId: null,
            status: "error",
            error: `D-ID video render unavailable (${didResponse.status}). Text fallback provided.`,
          });
        }
      } catch (err: any) {
        console.error("D-ID fetch exception:", err);
        return NextResponse.json({
          success: true,
          text: scriptText,
          talkId: null,
          status: "error",
          error: "D-ID integration network error. Text response provided.",
        });
      }
    }

    return NextResponse.json({
      success: true,
      text: scriptText,
      talkId: null,
      status: "error",
      error: "DID_API_KEY not configured on server. Text response provided.",
    });
  } catch (error: any) {
    console.error("Future Self API error:", error);
    return NextResponse.json(
      { error: "Failed to generate Future Self response", message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const talkId = searchParams.get("talkId");

  if (!talkId) {
    return NextResponse.json({ error: "Missing talkId query parameter" }, { status: 400 });
  }

  const didApiKey = process.env.DID_API_KEY;
  if (!didApiKey) {
    return NextResponse.json({ status: "error", error: "DID_API_KEY not set" }, { status: 400 });
  }

  try {
    const res = await callDIDFetch(
      `https://api.d-id.com/talks/${talkId}`,
      { method: "GET" },
      didApiKey
    );

    if (!res.ok) {
      return NextResponse.json({ status: "error", error: "Failed to fetch talk status from D-ID" });
    }

    const data = await res.json();
    const status = data.status === "started" || data.status === "created" ? "processing" : data.status;

    return NextResponse.json({
      status,
      videoUrl: data.result_url || null,
      error: data.error || null,
    });
  } catch (err: any) {
    return NextResponse.json({ status: "error", error: err.message });
  }
}
