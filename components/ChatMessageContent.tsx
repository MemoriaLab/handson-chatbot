type ChatMessageContentProps = {
  text: string;
};

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function splitBlocks(text: string) {
  const normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/\n[-*]\s+/g, "\n• ")
    .replace(/\s+\*\s+/g, "\n• ")
    .replace(
      /\s+((?:Free|Standard|Business)プラン(?:の|は|を|へ)[^\n*•-]+)/g,
      "\n$1"
    );

  return normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (line.startsWith("• ")) {
        return { type: "item" as const, content: line.slice(2) };
      }
      return { type: "text" as const, content: line };
    });
}

export default function ChatMessageContent({ text }: ChatMessageContentProps) {
  const blocks = splitBlocks(text);

  return (
    <div className="space-y-1.5">
      {blocks.map((block, i) =>
        block.type === "item" ? (
          <div key={i} className="flex gap-1.5 pl-0.5">
            <span className="shrink-0 select-none" aria-hidden="true">
              •
            </span>
            <span>{renderInline(block.content)}</span>
          </div>
        ) : (
          <p key={i}>{renderInline(block.content)}</p>
        )
      )}
    </div>
  );
}
