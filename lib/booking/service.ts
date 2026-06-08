import { formatSlotLabel, getRangeFromMessage } from "@/lib/booking/format";
import { generateDemoSlots } from "@/lib/booking/demoSlots";
import {
  getBookingSession,
  resetBookingSession,
  updateBookingSession,
  type BookingSlot,
} from "@/lib/booking/session";
import {
  createOneTimeUrl,
  getCalendarEvents,
  getCalendarInfo,
  getDefaultEventRange,
} from "@/lib/timerex/client";

export type SlotCandidate = {
  number: number;
  id: string;
  label: string;
};

export type GetSlotsResult = {
  success: boolean;
  rangeHint: string;
  slots: SlotCandidate[];
  nextStep: "select_slot" | "ask_date";
  message: string;
};

export type SelectSlotResult = {
  success: boolean;
  selected?: SlotCandidate;
  nextStep?: "await_contact";
  message: string;
};

export type CompleteBookingResult = {
  success: boolean;
  booking?: {
    slotLabel: string;
    guestName: string;
    guestEmail: string;
    oneTimeUrlId: string;
  };
  message: string;
};

function formatSlotCandidates(slots: BookingSlot[]): SlotCandidate[] {
  return slots.map((slot, index) => ({
    number: index + 1,
    id: slot.id,
    label: slot.label,
  }));
}

function formatRangeHint(dateHint?: string): string {
  if (!dateHint) return "今後2週間";
  if (/今日/.test(dateHint) && /明日/.test(dateHint)) return "今日〜明日";
  if (/今日/.test(dateHint)) return "今日";
  if (/明日/.test(dateHint)) return "明日";
  if (/来週/.test(dateHint)) return "来週";
  if (/今週/.test(dateHint)) return "今週";
  return dateHint;
}

async function fetchSlots(dateHint?: string): Promise<BookingSlot[]> {
  const preferredRange = dateHint ? getRangeFromMessage(dateHint) : undefined;
  const defaultRange = getDefaultEventRange();
  const startTime = preferredRange?.startTime ?? defaultRange.startTime;
  const endTime = preferredRange?.endTime ?? defaultRange.endTime;

  const response = await getCalendarEvents(undefined, startTime, endTime);
  const apiSlots = response.items.map((item) => ({
    id: item.id,
    start: item.start_datetime,
    end: item.end_datetime,
    label: formatSlotLabel(item.start_datetime, item.end_datetime),
  }));

  if (apiSlots.length > 0) return apiSlots;

  const calendar = await getCalendarInfo();
  const demoSlots = generateDemoSlots(startTime, endTime, calendar.duration);
  console.log(
    `[Booking] API空き0件 → デモ候補${demoSlots.length}件を生成 (duration=${calendar.duration}分)`
  );
  return demoSlots;
}

export async function getAvailableSlots(
  sessionId: string,
  dateHint?: string
): Promise<GetSlotsResult> {
  const session = getBookingSession(sessionId);
  if (session.state === "completed") {
    resetBookingSession(sessionId);
  }

  const slots = await fetchSlots(dateHint);
  const rangeHint = formatRangeHint(dateHint);

  if (slots.length === 0) {
    updateBookingSession(sessionId, {
      state: "selecting_slot",
      slots: [],
      selectedSlot: undefined,
      guestName: undefined,
      guestEmail: undefined,
      oneTimeUrlId: undefined,
    });

    return {
      success: true,
      rangeHint,
      slots: [],
      nextStep: "ask_date",
      message: `${rangeHint}の空き枠は見つかりませんでした。別の日時を指定してください。`,
    };
  }

  updateBookingSession(sessionId, {
    state: "selecting_slot",
    slots,
    selectedSlot: undefined,
    guestName: undefined,
    guestEmail: undefined,
    oneTimeUrlId: undefined,
  });

  const candidates = formatSlotCandidates(slots);
  return {
    success: true,
    rangeHint,
    slots: candidates,
    nextStep: "select_slot",
    message: `${rangeHint}の空き候補を${candidates.length}件取得しました。`,
  };
}

export function selectSlot(
  sessionId: string,
  slotNumber: number
): SelectSlotResult {
  const session = getBookingSession(sessionId);

  if (session.state !== "selecting_slot" || session.slots.length === 0) {
    return {
      success: false,
      message:
        "先に getAvailableSlots で空き候補を取得してください。",
    };
  }

  const selectedSlot = session.slots[slotNumber - 1];
  if (!selectedSlot) {
    return {
      success: false,
      message: `${slotNumber}番は候補にありません。1〜${session.slots.length}番から選んでください。`,
    };
  }

  updateBookingSession(sessionId, {
    state: "awaiting_contact",
    selectedSlot,
  });

  const selected: SlotCandidate = {
    number: slotNumber,
    id: selectedSlot.id,
    label: selectedSlot.label,
  };

  return {
    success: true,
    selected,
    nextStep: "await_contact",
    message: `${selected.label} で仮押さえしました。名前とメールアドレスが必要です。`,
  };
}

export async function completeBooking(
  sessionId: string,
  guestName: string,
  guestEmail: string
): Promise<CompleteBookingResult> {
  const session = getBookingSession(sessionId);

  if (session.state !== "awaiting_contact" || !session.selectedSlot) {
    return {
      success: false,
      message:
        "先に selectSlot で日時を選んでください。",
    };
  }

  const booking = await createOneTimeUrl();

  updateBookingSession(sessionId, {
    state: "completed",
    guestName,
    guestEmail,
    oneTimeUrlId: booking.id,
  });

  return {
    success: true,
    booking: {
      slotLabel: session.selectedSlot.label,
      guestName,
      guestEmail,
      oneTimeUrlId: booking.id,
    },
    message: "TimeRex API で予約を確定しました。",
  };
}

export function getSessionSummary(sessionId: string): string {
  const session = getBookingSession(sessionId);

  if (session.state === "idle") {
    return "状態: 未開始";
  }

  if (session.state === "selecting_slot") {
    const slots = formatSlotCandidates(session.slots);
    return [
      "状態: 枠選択中",
      slots.length > 0
        ? `候補: ${slots.map((s) => `${s.number}. ${s.label}`).join(" / ")}`
        : "候補: なし（日時の再指定が必要）",
    ].join("\n");
  }

  if (session.state === "awaiting_contact" && session.selectedSlot) {
    return [
      "状態: 連絡先入力待ち",
      `選択済み: ${session.selectedSlot.label}`,
    ].join("\n");
  }

  if (session.state === "completed") {
    return [
      "状態: 予約完了",
      session.selectedSlot ? `日時: ${session.selectedSlot.label}` : "",
      session.guestName ? `名前: ${session.guestName}` : "",
      session.guestEmail ? `メール: ${session.guestEmail}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return `状態: ${session.state}`;
}
