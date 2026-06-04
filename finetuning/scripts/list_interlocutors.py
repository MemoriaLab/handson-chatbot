#!/usr/bin/env python3
"""real-persona-chat の話者一覧と対話数を表示する（話者選定用）"""

from __future__ import annotations

import argparse
from collections import Counter
from pathlib import Path

from datasets import load_dataset


def main() -> None:
    parser = argparse.ArgumentParser(description="List interlocutors for selection")
    parser.add_argument(
        "--min-dialogues",
        type=int,
        default=0,
        help="この対話数以上の話者のみ表示",
    )
    parser.add_argument("--limit", type=int, default=50, help="表示件数上限")
    args = parser.parse_args()

    print("Loading nu-dialogue/real-persona-chat (dialogues)...")
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

    counts: Counter[str] = Counter()
    for row in dialogues:
        for iid in row["interlocutors"]:
            counts[iid] += 1

    interlocutor_map = {row["interlocutor_id"]: row for row in interlocutors_ds}

    rows: list[tuple[str, int, str]] = []
    for iid, cnt in counts.items():
        if cnt < args.min_dialogues:
            continue
        info = interlocutor_map.get(iid)
        persona_preview = ""
        if info and info.get("persona"):
            persona_preview = info["persona"][0][:60]
        rows.append((iid, cnt, persona_preview))

    rows.sort(key=lambda x: (-x[1], x[0]))

    print(f"\n{'ID':<6} {'dialogues':>10}  persona (first line)")
    print("-" * 80)
    for iid, cnt, preview in rows[: args.limit]:
        print(f"{iid:<6} {cnt:>10}  {preview}")
    print(f"\nTotal speakers with dialogues: {len(rows)}")
    print("config.yaml の interlocutor_id に選んだ ID を設定してください。")


if __name__ == "__main__":
    main()
