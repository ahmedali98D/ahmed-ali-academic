#!/usr/bin/env python3
"""
Parse the 8 Season 2 episode docx files and extract structured data:
  - arTitle: Arabic title with diacritics (e.g., "مَتَى يَبْدَأُ الوَعْيُ؟")
  - enTitle: English title (e.g., "When Does Awareness Begin?")
  - arExcerpt: Opening hook (same across all episodes)
  - arFull: Full Arabic episode body text
  - enExcerpt: English translation of the hook (same as Season 1)
  - enFull: Placeholder — English translation forthcoming

Output: JSON file at /home/z/my-project/scripts/season2-episodes.json
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

# The opening hook used as the excerpt (same across all Season 2 episodes,
# matching Season 1's pattern). We'll extract it from each file to be sure.
HOOK_AR = "في زَحامِ العَصْرِ، وقَبْلَ أنْ يَنْطَلِقَ بِنا السَّيْلُ — نَقِفُ مَوْقِفَ المُتَأَمِّلِ."
HOOK_EN = "In the rush of our age, before the current sweeps us away, we pause as contemplators."

# English full text placeholder — graceful message for the EN episode page
EN_FULL_PLACEHOLDER = (
    "The English translation of this episode is forthcoming and will be published soon.\n\n"
    "The original Arabic text is available on the Arabic version of this page.\n\n"
    "— Ahmed Ali"
)

def parse_episode(filepath, season2_ep_num):
    """Parse a single episode docx and return structured data."""
    doc = Document(filepath)
    paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]

    # The docx structure (based on inspection):
    #   ✦  ✦  ✦
    #   سلسلة «أصداء الحكمة»
    #   Echoes of Wisdom
    #   الحَلْقَةُ الأُولَى
    #   ✦  ✦  ✦
    #   مَتَى يَبْدَأُ الوَعْيُ؟       ← Arabic title (line after 2nd ✦ separator)
    #   When Does Awareness Begin?  ← English title (next line)
    #   ✦  ✦  ✦
    #   إعداد وتقديم: أحمد علي
    #   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    #   ────────────────────
    #   الحَلْقَةُ الأُولَى: مَتَى يَبْدَأُ الوَعْيُ؟  ← Title repeated with episode label
    #   في زَحامِ العَصْرِ...          ← Opening hook
    #   هٰذَا «أَصْدَاءُ الحِكْمَةِ»...  ← Show intro
    #   ...main body...
    #   كَانَ مَعَكُم: أَحْمَدُ عَلِيّ  ← Sign-off
    #   ✦  ...  ✦
    #   «أَصْدَاءُ الحِكْمَةِ»
    #   رِحْلَةٌ في الفِكْرِ...
    #   ✦  ✦  ✦

    # Find the Arabic and English titles.
    # They appear after the second "✦ ✦ ✦" separator, before the third.
    # The Arabic title contains Arabic characters and possibly ؟ (question mark).
    # The English title is the line immediately after, containing only ASCII.

    ar_title = None
    en_title = None
    separator_indices = [i for i, p in enumerate(paragraphs) if "✦" in p]

    # Find the title pair: look for a line with Arabic + ؟ followed by an English line
    for i, p in enumerate(paragraphs):
        if re.search(r'[\u0600-\u06FF]', p) and len(p) < 100 and not p.startswith("سلسلة") and not p.startswith("الحَلْقَة") and not p.startswith("إعداد") and "✦" not in p and "━" not in p and "─" not in p:
            # This could be the Arabic title
            next_p = paragraphs[i + 1] if i + 1 < len(paragraphs) else ""
            # Check if next line is English (ASCII only, no Arabic)
            if next_p and not re.search(r'[\u0600-\u06FF]', next_p) and re.search(r'[A-Za-z]', next_p) and len(next_p) < 100:
                ar_title = p
                en_title = next_p
                break

    if not ar_title or not en_title:
        raise ValueError(f"Could not find title pair in {filepath}")

    # Find the start of the episode body: after the "────────────────────" separator
    # that follows the "إعداد وتقديم: أحمد علي" line
    body_start = None
    for i, p in enumerate(paragraphs):
        if "إعداد" in p and "أحمد" in p:
            # Find the separator line after this
            for j in range(i + 1, min(i + 5, len(paragraphs))):
                if "─" in paragraphs[j] and len(paragraphs[j]) > 10:
                    body_start = j + 1
                    break
            break

    if body_start is None:
        raise ValueError(f"Could not find body start separator in {filepath}")

    # Find the end of the episode body: the sign-off "كَانَ مَعَكُم" or "كَانَ معكم"
    body_end = None
    for i in range(body_start, len(paragraphs)):
        if "كَانَ مَعَكُم" in paragraphs[i] or "كَانَ معكم" in paragraphs[i]:
            body_end = i + 1  # Include the sign-off line
            break

    if body_end is None:
        raise ValueError(f"Could not find sign-off in {filepath}")

    # Extract the body (from after separator through sign-off)
    body_paragraphs = paragraphs[body_start:body_end]
    ar_full = "\n\n".join(body_paragraphs)

    # Extract the excerpt: the opening hook line (usually the first or second paragraph of the body)
    ar_excerpt = HOOK_AR  # default
    for p in body_paragraphs:
        if "زَحامِ العَصْرِ" in p or "زحام العصر" in p:
            ar_excerpt = p
            break

    return {
        "number": season2_ep_num + 8,  # Season 2 continues numbering: 9-16
        "season2_number": season2_ep_num,  # 1-8 within Season 2
        "arTitle": ar_title,
        "enTitle": en_title,
        "arExcerpt": ar_excerpt,
        "enExcerpt": HOOK_EN,
        "arFull": ar_full,
        "enFull": EN_FULL_PLACEHOLDER,
    }


def main():
    # Map files to episode numbers
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
        print(f"\nParsing Episode {num}...")
        try:
            ep = parse_episode(episodes_raw[num], num)
            episodes.append(ep)
            print(f"  arTitle: {ep['arTitle']}")
            print(f"  enTitle: {ep['enTitle']}")
            print(f"  number:  {ep['number']} (Season 2 Ep {num})")
            print(f"  arFull:  {len(ep['arFull'])} chars")
        except Exception as e:
            print(f"  ERROR: {e}")
            raise

    # Write to JSON
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(episodes, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*60}")
    print(f"Wrote {len(episodes)} episodes to {OUTPUT_FILE}")
    print(f"{'='*60}")

    # Print summary table
    print(f"\n{'#':>3}  {'S2#':>3}  {'arTitle':<50}  {'enTitle':<40}")
    print("-" * 100)
    for ep in episodes:
        print(f"{ep['number']:>3}  {ep['season2_number']:>3}  {ep['arTitle'][:48]:<50}  {ep['enTitle'][:38]:<40}")


if __name__ == "__main__":
    main()
