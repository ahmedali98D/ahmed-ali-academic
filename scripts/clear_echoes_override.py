#!/usr/bin/env python3
"""Clear the stale DB override for the 'echoes' namespace in both EN and AR
so the new Season 2 JSON values (project2Name, project2Tagline, etc.) take effect."""
import json, os, sys, urllib.request, http.cookiejar

BASE = "https://phronesis-studio.com"
email = os.environ.get("ADMIN_EMAIL")
password = os.environ.get("ADMIN_PASSWORD")

cookie_jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookie_jar))

# Login
print("Logging in...")
data = json.dumps({"email": email, "password": password}).encode()
req = urllib.request.Request(f"{BASE}/api/admin/login", data=data,
    headers={"Content-Type": "application/json"}, method="POST")
resp = opener.open(req, timeout=30)
if not json.loads(resp.read().decode()).get("ok"):
    print("Login failed"); sys.exit(1)
print("  OK")

# Delete echoes override for both locales
for locale in ("en", "ar"):
    print(f"\nDeleting DB override for locale={locale}, namespace=echoes...")
    req = urllib.request.Request(
        f"{BASE}/api/admin/content?locale={locale}&namespace=echoes",
        method="DELETE")
    resp = opener.open(req, timeout=30)
    body = json.loads(resp.read().decode())
    print(f"  {body}")

# Verify
print("\n=== Verification ===")
for locale in ("en", "ar"):
    page = opener.open(urllib.request.Request(f"{BASE}/{locale}/echoes"), timeout=30).read().decode()
    if locale == "en":
        checks = ["A Journey into Existence", "Season 2"]
    else:
        checks = ["رِحْلَةٌ فِي الوُجُودِ", "الموسم الثاني"]
    for c in checks:
        found = c in page
        print(f"  [{locale.upper()}] '{c}': {'FOUND' if found else 'NOT FOUND'}")
