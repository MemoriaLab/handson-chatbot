import { NextRequest, NextResponse } from "next/server";
import { generateAnswer } from "@/lib/ai";

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

    const answer = await generateAnswer({ message });

    return NextResponse.json({ answer });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "failed to generate answer" },
      { status: 500 }
    );
  }
}
