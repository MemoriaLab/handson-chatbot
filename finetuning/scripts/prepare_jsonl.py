#!/usr/bin/env python3
"""ペルソナ雑談 + Taskmate FAQ を Gemini SFT 用 JSONL に変換"""

from __future__ import annotations

import argparse
import json
import random
from pathlib import Path
from typing import Any

import yaml
from datasets import load_dataset
from tqdm import tqdm

from prompt_builder import build_system_instruction, to_gemini_example

FINETUNING_ROOT = Path(__file__).resolve().parent.parent


def load_config(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as f:
        return yaml.safe_load(f)


def get_interlocutor_record(interlocutors_ds: Any, interlocutor_id: str) -> dict[str, Any]:
    for row in interlocutors_ds:
        if row["interlocutor_id"] == interlocutor_id:
            return dict(row)
    raise ValueError(f"interlocutor_id {interlocutor_id} not found in dataset")


def normalize_utterances(raw: Any) -> list[dict[str, Any]]:
    """HF datasets の行形式（list[dict] または列指向き dict）を list[dict] に統一"""
    if raw is None:
        return []
    if isinstance(raw, list):
        return [dict(u) if not isinstance(u, dict) else u for u in raw]
    if isinstance(raw, dict):
        # 列指向き: {"utterance_id": [0, 1], "text": [...], ...}
        if "utterance_id" in raw and isinstance(raw["utterance_id"], list):
            n = len(raw["utterance_id"])
            keys = ("utterance_id", "interlocutor_id", "text", "timestamp")
            return [
                {k: raw[k][i] for k in keys if k in raw and i < len(raw[k])}
                for i in range(n)
            ]
        # 単一発話が dict でラップされている場合
        if "text" in raw and not isinstance(raw.get("text"), list):
            return [raw]
    return []


def as_plain_dict(row: Any) -> dict[str, Any]:
    return dict(row) if not isinstance(row, dict) else row


def persona_examples_from_dialogue(
    dialogue: dict[str, Any],
    target_id: str,
) -> list[list[dict[str, str]]]:
    """1対話から、target の各 model ターンごとの contents 履歴リストを返す"""
    utterances = sorted(
        normalize_utterances(dialogue.get("utterances")),
        key=lambda u: u["utterance_id"],
    )
    examples: list[list[dict[str, str]]] = []
    history: list[dict[str, str]] = []

    for utt in utterances:
        speaker = utt["interlocutor_id"]
        text = (utt.get("text") or "").strip()
        if not text:
            continue

        if speaker == target_id:
            if history and history[-1]["role"] == "user":
                examples.append(history + [{"role": "model", "text": text}])
            history = history + [{"role": "model", "text": text}]
        else:
            history = history + [{"role": "user", "text": text}]

    return examples


def faq_user_variants(faq: dict[str, Any]) -> list[str]:
    variants = [faq["question"]]
    keywords = faq.get("keywords") or []
    templates = [
        "{kw}について教えてください",
        "{kw}はどうなっていますか？",
        "{kw}に関する質問です",
    ]
    for kw in keywords[:3]:
        for tpl in templates:
            q = tpl.format(kw=kw)
            if q not in variants:
                variants.append(q)
    return variants


def style_faq_answer(answer: str, persona: list[str]) -> str:
    """FAQ 回答に軽い口調を付与（事実は answer を維持）"""
    opener = "はい、"
    if persona:
        first = persona[0]
        if "学生" in first:
            opener = "はい、"
        elif "医療" in first or "働い" in first:
            opener = "そうですね、"
    return f"{opener}{answer}"


def build_faq_examples(
    system_text: str,
    faqs: list[dict[str, Any]],
    interlocutor: dict[str, Any],
) -> list[dict[str, Any]]:
    examples: list[dict[str, Any]] = []
    persona = interlocutor.get("persona") or []
    for faq in faqs:
        model_text = style_faq_answer(faq["answer"], persona)
        for user_text in faq_user_variants(faq):
            examples.append(
                to_gemini_example(
                    system_text,
                    [
                        {"role": "user", "text": user_text},
                        {"role": "model", "text": model_text},
                    ],
                )
            )
    return examples


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--config",
        type=Path,
        default=FINETUNING_ROOT / "config.yaml",
        help="config.yaml のパス",
    )
    args = parser.parse_args()

    if not args.config.exists():
        raise SystemExit(
            f"config not found: {args.config}\n"
            "cp config.example.yaml config.yaml を実行し、interlocutor_id を設定してください。"
        )

    cfg = load_config(args.config)
    interlocutor_id = (cfg.get("interlocutor_id") or "").strip()
    if not interlocutor_id:
        raise SystemExit("config.yaml の interlocutor_id を設定してください。")

    max_persona = int(cfg.get("max_persona_examples", 250))
    val_ratio = float(cfg.get("validation_ratio", 0.1))
    seed = int(cfg.get("seed", 42))
    output_dir = FINETUNING_ROOT / cfg.get("output_dir", "output")
    taskmate_dir = FINETUNING_ROOT / cfg.get("taskmate_dir", "taskmate")

    faq_path = taskmate_dir / "faq.json"
    service_path = taskmate_dir / "service.json"
    if not faq_path.exists() or not service_path.exists():
        raise SystemExit(
            "taskmate/faq.json がありません。先に npm run finetuning:export を実行してください。"
        )

    faqs = json.loads(faq_path.read_text(encoding="utf-8"))
    output_dir.mkdir(parents=True, exist_ok=True)

    print("Loading datasets...")
    dialogues = load_dataset(
        "nu-dialogue/real-persona-chat",
        "dialogue",
        split="train",
        trust_remote_code=True,
    )
    interlocutors_ds = load_dataset(
        "nu-dialogue/real-persona-chat",
        "interlocutor",
        split="train",
        trust_remote_code=True,
    )

    interlocutor = get_interlocutor_record(interlocutors_ds, interlocutor_id)
    interlocutor_out = {
        "interlocutor_id": interlocutor_id,
        "persona": interlocutor["persona"],
        "personality": interlocutor.get("personality", {}),
    }
    (output_dir / "interlocutor.json").write_text(
        json.dumps(interlocutor_out, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    system_text = build_system_instruction(interlocutor, faq_path, service_path)

    persona_rows: list[dict[str, Any]] = []
    for dialogue in tqdm(dialogues, desc="persona dialogues"):
        d = as_plain_dict(dialogue)
        interlocutors = d.get("interlocutors") or []
        if interlocutor_id not in interlocutors:
            continue
        for contents in persona_examples_from_dialogue(d, interlocutor_id):
            persona_rows.append(to_gemini_example(system_text, contents))

    random.seed(seed)
    random.shuffle(persona_rows)
    if len(persona_rows) > max_persona:
        persona_rows = persona_rows[:max_persona]

    split_idx = max(1, int(len(persona_rows) * (1 - val_ratio)))
    persona_train = persona_rows[:split_idx]
    persona_val = persona_rows[split_idx:]

    faq_examples = build_faq_examples(system_text, faqs, interlocutor)
    faq_val_count = min(2, len(faq_examples))
    faq_train = faq_examples[:-faq_val_count] if faq_val_count else faq_examples
    faq_val = faq_examples[-faq_val_count:] if faq_val_count else []

    train_examples = persona_train + faq_train
    val_examples = persona_val + faq_val
    random.shuffle(train_examples)
    random.shuffle(val_examples)

    train_path = output_dir / "train.jsonl"
    val_path = output_dir / "validation.jsonl"

    with train_path.open("w", encoding="utf-8") as f:
        for ex in train_examples:
            f.write(json.dumps(ex, ensure_ascii=False) + "\n")

    with val_path.open("w", encoding="utf-8") as f:
        for ex in val_examples:
            f.write(json.dumps(ex, ensure_ascii=False) + "\n")

    print(f"Wrote {train_path} ({len(train_examples)} examples)")
    print(f"Wrote {val_path} ({len(val_examples)} examples)")
    print(f"  persona train/val: {len(persona_train)} / {len(persona_val)}")
    print(f"  faq train/val: {len(faq_train)} / {len(faq_val)}")
    print(f"Wrote {output_dir / 'interlocutor.json'}")


if __name__ == "__main__":
    main()
