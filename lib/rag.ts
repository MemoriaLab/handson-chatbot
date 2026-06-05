/**
 * RAG（Retrieval-Augmented Generation）のオーケストレーション
 *
 * FAQ の embedding は `npm run generate:embeddings` で事前生成し、
 * `data/faqIndex.ts` に保存して使い回します。
 * 本番環境では同様に FAQ 更新時のバッチで embedding を生成し、
 * ベクトル DB に永続保存するのが正攻法です。
 */

import { faqIndex } from "@/data/faqIndex";
import { generateAnswer } from "@/lib/ai";
import { buildFaqChunks } from "@/lib/chunk";
import { createEmbedding } from "@/lib/embeddings";
import { buildChatPrompt } from "@/lib/prompt";
import {
  InMemoryVectorStore,
  type IndexedDocument,
  type SearchResult,
} from "@/lib/vectorStore";

const vectorStore = new InMemoryVectorStore();

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

export async function retrieveRelatedDocuments(
  query: string,
  options: RetrieveOptions = {}
): Promise<SearchResult[]> {
  const queryEmbedding = await createEmbedding(query);

  return vectorStore.search(queryEmbedding, {
    minScore: options.minScore,
  });
}

export async function generateRagAnswer(query: string): Promise<{
  answer: string;
  relatedDocuments: SearchResult[];
}> {
  const relatedDocuments = await retrieveRelatedDocuments(query);

  console.log("[RAG] ユーザーの質問:", query);
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
  });
  const answer = await generateAnswer({ message: prompt });

  return {
    answer,
    relatedDocuments,
  };
}
