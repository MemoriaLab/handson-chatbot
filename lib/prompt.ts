import type { Faq } from "@/data/faq";
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

  return `あなたはTaskmateのWebサイトに設置された問い合わせ対応チャットボットです。
ユーザーからの質問に対して、丁寧で分かりやすく回答してください。
分からないことは推測せず、「詳しい確認が必要です」と答えてください。

## 回答ルール
- 下記の「サービス情報」および、ユーザーメッセージ内の「# FAQ」に書かれた内容だけを根拠に回答してください
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
${pricing}`;
}

export function formatFaqsForPrompt(faqs: Faq[]): string {
  if (faqs.length === 0) {
    return "関連するFAQは見つかりませんでした。";
  }

  return faqs
    .map((faq) => {
      return `Q. ${faq.question}\nA. ${faq.answer}`;
    })
    .join("\n\n");
}

type BuildChatPromptParams = {
  message: string;
  relatedFaqs: Faq[];
};

export function buildChatPrompt({
  message,
  relatedFaqs,
}: BuildChatPromptParams): string {
  const faqText = formatFaqsForPrompt(relatedFaqs);

  return `
以下はTaskmateに関するFAQです。
FAQに書かれている内容を参考にして、ユーザーの質問に回答してください。

FAQにない内容は推測せず、「詳しい確認が必要です」と伝えてください。

# FAQ
${faqText}

# ユーザーの質問
${message}
`.trim();
}
