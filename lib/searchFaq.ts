/**
 * Chapter 8 のキーワードベース FAQ 検索（簡易 RAG）
 *
 * Chapter 9 では embedding + ベクトル検索による RAG（lib/rag.ts）に置き換えました。
 * このファイルは Chapter 8 との対比のため残しています。
 *
 * FAQ を更新した場合は `npm run generate:embeddings` も実行してください。
 */

import { faqs, type Faq } from "@/data/faq";

type SearchFaqOptions = {
  limit?: number;
};

export function searchFaqs(
  query: string,
  options: SearchFaqOptions = {}
): Faq[] {
  const limit = options.limit ?? 3;
  const normalizedQuery = normalizeText(query);

  const scoredFaqs = faqs
    .map((faq) => {
      const score = calculateScore(normalizedQuery, faq);

      return {
        faq,
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scoredFaqs.slice(0, limit).map((item) => item.faq);
}

function calculateScore(query: string, faq: Faq): number {
  let score = 0;

  const question = normalizeText(faq.question);
  const answer = normalizeText(faq.answer);

  if (question.includes(query)) {
    score += 5;
  }

  if (answer.includes(query)) {
    score += 3;
  }

  for (const keyword of faq.keywords) {
    const normalizedKeyword = normalizeText(keyword);

    if (query.includes(normalizedKeyword)) {
      score += 4;
    }

    if (question.includes(normalizedKeyword)) {
      score += 1;
    }

    if (answer.includes(normalizedKeyword)) {
      score += 1;
    }
  }

  return score;
}

function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}
