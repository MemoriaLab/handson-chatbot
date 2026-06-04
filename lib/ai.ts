import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { buildSystemPrompt } from "@/lib/prompt";

const modelName = process.env.AI_MODEL ?? "gemini-2.5-flash-lite";

type GenerateAnswerParams = {
  message: string;
};

export async function generateAnswer({ message }: GenerateAnswerParams) {
  const result = await generateText({
    model: google(modelName),
    system: buildSystemPrompt(),
    prompt: message,
  });

  return result.text;
}
