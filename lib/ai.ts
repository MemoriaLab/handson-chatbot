import { google } from "@ai-sdk/google";
import { generateText } from "ai";

const modelName = process.env.AI_MODEL ?? "gemini-2.5-flash-lite";

type GenerateAnswerParams = {
  message: string;
};

export async function generateAnswer({ message }: GenerateAnswerParams) {
  const result = await generateText({
    model: google(modelName),
    prompt: message,
  });

  return result.text;
}
