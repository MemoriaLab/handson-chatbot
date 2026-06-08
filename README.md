# Taskmate

**Chapter 10「外部システムとつなぐ場合の考え方」** のサンプルプロジェクトです。

架空のタスク管理SaaS「Taskmate」のランディングページに、Gemini API を使った問い合わせ対応チャットボットを接続しています。Chapter 9 の RAG に加え、TimeRex API 連携によるチャット内予約フローを実現します。

---

## このチャプターで学ぶこと

- **外部連携の考え方** — FAQ に答えるだけでなく、予約・在庫確認など実務に近い連携をチャットボットに載せる
- **会話履歴の活用** — 複数ターンの予約調整（「今日か明日」などの続きの発話）に対応
- **TimeRex API 連携** — 空き予定の取得と予約作成 API の呼び出し
- **LLM + ツール呼び出し** — LLM が判断して TimeRex API を実行（MCP 的な外部連携）

---

## 予約連携の処理フロー

ユーザーが「デモ見せてほしい」と言うと、LLM が予約ツールを呼び出し、TimeRex API で処理します（URLをユーザーに渡すのではなく、チャットで完結）。

```
1. デモ見せてほしい
   → LLM が getAvailableSlots ツールを呼ぶ
   → GET /calendars/{id}/events で空き候補を取得・表示

2. 4で / 来週で
   → LLM が selectSlot または getAvailableSlots を呼ぶ

3. 山田太郎、yamada@example.com
   → LLM が completeBooking ツールを呼ぶ
   → POST /calendars/{id}/one-time-url で予約確定
   → 予約内容と次のステップをチャットで通知
```

| ツール | TimeRex API | 役割 |
|--------|-------------|------|
| `getAvailableSlots` | `GET /calendars/{calendar_id}/events` | 空き候補日時を取得 |
| `selectSlot` | （セッション更新） | 候補番号で仮押さえ |
| `completeBooking` | `POST /calendars/{calendar_id}/one-time-url` | 予約を API で確定 |

会話履歴と `sessionId` により、「今日か明日」のような続きの発話も文脈を維持します。

API リファレンス: [Get Calendar Events](https://developers.timerex.net/ja/api/reference/q3ig7kz84i66i-get-calendar-events) / [Create One Time URL](https://developers.timerex.net/ja/api/reference/wggd2aqhlotdc-create-one-time-url)

---

## RAG の処理フロー（Chapter 9 からの継続）

```
【事前準備】FAQ 更新時にローカルで1回実行
FAQ → chunk 化 → embedding 化 → data/faqIndex.ts に保存

【クエリ時】ユーザーが質問したとき
質問文 → embedding 化（1回） → 保存済みベクトルと照合 → プロンプトに注入 → AI が回答
```

FAQ の embedding は `npm run generate:embeddings` で事前生成し、`data/faqIndex.ts` に保存して使い回します。

| | Chapter 8 | Chapter 9 | Chapter 10 |
|---|---|---|---|
| 検索方法 | キーワード一致 | embedding + cosine similarity | 同左 |
| 外部連携 | なし | なし | TimeRex API（予約フロー） |
| 例 | 「解約」で検索 | 「もう使わない」→ 解約 FAQ | 「デモ見せて」→ 空き枠 → 予約完了 |

---

## プロジェクト構成

```
Taskmate/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts   # チャット API（RAG + 予約連携）
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ChatBot.tsx        # AI チャット UI（会話履歴・sessionId 送信）
│   └── …                  # LP 各セクション
├── lib/
│   ├── ai.ts              # Gemini 呼び出し
│   ├── prompt.ts          # システムプロンプト・チャットプロンプト
│   ├── rag.ts             # RAG / 予約ツールの振り分け
│   ├── tools/
│   │   └── booking.ts     # 予約ツール定義（LLM が呼び出す）
│   ├── booking/
│   │   ├── service.ts     # 予約ビジネスロジック
│   │   ├── session.ts     # 予約セッション管理
│   │   ├── demoSlots.ts   # API 0件時のデモ候補生成
│   │   └── format.ts      # 日時フォーマット
│   ├── timerex/
│   │   └── client.ts      # TimeRex API クライアント
│   ├── chunk.ts           # ドキュメントの chunk 分割
│   ├── embeddings.ts      # テキスト → embedding 変換
│   ├── vectorStore.ts     # インメモリベクトル検索
│   └── searchFaq.ts       # Chapter 8 のキーワード検索（対比用に残置）
├── scripts/
│   └── generate-faq-embeddings.ts
└── data/
    ├── service.ts
    ├── faq.ts
    └── faqIndex.ts
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
RAG_MIN_SCORE=0.6
TIMEREX_API_KEY=your_timerex_api_key_here
TIMEREX_CALENDAR_ID=your_calendar_id_here
```

| 変数 | 説明 |
|------|------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) から取得 |
| `AI_MODEL` | 回答生成用モデル（デフォルト: `gemini-2.5-flash-lite`） |
| `EMBEDDING_MODEL` | embedding 用モデル（デフォルト: `gemini-embedding-001`） |
| `RAG_MIN_SCORE` | ベクトル検索の関連性閾値（0〜1） |
| `TIMEREX_API_KEY` | TimeRex の API キー（[APIキーによる認証](https://developers.timerex.net/ja/api/reference/86cyex2iwt9fj-authorization-with-api-key)） |
| `TIMEREX_CALENDAR_ID` | 対面相談用**カレンダー**の ID（チーム ID ではない） |

### 3. TimeRex の準備

1. [TimeRex](https://timerex.net/) に登録する
2. 対面相談用のカレンダーを作成する
3. ダッシュボード > チーム設定 > デベロッパーツール で API キーを発行する
4. カレンダー ID を取得して `.env.local` の `TIMEREX_CALENDAR_ID` に設定する

カレンダー ID は API で確認できます（`team_id` と混同しないよう注意）:

```bash
# チーム一覧（items[].id が team_id）
curl -H "x-api-key: YOUR_API_KEY" https://timerex.net/api/beta/user/me/teams

# カレンダー一覧（items[].id が calendar_id ← こちらを設定）
curl -H "x-api-key: YOUR_API_KEY" https://timerex.net/api/beta/teams/TEAM_ID/calendars
```

### 4. FAQ embedding の生成

FAQ を更新した場合、または初回セットアップ時に embedding を生成します。

```bash
npm run generate:embeddings
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開き、右下のチャットからメッセージを送信して動作を確認できます。

**動作確認の例:**

1. 「デモ見せてほしい」→ 空き候補が番号付きで表示される
2. 「1番」または「今日か明日」→ 枠が選択される
3. 「山田太郎、yamada@example.com」→ 「ご予約を承りました」と表示される

---

## デプロイ（Vercel）

Vercel の Project Settings → **Environment Variables** に、ローカルと同じ変数を登録してください。

- `GOOGLE_GENERATIVE_AI_API_KEY`
- `AI_MODEL`（任意）
- `EMBEDDING_MODEL`（任意）
- `RAG_MIN_SCORE`（任意）
- `TIMEREX_API_KEY`
- `TIMEREX_CALENDAR_ID`

---

## 技術スタック

| 技術 | 用途 |
|------|------|
| Next.js 16 (App Router) | フレームワーク・API Route |
| TypeScript | 型安全な実装 |
| Tailwind CSS v4 | スタイリング |
| Vercel AI SDK (`ai`) | AI 呼び出し・ツール呼び出し・embedding 生成 |
| `@ai-sdk/google` | Google Gemini API Provider |
| [TimeRex Scheduling API](https://developers.timerex.net/ja/api/) | 空き予定取得・予約 URL 発行 |
| Vercel | ホスティング |

---

## 今後の応用

予約が確定したあとに Slack や CRM へ通知したい場合は、TimeRex の [Webhook](https://developers.timerex.net/ja/webhook/) や `Watch One Time URL` API で予約完了イベントを受け取る構成が考えられます。今回のハンズオンではスコープ外です。
