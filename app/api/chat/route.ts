import { APICallError } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { generateRagAnswer } from "@/lib/rag";

const RATE_LIMIT_MESSAGE =
  "Gemini API の利用上限に達しました。しばらく待ってから再度お試しください。";

function isRateLimitError(error: unknown): boolean {
  if (APICallError.isInstance(error) && error.statusCode === 429) {
    return true;
  }

  const text =
    error instanceof Error
      ? `${error.message} ${error.cause ?? ""}`
      : String(error);

  return /rate.?limit|quota|429|RESOURCE_EXHAUSTED|Too Many Requests/i.test(
    text
  );
}

function getErrorMessage(error: unknown): { message: string; status: number } {
  if (isRateLimitError(error)) {
    return { message: RATE_LIMIT_MESSAGE, status: 429 };
  }

  if (APICallError.isInstance(error)) {
    if (error.statusCode === 503) {
      return {
        message:
          "AI サービスが一時的に利用できません。しばらく待ってから再度お試しください。",
        status: 503,
      };
    }

    if (error.statusCode === 401 || error.statusCode === 403) {
      return {
        message:
          "AI サービスの認証に失敗しました。管理者にお問い合わせください。",
        status: error.statusCode,
      };
    }
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
