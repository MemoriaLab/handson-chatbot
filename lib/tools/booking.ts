import { tool } from "ai";
import { z } from "zod";
import {
  completeBooking,
  getAvailableSlots,
  selectSlot,
} from "@/lib/booking/service";

export function createBookingTools(sessionId: string) {
  return {
    getAvailableSlots: tool({
      description:
        "TimeRex API で空き候補を取得する。デモ・予約の開始時、またはユーザーが日時条件を変更したときに呼ぶ。",
      inputSchema: z.object({
        dateHint: z
          .string()
          .optional()
          .describe("日時の希望（例: 来週、明日、今日か明日、6/10の午前）"),
      }),
      execute: async ({ dateHint }) => {
        console.log("[Booking] tool:getAvailableSlots", { dateHint });
        return getAvailableSlots(sessionId, dateHint);
      },
    }),

    selectSlot: tool({
      description:
        "ユーザーが選んだ候補番号で日時を仮押さえする。番号が分かったら必ずこのツールを呼ぶ。",
      inputSchema: z.object({
        slotNumber: z
          .number()
          .int()
          .min(1)
          .describe("getAvailableSlots で返った候補の番号（1始まり）"),
      }),
      execute: async ({ slotNumber }) => {
        console.log("[Booking] tool:selectSlot", { slotNumber });
        return selectSlot(sessionId, slotNumber);
      },
    }),

    completeBooking: tool({
      description:
        "お名前とメールアドレスを受け取り、TimeRex API で予約を確定する。連絡先が揃ったら必ずこのツールを呼ぶ。",
      inputSchema: z.object({
        guestName: z.string().min(1).describe("予約者の氏名"),
        guestEmail: z.string().email().describe("予約者のメールアドレス"),
      }),
      execute: async ({ guestName, guestEmail }) => {
        console.log("[Booking] tool:completeBooking", { guestName, guestEmail });
        return completeBooking(sessionId, guestName, guestEmail);
      },
    }),
  };
}
