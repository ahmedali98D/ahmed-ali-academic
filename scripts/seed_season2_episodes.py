#!/usr/bin/env python3
"""
Seed the 8 Season 2 episodes into the database via the admin API.
Reads the parsed JSON from parse_season2_episodes.py and POSTs each
episode to /api/admin/episodes.

Episode numbering: Season 1 is 1-8, Season 2 continues as 9-16.
"""
import json
import os
import sys
import urllib.request
import http.cookiejar

BASE = "https://phronesis-studio.com"
EPISODES_FILE = "/home/z/my-project/scripts/season2-episodes.json"

email = os.environ.get("ADMIN_EMAIL")
password = os.environ.get("ADMIN_PASSWORD")
if not email or not password:
    print("ERROR: ADMIN_EMAIL and ADMIN_PASSWORD env vars required.", file=sys.stderr)
    sys.exit(1)

# Load parsed episodes
with open(EPISODES_FILE, "r", encoding="utf-8") as f:
    episodes = json.load(f)

print(f"Loaded {len(episodes)} episodes from {EPISODES_FILE}")

# Set up cookie-aware opener
cookie_jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookie_jar))

# Login
print(f"\nLogging in as {email}...")
login_data = json.dumps({"email": email, "password": password}).encode()
login_req = urllib.request.Request(
    f"{BASE}/api/admin/login",
    data=login_data,
    headers={"Content-Type": "application/json"},
    method="POST",
)
resp = opener.open(login_req, timeout=30)
login_body = json.loads(resp.read().decode())
if not login_body.get("ok"):
    print(f"Login failed: {login_body}", file=sys.stderr)
    sys.exit(1)
print("  Login OK")

# Seed each episode
print(f"\nSeeding {len(episodes)} episodes...")
success_count = 0
fail_count = 0

for ep in episodes:
    print(f"\n  Episode {ep['number']} (S2 Ep {ep['season2_number']}): {ep['arTitle']}")
    print(f"    EN: {ep['enTitle']}")

    payload = {
        "number": ep["number"],
        "enTitle": ep["enTitle"],
        "arTitle": ep["arTitle"],
        "enExcerpt": ep["enExcerpt"],
        "arExcerpt": ep["arExcerpt"],
        "enFull": ep["enFull"],
        "arFull": ep["arFull"],
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE}/api/admin/episodes",
        data=data,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )

    try:
        resp = opener.open(req, timeout=60)
        body = json.loads(resp.read().decode())
        if body.get("ok"):
            print(f"    ✓ Created (id: {body['episode']['number']})")
            success_count += 1
        else:
            print(f"    ✗ Failed: {body.get('error', 'unknown')}")
            fail_count += 1
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"    ✗ HTTP {e.code}: {body[:200]}")
        fail_count += 1
    except Exception as e:
        print(f"    ✗ Error: {e}")
        fail_count += 1

print(f"\n{'='*60}")
print(f"DONE: {success_count} succeeded, {fail_count} failed")
print(f"{'='*60}")

if fail_count > 0:
    sys.exit(1)
