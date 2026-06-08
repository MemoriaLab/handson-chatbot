import { APICallError } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { generateRagAnswer } from "@/lib/rag";
import type { ChatHistoryMessage } from "@/lib/prompt";

function getErrorMessage(error: unknown): { message: string; status: number } {
  if (APICallError.isInstance(error) && error.statusCode === 429) {
    return {
      message:
        "Gemini API の利用上限に達しました。しばらく待ってから再度お試しください。",
      status: 429,
    };
  }

  return {
    message: "回答を取得できませんでした。しばらくしてからお試しください。",
    status: 500,
  };
}

function parseHistory(value: unknown): ChatHistoryMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (item): item is ChatHistoryMessage =>
        typeof item === "object" &&
        item !== null &&
        (item.role === "user" || item.role === "bot") &&
        typeof item.text === "string" &&
        item.text.trim().length > 0
    )
    .map((item) => ({
      role: item.role,
      text: item.text.trim(),
    }));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body.message;
    const history = parseHistory(body.history);
    const sessionId =
      typeof body.sessionId === "string" && body.sessionId.trim().length > 0
        ? body.sessionId.trim()
        : "default";

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    const { answer, relatedDocuments } = await generateRagAnswer({
      query: message,
      history,
      sessionId,
    });

    return NextResponse.json({
      answer,
      relatedDocuments,
    });
  } catch (error) {
    console.error(error);

    const { message, status } = getErrorMessage(error);

    return NextResponse.json({ error: message }, { status });
  }
}
