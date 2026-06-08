export type BookingSlot = {
  id: string;
  start: string;
  end: string;
  label: string;
};

export type BookingState =
  | "idle"
  | "selecting_slot"
  | "awaiting_contact"
  | "completed";

export type BookingSession = {
  state: BookingState;
  slots: BookingSlot[];
  selectedSlot?: BookingSlot;
  guestName?: string;
  guestEmail?: string;
  oneTimeUrlId?: string;
};

const sessions = new Map<string, BookingSession>();

export function getBookingSession(sessionId: string): BookingSession {
  const existing = sessions.get(sessionId);
  if (existing) return existing;

  const session: BookingSession = {
    state: "idle",
    slots: [],
  };
  sessions.set(sessionId, session);
  return session;
}

export function updateBookingSession(
  sessionId: string,
  patch: Partial<BookingSession>
): BookingSession {
  const session = getBookingSession(sessionId);
  const next = { ...session, ...patch };
  sessions.set(sessionId, next);
  return next;
}

export function resetBookingSession(sessionId: string): BookingSession {
  const session: BookingSession = {
    state: "idle",
    slots: [],
  };
  sessions.set(sessionId, session);
  return session;
}

export function isBookingFlowActive(session: BookingSession): boolean {
  return session.state !== "idle";
}
