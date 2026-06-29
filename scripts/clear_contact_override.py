#!/usr/bin/env python3
"""
Log in to the phronesis-studio.com admin portal and clear the stale
SiteContent DB override for the 'contact' namespace in both EN and AR
locales. After this, the static JSON files (which now contain the new
USD budget tiers + USD engagement body) become the sole source of truth.

Usage:
    python3 clear_contact_override.py

Requires the admin credentials to be passed as environment variables:
    ADMIN_EMAIL, ADMIN_PASSWORD
"""
import json
import os
import sys
import urllib.request
import urllib.parse
import http.cookiejar

BASE = "https://phronesis-studio.com"

email = os.environ.get("ADMIN_EMAIL")
password = os.environ.get("ADMIN_PASSWORD")
if not email or not password:
    print("ERROR: ADMIN_EMAIL and ADMIN_PASSWORD env vars are required.", file=sys.stderr)
    sys.exit(1)

# ─── Set up a cookie-aware opener ──────────────────────────────────────────
cookie_jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(
    urllib.request.HTTPCookieProcessor(cookie_jar)
)

# ─── Step 1: Log in ────────────────────────────────────────────────────────
print(f"Logging in as {email}...")
login_data = json.dumps({"email": email, "password": password}).encode("utf-8")
login_req = urllib.request.Request(
    f"{BASE}/api/admin/login",
    data=login_data,
    headers={"Content-Type": "application/json"},
    method="POST",
)
try:
    login_resp = opener.open(login_req, timeout=30)
    login_body = json.loads(login_resp.read().decode("utf-8"))
    if not login_body.get("ok"):
        print(f"Login failed: {login_body.get('error', 'unknown error')}", file=sys.stderr)
        sys.exit(1)
    print(f"  Login successful. Cookies set:")
    for c in cookie_jar:
        print(f"    {c.name} = {c.value[:20]}... (domain: {c.domain})")
except urllib.error.HTTPError as e:
    body = e.read().decode("utf-8", errors="replace")
    print(f"Login HTTP error {e.code}: {body}", file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(f"Login error: {e}", file=sys.stderr)
    sys.exit(1)

# ─── Step 2: DELETE the 'contact' namespace DB override for both locales ───
for locale in ("en", "ar"):
    print(f"\nDeleting DB override for locale={locale}, namespace=contact...")
    delete_req = urllib.request.Request(
        f"{BASE}/api/admin/content?locale={locale}&namespace=contact",
        method="DELETE",
    )
    try:
        delete_resp = opener.open(delete_req, timeout=30)
        delete_body = json.loads(delete_resp.read().decode("utf-8"))
        if delete_body.get("ok"):
            print(f"  Deleted: {delete_body}")
        else:
            print(f"  Failed: {delete_body}", file=sys.stderr)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"  HTTP error {e.code}: {body}", file=sys.stderr)
    except Exception as e:
        print(f"  Error: {e}", file=sys.stderr)

# ─── Step 3: Verify by fetching the live contact page ─────────────────────
print("\n" + "=" * 60)
print("Verification — fetching live contact section...")
print("=" * 60)
for locale in ("en", "ar"):
    page_req = urllib.request.Request(f"{BASE}/{locale}")
    try:
        page_resp = opener.open(page_req, timeout=30)
        html = page_resp.read().decode("utf-8", errors="replace")
        # Look for budget tier text in the HTML
        if locale == "en":
            tiers = ["Under $500", "$500", "$1,500", "$3,000", "Above $5,000", "Custom builds start at $2,500"]
        else:
            tiers = ["أقل من 500 دولار", "500 – 1,500 دولار", "2,500 دولار"]
        found = [t for t in tiers if t in html]
        missing = [t for t in tiers if t not in html]
        print(f"\n  [{locale.upper()}] Found in live HTML: {found}")
        if missing:
            print(f"  [{locale.upper()}] NOT found (may still be cached or DB override not cleared): {missing}")
        else:
            print(f"  [{locale.upper()}] All expected USD text found!")
    except Exception as e:
        print(f"  [{locale.upper()}] Error fetching page: {e}")

print("\nDone.")
