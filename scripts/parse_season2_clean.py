#!/usr/bin/env python3
"""
Re-parse Season 2 episodes with cleaned text:
  1. Replace em dashes (—) with commas — matches Season 1's style
  2. Remove separator lines (────────────────────, ━━━━━━━━━━━, ✦ ✦ ✦)
  3. Remove the repeated title header at the start of the body

Output: updated /home/z/my-project/scripts/season2-episodes.json
"""
from docx import Document
import json
import os
import re

ORDINALS = {
    "الأولى": 1, "الثانية": 2, "الثالثة": 3, "الرابعة": 4,
    "الخامسة": 5, "السادسة": 6, "السابعة": 7, "الثامنة": 8,
}

UPLOAD_DIR = "/home/z/my-project/upload"
OUTPUT_FILE = "/home/z/my-project/scripts/season2-episodes.json"

HOOK_EN = "In the rush of our age, before the current sweeps us away, we pause as contemplators."

EN_FULL_PLACEHOLDER = (
    "The English translation of this episode is forthcoming and will be published soon.\n\n"
    "The original Arabic text is available on the Arabic version of this page.\n\n"
    "— Ahmed Ali"
)

def is_separator_line(line):
    """Check if a line is a decorative separator (──, ━━, ✦, etc.)"""
    stripped = line.strip()
    if not stripped:
        return False
    # Lines made entirely of ─, ━, ✦, -, =, or combinations thereof
    if re.match(r'^[─━✦\-=]+\s*$', stripped):
        return True
    return False

def clean_text(text):
    """Clean em dashes and separator lines from the text."""
    lines = text.split('\n')

    # Remove separator lines and empty lines adjacent to them
    cleaned_lines = []
    for line in lines:
        if is_separator_line(line):
            continue
        cleaned_lines.append(line)

    text = '\n'.join(cleaned_lines)

    # Replace em dashes with commas:
    # " — " → ", " (most common pattern: space-emdash-space)
    # "—" → "," (em dash without spaces)
    text = text.replace(' — ', ', ')
    text = text.replace('—', ',')

    # Remove leading "الحَلْقَةُ X: title" line if it appears at the start
    # (this is the repeated header from the docx that Season 1 doesn't have)
    text = re.sub(r'^الحَلْقَةُ[^:]*:[^\n]*\n+', '', text)

    # Clean up multiple consecutive blank lines (from removed separators)
    text = re.sub(r'\n{3,}', '\n\n', text)

    # Strip leading/trailing whitespace
    return text.strip()


def parse_episode(filepath, season2_ep_num):
    doc = Document(filepath)
    paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]

    # Find Arabic + English title pair
    ar_title = None
    en_title = None
    for i, p in enumerate(paragraphs):
        if re.search(r'[\u0600-\u06FF]', p) and len(p) < 100 \
           and not p.startswith("سلسلة") and not p.startswith("الحَلْقَة") \
           and not p.startswith("إعداد") and "✦" not in p and "━" not in p and "─" not in p:
            next_p = paragraphs[i + 1] if i + 1 < len(paragraphs) else ""
            if next_p and not re.search(r'[\u0600-\u06FF]', next_p) \
               and re.search(r'[A-Za-z]', next_p) and len(next_p) < 100:
                ar_title = p
                en_title = next_p
                break

    if not ar_title or not en_title:
        raise ValueError(f"Could not find title pair in {filepath}")

    # Find body start: after the "────────────────────" separator that follows "إعداد"
    body_start = None
    for i, p in enumerate(paragraphs):
        if "إعداد" in p and "أحمد" in p:
            for j in range(i + 1, min(i + 5, len(paragraphs))):
                if "─" in paragraphs[j] and len(paragraphs[j]) > 10:
                    body_start = j + 1
                    break
            break

    if body_start is None:
        raise ValueError(f"Could not find body start in {filepath}")

    # Find body end: sign-off "كَانَ مَعَكُم"
    body_end = None
    for i in range(body_start, len(paragraphs)):
        if "كَانَ مَعَكُم" in paragraphs[i] or "كَانَ معكم" in paragraphs[i]:
            body_end = i + 1
            break

    if body_end is None:
        raise ValueError(f"Could not find sign-off in {filepath}")

    body_paragraphs = paragraphs[body_start:body_end]
    ar_full_raw = "\n\n".join(body_paragraphs)

    # Clean the text
    ar_full = clean_text(ar_full_raw)

    # Extract excerpt (the hook line)
    ar_excerpt_raw = None
    for p in body_paragraphs:
        if "زَحامِ العَصْرِ" in p or "زحام العصر" in p:
            ar_excerpt_raw = p
            break

    if ar_excerpt_raw:
        ar_excerpt = clean_text(ar_excerpt_raw)
    else:
        ar_excerpt = "في زَحامِ العَصْرِ، وقَبْلَ أنْ يَنْطَلِقَ بِنا السَّيْلُ, نَقِفُ مَوْقِفَ المُتَأَمِّلِ."

    return {
        "number": season2_ep_num + 8,
        "season2_number": season2_ep_num,
        "arTitle": ar_title,
        "enTitle": en_title,
        "arExcerpt": ar_excerpt,
        "enExcerpt": HOOK_EN,
        "arFull": ar_full,
        "enFull": EN_FULL_PLACEHOLDER,
    }


def main():
    episodes_raw = {}
    for fname in os.listdir(UPLOAD_DIR):
        if "الموسم_الثاني" not in fname or not fname.endswith(".docx"):
            continue
        for ord_name, num in ORDINALS.items():
            if ord_name in fname:
                episodes_raw[num] = os.path.join(UPLOAD_DIR, fname)
                break

    episodes = []
    for num in sorted(episodes_raw.keys()):
        print(f"Parsing Episode {num}...")
        ep = parse_episode(episodes_raw[num], num)
        episodes.append(ep)

        # Verify cleaning
        em_dash_count = ep['arFull'].count('—')
        sep_count = ep['arFull'].count('─')
        print(f"  {ep['arTitle']}")
        print(f"  arFull: {len(ep['arFull'])} chars, em dashes: {em_dash_count}, sep chars: {sep_count}")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(episodes, f, ensure_ascii=False, indent=2)

    print(f"\nWrote {len(episodes)} cleaned episodes to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
