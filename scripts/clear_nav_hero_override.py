#!/usr/bin/env python3
"""Clear stale DB overrides for nav and hero namespaces so the new
'Work with me' JSON values take effect."""
import json, os, sys, urllib.request, http.cookiejar

BASE = "https://phronesis-studio.com"
email = os.environ.get("ADMIN_EMAIL")
password = os.environ.get("ADMIN_PASSWORD")

cookie_jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookie_jar))

print("Logging in...")
data = json.dumps({"email": email, "password": password}).encode()
req = urllib.request.Request(f"{BASE}/api/admin/login", data=data,
    headers={"Content-Type": "application/json"}, method="POST")
resp = opener.open(req, timeout=30)
if not json.loads(resp.read().decode()).get("ok"):
    print("Login failed"); sys.exit(1)
print("  OK")

# Clear nav and hero overrides for both locales
for locale in ("en", "ar"):
    for ns in ("nav", "hero"):
        print(f"Deleting DB override for locale={locale}, namespace={ns}...")
        req = urllib.request.Request(
            f"{BASE}/api/admin/content?locale={locale}&namespace={ns}",
            method="DELETE")
        resp = opener.open(req, timeout=30)
        body = json.loads(resp.read().decode())
        print(f"  {body}")

# Verify
print("\n=== Verification ===")
for locale in ("en", "ar"):
    page = opener.open(urllib.request.Request(f"{BASE}/{locale}"), timeout=30).read().decode()
    if locale == "en":
        begin_count = page.count(">Begin<")
        work_count = page.count("Work with me")
        print(f"  [{locale.upper()}] '>Begin<' occurrences: {begin_count}")
        print(f"  [{locale.upper()}] 'Work with me' occurrences: {work_count}")
    else:
        begin_count = page.count(">ابدأ<")
        work_count = page.count("اعمل معي")
        print(f"  [{locale.upper()}] '>ابدأ<' occurrences: {begin_count}")
        print(f"  [{locale.upper()}] 'اعمل معي' occurrences: {work_count}")
