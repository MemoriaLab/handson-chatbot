const TIMEREX_API_BASE = "https://timerex.net/api/beta";

export type CalendarEvent = {
  id: string;
  status: string;
  start_datetime: string;
  end_datetime: string;
};

export type CalendarEventsResponse = {
  nextPageToken?: string;
  items: CalendarEvent[];
};

export type CalendarInfo = {
  id: string;
  name: string;
  duration: number;
  url: string;
};

export type OneTimeUrlResponse = {
  id: string;
  url: string;
  status: string;
  event: unknown;
};

function getApiKey(): string {
  const apiKey = process.env.TIMEREX_API_KEY;
  if (!apiKey) {
    throw new Error("TIMEREX_API_KEY is not configured");
  }
  return apiKey;
}

function getCalendarId(): string {
  const calendarId = process.env.TIMEREX_CALENDAR_ID;
  if (!calendarId) {
    throw new Error("TIMEREX_CALENDAR_ID is not configured");
  }
  return calendarId;
}

function formatUtcDateTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

export function getDefaultEventRange(): { startTime: string; endTime: string } {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 14);

  return {
    startTime: formatUtcDateTime(start),
    endTime: formatUtcDateTime(end),
  };
}

async function timerexFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${TIMEREX_API_BASE}${path}`, {
    ...options,
    headers: {
      "x-api-key": getApiKey(),
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `TimeRex API error (${response.status}): ${body || response.statusText}`
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export async function getCalendarInfo(
  calendarId: string = getCalendarId()
): Promise<CalendarInfo> {
  return timerexFetch<CalendarInfo>(`/calendars/${calendarId}`);
}

export async function getCalendarEvents(
  calendarId: string = getCalendarId(),
  startTime?: string,
  endTime?: string
): Promise<CalendarEventsResponse> {
  const range = getDefaultEventRange();
  const params = new URLSearchParams({
    startTime: startTime ?? range.startTime,
    endTime: endTime ?? range.endTime,
  });

  return timerexFetch<CalendarEventsResponse>(
    `/calendars/${calendarId}/events?${params.toString()}`
  );
}

export async function createOneTimeUrl(
  calendarId: string = getCalendarId()
): Promise<OneTimeUrlResponse> {
  return timerexFetch<OneTimeUrlResponse>(
    `/calendars/${calendarId}/one-time-url`,
    { method: "POST" }
  );
}
