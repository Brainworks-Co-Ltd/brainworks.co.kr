#!/usr/bin/env bash
# DNS A 레코드가 새 서버를 가리킨 뒤 root로 한 번 실행한다: bash ops/enable-https.sh
# HTTPS 인증서, www를 apex로 보내기, 6시간마다 DB 백업(14일 보관)
set -euo pipefail
repo=$(cd "$(dirname "$0")/.." && pwd)
conf=/etc/nginx/sites-available/brainworks

# Let's Encrypt는 2025년부터 만료 알림 메일을 보내지 않아서 메일 등록 없이 발급
certbot --nginx -d brainworks.co.kr -d www.brainworks.co.kr --redirect \
  --agree-tos --register-unsafely-without-email --non-interactive

# 인증서 발급 뒤에 넣어야 www 쪽 인증 요청이 리다이렉트에 걸리지 않는다
grep -q 'return 301 https://brainworks.co.kr' "$conf" || \
  sed -i '0,/server_name brainworks.co.kr www.brainworks.co.kr;/s|server_name brainworks.co.kr www.brainworks.co.kr;|&\n    if ($host = www.brainworks.co.kr) { return 301 https://brainworks.co.kr$request_uri; }|' "$conf"
nginx -t
systemctl reload nginx

install -m 755 "$repo/scripts/backup-postgres.sh" /usr/local/bin/brainworks-backup
cat > /etc/cron.d/brainworks-backup <<'EOF'
0 */6 * * * root bash -c 'set -a; . /etc/brainworks/app.env; PATH=/usr/lib/postgresql/17/bin:$PATH /usr/local/bin/brainworks-backup >/dev/null && find /var/lib/brainworks/backups -name "brainworks-*" -mtime +14 -delete'
EOF
bash -c 'set -a; . /etc/brainworks/app.env; PATH=/usr/lib/postgresql/17/bin:$PATH /usr/local/bin/brainworks-backup'

echo "== 결과"
for u in https://brainworks.co.kr/ https://www.brainworks.co.kr/ http://brainworks.co.kr/; do
  curl -sS -o /dev/null -w "$u %{http_code} -> %{redirect_url}\n" "$u"
done
certbot certificates 2>/dev/null | grep -E 'Domains|Expiry'
