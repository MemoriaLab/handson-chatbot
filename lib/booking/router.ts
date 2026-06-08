import { hasDatePreference } from "@/lib/booking/format";
import { parseContactInfo, parseSlotNumber } from "@/lib/booking/parse";
import { getBookingSession } from "@/lib/booking/session";

type BookingToolName =
  | "getAvailableSlots"
  | "selectSlot"
  | "completeBooking";

type ForcedToolChoice =
  | { type: "tool"; toolName: BookingToolName }
  | "required"
  | "auto";

export function resolveBookingToolChoice(
  sessionId: string,
  message: string
): ForcedToolChoice {
  const session = getBookingSession(sessionId);

  if (session.state === "idle") {
    return { type: "tool", toolName: "getAvailableSlots" };
  }

  if (session.state === "selecting_slot") {
    if (parseSlotNumber(message) !== undefined) {
      return { type: "tool", toolName: "selectSlot" };
    }
    if (hasDatePreference(message)) {
      return { type: "tool", toolName: "getAvailableSlots" };
    }
  }

  if (session.state === "awaiting_contact") {
    const contact = parseContactInfo(message);
    if (contact.guestName && contact.guestEmail) {
      return { type: "tool", toolName: "completeBooking" };
    }
  }

  return "auto";
}
