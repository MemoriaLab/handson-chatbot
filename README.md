# Taskmate

**Chapter 5「AIをチャットに接続する」** のサンプルプロジェクトです。

架空のタスク管理SaaS「Taskmate」のランディングページに、Gemini API を使った AI チャットボットを接続しています。

---

## このチャプターで学ぶこと

- **API Route の作成** — `app/api/chat/route.ts` で POST を受け、AI 回答を JSON で返す
- **環境変数の設定** — API キーをサーバー側だけで使う（クライアントに露出させない）
- **フロントエンドから API を呼び出す** — `ChatBot.tsx` から `fetch` で `/api/chat` を叩く
- **AI の回答を画面に表示する** — 返ってきた `{ answer }` をチャット UI に描画する

プロンプト設計やロール付与は **Chapter 6** で行います。

---

## プロジェクト構成

```
Taskmate/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts   # チャット API（POST）
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ChatBot.tsx        # AI チャット UI
│   └── …                  # LP 各セクション
├── lib/
│   └── ai.ts              # Gemini 呼び出し（Vercel AI SDK）
└── data/
    ├── service.ts
    └── faq.ts             # LP の FAQ セクション用（AI には渡さない）
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

---

## 技術スタック

| 技術                    | 用途                         |
| ----------------------- | ---------------------------- |
| Next.js 16 (App Router) | フレームワーク・API Route    |
| TypeScript              | 型安全な実装                 |
| Tailwind CSS v4         | スタイリング                 |
| Vercel AI SDK (`ai`)    | AI 呼び出しの共通インターフェース |
| `@ai-sdk/google`        | Google Gemini API Provider   |
| Vercel                  | ホスティング                 |
