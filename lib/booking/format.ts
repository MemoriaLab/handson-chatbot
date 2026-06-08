export function formatSlotLabel(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  });
  const timeFormatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${dateFormatter.format(startDate)} ${timeFormatter.format(startDate)}〜${timeFormatter.format(endDate)}`;
}

export function formatUtcDateTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

function toTimerexUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number
): string {
  const utc = new Date(Date.UTC(year, month - 1, day, hour - 9, minute, second));
  return formatUtcDateTime(utc);
}

function getJstDateParts(dayOffset = 0): {
  year: number;
  month: number;
  day: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  const target = new Date(Date.UTC(year, month - 1, day + dayOffset));

  return {
    year: target.getUTCFullYear(),
    month: target.getUTCMonth() + 1,
    day: target.getUTCDate(),
  };
}

export function getJstDayRange(dayOffset: number): {
  startTime: string;
  endTime: string;
} {
  const { year, month, day } = getJstDateParts(dayOffset);

  return {
    startTime: toTimerexUtc(year, month, day, 0, 0, 0),
    endTime: toTimerexUtc(year, month, day, 23, 59, 59),
  };
}

function getJstWeekRange(weekOffset: number): {
  startTime: string;
  endTime: string;
} {
  const now = new Date();
  const jstDay = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    weekday: "short",
  }).format(now);
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const currentDay = dayMap[jstDay] ?? 0;
  const daysUntilMonday = currentDay === 0 ? 1 : 8 - currentDay;
  const startOffset = daysUntilMonday + weekOffset * 7;
  const endOffset = startOffset + 6;

  const start = getJstDayRange(startOffset);
  const end = getJstDayRange(endOffset);
  return {
    startTime: start.startTime,
    endTime: end.endTime,
  };
}

export function hasDatePreference(message: string): boolean {
  return /今日|明日|来週|今週|午前|午後|\d{1,2}月|\d{1,2}日|曜日|いつ|日時|都合/.test(
    message
  );
}

export function getRangeFromMessage(message: string): {
  startTime: string;
  endTime: string;
} | undefined {
  const hasToday = /今日/.test(message);
  const hasTomorrow = /明日/.test(message);
  const hasNextWeek = /来週/.test(message);
  const hasThisWeek = /今週/.test(message);

  if (hasToday && hasTomorrow) {
    const today = getJstDayRange(0);
    const tomorrow = getJstDayRange(1);
    return {
      startTime: today.startTime,
      endTime: tomorrow.endTime,
    };
  }

  if (hasToday) return getJstDayRange(0);
  if (hasTomorrow) return getJstDayRange(1);
  if (hasNextWeek) return getJstWeekRange(1);
  if (hasThisWeek) return getJstWeekRange(0);

  return undefined;
}
