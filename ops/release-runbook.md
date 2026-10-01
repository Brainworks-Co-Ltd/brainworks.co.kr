# 브레인웍스 서버 배포 런북

운영 서버는 카페24 SSD 가상서버 비즈니스(Ubuntu 24.04, 서울 IDC)입니다. IP는 180.70.116.103이고, 접속은 root 키 전용입니다(PC의 `~\.ssh\brainworks_vm`). 2026-10-01에 이전 서버(개발언어 VPS DEV B, 오사카)에서 옮겼습니다.

## 서버 구성

| 항목 | 위치 |
|---|---|
| 앱 프로세스 | systemd `brainworks-web` (`ops/systemd/brainworks-web.service`), 127.0.0.1:3000, `TZ=Asia/Seoul` |
| 환경 변수 | `/etc/brainworks/app.env` (root:brainworks 640, 저장소에 두지 않음) |
| 릴리스 | `/srv/brainworks/releases/{sha}`, 운영 중인 것은 `/srv/brainworks/current` 링크 |
| 업로드 이미지 | `/var/lib/brainworks/uploads` |
| DB | PostgreSQL 17, DB와 계정 이름 `brainworks` |
| 웹 서버 | nginx (`ops/nginx/brainworks.conf` + certbot이 붙인 HTTPS, www는 apex로 301) |
| DB 백업 | `/etc/cron.d/brainworks-backup`, 6시간마다 `/var/lib/brainworks/backups`, 14일 보관 |

## 배포

PC의 PowerShell에서 저장소 폴더로 이동한 뒤 두 줄을 차례로 실행합니다. 같은 창에서 실행해야 `$sha`가 이어집니다.

```powershell
git fetch origin; $sha = git rev-parse --short origin/main; git -c core.autocrlf=false archive -o "$env:TEMP\bw-$sha.tar" origin/main; scp -i "$env:USERPROFILE\.ssh\brainworks_vm" "$env:TEMP\bw-$sha.tar" root@180.70.116.103:/tmp/
```

```powershell
ssh -i "$env:USERPROFILE\.ssh\brainworks_vm" root@180.70.116.103 "mkdir -p /srv/brainworks/build/$sha && tar -xf /tmp/bw-$sha.tar -C /srv/brainworks/build/$sha && SHA=$sha bash /srv/brainworks/build/$sha/scripts/deploy.sh"
```

`scripts/deploy.sh`는 서버에서 빌드하고 migration을 적용한 뒤 릴리스를 바꿉니다. 준비 확인(`/api/health/ready/`)에 실패하면 직전 릴리스로 되돌리고 멈춥니다. 마지막 `== 결과`에 200과 `active`가 나오면 끝입니다.

- `core.autocrlf=false`를 빼면 이 PC에서는 스크립트가 CRLF로 묶여 서버에서 `bash\r` 오류가 납니다.
- 빌드는 서버(RAM 2G, 스왑 4G)에서 5~10분 걸립니다.

## 롤백

```bash
ln -sfn /srv/brainworks/releases/{이전 sha} /srv/brainworks/current && systemctl restart brainworks-web
```

migration은 되돌리지 않습니다. 스키마가 이전 앱과 맞지 않으면 백업을 격리 DB에 먼저 복원해 확인한 뒤 결정합니다.

## 서버를 처음부터 세울 때

1. 카페24에서 root 비밀번호로 한 번 접속해 키를 등록합니다.
   ```powershell
   $key = (Get-Content "$env:USERPROFILE\.ssh\brainworks_vm.pub" -Raw).Trim(); ssh root@{새 IP} "mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '$key' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
   ```
2. 위 배포 첫 줄로 소스를 올리고 서버에서 풉니다. 백업 파일도 서버에 올립니다.
3. `DUMP=/경로/백업.dump bash ops/provision.sh`: Node 24, PostgreSQL 17, nginx, 방화벽, 키 전용 접속, 앱 계정, DB, `app.env`를 만들고 백업을 복원합니다.
4. `nano /etc/brainworks/app.env`로 `SMTP_PASSWORD='...'`(하이웍스 메일 전용 비밀번호)를 넣습니다.
5. `SHA={sha} bash scripts/deploy.sh`
6. 카페24 DNS에서 A 레코드 `brainworks.co.kr`만 새 IP로 바꿉니다. www CNAME(`brainworks.co.kr`), MX, TXT는 건드리지 않습니다. MX와 TXT가 바뀌면 회사 메일이 끊깁니다.
7. DNS가 퍼진 뒤 `bash ops/enable-https.sh`: 인증서 발급, www 리다이렉트, DB 백업 cron을 설정합니다.

카페24 이미지는 `/usr/bin/perl`이 root 전용이라 `sudo -u postgres psql`이 실패합니다. 스크립트는 `/usr/lib/postgresql/17/bin`을 직접 씁니다.

## 백업과 복원

- 서버: 6시간마다 DB 덤프, 14일 보관
- 서버 밖: PC 작업 스케줄러 `brainworks-backup`이 2주마다 최신 덤프와 업로드 이미지를 구글 드라이브 `brainworks-backup\날짜`로 받습니다.
- 복원: `scripts/restore-postgres.sh` (`BACKUP_FILE`, `RESTORE_DATABASE_URL`, `CONFIRM_RESTORE=yes`)

업로드 이미지는 DB 덤프에 들어 있지 않습니다. 서버가 사라지면 마지막 PC 백업 이후 올린 이미지는 복구할 수 없습니다.
