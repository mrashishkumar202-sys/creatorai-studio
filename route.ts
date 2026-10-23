import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "CreatorAI Studio",
    aiConfigured: Boolean(process.env.AI_API_KEY),
    message: process.env.AI_API_KEY ? "AI provider key is configured." : "AI provider is not configured."
  });
}
