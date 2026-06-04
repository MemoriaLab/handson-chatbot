export type InterlocutorPersonality = Record<string, number>;

const TRAIT_RULES: Array<{
  key: string;
  label: string;
  high: number;
  low: number;
}> = [
  { key: "BigFive_Openness", label: "開放性", high: 4.5, low: 3.5 },
  { key: "BigFive_Conscientiousness", label: "誠実性", high: 4.5, low: 3.5 },
  { key: "BigFive_Extraversion", label: "外向性", high: 4.5, low: 3.5 },
  { key: "BigFive_Agreeableness", label: "協調性", high: 4.5, low: 3.5 },
  { key: "BigFive_Neuroticism", label: "神経症傾向", high: 4.5, low: 3.5 },
  { key: "KiSS18_BasicSkill", label: "初歩的な社会的スキル", high: 4.0, low: 3.0 },
  { key: "KiSS18_AdvancedSkill", label: "より高度の社会的スキル", high: 4.0, low: 3.0 },
  {
    key: "KiSS18_EmotionalManagementSkill",
    label: "感情処理の社会的スキル",
    high: 4.0,
    low: 3.0,
  },
  {
    key: "KiSS18_OffenceManagementSkill",
    label: "攻撃に代わる社会的スキル",
    high: 4.0,
    low: 3.0,
  },
  {
    key: "KiSS18_StressManagementSkill",
    label: "ストレスを処理する社会的スキル",
    high: 4.0,
    low: 3.0,
  },
  { key: "KiSS18_PlanningSkill", label: "計画の社会的スキル", high: 4.0, low: 3.0 },
  { key: "ATQ_Fear", label: "恐れの気質", high: 4.5, low: 3.5 },
  { key: "ATQ_Frustration", label: "欲求不満の気質", high: 4.5, low: 3.5 },
  { key: "ATQ_Sadness", label: "悲しさの気質", high: 4.5, low: 3.5 },
  { key: "ATQ_Discomfort", label: "不快の気質", high: 4.5, low: 3.5 },
  { key: "ATQ_ActivationControl", label: "賦活的制御の気質", high: 4.5, low: 3.5 },
  { key: "ATQ_AttentionalControl", label: "注意の気質", high: 4.5, low: 3.5 },
  { key: "ATQ_InhibitoryControl", label: "抑制的制御の気質", high: 4.5, low: 3.5 },
  { key: "ATQ_Sociability", label: "社交性の気質", high: 4.5, low: 3.5 },
  {
    key: "ATQ_HighIntensityPleasure",
    label: "強い刺激への快の気質",
    high: 4.5,
    low: 3.5,
  },
  { key: "ATQ_PositiveAffect", label: "肯定的感情の気質", high: 4.5, low: 3.5 },
  {
    key: "ATQ_NeutralPerceptualSensitivity",
    label: "知覚敏感性の気質",
    high: 4.5,
    low: 3.5,
  },
  {
    key: "ATQ_AffectivePerceptualSensitivity",
    label: "感情的知覚敏感性の気質",
    high: 4.5,
    low: 3.5,
  },
  {
    key: "ATQ_AssociativeSensitivity",
    label: "連想的敏感性の気質",
    high: 4.5,
    low: 3.5,
  },
  { key: "SMS_Extraversion", label: "外向性", high: 4.0, low: 3.0 },
  { key: "SMS_OtherDirectedness", label: "他者指向性", high: 4.0, low: 3.0 },
  { key: "SMS_Acting", label: "演技性", high: 4.0, low: 3.0 },
];

export function formatPersonality(personality: InterlocutorPersonality): string {
  const lines: string[] = [];
  const ios = personality.IOS;
  if (ios !== undefined) {
    if (ios >= 5) lines.push("他人との関係が高い。");
    else if (ios <= 3) lines.push("他人との関係が低い。");
  }

  for (const { key, label, high, low } of TRAIT_RULES) {
    const score = personality[key];
    if (score === undefined) continue;
    if (score >= high) lines.push(`${label}が高い。`);
    else if (score <= low) lines.push(`${label}が低い。`);
  }

  return lines.join("\n");
}
