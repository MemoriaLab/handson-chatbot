export type Faq = {
  question: string;
  answer: string;
  keywords: string[];
};

// embedding は scripts/generate-faq-embeddings.ts で生成し data/faqIndex.ts に保存します。
// FAQ を更新したら `npm run generate:embeddings` を実行してください。

export const faqs: Faq[] = [
  {
    question: "無料プランはありますか？",
    answer: "はい。3ユーザーまで無料で利用できます。",
    keywords: ["無料", "Free", "フリープラン", "料金"],
  },
  {
    question: "無料トライアルはありますか？",
    answer:
      "はい。StandardプランとBusinessプランは14日間無料でお試しいただけます。",
    keywords: ["無料トライアル", "お試し", "体験", "Standard", "Business"],
  },
  {
    question: "クレジットカード登録は必要ですか？",
    answer:
      "Freeプランの利用にはクレジットカード登録は不要です。有料プランへ変更する際に登録が必要です。",
    keywords: ["クレジットカード", "カード", "登録", "支払い"],
  },
  {
    question: "スマートフォンでも使えますか？",
    answer: "はい。スマートフォンのブラウザから利用できます。",
    keywords: ["スマホ", "スマートフォン", "モバイル", "ブラウザ"],
  },
  {
    question: "解約はできますか？",
    answer:
      "はい。管理画面からいつでも解約できます。解約後は次回請求日以降の料金は発生しません。",
    keywords: ["解約", "キャンセル", "退会", "停止"],
  },
  {
    question: "請求書払いはできますか？",
    answer: "Businessプランのみ請求書払いに対応しています。",
    keywords: ["請求書", "請求書払い", "法人", "支払い"],
  },
  {
    question: "データのエクスポートはできますか？",
    answer: "はい。タスク一覧をCSV形式でエクスポートできます。",
    keywords: ["エクスポート", "CSV", "出力", "データ"],
  },
  {
    question: "外部ツールとの連携はできますか？",
    answer:
      "現時点では外部ツール連携は一部ユーザー向けにβ提供中です。詳細はお問い合わせください。",
    keywords: ["外部連携", "API", "Slack", "連携", "β"],
  },
  {
    question: "サポートはありますか？",
    answer:
      "Standardプランではメールサポート、Businessプランでは優先サポートを提供しています。",
    keywords: ["サポート", "問い合わせ", "メール", "優先サポート"],
  },
  {
    question: "導入サポートはありますか？",
    answer:
      "Businessプランでは、初期設定やチーム導入に関するサポートを提供しています。",
    keywords: ["導入", "初期設定", "サポート", "Business"],
  },
  {
    question: "対面での相談やデモは予約できますか？",
    answer:
      "はい。チャット内で空き枠を確認し、日時とお名前・メールアドレスをいただければ予約まで完結できます。",
    keywords: ["対面", "相談", "デモ", "予約", "面談", "説明", "見せて"],
  },
];
