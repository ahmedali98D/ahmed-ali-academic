#!/usr/bin/env python3
"""
Re-redact the VP letter, KEEPING the word 'Private' in the school name.
Only cover the contact details (mobile, landline, email, Arabic equivalents).
"""
import fitz
from pathlib import Path

VP_ORIG = Path("/home/z/my-project/upload/Reference_Letter_Mr_Ahmed_VP.pdf")
OUT = Path("/home/z/my-project/audit/phronesis-studio/public/references/Reference - Vice Principal.pdf")
REDACT_COLOR = (0, 0, 0)

doc = fitz.open(VP_ORIG)
page = doc[0]
print(f"Page: {page.rect.width:.1f} x {page.rect.height:.1f} pts")

contact_targets = [
    "+971 50 931 8098",
    "T:037811232",
    "T: 037811232",
    "037811232",
    "MOBILE: 0563005684",
    "MOBILE:0563005684",
    "0563005684",
    "E: administration@ainalkhaleejprivateschools.com",
    "E:administration@ainalkhaleejprivateschools.com",
    "administration@ainalkhaleejprivateschools.com",
    "هاتف متحرك",
    "هاتف",
]
total = 0
for t in contact_targets:
    rects = page.search_for(t)
    for r in rects:
        page.add_redact_annot(r, fill=REDACT_COLOR)
    if rects:
        print(f"  Redacted '{t}'  ({len(rects)} occurrence(s))")
        total += len(rects)
print(f"Total contact-detail redactions: {total}")

# Apply redactions — DO NOT remove the word 'Private' this time
page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_PIXELS
                      if hasattr(fitz, "PDF_REDACT_IMAGE_PIXELS") else 0)

# Verify 'Private' is still in the document
remaining_text = page.get_text()
priv_count = remaining_text.count("Private") + remaining_text.count("PRIVATE")
print(f"\n'Private' occurrences remaining in document: {priv_count}")
print(f"'School' occurrences remaining: {remaining_text.count('School') + remaining_text.count('SCHOOL')}")

doc.save(OUT, deflate=True, garbage=4)
doc.close()
print(f"\nSaved -> {OUT}")
