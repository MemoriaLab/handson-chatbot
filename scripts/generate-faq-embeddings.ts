import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { faqs } from "../data/faq";
import {
  createEmbeddings,
  EMBEDDING_DIMENSIONS,
  EMBEDDING_MODEL,
} from "../lib/embeddings";

function faqToChunkContent(faq: (typeof faqs)[number]): string {
  return `Q. ${faq.question}\nA. ${faq.answer}`;
}

function loadEnvLocal(): void {
  const envPath = resolve(process.cwd(), ".env.local");

  if (!existsSync(envPath)) {
    return;
  }

  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function formatEmbedding(embedding: number[]): string {
  const rows: string[] = [];

  for (let i = 0; i < embedding.length; i += 8) {
    const slice = embedding
      .slice(i, i + 8)
      .map((value) => Number(value.toFixed(6)))
      .join(", ");
    rows.push(`      ${slice},`);
  }

  return rows.join("\n");
}

async function main(): Promise<void> {
  loadEnvLocal();

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY が .env.local に設定されていません。"
    );
  }

  const contents = faqs.map((faq) => faqToChunkContent(faq));
  const embeddings = await createEmbeddings(contents);

  if (embeddings.length !== faqs.length) {
    throw new Error("FAQ 件数と embedding 件数が一致しません。");
  }

  const entries = faqs.map((faq, index) => ({
    question: faq.question,
    answer: faq.answer,
    keywords: faq.keywords,
    embedding: embeddings[index],
  }));

  const generatedAt = new Date().toISOString();
  const fileBody = `// このファイルは scripts/generate-faq-embeddings.ts によって自動生成されます。
// FAQ を更新したら \`npm run generate:embeddings\` を実行してください。

export type FaqWithEmbedding = {
  question: string;
  answer: string;
  keywords: string[];
  embedding: number[];
};

export const FAQ_EMBEDDING_META = {
  model: "${EMBEDDING_MODEL}",
  dimensions: ${EMBEDDING_DIMENSIONS},
  generatedAt: "${generatedAt}",
} as const;

export const faqIndex: FaqWithEmbedding[] = [
${entries
  .map(
    (entry) => `  {
    question: ${JSON.stringify(entry.question)},
    answer: ${JSON.stringify(entry.answer)},
    keywords: ${JSON.stringify(entry.keywords)},
    embedding: [
${formatEmbedding(entry.embedding)}
    ],
  }`
  )
  .join(",\n")}
];
`;

  const outputPath = resolve(process.cwd(), "data/faqIndex.ts");
  writeFileSync(outputPath, fileBody, "utf8");

  console.log(`Generated ${outputPath}`);
  console.log(`FAQ count: ${entries.length}`);
  console.log(`Model: ${EMBEDDING_MODEL}`);
  console.log(`Dimensions: ${EMBEDDING_DIMENSIONS}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
