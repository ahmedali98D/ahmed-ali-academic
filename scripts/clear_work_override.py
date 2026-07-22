#!/usr/bin/env python3
"""
Log in to the phronesis-studio.com admin portal and clear the stale
SiteContent DB override for the 'work' namespace in both EN and AR locales.

After this, the static JSON files (which now have the Finance tab removed
and the new Al Ain Room for Rent project added) become the sole source
of truth for the Work section.
"""
import json
import os
import sys
import urllib.request
import urllib.parse
import http.cookiejar

BASE = "https://phronesis-studio.com"

email = os.environ.get("ADMIN_EMAIL", "ahmed@phronesis@gmail.com")
password = os.environ.get("ADMIN_PASSWORD", "Phronesis59ba98aa!")

cookie_jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(
    urllib.request.HTTPCookieProcessor(cookie_jar)
)

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
    print(f"  Login successful.")
except Exception as e:
    print(f"Login error: {e}", file=sys.stderr)
    sys.exit(1)

# Delete 'work' DB override for both locales
for locale in ("en", "ar"):
    print(f"\nDeleting DB override for locale={locale}, namespace=work...")
    delete_req = urllib.request.Request(
        f"{BASE}/api/admin/content?locale={locale}&namespace=work",
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

# Also delete 'workContent' since that holds the Finance tab data
for locale in ("en", "ar"):
    print(f"\nDeleting DB override for locale={locale}, namespace=workContent...")
    delete_req = urllib.request.Request(
        f"{BASE}/api/admin/content?locale={locale}&namespace=workContent",
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

print("\nDone. Verify by checking the live /en/work page after a moment.")
