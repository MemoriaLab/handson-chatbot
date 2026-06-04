# Taskmate

**Chapter 6「プロンプトで役割を与える」** および **Chapter 6.5「キャラクター性と回答の安定性を上げる。fine-tuning」** のサンプルプロジェクトです。

架空のタスク管理SaaS「Taskmate」のランディングページに、Gemini API を使った問い合わせ対応チャットボットを接続しています。

---

## Chapter 6.5（fine-tuning）

応用編の手順・データ準備・Vertex AI チューニングは **[finetuning/README.md](finetuning/README.md)** にまとめています。

- **キャラクター性**: real-persona-chat の口調を学習
- **回答の安定性**: Taskmate の FAQ / サービス情報を学習データに含める
- アプリのチャットで「Chapter 6.5 比較モード」から base / プロンプト版 / fine-tuning 版を比較

---

## このチャプターで学ぶこと（Chapter 6）

- **システムプロンプトの設定** — `generateText` の `system` オプションで AI に役割を与える
- **役割の定義** — 問い合わせ対応チャットボットとしての振る舞いを指示する
- **サービス情報の注入** — `data/service.ts` の内容をプロンプトに組み込む
- **FAQ データの注入** — `data/faq.ts` の Q/A をプロンプトに組み込み、正確な回答を促す

---

## プロジェクト構成

```
Taskmate/
├── finetuning/            # Chapter 6.5: JSONL 生成・Vertex 手順
├── app/api/chat/route.ts
├── components/ChatBot.tsx
├── lib/
│   ├── ai.ts              # Gemini / Vertex（比較モード）
│   ├── prompt.ts          # Chapter 6 システムプロンプト
│   └── finetune-prompt.ts # 学習時と同じ system（ペルソナ付き）
└── data/
    ├── service.ts
    └── faq.ts
```

---

## 起動方法

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、API キーを設定します。

```bash
cp .env.local.example .env.local
```

`.env.local` の例:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
AI_MODEL=gemini-2.5-flash-lite
```

API キーは [Google AI Studio](https://aistudio.google.com/apikey) から取得できます（無料枠あり）。

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開き、右下のチャットからメッセージを送信して AI の回答を確認できます。

---

## デプロイ（Vercel）

Vercel の Project Settings → **Environment Variables** に、ローカルと同じ変数を登録してください。

- `GOOGLE_GENERATIVE_AI_API_KEY`
- `AI_MODEL`（任意。未設定時は `gemini-2.5-flash-lite`）

Chapter 6.5 の fine-tuning 版比較では `GOOGLE_VERTEX_PROJECT` と `AI_TUNED_ENDPOINT_ID` も必要です（詳細は [finetuning/README.md](finetuning/README.md)）。

---

## 技術スタック

| 技術                    | 用途                         |
| ----------------------- | ---------------------------- |
| Next.js 16 (App Router) | フレームワーク・API Route    |
| TypeScript              | 型安全な実装                 |
| Tailwind CSS v4         | スタイリング                 |
| Vercel AI SDK (`ai`)    | AI 呼び出しの共通インターフェース |
| `@ai-sdk/google`        | Google Gemini API Provider   |
| `@ai-sdk/google-vertex` | fine-tuning 済みモデル（Chapter 6.5） |
| Vercel                  | ホスティング                 |
