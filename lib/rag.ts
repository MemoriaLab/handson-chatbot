/**
 * RAG（Retrieval-Augmented Generation）のオーケストレーション
 *
 * FAQ の embedding は `npm run generate:embeddings` で事前生成し、
 * `data/faqIndex.ts` に保存して使い回します。
 */

import { faqIndex } from "@/data/faqIndex";
import { generateAnswer, generateBookingAnswer } from "@/lib/ai";
import { buildFaqChunks } from "@/lib/chunk";
import { createEmbedding } from "@/lib/embeddings";
import {
  buildChatPrompt,
  shouldUseBookingTools,
  type ChatHistoryMessage,
} from "@/lib/prompt";
import {
  InMemoryVectorStore,
  type IndexedDocument,
  type SearchResult,
} from "@/lib/vectorStore";
import type { ModelMessage } from "ai";

const vectorStore = new InMemoryVectorStore();
const MAX_HISTORY_MESSAGES = 10;

function loadIndex(): void {
  const chunks = buildFaqChunks();

  const indexedDocuments: IndexedDocument[] = chunks.map((chunk, index) => ({
    ...chunk,
    embedding: faqIndex[index].embedding,
  }));

  vectorStore.addDocuments(indexedDocuments);
}

loadIndex();

type RetrieveOptions = {
  minScore?: number;
};

type GenerateRagAnswerParams = {
  query: string;
  history?: ChatHistoryMessage[];
  sessionId: string;
};

function buildSearchQuery(query: string, history: ChatHistoryMessage[]): string {
  const recentUserMessages = history
    .filter((item) => item.role === "user")
    .slice(-2)
    .map((item) => item.text);

  return [query, ...recentUserMessages].join("\n");
}

function toModelHistory(history: ChatHistoryMessage[]): ModelMessage[] {
  return history.slice(-MAX_HISTORY_MESSAGES).map((item) => ({
    role: item.role === "user" ? "user" : "assistant",
    content: item.text,
  }));
}

export async function retrieveRelatedDocuments(
  query: string,
  options: RetrieveOptions = {}
): Promise<SearchResult[]> {
  const queryEmbedding = await createEmbedding(query);

  return vectorStore.search(queryEmbedding, {
    minScore: options.minScore,
  });
}

export async function generateRagAnswer({
  query,
  history = [],
  sessionId,
}: GenerateRagAnswerParams): Promise<{
  answer: string;
  relatedDocuments: SearchResult[];
}> {
  if (shouldUseBookingTools(query, history, sessionId)) {
    console.log("[Booking] LLM+ツール応答:", query);
    const answer = await generateBookingAnswer({
      message: query,
      history: toModelHistory(history),
      sessionId,
    });

    return {
      answer,
      relatedDocuments: [],
    };
  }

  const searchQuery = buildSearchQuery(query, history);
  const relatedDocuments = await retrieveRelatedDocuments(searchQuery);

  console.log("[RAG] ユーザーの質問:", query);
  if (history.length > 0) {
    console.log("[RAG] 会話履歴:", history.length, "件");
  }
  if (relatedDocuments.length === 0) {
    console.log("[RAG] 読み込んだドキュメント: なし（閾値未満）");
  } else {
    console.log(
      "[RAG] 読み込んだドキュメント:",
      relatedDocuments.map((doc) => ({
        id: doc.id,
        score: doc.score.toFixed(3),
        content: doc.content,
      }))
    );
  }

  const prompt = buildChatPrompt({
    message: query,
    documents: relatedDocuments,
    history,
  });
  const answer = await generateAnswer({
    prompt,
    history: toModelHistory(history),
  });

  return {
    answer,
    relatedDocuments,
  };
}
