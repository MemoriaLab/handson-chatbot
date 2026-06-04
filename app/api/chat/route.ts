import { NextRequest, NextResponse } from "next/server";
import { generateAnswer, type ChatMode } from "@/lib/ai";

const VALID_MODES: ChatMode[] = ["default", "base", "prompt", "tuned"];

function parseMode(value: unknown): ChatMode {
  if (typeof value === "string" && VALID_MODES.includes(value as ChatMode)) {
    return value as ChatMode;
  }
  return "default";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body.message;
    const mode = parseMode(body.mode);

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    const answer = await generateAnswer({ message, mode });

    return NextResponse.json({ answer, mode });
  } catch (error) {
    console.error(error);
    const message =
      error instanceof Error ? error.message : "failed to generate answer";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
