# Chapter 6.5：キャラクター性と回答の安定性を上げる。fine-tuning

Chapter 6 ではシステムプロンプトで Taskmate の問い合わせ役割を与えました。本章では **fine-tuning** で次の2軸を補強します。

| 軸                 | プロンプトのみの限界                       | fine-tuning で狙うこと                                                                                          |
| ------------------ | ------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| **キャラクター性** | 口調指示の解釈がぶれる                     | [real-persona-chat](https://huggingface.co/datasets/nu-dialogue/real-persona-chat) の発話パターンで話し方を安定 |
| **回答の安定性**   | FAQ 列挙でも言い換え・再生成で答えがブレる | `data/faq.ts` の正答パターンを学習し、同趣旨の質問に安定して答える                                              |

fine-tuning はプロンプトの**代わり**ではなく、**プロンプト + 学習**で両方を補強します。

---

## やること / やらないこと

**やること**

- real-persona-chat の確認と話者（`interlocutor_id`）の選定
- Taskmate サービス情報・FAQ を含む JSONL の生成
- Cloud Storage へのアップロード
- Vertex AI supervised fine-tuning
- ベース / プロンプト版 / fine-tuning 版の比較（FAQ・言い換え・再送）

**やらないこと**

- 本格的なデータクリーニング
- 大量データでの本番品質モデル作成
- NSFW デモ
- 本番 MLOps

---

## 使用データセット

- [nu-dialogue/real-persona-chat](https://github.com/nu-dialogue/real-persona-chat)（CC BY-SA 4.0）
- Taskmate 固有: [`data/faq.ts`](../data/faq.ts)、[`data/service.ts`](../data/service.ts)

**倫理上の注意**: 特定個人のなりすましに使わないこと。口調・雑談スタイルの学習として扱うこと。

---

## 章の流れ

1. なぜ fine-tuning するのか（キャラクター性・回答の安定性）
2. データセットを確認する
3. 話者を選び、データを抽出・整形する
4. Gemini 用 JSONL に変換する
5. Cloud Storage にアップロードする
6. Vertex AI で tuning job を実行する
7. tuned model をテストする
8. アプリで base / prompt / tuned を比較する

---

## 1. 準備

```bash
# リポジトリルートで
npm install

cd finetuning
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

`Dataset scripts are no longer supported` が出た場合は、`datasets` 4.x が入っています。次で再インストールしてください。

```bash
pip install "datasets>=2.19.0,<4.0.0"
```

```bash
# リポジトリルートで Taskmate データを JSON にエクスポート
npm run finetuning:export
```

```bash
cp config.example.yaml config.yaml
# config.yaml の interlocutor_id を設定
```

---

## 2. 話者の選び方

```bash
cd finetuning
python scripts/list_interlocutors.py --min-dialogues 50
```

表示された ID のうち1つを `config.yaml` の `interlocutor_id` に設定します。

- 対話数が多いほど学習例が取りやすい
- ペルソナ10文が読みやすい話者を選ぶ
- マスク（`＊＊`）が極端に多い話者は避ける

---

## 3. JSONL の生成

```bash
python scripts/prepare_jsonl.py --config config.yaml
```

出力:

- `output/train.jsonl`
- `output/validation.jsonl`
- `output/interlocutor.json`（アプリのプロンプト組み立て用）

フォーマットは [Vertex AI の Gemini SFT 形式](https://cloud.google.com/vertex-ai/generative-ai/docs/models/gemini-supervised-tuning-prepare) です。サンプルは [`samples/example.jsonl`](samples/example.jsonl) を参照してください。

---

## 4. Cloud Storage にアップロード

```bash
export BUCKET=your-gcs-bucket
gsutil cp output/train.jsonl gs://${BUCKET}/taskmate-ch65/train.jsonl
gsutil cp output/validation.jsonl gs://${BUCKET}/taskmate-ch65/validation.jsonl
```

---

## 5. Vertex AI で tuning job を実行

### 前提

- GCP プロジェクトで Vertex AI API が有効
- `gcloud auth application-default login` 済み（ローカル実行時）

### Python SDK の例

```python
import vertexai
from vertexai.tuning import sft

PROJECT_ID = "your-project-id"
LOCATION = "us-central1"
BUCKET = "your-gcs-bucket"

vertexai.init(project=PROJECT_ID, location=LOCATION)

job = sft.train(
    source_model="gemini-2.0-flash-001",
    train_dataset=f"gs://{BUCKET}/taskmate-ch65/train.jsonl",
    validation_dataset=f"gs://{BUCKET}/taskmate-ch65/validation.jsonl",
    tuned_model_display_name="taskmate-stable-support-ch65",
    epochs=1,
    adapter_size=4,
)
print("Job:", job.resource_name)
```

ジョブ完了後、Vertex AI の Model Registry から **エンドポイントにデプロイ**し、エンドポイント ID を控えます。

### コンソール

1. [Vertex AI → Tuning](https://console.cloud.google.com/vertex-ai/generative/language/create/tune) を開く
2. ベースモデル（Gemini 2.0 Flash 等）を選択
3. 学習データ URI に `gs://.../train.jsonl`、検証データに `validation.jsonl` を指定
4. ジョブ完了後にデプロイ

**注意**: チューニングは課金対象です。ハンズオンでは `max_persona_examples: 250`・`epochs: 1` を推奨します。

---

## 6. アプリで比較する

### 環境変数（`.env.local`）

````env
GOOGLE_GENERATIVE_AI_API_KEY=...
AI_MODEL=gemini-2.5-flash-lite

# fine-tuning 版（ローカル推奨）
GOOGLE_VERTEX_PROJECT=your-project-id
GOOGLE_VERTEX_LOCATION=us-central1
AI_TUNED_ENDPOINT_ID=endpoint_id

`GOOGLE_VERTEX_LOCATION` は **エンドポイントをデプロイしたリージョンと一致**させてください（例: チューニングを `us-central1` でしたら `us-central1`）。リージョンが違うと `Endpoint not found` になります。



Vertex 推論には [Application Default Credentials](https://cloud.google.com/docs/authentication/application-default-credentials) が必要です。

```bash
npm run dev
````

チャット UI で **「Chapter 6.5 比較モード」** を ON にし、次を試します。

| モード         | 説明                                         |
| -------------- | -------------------------------------------- |
| ベース         | 最小 system のみ                             |
| プロンプト版   | Taskmate 知識 + ペルソナ（Chapter 6 + 口調） |
| fine-tuning 版 | Vertex エンドポイント + 同じ system          |

**推奨テスト**

1. 「無料プランはありますか？」を **2回連続**送信 → tuned は結論が揃いやすい
2. 「退会したい」など言い換え → FAQ の方針が安定しているか
3. 雑談1件 → 口調のキャラクター感

通常の LP チャット（比較モード OFF）は Chapter 6 の `buildSystemPrompt()` のままです。

**Vercel 本番**: tuned モードは Vertex 認証が必要なため、**ローカル開発での比較を主**にしてください。

---

## ライセンス

real-persona-chat 由来の派生データ（JSONL）は **CC BY-SA 4.0** の範囲で利用・共有してください。
