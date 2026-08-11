#!/usr/bin/env python3
"""
Replace the tagline in all 9 languages in ahmed-ali-ops translations.ts
"""

filepath = '/home/z/ahmed-ali-ops/src/lib/translations.ts'
content = open(filepath).read()

new_taglines = {
    'en': '"Eight years across education, operations, and software. One method throughout: see clearly, decide wisely, build what lasts."',
    'ar': '"ثماني سنواتٍ عبر التعليم والعمليات والبرمجيات. منهجٌ واحدٌ في كلّ ذلك: الرؤيةُ الواضحة، والقرارُ الحكيم، والبناءُ الذي يدوم."',
    'fr': '"Huit ans dans l\'éducation, les opérations et le logiciel. Une seule méthode partout: voir clairement, décider sagement, construire ce qui dure."',
    'es': '"Ocho años en educación, operaciones y software. Un método en todo: ver con claridad, decidir con sabiduría, construir lo que perdura."',
    'pt': '"Oito anos em educação, operações e software. Um método em tudo: ver com clareza, decidir com sabedoria, construir o que perdura."',
    'ru': '"Восемь лет в образовании, операциях и программном обеспечении. Один метод во всём: видеть ясно, решать мудро, строить то, что сохранится."',
    'zh': '"在教育、运营和软件领域八年。始终如一的方法：看清现实，明智决策，建造经久不衰之物。"',
    'ur': '"تعليم، آپریشنز اور سافٹ ویئر میں آٹھ سال۔ ہر چیز میں ایک طریقہ: واضح دیکھو، دانشمندانہ فیصلہ کرو، وہ بناؤ جو قائم رہے۔"',
    'tr': '"Eğitim, operasyonlar ve yazılım alanında sekiz yıl. Her şeyde tek bir yöntem: netçe gör, bilgece karar ver, kalıcı olanı inşa et."',
}

for lang, new_tagline in new_taglines.items():
    # Find the language block
    lang_pattern = f"\n  {lang}: {{"
    lang_idx = content.find(lang_pattern)
    if lang_idx < 0:
        # Try without leading newline (for 'en' which is first)
        lang_pattern = f"  {lang}: {{"
        lang_idx = content.find(lang_pattern)
    if lang_idx < 0:
        print(f"  WARNING: Could not find {lang} block")
        continue

    # Find the tagline line within this language block
    # Pattern: tagline: '...' or tagline: "..."
    import re
    # Find tagline: within this language block (before the next language block)
    tagline_match = re.search(r"tagline:\s*('(?:[^'\\]|\\.)*'|\"(?:[^\"\\]|\\.)*\")", content[lang_idx:])
    if tagline_match:
        old_tagline = tagline_match.group(0)
        new_line = f'tagline: {new_tagline}'
        # Replace in the content
        abs_start = lang_idx + tagline_match.start()
        abs_end = lang_idx + tagline_match.end()
        content = content[:abs_start] + new_line + content[abs_end:]
        print(f"  {lang}: Updated tagline")
    else:
        print(f"  WARNING: Could not find tagline in {lang}")

open(filepath, 'w').write(content)
print("\nDone!")
