# Taskmate

**Chapter 4「チャットボットを作る」** のサンプルプロジェクトです。

架空のタスク管理SaaS「Taskmate」のランディングページに、FAQ データを使ったキーワードマッチング型のチャットボットを追加しています。

---

## このチャプターで学ぶこと

- **Client Component の使い方** — `"use client"` を付けて、ブラウザ上で動くインタラクティブな UI を作る
- **React Hooks による状態管理** — `useState` でメッセージ・入力・開閉状態を扱う
- **チャット UI の実装** — フローティングボタン、メッセージ一覧、入力欄・送信ボタン
- **キーワードマッチングによる自動応答** — `data/faq.ts` の `keywords` を参照し、ユーザーの入力に応じて回答を返す
- **LP への組み込み** — `page.tsx` に `ChatBot` コンポーネントを追加する

AI による回答生成は **Chapter 5** で行います。

---

## プロジェクト構成

```
Taskmate/
├── app/
│   ├── layout.tsx       # レイアウト・メタ情報
│   ├── page.tsx         # ページ本体（各セクション + ChatBot）
│   └── globals.css      # グローバルスタイル
├── components/
│   ├── ChatBot.tsx      # キーワードマッチ型チャット UI
│   ├── Header.tsx       # ナビゲーションヘッダー
│   ├── Hero.tsx         # ファーストビュー（モックUI付き）
│   ├── Problem.tsx      # 課題提示セクション
│   ├── Features.tsx     # 機能紹介セクション
│   ├── HowItWorks.tsx   # 使い方ステップ（モックUI付き）
│   ├── Pricing.tsx      # 料金プランセクション
│   ├── FAQ.tsx          # よくある質問（アコーディオン）
│   ├── CTA.tsx          # コンバージョンセクション
│   └── Footer.tsx       # フッター
└── data/
    ├── service.ts       # サービス情報・機能・料金プランのデータ定義
    └── faq.ts           # FAQ データ（LP 表示 + チャットボットのキーワード用）
```

---

## 起動方法

```bash
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開き、右下のチャットボタンからメッセージを送信して応答を確認できます。

「無料」「解約」「スマホ」などのキーワードを含む質問を送ると、FAQ に対応する回答が返ります。

---

## デプロイ（Vercel）

Chapter 3 と同様、環境変数なしで Vercel にデプロイできます。

1. このリポジトリを GitHub に push する
2. [vercel.com](https://vercel.com) にアクセスし、GitHub アカウントでサインアップ
3. 「Add New Project」からリポジトリを選択
4. 設定はデフォルトのままで「Deploy」をクリック

デプロイが完了すると、`https://your-project.vercel.app` のような URL が発行されます。

---

## 技術スタック

| 技術                    | 用途                         |
| ----------------------- | ---------------------------- |
| Next.js 16 (App Router) | フレームワーク               |
| React 19 (Client Component) | チャット UI の状態管理   |
| TypeScript              | 型安全な実装                 |
| Tailwind CSS v4         | スタイリング                 |
| Vercel                  | ホスティング                 |
