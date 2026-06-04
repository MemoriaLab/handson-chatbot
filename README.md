# Taskmate

**Chapter 3「簡単なWebサイトを作る」** のサンプルプロジェクトです。

架空のタスク管理SaaS「Taskmate」のランディングページを題材にしています。

---

## このチャプターで学ぶこと

- Next.js App Router の基本的なファイル構成
- Tailwind CSS を使ったスタイリング
- コンポーネント分割の考え方
- データ定義ファイル（TypeScript）の使い方
- レスポンシブ対応の基本
- Vercel を使ったホスティング・デプロイ

---

## プロジェクト構成

```
Taskmate/
├── app/
│   ├── layout.tsx       # レイアウト・メタ情報
│   ├── page.tsx         # ページ本体（各セクションを組み込み）
│   └── globals.css      # グローバルスタイル
├── components/
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
    └── faq.ts           # FAQのデータ定義
```

---

## 起動方法

```bash
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くと確認できます。

---

## デプロイ（Vercel）

このチャプターでは、作成したLPをVercelでホスティングするところまで行います。

Vercelは、GitHubのパブリックリポジトリと連携するだけで無料でデプロイできます。Next.jsの開発元でもあるため、設定なしですぐに動作します。

### デプロイ手順

1. このリポジトリをGitHubにpushする
2. [vercel.com](https://vercel.com) にアクセスし、GitHubアカウントでサインアップ
3. 「Add New Project」からリポジトリを選択
4. 設定はデフォルトのままで「Deploy」をクリック

デプロイが完了すると、`https://your-project.vercel.app` のようなURLが発行されます。
以降、`main` ブランチにpushするたびに自動でデプロイが走ります。

---

## 技術スタック

| 技術                    | 用途           |
| ----------------------- | -------------- |
| Next.js 16 (App Router) | フレームワーク |
| TypeScript              | 型安全な実装   |
| Tailwind CSS v4         | スタイリング   |
| Vercel                  | ホスティング   |
