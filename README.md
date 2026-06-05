# Taskmate

**Chapter 9「RAGの仕組みを理解する（応用編）」** のサンプルプロジェクトです。

架空のタスク管理SaaS「Taskmate」のランディングページに、Gemini API を使った問い合わせ対応チャットボットを接続しています。

---

## このチャプターで学ぶこと

- **RAG の基本構成** — 事前準備（chunk 化 → embedding → 保存）とクエリ時（検索 → プロンプト注入 → 回答生成）の2フェーズ
- **embedding** — 文章を数値ベクトルに変換し、意味的な近さで検索する仕組み
- **ベクトル検索** — cosine similarity による関連ドキュメントの取得
- **Chapter 8 との違い** — キーワード検索（簡易 RAG）から embedding ベースの検索（本格 RAG）への発展

---

## RAG の処理フロー

```
【事前準備】FAQ 更新時にローカルで1回実行
FAQ → chunk 化 → embedding 化 → data/faqIndex.ts に保存

【クエリ時】ユーザーが質問したとき
質問文 → embedding 化（1回） → 保存済みベクトルと照合 → プロンプトに注入 → AI が回答
```

FAQ の embedding は `npm run generate:embeddings` で事前生成し、`data/faqIndex.ts` に保存して使い回します。チャット API 呼び出しのたびに FAQ を embedding 化することはありません。

Chapter 8 では `searchFaqs`（キーワード検索）で関連 FAQ を探していました。
Chapter 9 では `retrieveRelatedDocuments`（ベクトル検索）に置き換え、言い換え表現にも対応しやすくなります。

| | Chapter 8 | Chapter 9 |
|---|---|---|
| 検索方法 | キーワード一致 | embedding + cosine similarity |
| 探し方 | 文字の一致 | 意味の近さ |
| 例 | 「解約」で検索 | 「もう使わない」→ 解約 FAQ を発見 |

---

## 本番環境ではどうするか

このハンズオンでは **インメモリベクトルストア** を使っていますが、これは学習用の簡略化です。本番環境では以下の構成が正攻法です。

```
【本番の事前準備】FAQ 更新時にバッチで実行
ドキュメント → chunk 化 → embedding 化 → ベクトル DB に永続保存

【本番のクエリ時】
質問文 → embedding 化（1回） → ベクトル DB から検索 → プロンプト注入 → AI が回答
```

| | 本番（正攻法） | ハンズオン（今回） |
|---|---|---|
| embedding の保存先 | ベクトル DB | `data/faqIndex.ts`（ファイルに永続化） |
| 事前準備のタイミング | FAQ 更新時にバッチ実行 | `npm run generate:embeddings` |
| クエリ時の API 呼び出し | 質問 embedding 1回 + 回答生成 | 質問 embedding 1回 + 回答生成 |
| 再起動後 | DB からそのまま検索可能 | 保存済みファイルから読み込み |

ベクトル DB の候補: Supabase pgvector, Qdrant, Pinecone, Cloudflare Vectorize など。

---

## プロジェクト構成

```
Taskmate/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts   # チャット API（RAG フロー）
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ChatBot.tsx        # AI チャット UI
│   └── …                  # LP 各セクション
├── lib/
│   ├── ai.ts              # Gemini 呼び出し（Vercel AI SDK）
│   ├── prompt.ts          # システムプロンプト・チャットプロンプトの組み立て
│   ├── searchFaq.ts       # Chapter 8 のキーワード検索（対比用に残置）
│   ├── chunk.ts           # ドキュメントの chunk 分割
│   ├── embeddings.ts      # テキスト → embedding 変換
│   ├── vectorStore.ts     # インメモリベクトル検索（ハンズオン用）
│   └── rag.ts             # RAG 全体のオーケストレーション
├── scripts/
│   └── generate-faq-embeddings.ts  # FAQ embedding 事前生成スクリプト
└── data/
    ├── service.ts         # サービス情報（LP・AI プロンプト共用）
    ├── faq.ts             # FAQ データ（LP 表示・embedding 生成元）
    └── faqIndex.ts        # FAQ + embedding（自動生成・RAG 検索用）
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
EMBEDDING_MODEL=gemini-embedding-001
RAG_MIN_SCORE=0.7
```

- `GOOGLE_GENERATIVE_AI_API_KEY` — [Google AI Studio](https://aistudio.google.com/apikey) から取得（無料枠あり）
- `EMBEDDING_MODEL` — embedding 用モデル（デフォルト: `gemini-embedding-001`）
- `RAG_MIN_SCORE` — ベクトル検索の関連性閾値（0〜1。これ未満のドキュメントは渡さない）

### 3. FAQ embedding の生成

FAQ を更新した場合、または初回セットアップ時に embedding を生成します。

```bash
npm run generate:embeddings
```

`data/faq.ts` を読み込み、Gemini API で embedding を生成して `data/faqIndex.ts` に保存します。このファイルは Git にコミットして使い回せます。

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開き、右下のチャットからメッセージを送信して AI の回答を確認できます。

1回のチャット送信では **質問の embedding 1回 + 回答生成 1回** の API 呼び出しが発生します。

---

## デプロイ（Vercel）

Vercel の Project Settings → **Environment Variables** に、ローカルと同じ変数を登録してください。

- `GOOGLE_GENERATIVE_AI_API_KEY`
- `AI_MODEL`（任意。未設定時は `gemini-2.5-flash-lite`）
- `EMBEDDING_MODEL`（任意。未設定時は `gemini-embedding-001`）
- `RAG_MIN_SCORE`（任意。未設定時は `0.7`）

---

## 技術スタック

| 技術                    | 用途                         |
| ----------------------- | ---------------------------- |
| Next.js 16 (App Router) | フレームワーク・API Route    |
| TypeScript              | 型安全な実装                 |
| Tailwind CSS v4         | スタイリング                 |
| Vercel AI SDK (`ai`)    | AI 呼び出し・embedding 生成  |
| `@ai-sdk/google`        | Google Gemini API Provider   |
| Vercel                  | ホスティング                 |
