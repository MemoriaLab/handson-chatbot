const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

function normalizeDigits(value: string): string {
  return value.replace(/[０-９]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0xff10 + 0x30)
  );
}

export function parseSlotNumber(message: string): number | undefined {
  const trimmed = normalizeDigits(message.trim());
  const match = trimmed.match(/^(?:第)?([1-9１-９])[番号]?/);
  if (!match) return undefined;

  const rest = trimmed.slice(match[0].length).replace(/[。！!?\s　]/g, "");
  if (rest.length > 24) return undefined;
  if (/月|日|週|曜|午|時/.test(rest)) return undefined;
  if (
    rest !== "" &&
    !/^(で(す|き)?|に(して)?|よろしく|お願い|を|が|は|ね|な)/.test(rest) &&
    !/^でお願い/.test(rest)
  ) {
    return undefined;
  }

  return Number(match[1]);
}

export function parseContactInfo(message: string): {
  guestName?: string;
  guestEmail?: string;
} {
  const emailMatch = message.match(EMAIL_PATTERN);
  if (!emailMatch) return {};

  const guestEmail = emailMatch[0];
  const guestName = message
    .replace(guestEmail, "")
    .replace(/[、,]/g, " ")
    .trim();

  return {
    guestName: guestName || undefined,
    guestEmail,
  };
}
