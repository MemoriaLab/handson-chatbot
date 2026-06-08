import type { DocumentChunk } from "@/lib/chunk";
import { getSessionSummary } from "@/lib/booking/service";
import { isBookingFlowActive, getBookingSession } from "@/lib/booking/session";
import { serviceInfo } from "@/data/service";

export type ChatHistoryMessage = {
  role: "user" | "bot";
  text: string;
};

const BOOKING_INTENT_PATTERN =
  /デモ|予約|相談|面談|説明|見せて|見たい|体験|対面|紹介して|話したい|話を聞/i;

const DATE_PREFERENCE_PATTERN =
  /今日|明日|来週|午前|午後|\d{1,2}月|\d{1,2}日|曜日|いつ|日時|希望|都合/i;

const SLOT_SELECTION_PATTERN =
  /^(?:第)?[1-9１-９][番号]?(?:で|です|に|よろしく|お願い)?/;

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

export function hasBookingIntent(
  message: string,
  history: ChatHistoryMessage[] = []
): boolean {
  if (BOOKING_INTENT_PATTERN.test(message)) return true;

  if (EMAIL_PATTERN.test(message) && hasRecentBookingContext(history)) {
    return true;
  }

  if (SLOT_SELECTION_PATTERN.test(message.trim()) && hasRecentBookingContext(history)) {
    return true;
  }

  if (
    DATE_PREFERENCE_PATTERN.test(message) &&
    hasRecentBookingContext(history)
  ) {
    return true;
  }

  return false;
}

function hasRecentBookingContext(history: ChatHistoryMessage[]): boolean {
  const recentText = history
    .slice(-6)
    .map((item) => item.text)
    .join(" ");
  return (
    BOOKING_INTENT_PATTERN.test(recentText) ||
    /空き候補|仮押さえ|ご予約|番号|お名前とメール|メールアドレス/.test(
      recentText
    )
  );
}

function formatHistoryForPrompt(history: ChatHistoryMessage[]): string {
  if (history.length === 0) return "（なし）";

  return history
    .map((item) => `${item.role === "user" ? "ユーザー" : "ボット"}: ${item.text}`)
    .join("\n");
}

function buildServiceInfoSection(): string {
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

  return `## サービス情報

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

export function buildSystemPrompt(): string {
  return `あなたはTaskmateのWebサイトに設置された問い合わせ対応チャットボットです。
ユーザーからの質問に対して、丁寧で分かりやすく回答してください。
分からないことは推測せず、「詳しい確認が必要です」と答えてください。

## 回答ルール
- 下記の「サービス情報」および、ユーザーメッセージ内の「# FAQ」に書かれた内容を根拠に回答してください
- 会話履歴がある場合は文脈を踏まえて回答してください
- FAQ に該当する質問は、内容を要約・言い換えて丁寧に答えてください
- 情報にない内容は推測せず「詳しい確認が必要です」と伝えてください

## 予約・デモ・対面相談
- デモ・予約・相談の依頼には、予約用ツール（getAvailableSlots / selectSlot / completeBooking）が別途処理します
- 通常のFAQ回答では「チャット内で空き枠確認と予約ができます」と伝えてください

${buildServiceInfoSection()}`;
}

export function buildBookingSystemPrompt(sessionId: string): string {
  const session = getBookingSession(sessionId);
  const sessionSummary = getSessionSummary(sessionId);

  return `あなたはTaskmateの予約アシスタントです。
ユーザーと自然な会話をしながら、デモ・相談の予約をチャット内で完結させてください。

## 利用可能なツール（MCP 的な外部連携）
予約に関する処理は、必ず以下のツールを使って実行してください。テキストだけで確定しないでください。

1. getAvailableSlots — 空き候補の取得（TimeRex API）
   - デモ・予約の開始時
   - ユーザーが「来週」「明日」など日時を変更したとき

2. selectSlot — 候補番号で日時を仮押さえ
   - ユーザーが番号（「4で」「1番」など）を選んだとき

3. completeBooking — 名前とメールで予約確定（TimeRex API）
   - 連絡先が揃ったとき

## 回答ルール
- デモ・予約の開始時は、必ず最初に getAvailableSlots を呼んで候補を取得してください（日時の希望がなければ dateHint 省略可）
- ツールの結果をもとに、丁寧な日本語で説明してください
- 候補を提示するときは、ツールが返した番号・日時をそのまま箇条書きにしてください
- **禁止**: completeBooking の成功前に「ご予約が完了しました」と言わない
- **禁止**: ツールを呼ばずに日時や予約状況を捏造しない
- 「番号って？」などの質問には、直前に提示した候補リストの番号だと説明してください
- 予約完了後（completeBooking 成功時）は、以下を必ず伝えてください:
  - 予約内容（日時・名前・メール）
  - 確認メールが届くこと
  - デモ当日は Google Meet リンクから参加すること

## 現在の予約セッション
${sessionSummary}
${session.state === "completed" ? "新しい予約希望があれば getAvailableSlots から再開してください。" : ""}

${buildServiceInfoSection()}`;
}

export function formatDocumentsForPrompt(documents: DocumentChunk[]): string {
  if (documents.length === 0) {
    return "関連するFAQは見つかりませんでした。";
  }

  return documents.map((doc) => doc.content).join("\n\n");
}

type BuildChatPromptParams = {
  message: string;
  documents: DocumentChunk[];
  history?: ChatHistoryMessage[];
};

export function buildChatPrompt({
  message,
  documents,
  history = [],
}: BuildChatPromptParams): string {
  const faqText = formatDocumentsForPrompt(documents);

  return `
以下はTaskmateに関するFAQです。
FAQに書かれている内容を参考にして、ユーザーの質問に回答してください。

会話履歴がある場合は、直前のやり取りの続きとして解釈してください。
デモ・予約・相談の依頼は予約ツールが処理します。

# FAQ
${faqText}

# 会話履歴
${formatHistoryForPrompt(history)}

# ユーザーの最新メッセージ
${message}
`.trim();
}

export function shouldUseBookingTools(
  message: string,
  history: ChatHistoryMessage[],
  sessionId: string
): boolean {
  const session = getBookingSession(sessionId);
  return isBookingFlowActive(session) || hasBookingIntent(message, history);
}
