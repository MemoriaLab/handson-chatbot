import { faqs } from "@/data/faq";
import { serviceInfo } from "@/data/service";

export function buildSystemPrompt(): string {
  const targetUsers = serviceInfo.targetUsers
    .map((user) => `- ${user}`)
    .join("\n");

  const features = serviceInfo.features
    .map((feature) => `- ${feature.title}: ${feature.description}`)
    .join("\n");

  const pricing = serviceInfo.pricing
    .map(
      (plan) =>
        `- ${plan.name}（${plan.price}）: ${plan.description}\n  機能: ${plan.features.join("、")}`
    )
    .join("\n");

  const faqSection = faqs
    .map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`)
    .join("\n\n");

  return `あなたはTaskmateのWebサイトに設置された問い合わせ対応チャットボットです。
ユーザーからの質問に対して、丁寧で分かりやすく回答してください。
分からないことは推測せず、「詳しい確認が必要です」と答えてください。

## 回答ルール
- 下記の「サービス情報」「FAQ」に書かれた内容だけを根拠に回答してください
- FAQ に該当する質問は、内容を要約・言い換えて丁寧に答えてください
- 情報にない内容（例: 個別アカウントの状態、未公開機能の詳細）は推測せず「詳しい確認が必要です」と伝えてください

## サービス情報

### サービス名
${serviceInfo.name}

### 概要
${serviceInfo.description}

### 対象ユーザー
${targetUsers}

### 主な機能
${features}

### 料金プラン
${pricing}

## FAQ

${faqSection}`;
}
