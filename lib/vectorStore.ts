/**
 * インメモリベクトルストア（ハンズオン用の簡略化）
 *
 * FAQ の embedding は `data/faqIndex.ts` に事前保存し、ここでは検索だけ行います。
 * 本番環境では embedding をベクトル DB（Supabase pgvector, Qdrant, Pinecone 等）に
 * 永続化し、クエリ時は DB から検索するのが正攻法です。
 */

import type { DocumentChunk } from "@/lib/chunk";

export type IndexedDocument = DocumentChunk & {
  embedding: number[];
};

export type SearchResult = DocumentChunk & {
  score: number;
};

type SearchOptions = {
  minScore?: number;
};

export class InMemoryVectorStore {
  private documents: IndexedDocument[] = [];

  addDocuments(docs: IndexedDocument[]): void {
    this.documents = docs;
  }

  search(
    queryEmbedding: number[],
    options: SearchOptions = {}
  ): SearchResult[] {
    const minScore =
      options.minScore ??
      Number.parseFloat(process.env.RAG_MIN_SCORE ?? "0.7");

    return this.documents
      .map((doc) => ({
        id: doc.id,
        content: doc.content,
        source: doc.source,
        metadata: doc.metadata,
        score: cosineSimilarity(queryEmbedding, doc.embedding),
      }))
      .filter((result) => result.score >= minScore)
      .sort((a, b) => b.score - a.score);
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);

  if (denominator === 0) {
    return 0;
  }

  return dot / denominator;
}
