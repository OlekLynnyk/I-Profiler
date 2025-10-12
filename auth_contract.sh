#!/usr/bin/env bash
set -euo pipefail
BASE="http://localhost:3000"

fail(){ echo "❌ $1"; exit 1; }
ok(){ echo "✅ $1"; }

# init: OPTIONS → Allow содержит POST
ALLOW=$(curl -s -i -X OPTIONS "$BASE/api/user/init" | awk -F': ' 'tolower($1)=="allow"{print tolower($2)}' | tr -d '\r')
echo "$ALLOW" | grep -q 'post' || fail "/api/user/init OPTIONS: нет POST в Allow"
ok "/api/user/init OPTIONS Allow: $ALLOW"

# init: POST '{}' → 200 и body содержит no_token
RESP=$(curl -s -i -X POST "$BASE/api/user/init" -H "Content-Type: application/json" -d '{}')
echo "$RESP" | head -n1 | grep -q "200" || fail "/api/user/init POST: не 200"
echo "$RESP" | tail -n1 | grep -q '"reason":"no_token"' || fail "/api/user/init POST: нет reason=no_token"
ok "/api/user/init POST '{}' -> 200 + reason=no_token"

# stats: без сессии 401 (HEAD/GET)
HC=$(curl -s -o /dev/null -w "%{http_code}" -I "$BASE/api/user/stats")
[ "$HC" = "401" ] || fail "/api/user/stats HEAD: ожидался 401, получили $HC"
GC=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/user/stats")
[ "$GC" = "401" ] || fail "/api/user/stats GET: ожидался 401, получили $GC"
ok "/api/user/stats без сессии → 401"

# callback: GET → 30x (не 404). Фиксируем Location
CB=$(curl -s -i "$BASE/api/auth/callback")
echo "$CB" | head -n1 | egrep -q ' 30[12378] ' || fail "/api/auth/callback GET: ожидался 30x"
LOC=$(echo "$CB" | awk 'tolower($0) ~ /^location:/{print $0}')
[ -n "$LOC" ] && ok "/api/auth/callback Location: $LOC" || fail "/api/auth/callback: нет Location"

# guard: редиректы на /login
WRC=$(curl -s -o /dev/null -w "%{http_code}" -I "$BASE/workspace"); echo "$WRC" | egrep -q '^30[12378]$' || fail "/workspace: ожидался 30x"
curl -s -I "$BASE/workspace" | grep -qi '^location:.*\/login' || fail "/workspace: Location не /login"

PRC=$(curl -s -o /dev/null -w "%{http_code}" -I "$BASE/settings/profile"); echo "$PRC" | egrep -q '^30[12378]$' || fail "/settings/profile: ожидался 30x"
SRC=$(curl -s -o /dev/null -w "%{http_code}" -I "$BASE/settings/subscription"); echo "$SRC" | egrep -q '^30[12378]$' || fail "/settings/subscription: ожидался 30x"
ok "Guard страниц OK"

# logout-роуты отсутствуют (404)
AS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/auth/signout")
HS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/auth/signout")
[ "$AS" = "404" ] && [ "$HS" = "404" ] || fail "Signout роуты не должны существовать (ожидался 404)"
ok "Отсутствие signout-роутов зафиксировано"

echo "🎉 AUTH CONTRACT: OK"
