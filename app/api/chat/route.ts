import { APICallError } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { generateRagAnswer } from "@/lib/rag";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body.message;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    const { answer, relatedDocuments } = await generateRagAnswer(message);

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
