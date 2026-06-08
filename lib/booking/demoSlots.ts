import { formatSlotLabel } from "@/lib/booking/format";
import type { BookingSlot } from "@/lib/booking/session";

const SLOT_HOURS = [10, 11, 13, 14, 15, 16, 17];
const MAX_SLOTS = 5;

function getJstNowParts(): { year: number; month: number; day: number; hour: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  return {
    year: Number(parts.find((p) => p.type === "year")?.value),
    month: Number(parts.find((p) => p.type === "month")?.value),
    day: Number(parts.find((p) => p.type === "day")?.value),
    hour: Number(parts.find((p) => p.type === "hour")?.value),
  };
}

function toIsoUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): string {
  const utc = new Date(Date.UTC(year, month - 1, day, hour - 9, minute, 0));
  return utc.toISOString();
}

function isWeekday(year: number, month: number, day: number): boolean {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    weekday: "short",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
  return weekday !== "Sat" && weekday !== "Sun";
}

export function generateDemoSlots(
  startTime: string,
  endTime: string,
  durationMinutes = 30
): BookingSlot[] {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = getJstNowParts();
  const slots: BookingSlot[] = [];

  for (
    let cursor = new Date(start);
    cursor <= end && slots.length < MAX_SLOTS;
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  ) {
    const year = cursor.getUTCFullYear();
    const month = cursor.getUTCMonth() + 1;
    const day = cursor.getUTCDate();

    if (!isWeekday(year, month, day)) continue;

    for (const hour of SLOT_HOURS) {
      if (slots.length >= MAX_SLOTS) break;

      const isToday =
        year === now.year && month === now.month && day === now.day;
      if (isToday && hour <= now.hour) continue;

      const startIso = toIsoUtc(year, month, day, hour, 0);
      const endDate = new Date(startIso);
      endDate.setUTCMinutes(endDate.getUTCMinutes() + durationMinutes);
      const endIso = endDate.toISOString();

      slots.push({
        id: `demo-${year}${month}${day}-${hour}`,
        start: startIso,
        end: endIso,
        label: formatSlotLabel(startIso, endIso),
      });
    }
  }

  return slots;
}
