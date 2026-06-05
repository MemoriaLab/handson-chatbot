import { NextRequest, NextResponse } from "next/server";
import { generateAnswer } from "@/lib/ai";
import { buildChatPrompt } from "@/lib/prompt";
import { searchFaqs } from "@/lib/searchFaq";

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

    const relatedFaqs = searchFaqs(message, { limit: 3 });

    const prompt = buildChatPrompt({
      message,
      relatedFaqs,
    });

    const answer = await generateAnswer({ message: prompt });

    return NextResponse.json({
      answer,
      relatedFaqs,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "failed to generate answer" },
      { status: 500 }
    );
  }
}
