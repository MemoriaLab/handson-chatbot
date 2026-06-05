import { google } from "@ai-sdk/google";
import { embed, embedMany } from "ai";

const embeddingModelName =
  process.env.EMBEDDING_MODEL ?? "gemini-embedding-001";

export const EMBEDDING_MODEL = embeddingModelName;
export const EMBEDDING_DIMENSIONS = 768;

const embeddingModel = google.embedding(embeddingModelName);

const outputDimensionality = EMBEDDING_DIMENSIONS;

export async function createEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
    providerOptions: {
      google: {
        outputDimensionality,
        taskType: "RETRIEVAL_QUERY",
      },
    },
  });

  return embedding;
}

export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: texts,
    providerOptions: {
      google: {
        outputDimensionality,
        taskType: "RETRIEVAL_DOCUMENT",
      },
    },
  });

  return embeddings;
}
