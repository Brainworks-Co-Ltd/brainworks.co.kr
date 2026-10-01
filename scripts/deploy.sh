#!/usr/bin/env bash
# 서버에서 root로 실행한다. /srv/brainworks/build/$SHA 에 푼 소스를 빌드해
# releases/$SHA 로 배치하고 서비스를 바꾼다. 절차는 ops/release-runbook.md 참고.
set -euo pipefail
: "${SHA:?SHA is required}"
# 카페24 이미지는 /usr/bin/perl이 root 전용이라 pg_wrapper 대신 실행 파일을 직접 쓴다
export PATH=/usr/lib/postgresql/17/bin:$PATH
src=/srv/brainworks/build/$SHA
release=/srv/brainworks/releases/$SHA

cd "$src"
set -a; . /etc/brainworks/app.env; set +a
# app.env의 NODE_ENV=production 때문에 devDependencies가 빠지지 않게
npm ci --include=dev --no-audit --no-fund --loglevel=error
npm run build
MIGRATIONS_DIR="$src/src/server/db/migrations" node scripts/migrate.cjs

rm -rf "$release"
cp -a .next/standalone "$release"
cp -a .next/static "$release/.next/static"
cp -a public "$release/public"
chown -R brainworks:brainworks "$release"

install -m 644 ops/systemd/brainworks-web.service /etc/systemd/system/brainworks-web.service
previous=$(readlink -f /srv/brainworks/current || true)
ln -sfn "$release" /srv/brainworks/current
systemctl daemon-reload
systemctl enable brainworks-web >/dev/null 2>&1
systemctl restart brainworks-web

ready=
for _ in $(seq 1 30); do
  curl -fsS http://127.0.0.1:3000/api/health/ready/ >/dev/null 2>&1 && { ready=1; break; }
  sleep 1
done
if [ -z "$ready" ]; then
  echo "준비 확인 실패: 직전 릴리스로 되돌립니다 ($previous)" >&2
  if [ -n "$previous" ]; then ln -sfn "$previous" /srv/brainworks/current; systemctl restart brainworks-web; fi
  exit 1
fi

# 빌드 소스는 지우고 릴리스는 최근 5개만 남긴다
rm -rf "$src"
ls -1dt /srv/brainworks/releases/* | tail -n +6 | xargs -r rm -rf

echo "== 결과"
for p in /api/health/ready/ / /en/ /notices/ /contact/; do
  curl -sS -o /dev/null -w "$p %{http_code}\n" "http://127.0.0.1:3000$p"
done
systemctl is-active brainworks-web
