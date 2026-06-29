#!/usr/bin/env bash
# Verify all 8 enhancements are live on production
set -u
BASE="https://phronesis-studio.com"
PASS=0
FAIL=0
declare -a FAILURES

check() {
  local name="$1"; local expected="$2"; local actual="$3"
  if [[ "$actual" == "$expected" ]]; then
    echo "  [PASS] $name"
    PASS=$((PASS+1))
  else
    echo "  [FAIL] $name (expected $expected, got: $actual)"
    FAIL=$((FAIL+1))
    FAILURES+=("$name")
  fi
}

echo "══════════════════════════════════════════════════════"
echo "VERIFICATION: 8 ENHANCEMENTS ON PRODUCTION"
echo "══════════════════════════════════════════════════════"
echo ""

# ─── 1. Why I built it this way (rationale content on /work) ────────────────
echo "─── 1. 'Why I built it this way' rationale content ───"
work_html=$(curl -sS --max-time 15 "$BASE/en/work")
has_rationale_label=$(echo "$work_html" | grep -o 'Why I built it this way' | head -1)
check "Rationale label visible on /en/work" "Why I built it this way" "$has_rationale_label"
has_aristotle=$(echo "$work_html" | grep -o 'Aristotle would have recognized' | head -1)
check "Scholarly rationale content present (Aristotle quote)" "Aristotle would have recognized" "$has_aristotle"

# Arabic rationale
ar_work_html=$(curl -sS --max-time 15 "$BASE/ar/work")
has_ar_rationale=$(echo "$ar_work_html" | grep -o 'لماذا بنيتُها هذا البناء' | head -1)
check "Arabic rationale label on /ar/work" "لماذا بنيتُها هذا البناء" "$has_ar_rationale"

# ─── 2. Neural network of clouds visualization ──────────────────────────────
echo ""
echo "─── 2. Neural network of clouds visualization ───"
has_neural=$(echo "$work_html" | grep -o 'The Neural Field' | head -1)
check "Neural viz title present" "The Neural Field" "$has_neural"
has_phronesis_center=$(echo "$work_html" | grep -o 'ΦΡΟΝΗΣΙΣ' | head -1)
check "Central ΦΡΟΝΗΣΙΣ node present" "ΦΡΟΝΗΣΙΣ" "$has_phronesis_center"
has_one_method=$(echo "$work_html" | grep -o 'One Method' | head -1)
check "Center 'One Method' label present" "One Method" "$has_one_method"
has_cloud_count=$(echo "$work_html" | grep -oE 'neural\.clouds\.' | wc -l)
check "At least 3 cloud references in HTML" "yes" "$([[ $has_cloud_count -ge 3 ]] && echo yes || echo no)"
has_projects_tab=$(echo "$work_html" | grep -oE 'data-[^>]*projects|>Projects<' | head -1)
check "Projects tab REMOVED (no 'Projects' button)" "" "$has_projects_tab"
has_education_tab=$(echo "$work_html" | grep -o '>Education<' | head -1)
check "Education tab still present" ">Education<" "$has_education_tab"
has_realestate_tab=$(echo "$work_html" | grep -o '>Real Estate<' | head -1)
check "Real Estate tab still present" ">Real Estate<" "$has_realestate_tab"
has_finance_tab=$(echo "$work_html" | grep -o '>Finance<' | head -1)
check "Finance tab still present" ">Finance<" "$has_finance_tab"

# ─── 3. Em-dash cleaning script deleted ─────────────────────────────────────
echo ""
echo "─── 3. Em-dash cleaning script deleted ───"
# Can't directly check the GitHub file system from production, but we can check the repo via API
script_status=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 "https://api.github.com/repos/ahmedphronesis/phronesis-studio/contents/scripts/clean-episodes-emdashes.ts")
check "scripts/clean-episodes-emdashes.ts deleted from repo" "404" "$script_status"

# ─── 4 & 7. CSP + security headers ──────────────────────────────────────────
echo ""
echo "─── 4 & 7. CSP + security headers ───"
headers=$(curl -sSI --max-time 10 "$BASE/en")
csp=$(echo "$headers" | grep -i '^content-security-policy:' | head -1 | tr -d '\r')
check "Content-Security-Policy header present" "yes" "$([[ -n "$csp" ]] && echo yes || echo no)"
echo "  [INFO] CSP: ${csp:0:80}..."
xcto=$(echo "$headers" | grep -i '^x-content-type-options:' | head -1 | tr -d '\r' | awk '{print $2}')
check "X-Content-Type-Options: nosniff" "nosniff" "$xcto"
xfo=$(echo "$headers" | grep -i '^x-frame-options:' | head -1 | tr -d '\r' | awk '{print $2}')
check "X-Frame-Options: DENY" "DENY" "$xfo"
rp=$(echo "$headers" | grep -i '^referrer-policy:' | head -1 | tr -d '\r' | awk '{print $2}')
check "Referrer-Policy present" "strict-origin-when-cross-origin" "$rp"
pp=$(echo "$headers" | grep -i '^permissions-policy:' | head -1 | tr -d '\r')
check "Permissions-Policy present" "yes" "$([[ -n "$pp" ]] && echo yes || echo no)"
echo "  [INFO] PP: ${pp:0:80}..."
# Verify frame-ancestors in CSP
frame_ancestors=$(echo "$csp" | grep -o "frame-ancestors 'none'" | head -1)
check "CSP frame-ancestors 'none'" "frame-ancestors 'none'" "$frame_ancestors"

# ─── 5. Per-page <title> and <meta description> ─────────────────────────────
echo ""
echo "─── 5. Per-page <title> and <meta description> ───"
for path in /en/about /en/work /en/echoes /en/library /en/method /en/correspondence; do
  html=$(curl -sS --max-time 10 "$BASE$path")
  title=$(echo "$html" | grep -oE '<title>[^<]+</title>' | head -1 | sed 's/<[^>]*>//g')
  desc=$(echo "$html" | grep -oE '<meta name="description" content="[^"]+"' | head -1 | sed 's/.*content="//;s/"$//')
  echo "  [INFO] $path"
  echo "         title: $title"
  echo "         desc:  ${desc:0:80}..."
  if [[ "$title" != "Studio of Phronesis · Ahmed Ali" && -n "$title" ]]; then
    check "  $path has unique <title>" "yes" "yes"
  else
    check "  $path has unique <title>" "yes" "no (still default)"
  fi
  if [[ -n "$desc" && "$desc" != "Perceiving the gap between"* ]]; then
    check "  $path has unique <meta description>" "yes" "yes"
  else
    check "  $path has unique <meta description>" "yes" "no (still default)"
  fi
done

# Arabic metadata
echo ""
echo "  Arabic pages:"
for path in /ar/about /ar/work /ar/echoes; do
  html=$(curl -sS --max-time 10 "$BASE$path")
  title=$(echo "$html" | grep -oE '<title>[^<]+</title>' | head -1 | sed 's/<[^>]*>//g')
  echo "  [INFO] $path → $title"
  if [[ "$title" == *"·"* || "$title" == *"ستوديو"* ]]; then
    check "  $path has Arabic title" "yes" "yes"
  else
    check "  $path has Arabic title" "yes" "no"
  fi
done

# ─── 6. SSR-correct <html lang/dir> for /ar ─────────────────────────────────
echo ""
echo "─── 6. SSR-correct <html lang/dir> ───"
ar_html_root=$(curl -sS --max-time 10 "$BASE/ar")
ar_html_tag=$(echo "$ar_html_root" | grep -oE '<html[^>]+>' | head -1)
echo "  [INFO] /ar <html> tag: $ar_html_tag"
has_ar_lang=$(echo "$ar_html_tag" | grep -o 'lang="ar"')
check "SSR <html lang='ar'> on /ar" 'lang="ar"' "$has_ar_lang"
has_ar_dir=$(echo "$ar_html_tag" | grep -o 'dir="rtl"')
check "SSR <html dir='rtl'> on /ar" 'dir="rtl"' "$has_ar_dir"

en_html_root=$(curl -sS --max-time 10 "$BASE/en")
en_html_tag=$(echo "$en_html_root" | grep -oE '<html[^>]+>' | head -1)
echo "  [INFO] /en <html> tag: $en_html_tag"
has_en_lang=$(echo "$en_html_tag" | grep -o 'lang="en"')
check "SSR <html lang='en'> on /en" 'lang="en"' "$has_en_lang"
has_en_dir=$(echo "$en_html_tag" | grep -o 'dir="ltr"')
check "SSR <html dir='ltr'> on /en" 'dir="ltr"' "$has_en_dir"

# Admin should default to en/ltr
admin_html=$(curl -sS --max-time 10 -o /dev/null -w "%{http_code}" "$BASE/admin")
check "/admin still redirects (307)" "307" "$admin_html"

# ─── 8. db.ts console.log deleted ───────────────────────────────────────────
echo ""
echo "─── 8. db.ts console.log deleted ───"
# Check the GitHub repo for the current db.ts content
db_ts=$(curl -sS --max-time 10 "https://raw.githubusercontent.com/ahmedphronesis/phronesis-studio/main/src/lib/db.ts")
has_console_log=$(echo "$db_ts" | grep -c 'console.log')
check "console.log removed from db.ts" "0" "$has_console_log"
has_dburl_leak=$(echo "$db_ts" | grep -c 'DATABASE_URL' )
check "DATABASE_URL leak removed from db.ts" "0" "$has_dburl_leak"

# ─── REGRESSION: All routes still return 200 ────────────────────────────────
echo ""
echo "─── REGRESSION: All public routes ───"
for path in /en /ar /en/about /ar/about /en/work /ar/work /en/echoes /ar/echoes /en/library /ar/library /en/method /ar/method /en/correspondence /ar/correspondence; do
  code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 "$BASE$path")
  check "GET $path → 200" "200" "$code"
done

# ─── REGRESSION: Admin + API still work ─────────────────────────────────────
echo ""
echo "─── REGRESSION: Admin + API ───"
code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 "$BASE/admin")
check "GET /admin → 307 (redirect to login)" "307" "$code"
code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 "$BASE/api/lead")
check "GET /api/lead → 200" "200" "$code"
code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 "$BASE/api/admin/leads")
check "GET /api/admin/leads (unauth) → 401" "401" "$code"

# ─── SUMMARY ────────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════════"
echo "SUMMARY: $PASS passed, $FAIL failed (out of $((PASS+FAIL)) checks)"
echo "══════════════════════════════════════════════════════"
if [[ $FAIL -gt 0 ]]; then
  echo "Failed checks:"
  for f in "${FAILURES[@]}"; do echo "  - $f"; done
fi
