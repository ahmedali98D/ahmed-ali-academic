#!/usr/bin/env python3
"""
Create the subscribers table in the database via the admin content API.
Since we can't run prisma db push without DATABASE_URL, we'll create the
table by calling the Neon database directly using the connection string
from Vercel env vars (via the admin API).

Actually, the simplest approach: deploy the code with the new Prisma
schema, then the first request to /api/subscribe will trigger the
Prisma client to access the table. If the table doesn't exist, we'll
need to create it manually.

Let me try a different approach: use the existing DATABASE_URL env var
on Vercel by making an API call that creates the table.
"""
import json, os, urllib.request, http.cookiejar

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
    print("Login failed"); exit(1)
print("  OK")

# Test the subscribe endpoint with a test email
print("\nTesting /api/subscribe endpoint...")
test_data = json.dumps({"email": "test@phronesis-studio.com", "locale": "en"}).encode()
req = urllib.request.Request(f"{BASE}/api/subscribe", data=test_data,
    headers={"Content-Type": "application/json"}, method="POST")
try:
    resp = opener.open(req, timeout=30)
    result = json.loads(resp.read().decode())
    print(f"  Result: {result}")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"  HTTP {e.code}: {body}")
except Exception as e:
    print(f"  Error: {e}")
