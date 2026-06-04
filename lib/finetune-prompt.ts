import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { buildSystemPrompt } from "@/lib/prompt";
import { formatPersonality, type InterlocutorPersonality } from "@/lib/personality";

export type InterlocutorProfile = {
  interlocutor_id: string;
  persona: string[];
  personality: InterlocutorPersonality;
};

const INTERLOCUTOR_PATH = join(
  process.cwd(),
  "finetuning/output/interlocutor.json"
);

export function loadInterlocutorProfile(): InterlocutorProfile | null {
  if (!existsSync(INTERLOCUTOR_PATH)) {
    return null;
  }
  const raw = readFileSync(INTERLOCUTOR_PATH, "utf-8");
  return JSON.parse(raw) as InterlocutorProfile;
}

export function buildPersonaSection(profile: InterlocutorProfile): string {
  const personaLines = profile.persona.map((p) => `- ${p}`).join("\n");
  const personality = formatPersonality(profile.personality);
  return `## 話し方（キャラクター）
${personaLines}

### 性格特性
${personality}`;
}

/** 学習時と同じ system（Taskmate 知識 + ペルソナ口調） */
export function buildFinetuneSystemPrompt(): string {
  const base = buildSystemPrompt();
  const profile = loadInterlocutorProfile();

  if (!profile) {
    return `${base}

## 話し方（キャラクター）
（finetuning/output/interlocutor.json がありません。prepare_jsonl.py を実行してください。）`;
  }

  return `${base}\n\n${buildPersonaSection(profile)}`;
}
