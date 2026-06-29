#!/usr/bin/env python3
"""
Critical email delivery diagnostic.

Sends test emails via the admin portal API to:
  1. A Gmail address (known to work — control)
  2. A Microsoft 365 / Outlook domain (known to fail — test case)

Captures the full SMTP response from Brevo for each, including:
  - messageId (Brevo's tracking ID)
  - SMTP response code and message
  - accepted / rejected recipient arrays

The user can then look up each messageId in Brevo's transactional logs
to see what happened AFTER Brevo accepted the email (delivered / bounced /
deferred / blocked).
"""
import json
import os
import sys
import urllib.request
import http.cookiejar

BASE = "https://phronesis-studio.com"

email = os.environ.get("ADMIN_EMAIL")
password = os.environ.get("ADMIN_PASSWORD")
if not email or not password:
    print("ERROR: ADMIN_EMAIL and ADMIN_PASSWORD env vars required.", file=sys.stderr)
    sys.exit(1)

# Recipients — provided by the user as the test cases
GMAIL_TARGET = "ahmed.phronesis@gmail.com"  # user's own Gmail (control)
SCHOOL_TARGET = "ahmed@ainalkhaleejprivateschools.com"  # the failing recipient (test)

# Set up cookie-aware opener
cookie_jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookie_jar))


def login():
    print(f"Logging in as {email}...")
    data = json.dumps({"email": email, "password": password}).encode()
    req = urllib.request.Request(
        f"{BASE}/api/admin/login",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    resp = opener.open(req, timeout=30)
    body = json.loads(resp.read().decode())
    if not body.get("ok"):
        raise RuntimeError(f"Login failed: {body}")
    print("  Login OK")


def send_test(to_address, label):
    print(f"\n{'='*70}")
    print(f"TEST: {label}")
    print(f"To: {to_address}")
    print(f"{'='*70}")
    payload = {
        "to": to_address,
        "subject": f"[Deliverability Test] {label} — phronesis-studio.com",
        "body": (
            f"This is an automated deliverability test from Studio of Phronesis.\n\n"
            f"Test label: {label}\n"
            f"Recipient: {to_address}\n"
            f"Timestamp: {__import__('datetime').datetime.utcnow().isoformat()}Z\n\n"
            f"If you received this email, delivery to {to_address} is working.\n"
            f"Please do not reply — this is a diagnostic message."
        ),
    }
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        f"{BASE}/api/admin/email-send",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        resp = opener.open(req, timeout=60)
        body = json.loads(resp.read().decode())
        print(f"\n  API response:")
        print(f"    ok:          {body.get('ok')}")
        print(f"    id:          {body.get('id')}")
        print(f"    messageId:   {body.get('messageId')}")
        print(f"    smtpResponse:{body.get('smtpResponse')}")
        print(f"    accepted:    {body.get('accepted')}")
        print(f"    rejected:    {body.get('rejected')}")
        if body.get("brevoLogsUrl"):
            print(f"    brevoLogs:   {body.get('brevoLogsUrl')}")
        if body.get("error"):
            print(f"    error:       {body.get('error')}")
        return body
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"  HTTP {e.code}: {body}")
        return {"ok": False, "error": body}
    except Exception as e:
        print(f"  Error: {e}")
        return {"ok": False, "error": str(e)}


login()
gmail_result = send_test(GMAIL_TARGET, "Gmail (control — known to work)")
school_result = send_test(SCHOOL_TARGET, "Microsoft 365 / Outlook (known to fail)")

print(f"\n{'='*70}")
print("SUMMARY")
print(f"{'='*70}")
print(f"\nGmail ({GMAIL_TARGET}):")
print(f"  Brevo accepted: {bool(gmail_result.get('accepted'))}")
print(f"  messageId:      {gmail_result.get('messageId')}")
print(f"\nSchool ({SCHOOL_TARGET}):")
print(f"  Brevo accepted: {bool(school_result.get('accepted'))}")
print(f"  messageId:      {school_result.get('messageId')}")
print(f"\nBoth messageIds should be looked up in Brevo dashboard →")
print(f"Transactional → Logs to see final delivery status.")
