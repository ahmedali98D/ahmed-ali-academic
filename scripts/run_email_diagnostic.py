#!/usr/bin/env python3
"""
Run the full email diagnostic via the admin API and print the report.
Shows whether the Brevo API key is valid and which path (API vs SMTP)
was used to send the test email.
"""
import json
import os
import sys
import urllib.request
import http.cookiejar

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
body = json.loads(resp.read().decode())
if not body.get("ok"):
    print(f"Login failed: {body}")
    sys.exit(1)
print("  OK")

# Run diagnostic
print("\nRunning email diagnostic...")
req = urllib.request.Request(f"{BASE}/api/admin/email-test",
    data=json.dumps({}).encode(),
    headers={"Content-Type": "application/json"}, method="POST")
resp = opener.open(req, timeout=90)
result = json.loads(resp.read().decode())

if not result.get("ok"):
    print(f"Diagnostic failed: {result}")
    sys.exit(1)

report = result["report"]

print("\n" + "="*70)
print("API KEY VERIFICATION")
print("="*70)
api = report.get("api", {})
print(f"  ok:           {api.get('ok')}")
print(f"  usingEnvVar:  {api.get('usingEnvVar')}")
print(f"  message:      {api.get('message')}")

print("\n" + "="*70)
print("SMTP VERIFICATION (fallback path)")
print("="*70)
smtp = report.get("smtp", {})
print(f"  ok:      {smtp.get('ok')}")
print(f"  message: {smtp.get('message')}")

print("\n" + "="*70)
print("TEST EMAIL SEND")
print("="*70)
sent = report.get("sent")
if sent:
    print(f"  to:          {sent.get('to')}")
    print(f"  messageId:   {sent.get('messageId')}")
    print(f"  smtpResponse:{sent.get('smtpResponse')}")
    print(f"  sentViaApi:  {sent.get('sentViaApi')}")
    print(f"  accepted:    {sent.get('accepted')}")
    print(f"  rejected:    {sent.get('rejected')}")
    print(f"  brevoLogs:   {sent.get('brevoLogsUrl')}")
else:
    print("  No email was sent (send failed)")

print("\n" + "="*70)
print("WARNINGS")
print("="*70)
for i, w in enumerate(report.get("warnings", []), 1):
    print(f"  {i}. {w}")

print("\n" + "="*70)
print("DNS RECORDS (summary)")
print("="*70)
dns = report.get("dns", {})
print(f"  SPF:           {'✓ found' if dns.get('spf',{}).get('found') else '✗ missing'}")
if dns.get("spf", {}).get("value"):
    print(f"                 {dns['spf']['value'][:80]}...")
print(f"  DKIM brevo1:   {'✓ found' if dns.get('dkimBrevo1Cname',{}).get('found') else '✗ missing'}")
print(f"  DKIM brevo2:   {'✓ found' if dns.get('dkimBrevo2Cname',{}).get('found') else '✗ missing'}")
print(f"  DMARC:         {'✓ found' if dns.get('dmarc',{}).get('found') else '✗ missing'}")
if dns.get("dmarc", {}).get("value"):
    print(f"                 {dns['dmarc']['value']}")
