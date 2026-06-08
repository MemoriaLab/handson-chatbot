import { google } from "@ai-sdk/google";
import { generateText, stepCountIs, type ModelMessage } from "ai";
import { resolveBookingToolChoice } from "@/lib/booking/router";
import { getSessionSummary } from "@/lib/booking/service";
import type {
  CompleteBookingResult,
  GetSlotsResult,
  SelectSlotResult,
} from "@/lib/booking/service";
import { buildBookingSystemPrompt, buildSystemPrompt } from "@/lib/prompt";
import { createBookingTools } from "@/lib/tools/booking";

type BookingToolOutput =
  | GetSlotsResult
  | SelectSlotResult
  | CompleteBookingResult;

const modelName = process.env.AI_MODEL ?? "gemini-2.5-flash-lite";

function formatToolFallback(toolName: string, output: BookingToolOutput): string {
  if (toolName === "getAvailableSlots") {
    const result = output as GetSlotsResult;
    if (result.slots.length === 0) {
      return [
        result.message,
        "別の日時でもよろしければ教えてください。（例: 来週の午前）",
      ].join("\n");
    }
    const list = result.slots
      .map((slot) => `${slot.number}. ${slot.label}`)
      .join("\n");
    return [
      "デモのご予約ありがとうございます。空き候補をご用意しました。",
      "",
      list,
      "",
      "ご都合のよい番号を教えてください。（例: 4で）",
    ].join("\n");
  }

  if (toolName === "selectSlot") {
    const result = output as SelectSlotResult;
    if (!result.success || !result.selected) return result.message;
    return [
      `${result.selected.label} で仮押さえしました。`,
      "予約を確定するために、お名前とメールアドレスを教えてください。",
      "（例: 山田太郎、yamada@example.com）",
    ].join("\n");
  }

  if (toolName === "completeBooking") {
    const result = output as CompleteBookingResult;
    if (!result.success || !result.booking) return result.message;
    return [
      "ご予約が完了しました。",
      "",
      "【予約内容】",
      `日時: ${result.booking.slotLabel}`,
      `お名前: ${result.booking.guestName}`,
      `メールアドレス: ${result.booking.guestEmail}`,
      "",
      "【次のステップ】",
      `・${result.booking.guestEmail} 宛に確認メールをお送りします`,
      "・デモ当日はメールに記載の Google Meet リンクからご参加ください",
      "・変更・キャンセルは、このチャットからお問い合わせください",
    ].join("\n");
  }

  return "処理を実行しました。続けてご案内します。";
}

type GenerateAnswerParams = {
  prompt: string;
  history?: ModelMessage[];
};

type GenerateBookingAnswerParams = {
  message: string;
  history?: ModelMessage[];
  sessionId: string;
};

export async function generateAnswer({
  prompt,
  history = [],
}: GenerateAnswerParams): Promise<string> {
  const messages: ModelMessage[] = [
    ...history,
    { role: "user", content: prompt },
  ];

  const result = await generateText({
    model: google(modelName),
    system: buildSystemPrompt(),
    messages,
  });

  return result.text;
}

export async function generateBookingAnswer({
  message,
  history = [],
  sessionId,
}: GenerateBookingAnswerParams): Promise<string> {
  const tools = createBookingTools(sessionId);
  const messages: ModelMessage[] = [
    ...history,
    { role: "user", content: message },
  ];

  const toolChoice = resolveBookingToolChoice(sessionId, message);

  const result = await generateText({
    model: google(modelName),
    system: buildBookingSystemPrompt(sessionId),
    messages,
    tools,
    toolChoice,
    stopWhen: stepCountIs(8),
  });

  let lastToolName: string | undefined;
  let lastToolOutput: BookingToolOutput | undefined;

  for (const step of result.steps) {
    for (const toolResult of step.toolResults) {
      console.log(
        "[Booking] tool result:",
        toolResult.toolName,
        toolResult.output
      );
      lastToolName = toolResult.toolName;
      lastToolOutput = toolResult.output as BookingToolOutput;
    }
  }

  if (result.text.trim()) {
    return result.text;
  }

  if (lastToolName && lastToolOutput) {
    return formatToolFallback(lastToolName, lastToolOutput);
  }

  const summary = getSessionSummary(sessionId);
  return `処理を実行しました。\n\n${summary}\n\n続きをご案内しますので、少しお待ちください。`;
}
