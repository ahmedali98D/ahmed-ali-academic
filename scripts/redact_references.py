#!/usr/bin/env python3
"""
Re-redact the recommendation/reference letters properly - v2.

Fixes:
1. Suhad: cover ONLY the email line AND mobile line (bottom-left),
   keep the stamp (bottom-right) untouched.
2. Bibliotheca: footer image strip is already covered; nothing else to do.
3. Ashraf Mansour: cover ONLY the contact-info lines (Address, Tel, Email)
   in the footer area. Do NOT redact "Alexandria" in body or signature block.
4. VP: cover all contact details (mobile in sig block + landline + mobile + email
   in footer + Arabic equivalents). Also remove the word "Private"/"PRIVATE"
   but KEEP "School"/"SCHOOL".
5. Emory: already correctly redacted - just copy.
"""

import os
import shutil
from pathlib import Path

import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io

UPLOAD = Path("/home/z/my-project/upload")
OUT = Path("/home/z/my-project/download/redacted_references")
OUT.mkdir(parents=True, exist_ok=True)

SUHAD_ORIG = UPLOAD / "Recommendation_Letter_AAKPS_HOD_Suhad.pdf"
VP_ORIG = UPLOAD / "Reference_Letter_Mr_Ahmed_VP.pdf"

# Use existing repo copies for sources we don't have originals for
REPO = Path("/home/z/my-project/audit/phronesis-studio/public/references")
BIB_SRC = REPO / "Recommendation - Bibliotheca Alexandrina - Ahmed Ali.pdf"
ASHRAF_SRC = REPO / "Recommendation - Alexandria University - Ahmed Ali.pdf"
EMORY_SRC = REPO / "Recommendation - Emory University - Ahmed Ali.pdf"

OUT_SUHAD = OUT / "Recommendation - HOD MoE.pdf"
OUT_VP = OUT / "Reference - Vice Principal.pdf"
OUT_ASHRAF = OUT / "Recommendation - Ashraf Mansour.pdf"
OUT_BIB = OUT / "Recommendation - Bibliotheca Alexandrina.pdf"
OUT_EMORY = OUT / "Recommendation - Emory University.pdf"

REDACT_COLOR = (0, 0, 0)


def redact_suhad():
    print("\n=== Redacting Suhad (HOD MoE) ===")
    doc = fitz.open(SUHAD_ORIG)
    page = doc[0]
    print(f"  Page: {page.rect.width:.1f} x {page.rect.height:.1f} pts, rot={page.rotation}")
    zoom = 200 / 72
    scale = zoom
    # Email/Mobile lines in rendered px at zoom=2.778
    email_px = (380, 6125, 1700, 6215)
    mobile_px = (380, 6255, 1700, 6335)
    for label, px in [("email", email_px), ("mobile", mobile_px)]:
        l, t, r, b = px
        rect_pdf = (l / scale, t / scale, r / scale, b / scale)
        pad = 2.0
        rect_pdf = (max(0, rect_pdf[0] - pad), max(0, rect_pdf[1] - pad),
                    rect_pdf[2] + pad, rect_pdf[3] + pad)
        page.draw_rect(fitz.Rect(*rect_pdf), color=REDACT_COLOR, fill=REDACT_COLOR, overlay=True)
        print(f"  Redacted {label} at PDF rect {rect_pdf}")
    doc.save(OUT_SUHAD, deflate=True, garbage=4)
    doc.close()
    print(f"  Saved -> {OUT_SUHAD}")


def redact_bibliotheca():
    print("\n=== Redacting Bibliotheca Alexandrina ===")
    doc = fitz.open(BIB_SRC)
    page = doc[0]
    print(f"  Page: {page.rect.width:.1f} x {page.rect.height:.1f} pts")
    page_w = page.rect.width
    page_h = page.rect.height
    footer_rect = fitz.Rect(0, page_h * 0.92, page_w, page_h)
    page.draw_rect(footer_rect, color=REDACT_COLOR, fill=REDACT_COLOR, overlay=True)
    print(f"  Covered footer image strip: {footer_rect}")
    gypt_rects = page.search_for("gypt")
    for r in gypt_rects:
        pad = 1.0
        expanded = fitz.Rect(r.x0 - pad, r.y0 - pad, r.x1 + pad, r.y1 + pad)
        page.draw_rect(expanded, color=REDACT_COLOR, fill=REDACT_COLOR, overlay=True)
        print(f"  Covered 'gypt' orphan at {expanded}")
    doc.save(OUT_BIB, deflate=True, garbage=4)
    doc.close()
    print(f"  Saved -> {OUT_BIB}")


def redact_ashraf():
    print("\n=== Redacting Ashraf Mansour ===")
    doc = fitz.open(ASHRAF_SRC)
    page = doc[0]
    print(f"  Page: {page.rect.width:.1f} x {page.rect.height:.1f} pts, rot={page.rotation}")
    zoom = 200 / 72
    scale = zoom
    contact_px = (180, 1410, 1100, 1535)
    page_w = page.rect.width
    page_h = page.rect.height
    if page.rotation == 180:
        l, t, r, b = contact_px
        l_pdf = l / scale
        t_pdf = t / scale
        r_pdf = r / scale
        b_pdf = b / scale
        rect_pdf = (page_w - r_pdf, page_h - b_pdf, page_w - l_pdf, page_h - t_pdf)
        pad = 2.0
        rect_pdf = (max(0, rect_pdf[0] - pad), max(0, rect_pdf[1] - pad),
                    rect_pdf[2] + pad, rect_pdf[3] + pad)
        page.draw_rect(fitz.Rect(*rect_pdf), color=REDACT_COLOR, fill=REDACT_COLOR, overlay=True)
        print(f"  Redacted contact block (un-rotated PDF coords): {rect_pdf}")
    else:
        l, t, r, b = contact_px
        rect_pdf = (l / scale, t / scale, r / scale, b / scale)
        pad = 2.0
        rect_pdf = (max(0, rect_pdf[0] - pad), max(0, rect_pdf[1] - pad),
                    rect_pdf[2] + pad, rect_pdf[3] + pad)
        page.draw_rect(fitz.Rect(*rect_pdf), color=REDACT_COLOR, fill=REDACT_COLOR, overlay=True)
        print(f"  Redacted contact block (PDF coords): {rect_pdf}")
    doc.save(OUT_ASHRAF, deflate=True, garbage=4)
    doc.close()
    print(f"  Saved -> {OUT_ASHRAF}")


def redact_vp():
    print("\n=== Redacting Vice Principal (Ain Al Khaleej) ===")
    doc = fitz.open(VP_ORIG)
    page = doc[0]
    print(f"  Page: {page.rect.width:.1f} x {page.rect.height:.1f} pts")
    contact_targets = [
        "+971 50 931 8098", "T:037811232", "T: 037811232", "037811232",
        "MOBILE: 0563005684", "MOBILE:0563005684", "0563005684",
        "E: administration@ainalkhaleejprivateschools.com",
        "E:administration@ainalkhaleejprivateschools.com",
        "administration@ainalkhaleejprivateschools.com",
        "هاتف متحرك", "هاتف",
    ]
    total = 0
    for t in contact_targets:
        rects = page.search_for(t)
        for r in rects:
            page.add_redact_annot(r, fill=REDACT_COLOR)
        if rects:
            print(f"    Redacted '{t}'  ({len(rects)} occurrence(s))")
            total += len(rects)
    print(f"  Total contact-detail redactions: {total}")
    page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_PIXELS
                          if hasattr(fitz, "PDF_REDACT_IMAGE_PIXELS") else 0)
    # Remove "Private" but keep "School"
    private_occurrences = []
    for search in ["Private", "PRIVATE"]:
        rects = page.search_for(search)
        for r in rects:
            private_occurrences.append({"text": search, "rect": r})
    final = []
    for occ in private_occurrences:
        is_dup = False
        for f in final:
            if occ["rect"].intersects(f["rect"]):
                is_dup = True
                break
        if not is_dup:
            final.append(occ)
    print(f"  Found {len(final)} 'Private' word(s) to remove (keeping 'School'):")
    for occ in final:
        print(f"    - '{occ['text']}' at {occ['rect']}")
    for occ in final:
        r = occ["rect"]
        pad_x = 1.0
        pad_y = 0.5
        expanded = fitz.Rect(r.x0 - pad_x, r.y0 - pad_y, r.x1 + pad_x, r.y1 + pad_y)
        page.add_redact_annot(expanded, fill=(1, 1, 1))
    page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_PIXELS
                          if hasattr(fitz, "PDF_REDACT_IMAGE_PIXELS") else 0)
    doc.save(OUT_VP, deflate=True, garbage=4)
    doc.close()
    print(f"  Saved -> {OUT_VP}")


def copy_emory():
    print("\n=== Copying Emory (already redacted) ===")
    shutil.copy2(EMORY_SRC, OUT_EMORY)
    print(f"  Copied -> {OUT_EMORY}")


if __name__ == "__main__":
    redact_suhad()
    redact_bibliotheca()
    redact_ashraf()
    redact_vp()
    copy_emory()
    print("\n=== ALL DONE ===")
    print(f"Output directory: {OUT}")
    for f in sorted(OUT.iterdir()):
        print(f"  {f.name}  ({f.stat().st_size // 1024} KB)")
