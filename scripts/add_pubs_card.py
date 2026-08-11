#!/usr/bin/env python3
"""
Add publications data after teach3Desc in each language block.
"""
import re

filepath = '/home/z/ahmed-ali-card/src/i18n/translations.ts'
content = open(filepath).read()

# Publication data per language
pubs = {
    'en': {
        'header': 'Publications',
        'title': 'Depth of Knowledge',
        'subtitle': 'A Practical Guide to Designing Rigorous Questions Without AI',
        'format': 'Paperback & eBook',
        'year': '2026',
        'link': 'https://phronesis-studio.com/en/publications/depth-of-knowledge',
        'buyLink': 'https://www.amazon.com/author/ahmed-ali',
    },
    'ar': {
        'header': 'المؤلَّفات',
        'title': 'العمق المعرفي',
        'subtitle': 'دليل عملي لتصميم أسئلة تُعمّق التفكير بلا ذكاء اصطناعي',
        'format': 'نسخة ورقية وكتاب إلكتروني',
        'year': '2026',
        'link': 'https://phronesis-studio.com/ar/publications/depth-of-knowledge',
        'buyLink': 'https://www.amazon.com/author/ahmed-ali',
    },
    'fa': {
        'header': 'انتشارات',
        'title': 'Depth of Knowledge',
        'subtitle': 'A Practical Guide to Designing Rigorous Questions Without AI',
        'format': 'کاغذی و الکترونیکی',
        'year': '2026',
        'link': 'https://phronesis-studio.com/en/publications/depth-of-knowledge',
        'buyLink': 'https://www.amazon.com/author/ahmed-ali',
    },
    'ur': {
        'header': 'تخلیقات',
        'title': 'العمق المعرفي',
        'subtitle': 'دليل عملي لتصميم أسئلة تُعمّق التفكير بلا ذكاء اصطناعي',
        'format': 'نسخہ ورقی اور الیکٹرانک کتاب',
        'year': '2026',
        'link': 'https://phronesis-studio.com/ar/publications/depth-of-knowledge',
        'buyLink': 'https://www.amazon.com/author/ahmed-ali',
    },
    'es': {
        'header': 'Publicaciones',
        'title': 'Depth of Knowledge',
        'subtitle': 'A Practical Guide to Designing Rigorous Questions Without AI',
        'format': 'Tapa blanda & eBook',
        'year': '2026',
        'link': 'https://phronesis-studio.com/en/publications/depth-of-knowledge',
        'buyLink': 'https://www.amazon.com/author/ahmed-ali',
    },
    'fr': {
        'header': 'Publications',
        'title': 'Depth of Knowledge',
        'subtitle': 'A Practical Guide to Designing Rigorous Questions Without AI',
        'format': 'Broché & eBook',
        'year': '2026',
        'link': 'https://phronesis-studio.com/en/publications/depth-of-knowledge',
        'buyLink': 'https://www.amazon.com/author/ahmed-ali',
    },
    'ru': {
        'header': 'Публикации',
        'title': 'Depth of Knowledge',
        'subtitle': 'A Practical Guide to Designing Rigorous Questions Without AI',
        'format': 'Мягкая обложка & eBook',
        'year': '2026',
        'link': 'https://phronesis-studio.com/en/publications/depth-of-knowledge',
        'buyLink': 'https://www.amazon.com/author/ahmed-ali',
    },
    'zh': {
        'header': '出版物',
        'title': 'Depth of Knowledge',
        'subtitle': 'A Practical Guide to Designing Rigorous Questions Without AI',
        'format': '平装本 & 电子书',
        'year': '2026',
        'link': 'https://phronesis-studio.com/en/publications/depth-of-knowledge',
        'buyLink': 'https://www.amazon.com/author/ahmed-ali',
    },
    'tl': {
        'header': 'Mga Publikasyon',
        'title': 'Depth of Knowledge',
        'subtitle': 'A Practical Guide to Designing Rigorous Questions Without AI',
        'format': 'Paperback & eBook',
        'year': '2026',
        'link': 'https://phronesis-studio.com/en/publications/depth-of-knowledge',
        'buyLink': 'https://www.amazon.com/author/ahmed-ali',
    },
    'tr': {
        'header': 'Yayınlar',
        'title': 'Depth of Knowledge',
        'subtitle': 'A Practical Guide to Designing Rigorous Questions Without AI',
        'format': 'Karton kapak & eBook',
        'year': '2026',
        'link': 'https://phronesis-studio.com/en/publications/depth-of-knowledge',
        'buyLink': 'https://www.amazon.com/author/ahmed-ali',
    },
}

# Language order in the file matches the LANGUAGES array
lang_order = ['en', 'ar', 'fa', 'ur', 'es', 'fr', 'ru', 'zh', 'tl', 'tr']

# Find each teach3Desc line and insert publications after it
for lang in lang_order:
    p = pubs[lang]
    pub_block = f"""

  // Publications
  publications: '{p['header']}',
  pub1Title: '{p['title']}',
  pub1Subtitle: '{p['subtitle']}',
  pub1Format: '{p['format']}',
  pub1Year: '{p['year']}',
  pub1Link: '{p['link']}',
  pub1BuyLink: '{p['buyLink']}',"""

    # Find the teach3Desc for this language
    # The teach3Desc values are unique per language (different text)
    # Find by language block
    lang_pattern = f"  {lang}: {{"
    lang_idx = content.find(lang_pattern)
    if lang_idx < 0:
        print(f"  WARNING: Could not find {lang} block")
        continue

    # Find teach3Desc: in this language block
    teach_pattern = "teach3Desc:"
    teach_idx = content.find(teach_pattern, lang_idx)
    if teach_idx < 0:
        print(f"  WARNING: Could not find teach3Desc in {lang}")
        continue

    # Find the end of this line (newline)
    line_end = content.find('\n', teach_idx)
    if line_end < 0:
        continue

    # Insert publications block after the teach3Desc line
    content = content[:line_end] + pub_block + content[line_end:]
    print(f"  Added publications to {lang}")

open(filepath, 'w').write(content)
print("\nDone!")
