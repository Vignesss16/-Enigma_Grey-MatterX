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

export async function GET(
  req: NextRequest,
  { params }: { params: { talkId: string } }
) {
  const talkId = params.talkId;

  if (!talkId) {
    return NextResponse.json({ error: "Missing talkId" }, { status: 400 });
  }

  const didApiKey = process.env.DID_API_KEY;
  if (!didApiKey) {
    return NextResponse.json(
      { status: "error", error: "DID_API_KEY not configured on server" },
      { status: 400 }
    );
  }

  try {
    const res = await callDIDFetch(
      `https://api.d-id.com/talks/${talkId}`,
      { method: "GET" },
      didApiKey
    );

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`D-ID talk status check HTTP ${res.status}:`, errBody);
      return NextResponse.json(
        { status: "error", error: `D-ID API HTTP ${res.status}: ${errBody}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    const status =
      data.status === "started" || data.status === "created"
        ? "processing"
        : data.status;

    let errorMessage: string | null = null;
    if (data.status === "error" || data.error) {
      errorMessage =
        typeof data.error === "string"
          ? data.error
          : data.error?.description || data.error?.kind || JSON.stringify(data.error);
      console.warn(`D-ID talk ${talkId} failed with error:`, data.error);
    }

    return NextResponse.json({
      status, // "created" | "processing" | "done" | "error"
      videoUrl: data.result_url || null,
      error: errorMessage,
      rawDidData: data,
    });
  } catch (err: any) {
    console.error("Error checking D-ID talkId status:", err);
    return NextResponse.json({ status: "error", error: err.message }, { status: 500 });
  }
}
