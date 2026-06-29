#!/usr/bin/env python3
"""Update all 8 Season 2 episodes in the DB with cleaned text via PUT API."""
import json, os, sys, urllib.request, http.cookiejar

BASE = "https://phronesis-studio.com"
EPISODES_FILE = "/home/z/my-project/scripts/season2-episodes.json"

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

with open(EPISODES_FILE, "r", encoding="utf-8") as f:
    episodes = json.load(f)

# Update each episode via PUT /api/admin/episodes/[id]
for ep in episodes:
    print(f"\nUpdating Episode {ep['number']}...")
    payload = {
        "arTitle": ep["arTitle"],
        "enTitle": ep["enTitle"],
        "arExcerpt": ep["arExcerpt"],
        "enExcerpt": ep["enExcerpt"],
        "arFull": ep["arFull"],
        "enFull": ep["enFull"],
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE}/api/admin/episodes/{ep['number']}",
        data=data,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="PUT",
    )
    try:
        resp = opener.open(req, timeout=60)
        body = json.loads(resp.read().decode())
        if body.get("ok"):
            print(f"  ✓ Updated (id: {body['episode']['number']})")
        else:
            print(f"  ✗ Failed: {body.get('error')}")
    except Exception as e:
        print(f"  ✗ Error: {e}")

print("\nDone.")
