"""Taskmate system prompt + persona（prepare_jsonl / list で共用）"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

# Big Five / KiSS18 等（1–7 または 1–5）
_TRAIT_RULES: list[tuple[str, str, float, float]] = [
    ("BigFive_Openness", "開放性", 4.5, 3.5),
    ("BigFive_Conscientiousness", "誠実性", 4.5, 3.5),
    ("BigFive_Extraversion", "外向性", 4.5, 3.5),
    ("BigFive_Agreeableness", "協調性", 4.5, 3.5),
    ("BigFive_Neuroticism", "神経症傾向", 4.5, 3.5),
    ("KiSS18_BasicSkill", "初歩的な社会的スキル", 4.0, 3.0),
    ("KiSS18_AdvancedSkill", "より高度の社会的スキル", 4.0, 3.0),
    ("KiSS18_EmotionalManagementSkill", "感情処理の社会的スキル", 4.0, 3.0),
    ("KiSS18_OffenceManagementSkill", "攻撃に代わる社会的スキル", 4.0, 3.0),
    ("KiSS18_StressManagementSkill", "ストレスを処理する社会的スキル", 4.0, 3.0),
    ("KiSS18_PlanningSkill", "計画の社会的スキル", 4.0, 3.0),
    ("ATQ_Fear", "恐れの気質", 4.5, 3.5),
    ("ATQ_Frustration", "欲求不満の気質", 4.5, 3.5),
    ("ATQ_Sadness", "悲しさの気質", 4.5, 3.5),
    ("ATQ_Discomfort", "不快の気質", 4.5, 3.5),
    ("ATQ_ActivationControl", "賦活的制御の気質", 4.5, 3.5),
    ("ATQ_AttentionalControl", "注意の気質", 4.5, 3.5),
    ("ATQ_InhibitoryControl", "抑制的制御の気質", 4.5, 3.5),
    ("ATQ_Sociability", "社交性の気質", 4.5, 3.5),
    ("ATQ_HighIntensityPleasure", "強い刺激への快の気質", 4.5, 3.5),
    ("ATQ_PositiveAffect", "肯定的感情の気質", 4.5, 3.5),
    ("ATQ_NeutralPerceptualSensitivity", "知覚敏感性の気質", 4.5, 3.5),
    ("ATQ_AffectivePerceptualSensitivity", "感情的知覚敏感性の気質", 4.5, 3.5),
    ("ATQ_AssociativeSensitivity", "連想的敏感性の気質", 4.5, 3.5),
    ("SMS_Extraversion", "外向性", 4.0, 3.0),
    ("SMS_OtherDirectedness", "他者指向性", 4.0, 3.0),
    ("SMS_Acting", "演技性", 4.0, 3.0),
]


def format_personality(personality: dict[str, Any]) -> str:
    lines: list[str] = []
    ios = personality.get("IOS")
    if ios is not None:
        if ios >= 5:
            lines.append("他人との関係が高い。")
        elif ios <= 3:
            lines.append("他人との関係が低い。")

    for key, label, high, low in _TRAIT_RULES:
        if key not in personality:
            continue
        score = float(personality[key])
        if score >= high:
            lines.append(f"{label}が高い。")
        elif score <= low:
            lines.append(f"{label}が低い。")
    return "\n".join(lines)


def build_taskmate_knowledge(faq_path: Path, service_path: Path) -> str:
    faqs = json.loads(faq_path.read_text(encoding="utf-8"))
    service = json.loads(service_path.read_text(encoding="utf-8"))

    target_users = "\n".join(f"- {u}" for u in service["targetUsers"])
    features = "\n".join(
        f"- {f['title']}: {f['description']}" for f in service["features"]
    )
    pricing = "\n".join(
        f"- {p['name']}（{p['price']}）: {p['description']}\n  機能: {'、'.join(p['features'])}"
        for p in service["pricing"]
    )
    faq_section = "\n\n".join(
        f"Q: {f['question']}\nA: {f['answer']}" for f in faqs
    )

    return f"""あなたはTaskmateのWebサイトに設置された問い合わせ対応チャットボットです。
ユーザーからの質問に対して、丁寧で分かりやすく回答してください。
分からないことは推測せず、「詳しい確認が必要です」と答えてください。

## 回答ルール
- 下記の「サービス情報」「FAQ」に書かれた内容だけを根拠に回答してください
- FAQ に該当する質問は、内容を要約・言い換えて丁寧に答えてください
- 情報にない内容（例: 個別アカウントの状態、未公開機能の詳細）は推測せず「詳しい確認が必要です」と伝えてください

## サービス情報

### サービス名
{service['name']}

### 概要
{service['description']}

### 対象ユーザー
{target_users}

### 主な機能
{features}

### 料金プラン
{pricing}

## FAQ

{faq_section}"""


def build_system_instruction(
    interlocutor: dict[str, Any],
    faq_path: Path,
    service_path: Path,
) -> str:
    base = build_taskmate_knowledge(faq_path, service_path)
    persona_lines = "\n".join(f"- {p}" for p in interlocutor["persona"])
    personality = format_personality(interlocutor.get("personality", {}))
    return f"""{base}

## 話し方（キャラクター）
{persona_lines}

### 性格特性
{personality}"""


def to_gemini_example(system_text: str, contents: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "systemInstruction": {"parts": [{"text": system_text}]},
        "contents": [
            {
                "role": c["role"],
                "parts": [{"text": c["text"]}],
            }
            for c in contents
        ],
    }
