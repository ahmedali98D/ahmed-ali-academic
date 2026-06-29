#!/usr/bin/env bash
# Phronesis Studio — End-to-end test suite
set -u
BASE="https://phronesis-studio.com"
ADMIN_EMAIL="ahmed.phronesis@gmail.com"
ADMIN_PASSWORD="Phronesis59ba98aa!"
COOKIE_JAR="/tmp/phronesis-cookies.txt"
PASS=0
FAIL=0
declare -a FAILURES

check() {
  local name="$1"; local expected="$2"; local actual="$3"
  if [[ "$actual" == "$expected" ]]; then
    echo "  [PASS] $name"
    PASS=$((PASS+1))
  else
    echo "  [FAIL] $name (expected $expected, got $actual)"
    FAIL=$((FAIL+1))
    FAILURES+=("$name")
  fi
}

echo "========================================"
echo "PHRONESIS STUDIO — END-TO-END TEST SUITE"
echo "========================================"
echo ""

# ─── 1. PUBLIC ROUTES ───────────────────────────────────────────────────────
echo "─── 1. PUBLIC ROUTES ───────────────────────────────"
for path in / /en /ar /en/about /ar/about /en/work /ar/work /en/echoes /ar/echoes /en/library /ar/library /en/method /ar/method /en/correspondence /ar/correspondence; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" -L --max-time 15 "$BASE$path")
  check "GET $path" "200" "$code"
done

# ─── 2. REDIRECTS & HEADERS ─────────────────────────────────────────────────
echo ""
echo "─── 2. REDIRECTS & HEADERS ─────────────────────────"
code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 "$BASE")
check "GET / → 307 redirect to /en" "307" "$code"
loc=$(curl -sSI --max-time 10 "$BASE" | grep -i '^location:' | tr -d '\r' | awk '{print $2}')
check "GET / Location header" "/en" "$loc"
www_code=$(curl -sS -o /dev/null -w "%{http_code}" -L --max-time 15 "https://www.phronesis-studio.com/")
check "GET www → apex (200 after redirect)" "200" "$www_code"
hsts=$(curl -sSI --max-time 10 "$BASE" | grep -i '^strict-transport-security:' | head -1 | tr -d '\r')
[[ -n "$hsts" ]] && check "HSTS header present" "yes" "yes" || check "HSTS header present" "yes" "no"

# ─── 3. SEO FILES ───────────────────────────────────────────────────────────
echo ""
echo "─── 3. SEO FILES ───────────────────────────────────"
code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 "$BASE/sitemap.xml"); check "GET /sitemap.xml" "200" "$code"
code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 "$BASE/robots.txt"); check "GET /robots.txt" "200" "$code"
code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 "$BASE/manifest.json"); check "GET /manifest.json" "200" "$code"
code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 "$BASE/og-image.png"); check "GET /og-image.png" "200" "$code"
for icon in favicon.ico favicon-16x16.png favicon-32x32.png favicon-48x48.png favicon-96x96.png favicon-180x180.png favicon-192x192.png favicon-512x512.png apple-touch-icon.png logo.svg logo-eagle.png; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 "$BASE/$icon")
  check "GET /$icon" "200" "$code"
done

# ─── 4. PUBLIC API: /api/lead ───────────────────────────────────────────────
echo ""
echo "─── 4. PUBLIC API: /api/lead ───────────────────────"
code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 "$BASE/api/lead"); check "GET /api/lead (health)" "200" "$code"
body=$(curl -sS --max-time 10 "$BASE/api/lead")
ok=$(echo "$body" | grep -o '"ok":true' | head -1)
check "GET /api/lead returns ok:true" '"ok":true' "$ok"

# ─── 5. CONTACT FORM SUBMISSION ─────────────────────────────────────────────
echo ""
echo "─── 5. CONTACT FORM (REAL LEAD) ────────────────────"
LEAD_PAYLOAD=$(cat <<EOF
{
  "name": "QA Audit Bot",
  "email": "qa-audit@phronesis-studio.com",
  "company": "Self-Audit",
  "gap": "This is an automated end-to-end test submission from the QA audit script. The lead pipeline, DB write, and dual-email (confirmation + notification) flow are being verified. Please disregard.",
  "budget": "AED 50k - 150k"
}
EOF
)
resp=$(curl -sS -w "\nHTTP:%{http_code}" --max-time 20 -X POST "$BASE/api/lead" -H "Content-Type: application/json" -d "$LEAD_PAYLOAD")
code=$(echo "$resp" | tail -1 | sed 's/HTTP://')
check "POST /api/lead (valid submission)" "200" "$code"
echo "  [INFO] Response: $(echo "$resp" | head -1)"

bad=$(curl -sS -w "\nHTTP:%{http_code}" --max-time 10 -X POST "$BASE/api/lead" -H "Content-Type: application/json" -d '{"name":"x"}')
code=$(echo "$bad" | tail -1 | sed 's/HTTP://')
check "POST /api/lead (invalid → 400)" "400" "$code"

# ─── 6. ADMIN AUTH FLOW ─────────────────────────────────────────────────────
echo ""
echo "─── 6. ADMIN AUTH FLOW ─────────────────────────────"
rm -f "$COOKIE_JAR"

code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 "$BASE/admin")
check "GET /admin (unauth → 307 to /login)" "307" "$code"

code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 "$BASE/api/admin/leads")
check "GET /api/admin/leads (unauth → 401)" "401" "$code"
code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 "$BASE/api/admin/content")
check "GET /api/admin/content (unauth → 401)" "401" "$code"
code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 "$BASE/api/admin/episodes")
check "GET /api/admin/episodes (unauth → 401)" "401" "$code"
code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 "$BASE/api/admin/email-sent")
check "GET /api/admin/email-sent (unauth → 401)" "401" "$code"

bad_login=$(curl -sS -w "\nHTTP:%{http_code}" --max-time 10 -X POST "$BASE/api/admin/login" -H "Content-Type: application/json" -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"WRONG_PASSWORD\"}")
code=$(echo "$bad_login" | tail -1 | sed 's/HTTP://')
check "POST /api/admin/login (wrong pw → 401)" "401" "$code"

good_login=$(curl -sS -w "\nHTTP:%{http_code}" --max-time 15 -c "$COOKIE_JAR" -X POST "$BASE/api/admin/login" -H "Content-Type: application/json" -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
code=$(echo "$good_login" | tail -1 | sed 's/HTTP://')
check "POST /api/admin/login (correct creds → 200)" "200" "$code"
echo "  [INFO] Login response: $(echo "$good_login" | head -1)"

httponly_check=$(grep -c '#HttpOnly_phronesis-studio.com' "$COOKIE_JAR")
check "Cookie is httpOnly" "1" "$httponly_check"

code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 15 -b "$COOKIE_JAR" "$BASE/admin"); check "GET /admin (authed → 200)" "200" "$code"
code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 15 -b "$COOKIE_JAR" "$BASE/admin/leads"); check "GET /admin/leads (authed → 200)" "200" "$code"
code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 15 -b "$COOKIE_JAR" "$BASE/admin/content"); check "GET /admin/content (authed → 200)" "200" "$code"
code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 15 -b "$COOKIE_JAR" "$BASE/admin/echoes"); check "GET /admin/echoes (authed → 200)" "200" "$code"
code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 15 -b "$COOKIE_JAR" "$BASE/admin/templates"); check "GET /admin/templates (authed → 200)" "200" "$code"
code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 15 -b "$COOKIE_JAR" "$BASE/admin/sent"); check "GET /admin/sent (authed → 200)" "200" "$code"
code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 15 -b "$COOKIE_JAR" "$BASE/admin/settings"); check "GET /admin/settings (authed → 200)" "200" "$code"

resp=$(curl -sS -w "\nHTTP:%{http_code}" --max-time 15 -b "$COOKIE_JAR" "$BASE/api/admin/leads")
code=$(echo "$resp" | tail -1 | sed 's/HTTP://')
check "GET /api/admin/leads (authed → 200)" "200" "$code"
leads_count=$(echo "$resp" | head -1 | grep -oE '"total":[0-9]+' | head -1)
echo "  [INFO] Leads table: $leads_count"

resp=$(curl -sS -w "\nHTTP:%{http_code}" --max-time 15 -b "$COOKIE_JAR" "$BASE/api/admin/content")
code=$(echo "$resp" | tail -1 | sed 's/HTTP://')
check "GET /api/admin/content (authed → 200)" "200" "$code"

resp=$(curl -sS -w "\nHTTP:%{http_code}" --max-time 15 -b "$COOKIE_JAR" "$BASE/api/admin/episodes")
code=$(echo "$resp" | tail -1 | sed 's/HTTP://')
check "GET /api/admin/episodes (authed → 200)" "200" "$code"
eps=$(echo "$resp" | head -1 | grep -oE '"episodes":\[[^]]*' | head -1 | grep -oE '"number":[0-9]+' | wc -l)
echo "  [INFO] Episodes count: $eps"

resp=$(curl -sS -w "\nHTTP:%{http_code}" --max-time 15 -b "$COOKIE_JAR" "$BASE/api/admin/email-sent")
code=$(echo "$resp" | tail -1 | sed 's/HTTP://')
check "GET /api/admin/email-sent (authed → 200)" "200" "$code"

# 6h. Logout
resp=$(curl -sS -w "\nHTTP:%{http_code}" --max-time 10 -b "$COOKIE_JAR" -c "$COOKIE_JAR" -X POST "$BASE/api/admin/logout")
code=$(echo "$resp" | tail -1 | sed 's/HTTP://')
check "POST /api/admin/logout → 200" "200" "$code"

code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 -b "$COOKIE_JAR" "$BASE/api/admin/leads")
check "GET /api/admin/leads after logout → 401" "401" "$code"

# ─── 7. SQL INJECTION ON LOGIN ──────────────────────────────────────────────
echo ""
echo "─── 7. SQL INJECTION / FUZZ ON LOGIN ───────────────"
sqli=$(curl -sS -w "\nHTTP:%{http_code}" --max-time 10 -X POST "$BASE/api/admin/login" -H "Content-Type: application/json" -d "{\"email\":\"admin@phronesis-studio.com' OR '1'='1\",\"password\":\"anything\"}")
code=$(echo "$sqli" | tail -1 | sed 's/HTTP://')
check "SQLi attempt on login (rejected)" "401" "$code"

# ─── 8. STATIC ASSETS — PDFs ────────────────────────────────────────────────
echo ""
echo "─── 8. STATIC ASSETS (PDFs) ────────────────────────"
for f in grade-1-mathematics grade-2-mathematics grade-3-mathematics grade-4-mathematics; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 15 "$BASE/guides/$f.pdf")
  check "GET /guides/$f.pdf" "200" "$code"
done
for f in "Recommendation - Alexandria University - Ahmed Ali" "Recommendation - Bibliotheca Alexandrina - Ahmed Ali" "Recommendation - Emory University - Ahmed Ali"; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 15 "$BASE/references/$f.pdf")
  check "GET /references/$f.pdf" "200" "$code"
done

# ─── 9. SEO CONTENT CHECKS ──────────────────────────────────────────────────
echo ""
echo "─── 9. SEO CONTENT CHECKS ──────────────────────────"
en_html=$(curl -sS --max-time 15 "$BASE/en")
has_title=$(echo "$en_html" | grep -o '<title>Studio of Phronesis · Ahmed Ali</title>' | head -1)
check "<title> present on /en" "Studio of Phronesis · Ahmed Ali" "$has_title"
has_verification=$(echo "$en_html" | grep -o 'I7i4WPjVKGFLNmDp1CU-rGfErnVn_MEzd4sv9zshhpI' | head -1)
check "Google verification meta present" "I7i4WPjVKGFLNmDp1CU-rGfErnVn_MEzd4sv9zshhpI" "$has_verification"
has_bing=$(echo "$en_html" | grep -o '62274B38A3DCB37F0CB0238AC08F507A' | head -1)
check "Bing verification meta present" "62274B38A3DCB37F0CB0238AC08F507A" "$has_bing"
has_og=$(echo "$en_html" | grep -o 'og:image' | head -1)
check "OpenGraph tags present" "og:image" "$has_og"
has_jsonld=$(echo "$en_html" | grep -o 'application/ld+json' | head -1)
check "JSON-LD structured data present" "application/ld+json" "$has_jsonld"
has_canonical=$(echo "$en_html" | grep -o 'rel="canonical"' | head -1)
check "Canonical link present" 'rel="canonical"' "$has_canonical"
has_ar_link=$(echo "$en_html" | grep -o 'hreflang="ar"' | head -1)
check "Arabic hreflang present" 'hreflang="ar"' "$has_ar_link"

ar_html=$(curl -sS --max-time 15 "$BASE/ar")
ar_dir=$(echo "$ar_html" | grep -oE 'dir="rtl"' | head -1)
check "Arabic page uses RTL direction" 'dir="rtl"' "$ar_dir"

# ─── 10. VERCEL BACKUP URL ──────────────────────────────────────────────────
echo ""
echo "─── 10. VERCEL BACKUP URL ──────────────────────────"
code=$(curl -sS -o /dev/null -w "%{http_code}" -L --max-time 15 "https://phronesis-studio.vercel.app/")
check "GET vercel.app backup → 200" "200" "$code"

# ─── SUMMARY ────────────────────────────────────────────────────────────────
echo ""
echo "========================================"
echo "SUMMARY: $PASS passed, $FAIL failed (out of $((PASS+FAIL)) tests)"
echo "========================================"
if [[ $FAIL -gt 0 ]]; then
  echo "Failed tests:"
  for f in "${FAILURES[@]}"; do echo "  - $f"; done
  exit 1
fi
