#!/usr/bin/env bash
# 새 카페24 가상서버(Ubuntu 24.04)를 처음 세울 때 root로 한 번 실행한다.
# 압축을 푼 소스 폴더 안에서 실행: bash ops/provision.sh
# 백업에서 시작하려면 DUMP=/경로/파일.dump 를 함께 넘긴다.
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive NEEDRESTART_MODE=a
repo=$(cd "$(dirname "$0")/.." && pwd)

timedatectl set-timezone Asia/Seoul
apt-get update -q
apt-get install -yq curl ca-certificates gnupg nginx certbot python3-certbot-nginx ufw rsync

install -d /usr/share/postgresql-common/pgdg
curl -fsSL -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc https://www.postgresql.org/media/keys/ACCC4CF8.asc
echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt noble-pgdg main" > /etc/apt/sources.list.d/pgdg.list
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt-get install -yq postgresql-17 nodejs
# 카페24 이미지는 /usr/bin/perl이 root 전용이라 pg_wrapper 대신 실행 파일을 직접 쓴다
export PATH=/usr/lib/postgresql/17/bin:$PATH

ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# 키를 등록한 뒤에 실행해야 한다
sed -i 's/^PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config.d/60-cloudimg-settings.conf
sed -i 's/^PermitRootLogin yes/PermitRootLogin prohibit-password/' /etc/ssh/sshd_config
sshd -t
systemctl reload ssh

id brainworks >/dev/null 2>&1 || useradd --system --home-dir /srv/brainworks --shell /usr/sbin/nologin brainworks
install -d -o brainworks -g brainworks /srv/brainworks /srv/brainworks/releases /var/lib/brainworks /var/lib/brainworks/uploads /var/lib/brainworks/backups
install -d -m 750 -o root -g brainworks /etc/brainworks

if [ ! -f /etc/brainworks/app.env ]; then
  db_password="$(openssl rand -hex 24)"
  sudo -u postgres env PATH="$PATH" psql -v ON_ERROR_STOP=1 -q -c "create role brainworks login password '${db_password}'"
  sudo -u postgres env PATH="$PATH" createdb -O brainworks brainworks
  umask 027
  cat > /etc/brainworks/app.env <<EOF
NODE_ENV=production
APP_ENV=production
APP_ORIGIN=https://brainworks.co.kr
DATABASE_URL=postgresql://brainworks:${db_password}@127.0.0.1:5432/brainworks
CONTACT_RECIPIENT=austin@brainworks.co.kr
SMTP_HOST=smtps.hiworks.com
SMTP_PORT=465
SMTP_USER=ppre1ude@brainworks.co.kr
SMTP_FROM=ppre1ude@brainworks.co.kr
SMTP_PASSWORD=
ASSET_LOCAL_DIR=/var/lib/brainworks/uploads
EOF
  chown root:brainworks /etc/brainworks/app.env
  chmod 640 /etc/brainworks/app.env
fi

if [ -n "${DUMP:-}" ]; then
  set -a; . /etc/brainworks/app.env; set +a
  pg_restore --no-owner --no-privileges --exit-on-error -d "$DATABASE_URL" "$DUMP"
fi

# HTTPS는 DNS를 옮긴 뒤 ops/enable-https.sh가 붙인다
cp "$repo/ops/nginx/brainworks.conf" /etc/nginx/sites-available/brainworks
ln -sfn /etc/nginx/sites-available/brainworks /etc/nginx/sites-enabled/brainworks
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "== 결과"
node -v; psql --version; nginx -v 2>&1
sshd -T | grep -E '^(passwordauthentication|permitrootlogin)'
echo "SMTP_PASSWORD는 nano /etc/brainworks/app.env 로 직접 넣는다"
