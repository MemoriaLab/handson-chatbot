import { google } from "@ai-sdk/google";
import { createVertex } from "@ai-sdk/google-vertex";
import { generateText } from "ai";
import { buildSystemPrompt } from "@/lib/prompt";
import { buildFinetuneSystemPrompt } from "@/lib/finetune-prompt";

const modelName = process.env.AI_MODEL ?? "gemini-2.5-flash-lite";

export type ChatMode = "default" | "base" | "prompt" | "tuned";

type GenerateAnswerParams = {
  message: string;
  mode?: ChatMode;
};

function getSystemForMode(mode: ChatMode): string | undefined {
  switch (mode) {
    case "default":
      return buildSystemPrompt();
    case "prompt":
    case "tuned":
      return buildFinetuneSystemPrompt();
    case "base":
      return "あなたは日本語で簡潔に答えるアシスタントです。";
    default:
      return buildSystemPrompt();
  }
}

async function generateWithGoogleApi(
  message: string,
  mode: ChatMode
): Promise<string> {
  const result = await generateText({
    model: google(modelName),
    system: getSystemForMode(mode),
    prompt: message,
  });
  return result.text;
}

function getVertexApiHost(location: string): string {
  if (location === "global") {
    return "aiplatform.googleapis.com";
  }
  return `${location}-aiplatform.googleapis.com`;
}

/** チューニング済み Endpoint 用 model パス（publishers/google ではなく endpoints/...） */
function resolveTunedModelPath(
  endpointId: string,
  project: string,
  location: string
): string {
  let id = endpointId.trim();
  // .env の誤記: AI_TUNED_ENDPOINT_ID=projects/...
  if (id.startsWith("AI_TUNED_ENDPOINT_ID=")) {
    id = id.slice("AI_TUNED_ENDPOINT_ID=".length);
  }

  const locationPrefix = `projects/${project}/locations/${location}/`;
  if (id.startsWith(locationPrefix)) {
    return id.slice(locationPrefix.length);
  }
  if (id.startsWith("projects/") && id.includes("/endpoints/")) {
    const idx = id.indexOf("/endpoints/");
    return id.slice(idx + 1);
  }
  if (/^\d+$/.test(id)) {
    return `endpoints/${id}`;
  }
  if (!id.startsWith("endpoints/")) {
    return `endpoints/${id}`;
  }
  return id;
}

async function generateWithTunedEndpoint(message: string): Promise<string> {
  const project = process.env.GOOGLE_VERTEX_PROJECT;
  const location = process.env.GOOGLE_VERTEX_LOCATION ?? "us-central1";
  const endpointId = process.env.AI_TUNED_ENDPOINT_ID;

  if (!project || !endpointId) {
    throw new Error(
      "tuned mode requires GOOGLE_VERTEX_PROJECT and AI_TUNED_ENDPOINT_ID"
    );
  }

  const modelPath = resolveTunedModelPath(endpointId, project, location);
  const host = getVertexApiHost(location);
  const baseURL = `https://${host}/v1beta1/projects/${project}/locations/${location}`;

  const vertex = createVertex({ project, location, baseURL });
  const result = await generateText({
    model: vertex(modelPath),
    system: buildFinetuneSystemPrompt(),
    prompt: message,
  });
  return result.text;
}

export async function generateAnswer({
  message,
  mode = "default",
}: GenerateAnswerParams): Promise<string> {
  if (mode === "tuned") {
    return generateWithTunedEndpoint(message);
  }
  return generateWithGoogleApi(message, mode);
}
