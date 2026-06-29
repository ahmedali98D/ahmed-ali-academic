#!/usr/bin/env bash
# Phronesis Studio — Extended feature test
set -u
BASE="https://phronesis-studio.com"
ADMIN_EMAIL="ahmed.phronesis@gmail.com"
ADMIN_PASSWORD="Phronesis59ba98aa!"
COOKIE_JAR="/tmp/phronesis-cookies2.txt"

echo "─── EXTENDED FEATURE TESTS ─────────────────────────"
rm -f "$COOKIE_JAR"

# Login first
curl -sS -o /dev/null --max-time 15 -c "$COOKIE_JAR" -X POST "$BASE/api/admin/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}"

echo ""
echo "─── A. DOCX TEMPLATE GENERATION ────────────────────"
# Test the demo-brief template
TEMPLATE_PAYLOAD=$(cat <<'EOF'
{
  "template": "demo-brief",
  "clientName": "QA Audit Test Client",
  "payload": {
    "clientName": "QA Audit Test Client",
    "projectName": "Phronesis Demo Platform",
    "projectDescription": "A test demonstration platform for QA audit purposes.",
    "websiteUrl": "https://demo.example.com",
    "adminUrl": "https://demo.example.com/admin",
    "adminEmail": "admin@example.com",
    "adminPassword": "TestPassword123!",
    "evaluationPoints": ["Login flow", "Dashboard rendering", "API responses"],
    "deadlineDate": "Friday, 26 June 2026",
    "deadlineTime": "1:00 PM UAE Time (GST)"
  }
}
EOF
)
resp=$(curl -sS -w "\nHTTP:%{http_code}\nCT:%{content_type}\nSIZE:%{size_download}" --max-time 30 \
  -b "$COOKIE_JAR" -X POST "$BASE/api/admin/templates/generate" \
  -H "Content-Type: application/json" -d "$TEMPLATE_PAYLOAD" -o /tmp/test-template.docx)
code=$(echo "$resp" | grep '^HTTP:' | sed 's/HTTP://')
ct=$(echo "$resp" | grep '^CT:' | sed 's/CT://')
size=$(echo "$resp" | grep '^SIZE:' | sed 's/SIZE://')
echo "  [INFO] Status: $code, Content-Type: $ct, Size: $size bytes"
if [[ "$code" == "200" && "$ct" == *openxmlformats* ]]; then
  echo "  [PASS] DOCX template generation works (binary file received)"
  # Verify it's a valid docx (zip file magic bytes: PK)
  magic=$(xxd /tmp/test-template.docx | head -1 | awk '{print $2,$3}')
  echo "  [INFO] File magic bytes: $magic"
else
  echo "  [FAIL] Template generation failed"
fi

echo ""
echo "─── B. INVALID TEMPLATE ID REJECTED ───────────────"
bad=$(curl -sS -w "\nHTTP:%{http_code}" --max-time 15 -b "$COOKIE_JAR" -X POST \
  "$BASE/api/admin/templates/generate" -H "Content-Type: application/json" \
  -d '{"template":"nonexistent","payload":{}}')
code=$(echo "$bad" | tail -1 | sed 's/HTTP://')
if [[ "$code" == "400" ]]; then echo "  [PASS] Invalid template id → 400"; else echo "  [FAIL] Expected 400, got $code"; fi

echo ""
echo "─── C. CONTENT UPSERT (write/read-back) ────────────"
# Update hero.eyebrow to test, then read back, then restore
ORIG=$(curl -sS --max-time 15 -b "$COOKIE_JAR" "$BASE/api/admin/content?locale=en")
ORIG_EYEBROW=$(echo "$ORIG" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.dumps(d.get('content',{}).get('hero',{}).get('eyebrow','')))")

# Update with a test marker
NEW_VAL='Philosopher · Educator · Architect [QA-AUDIT-MARKER]'
update_resp=$(curl -sS -w "\nHTTP:%{http_code}" --max-time 15 -b "$COOKIE_JAR" -X PUT \
  "$BASE/api/admin/content" -H "Content-Type: application/json" \
  -d "{\"locale\":\"en\",\"namespace\":\"hero\",\"value\":{\"eyebrow\":\"$NEW_VAL\",\"name\":\"Ahmed Ali\",\"subtitle\":\"test\",\"body\":\"test\",\"ctaPrimary\":\"test\",\"ctaSecondary\":\"test\",\"footnote\":\"test\",\"location\":\"test\",\"enterPrompt\":\"test\"}}")
code=$(echo "$update_resp" | tail -1 | sed 's/HTTP://')
if [[ "$code" == "200" ]]; then echo "  [PASS] Content PUT (update) → 200"; else echo "  [FAIL] PUT failed: $code"; fi

# Read back
RB=$(curl -sS --max-time 15 -b "$COOKIE_JAR" "$BASE/api/admin/content?locale=en")
MARKER=$(echo "$RB" | python3 -c "import sys,json; d=json.load(sys.stdin); print('FOUND' if 'QA-AUDIT-MARKER' in str(d.get('content',{}).get('hero',{})) else 'MISSING')")
if [[ "$MARKER" == "FOUND" ]]; then echo "  [PASS] Content read-back shows the new value"; else echo "  [FAIL] Marker not found in DB"; fi

# Restore original (re-render full hero object)
echo "$ORIG" | python3 -c "
import sys, json, urllib.request, http.cookiejar
d = json.load(sys.stdin)
hero = d.get('content',{}).get('hero',{})
print(json.dumps({'locale':'en','namespace':'hero','value':hero}))
" > /tmp/restore-payload.json
restore_resp=$(curl -sS -w "\nHTTP:%{http_code}" --max-time 15 -b "$COOKIE_JAR" -X PUT \
  "$BASE/api/admin/content" -H "Content-Type: application/json" \
  -d @/tmp/restore-payload.json)
code=$(echo "$restore_resp" | tail -1 | sed 's/HTTP://')
if [[ "$code" == "200" ]]; then echo "  [PASS] Content restored to original"; else echo "  [FAIL] Restore failed: $code"; fi

echo ""
echo "─── D. EPISODES CRUD ──────────────────────────────"
# List episodes
LIST=$(curl -sS --max-time 15 -b "$COOKIE_JAR" "$BASE/api/admin/episodes")
EP_COUNT=$(echo "$LIST" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('episodes',[])))")
echo "  [INFO] Episodes in DB: $EP_COUNT"

# Test creating a temp episode (then delete it)
TEMP_NUM=$((RANDOM % 9000 + 1000))
create_resp=$(curl -sS -w "\nHTTP:%{http_code}" --max-time 15 -b "$COOKIE_JAR" -X POST \
  "$BASE/api/admin/episodes" -H "Content-Type: application/json" \
  -d "{\"number\":$TEMP_NUM,\"enTitle\":\"QA Audit Temp\",\"arTitle\":\"تدقيق مؤقت\",\"enExcerpt\":\"temp\",\"arExcerpt\":\"temp\",\"enFull\":\"temp\",\"arFull\":\"temp\"}")
code=$(echo "$create_resp" | tail -1 | sed 's/HTTP://')
if [[ "$code" == "200" ]]; then echo "  [PASS] Episode create → 200 (num=$TEMP_NUM)"; else echo "  [FAIL] Create failed: $code"; fi

# Delete via /api/admin/episodes/[id]
del_resp=$(curl -sS -w "\nHTTP:%{http_code}" --max-time 15 -b "$COOKIE_JAR" -X DELETE \
  "$BASE/api/admin/episodes/$TEMP_NUM")
code=$(echo "$del_resp" | tail -1 | sed 's/HTTP://')
if [[ "$code" == "200" ]]; then echo "  [PASS] Episode delete → 200"; else echo "  [FAIL] Delete failed: $code"; fi

echo ""
echo "─── E. EMAIL TEST (admin/settings — sends real test email) ──"
email_resp=$(curl -sS -w "\nHTTP:%{http_code}" --max-time 30 -b "$COOKIE_JAR" -X POST \
  "$BASE/api/admin/email-test" -H "Content-Type: application/json" -d '{}')
code=$(echo "$email_resp" | tail -1 | sed 's/HTTP://')
echo "  [INFO] Email test response: $code"
echo "  [INFO] Body: $(echo "$email_resp" | head -1)"
if [[ "$code" == "200" ]]; then echo "  [PASS] Email test endpoint OK"; else echo "  [WARN] Email test returned $code — investigate"; fi

echo ""
echo "─── F. SECURITY HEADERS ───────────────────────────"
echo "  Headers on /en:"
curl -sSI --max-time 10 "$BASE/en" | grep -iE '^(strict-transport-security|content-security-policy|x-frame-options|x-content-type-options|referrer-policy|permissions-policy|cross-origin-):' | sed 's/^/    /'

echo ""
echo "  Headers on /api/lead:"
curl -sSI --max-time 10 "$BASE/api/lead" | grep -iE '^(strict-transport-security|content-security-policy|x-frame-options|x-content-type-options|referrer-policy|permissions-policy|cross-origin-):' | sed 's/^/    /'

echo ""
echo "─── G. STATIC ASSET CACHE HEADERS ─────────────────"
echo "  /og-image.png:"
curl -sSI --max-time 10 "$BASE/og-image.png" | grep -iE '^(cache-control|content-type|content-length):' | sed 's/^/    /'
echo ""
echo "  /guides/grade-1-mathematics.pdf:"
curl -sSI --max-time 10 "$BASE/guides/grade-1-mathematics.pdf" | grep -iE '^(cache-control|content-type|content-length):' | sed 's/^/    /'

echo ""
echo "─── H. COMPRESSION (gzip/br) ──────────────────────"
echo "  /en with Accept-Encoding: gzip, br:"
curl -sSI --max-time 10 -H 'Accept-Encoding: gzip, br' "$BASE/en" | grep -iE '^(content-encoding|vary):' | sed 's/^/    /'

echo ""
echo "─── I. HTTP METHOD VALIDATION ─────────────────────"
# /api/lead should reject PUT (only GET/POST allowed)
code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 -X PUT "$BASE/api/lead")
echo "  PUT /api/lead → $code (405 = correct)"
# /api/admin/login should reject GET
code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 -X GET "$BASE/api/admin/login")
echo "  GET /api/admin/login → $code (405 = correct)"

echo ""
echo "─── J. PATH TRAVERSAL / ROUTE FUZZ ─────────────────"
for path in "/api/admin/leads/../../../etc/passwd" "/admin/../../etc/passwd" "/.env" "/.git/config" "/api/admin/leads/%2e%2e%2f"; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 "$BASE$path")
  echo "  GET $path → $code"
done

echo ""
echo "─── K. ADMIN LEAD SEARCH ──────────────────────────"
search_resp=$(curl -sS --max-time 15 -b "$COOKIE_JAR" "$BASE/api/admin/leads?search=QA")
echo "  [INFO] Search 'QA' returned: $(echo "$search_resp" | head -c 200)"
