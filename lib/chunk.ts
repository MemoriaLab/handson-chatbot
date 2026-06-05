import { faqIndex, type FaqWithEmbedding } from "@/data/faqIndex";
import type { Faq } from "@/data/faq";

export type DocumentChunk = {
  id: string;
  content: string;
  source: "faq";
  metadata: {
    faqIndex: number;
  };
};

type SplitTextOptions = {
  maxLength?: number;
};

export function faqToChunk(faq: Faq | FaqWithEmbedding, index: number): DocumentChunk {
  return {
    id: `faq-${index}`,
    content: `Q. ${faq.question}\nA. ${faq.answer}`,
    source: "faq",
    metadata: {
      faqIndex: index,
    },
  };
}

export function buildFaqChunks(): DocumentChunk[] {
  return faqIndex.map((faq, index) => faqToChunk(faq, index));
}

export function splitTextIntoChunks(
  text: string,
  options: SplitTextOptions = {}
): DocumentChunk[] {
  const maxLength = options.maxLength ?? 500;
  const trimmed = text.trim();

  if (trimmed.length <= maxLength) {
    return [
      {
        id: "text-0",
        content: trimmed,
        source: "faq",
        metadata: {
          faqIndex: -1,
        },
      },
    ];
  }

  const chunks: DocumentChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < trimmed.length) {
    const end = Math.min(start + maxLength, trimmed.length);
    chunks.push({
      id: `text-${index}`,
      content: trimmed.slice(start, end),
      source: "faq",
      metadata: {
        faqIndex: -1,
      },
    });
    start = end;
    index += 1;
  }

  return chunks;
}
