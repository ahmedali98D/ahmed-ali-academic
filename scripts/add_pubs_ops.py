#!/usr/bin/env python3
"""
Add publications block after education block in each language in translations.ts
"""
import re

filepath = '/home/z/ahmed-ali-ops/src/lib/translations.ts'
content = open(filepath).read()

# Define the publications data for each language
pubs = {
    'en': """  publications: {
    title: 'Publications',
    items: [
      {
        title: 'Depth of Knowledge',
        subtitle: 'A Practical Guide to Designing Rigorous Questions Without AI',
        format: 'Paperback & eBook',
        year: '2026',
        link: 'https://phronesis-studio.com/en/publications/depth-of-knowledge',
        buyLink: 'https://www.amazon.com/author/ahmed-ali',
      },
    ],
  },""",

    'ar': """  publications: {
    title: 'المؤلَّفات',
    items: [
      {
        title: 'العمق المعرفي',
        subtitle: 'دليل عملي لتصميم أسئلة تُعمّق التفكير بلا ذكاء اصطناعي',
        format: 'نسخة ورقية وكتاب إلكتروني',
        year: '2026',
        link: 'https://phronesis-studio.com/ar/publications/depth-of-knowledge',
        buyLink: 'https://www.amazon.com/author/ahmed-ali',
      },
    ],
  },""",

    'fr': """  publications: {
    title: 'Publications',
    items: [
      {
        title: 'Depth of Knowledge',
        subtitle: 'A Practical Guide to Designing Rigorous Questions Without AI',
        format: 'Broché & eBook',
        year: '2026',
        link: 'https://phronesis-studio.com/en/publications/depth-of-knowledge',
        buyLink: 'https://www.amazon.com/author/ahmed-ali',
      },
    ],
  },""",

    'es': """  publications: {
    title: 'Publicaciones',
    items: [
      {
        title: 'Depth of Knowledge',
        subtitle: 'A Practical Guide to Designing Rigorous Questions Without AI',
        format: 'Tapa blanda & eBook',
        year: '2026',
        link: 'https://phronesis-studio.com/en/publications/depth-of-knowledge',
        buyLink: 'https://www.amazon.com/author/ahmed-ali',
      },
    ],
  },""",

    'pt': """  publications: {
    title: 'Publicações',
    items: [
      {
        title: 'Depth of Knowledge',
        subtitle: 'A Practical Guide to Designing Rigorous Questions Without AI',
        format: 'Brochura & eBook',
        year: '2026',
        link: 'https://phronesis-studio.com/en/publications/depth-of-knowledge',
        buyLink: 'https://www.amazon.com/author/ahmed-ali',
      },
    ],
  },""",

    'ru': """  publications: {
    title: 'Публикации',
    items: [
      {
        title: 'Depth of Knowledge',
        subtitle: 'A Practical Guide to Designing Rigorous Questions Without AI',
        format: 'Мягкая обложка & eBook',
        year: '2026',
        link: 'https://phronesis-studio.com/en/publications/depth-of-knowledge',
        buyLink: 'https://www.amazon.com/author/ahmed-ali',
      },
    ],
  },""",

    'zh': """  publications: {
    title: '出版物',
    items: [
      {
        title: 'Depth of Knowledge',
        subtitle: 'A Practical Guide to Designing Rigorous Questions Without AI',
        format: '平装本 & 电子书',
        year: '2026',
        link: 'https://phronesis-studio.com/en/publications/depth-of-knowledge',
        buyLink: 'https://www.amazon.com/author/ahmed-ali',
      },
    ],
  },""",

    'ur': """  publications: {
    title: 'تخلیقات',
    items: [
      {
        title: 'العمق المعرفي',
        subtitle: 'دليل عملي لتصميم أسئلة تُعمّق التفكير بلا ذكاء اصطناعي',
        format: 'نسخہ ورقی اور الیکٹرانک کتاب',
        year: '2026',
        link: 'https://phronesis-studio.com/ar/publications/depth-of-knowledge',
        buyLink: 'https://www.amazon.com/author/ahmed-ali',
      },
    ],
  },""",

    'tr': """  publications: {
    title: 'Yayınlar',
    items: [
      {
        title: 'Depth of Knowledge',
        subtitle: 'A Practical Guide to Designing Rigorous Questions Without AI',
        format: 'Karton kapak & eBook',
        year: '2026',
        link: 'https://phronesis-studio.com/en/publications/depth-of-knowledge',
        buyLink: 'https://www.amazon.com/author/ahmed-ali',
      },
    ],
  },""",
}

# Also add nav.publications to each language
nav_labels = {
    'en': 'Publications', 'ar': 'المؤلَّفات', 'fr': 'Publications',
    'es': 'Publicaciones', 'pt': 'Publicações', 'ru': 'Публикации',
    'zh': '出版物', 'ur': 'تخلیقات', 'tr': 'Yayınlar',
}

# Add nav.publications label after nav.education in each language
for lang, label in nav_labels.items():
    # Pattern: education: 'Education',\n in the nav section
    # We need to find the nav block for each language
    # The nav block is the first block after "const {lang}: Translations = {"
    old_nav = f"    education: '{nav_labels.get(lang, 'Publications')}',\n    recommendation:"
    # Actually, the nav.education values are different per language. Let me find them.
    pass

# Simpler approach: add nav.publications after nav.education for each language
# by finding the pattern "education: '<something>',\n    recommendation:" in the nav section
for lang, label in nav_labels.items():
    # Find the lang block
    lang_pattern = f"const {lang}: Translations = {{"
    lang_idx = content.find(lang_pattern)
    if lang_idx < 0:
        print(f"WARNING: Could not find {lang} block")
        continue

    # Find the nav block within this language
    nav_start = content.find("  nav: {", lang_idx)
    nav_end = content.find("  },", nav_start)

    # Find education: in the nav block
    edu_nav_pattern = re.compile(r"education: '([^']+)',\n")
    match = edu_nav_pattern.search(content, nav_start, nav_end)
    if match:
        edu_line = match.group(0)
        pub_nav_line = f"education: '{match.group(1)}',\n    publications: '{label}',\n"
        content = content[:match.start()] + pub_nav_line + content[match.end():]
        print(f"  Added nav.publications to {lang}: '{label}'")
    else:
        print(f"  WARNING: Could not find nav.education in {lang}")

# Now add the publications data block after education data block in each language
# Pattern: find "  },\n  recommendation: {" and insert publications before it
for lang, pub_block in pubs.items():
    lang_pattern = f"const {lang}: Translations = {{"
    lang_idx = content.find(lang_pattern)
    if lang_idx < 0:
        continue

    # Find "recommendation: {" after the education block in this language
    rec_pattern = "  recommendation: {"
    rec_idx = content.find(rec_pattern, lang_idx)
    if rec_idx < 0:
        print(f"  WARNING: Could not find recommendation block in {lang}")
        continue

    # Insert publications block before recommendation
    content = content[:rec_idx] + pub_block + "\n" + content[rec_idx:]
    print(f"  Added publications data block to {lang}")

open(filepath, 'w').write(content)
print("\nDone! File updated.")
