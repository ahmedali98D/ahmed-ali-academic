#!/usr/bin/env python3
"""Diagnostic: print OCR words near the contact-info region of the Suhad and Ashraf PDFs."""
import fitz, pytesseract, io
from PIL import Image

SUHAD = "/home/z/my-project/upload/Recommendation_Letter_AAKPS_HOD_Suhad.pdf"
ASHRAF = "/home/z/my-project/download/redacted_references/Recommendation - Alexandria University - Ahmed Ali.pdf"

def ocr_words(pdf_path, zoom=200/72):
    doc = fitz.open(pdf_path)
    page = doc[0]
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat)
    pil = Image.open(io.BytesIO(pix.tobytes("png")))
    data = pytesseract.image_to_data(pil, output_type=pytesseract.Output.DICT)
    words = []
    for i in range(len(data["text"])):
        t = (data["text"][i] or "").strip()
        if not t:
            continue
        try:
            conf = float(data["conf"][i])
        except:
            conf = -1
        if conf < 30:
            continue
        words.append({
            "text": t,
            "left": int(data["left"][i]),
            "top": int(data["top"][i]),
            "right": int(data["left"][i]) + int(data["width"][i]),
            "bottom": int(data["top"][i]) + int(data["height"][i]),
            "conf": conf,
        })
    return words, page.rect, zoom

print("\n=== SUHAD — words near email/mobile area (y > 6000) ===")
words, rect, zoom = ocr_words(SUHAD)
# Look in the area below the signature
for w in sorted(words, key=lambda w: (w["top"], w["left"])):
    if 5800 <= w["top"] <= 6400:
        print(f"  ({w['left']:5d},{w['top']:5d})-({w['right']:5d},{w['bottom']:5d})  '{w['text']}'  conf={w['conf']:.0f}")

print("\n=== ASHRAF — words near footer (y > 1300) ===")
words, rect, zoom = ocr_words(ASHRAF)
for w in sorted(words, key=lambda w: (w["top"], w["left"])):
    if w["top"] >= 1300:
        print(f"  ({w['left']:5d},{w['top']:5d})-({w['right']:5d},{w['bottom']:5d})  '{w['text']}'  conf={w['conf']:.0f}")
