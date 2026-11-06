#!/usr/bin/env bash
# Starts the API against the configured database and checks that it works end to end.
# Used in CI against a real SQL Server; also handy locally:
#   Database__Provider=SqlServer ConnectionStrings__Default="..." ./backend/scripts/smoke-test.sh
set -euo pipefail
cd "$(dirname "$0")/.."
URL=http://localhost:5099

dotnet run --project src/CarDealer.Api --no-launch-profile --urls "$URL" > smoke.log 2>&1 &
API_PID=$!
trap 'kill $API_PID 2>/dev/null || true' EXIT

for i in $(seq 1 60); do
  if curl -fs "$URL/health" > /dev/null; then break; fi
  if ! kill -0 $API_PID 2>/dev/null; then cat smoke.log; echo "API exited"; exit 1; fi
  sleep 2
done
curl -fs "$URL/health" | grep -q Healthy || { cat smoke.log; echo "health check failed"; exit 1; }

total=$(curl -fs "$URL/api/cars?pageSize=1" | python3 -c 'import sys,json;print(json.load(sys.stdin)["total"])')
echo "cars in database: $total"
[ "$total" -ge 24 ] || { echo "expected >= 24 seeded cars"; exit 1; }

code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$URL/api/leads" -H 'Content-Type: application/json' \
  -d '{"name":"CI","email":"ci@example.se","message":"Röktest från CI mot SQL Server","carSlug":"volvo-v90-d4-awd"}')
echo "POST /api/leads -> $code"
[ "$code" = "201" ] || { cat smoke.log; exit 1; }

token=$(curl -fs -X POST "$URL/api/auth/login" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$Admin__Email\",\"password\":\"$Admin__Password\"}" | python3 -c 'import sys,json;print(json.load(sys.stdin)["accessToken"])')
new_leads=$(curl -fs "$URL/api/dashboard" -H "Authorization: Bearer $token" | python3 -c 'import sys,json;print(json.load(sys.stdin)["newLeads"])')
echo "new leads: $new_leads"
[ "$new_leads" -ge 1 ] || exit 1
echo "Smoke test OK"
