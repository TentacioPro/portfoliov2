# Plane Self-Host (PMS) Runbook

## Context
- This Plane instance is the PMS for project tracking. Stack is docker-compose based in `plane-selfhost/`.
- Updated on 2025-12-27 to add resilient startup, health checks, backups, and log rotation.

## Current Topology
- Services: `plane-api`, `plane-web`, `plane-db` (Postgres 15), `plane-redis` (Redis 7), `plane-minio`, `create-bucket` job, `db-backup`, `minio-backup`.
- Networks: single bridge `plane-net`.
- Ports (host -> container): API 3006->8000, Web 3005->3000, MinIO 9000 (S3) / 9001 (console).

## Data + Volumes
- Postgres: `plane-selfhost/pgdata` (persistent DB files).
- Redis: `plane-selfhost/redisdata` (RDB snapshots).
- MinIO: `plane-selfhost/uploads` (object storage bucket `plane-uploads`).
- Backups: `plane-selfhost/backups/db` (pg_dump files) and `plane-selfhost/backups/minio` (mc mirror of bucket).
- Logs: json-file driver with rotation (max-size 10m, max-file 5) for all services.

## Runtime Configuration (compose)
- Compose file: `plane-selfhost/docker-compose.yaml`.
- Key env for API: `DATABASE_URL`, `REDIS_URL`, `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND`, `SECRET_KEY` (must change in prod), `WEB_URL`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, S3 creds/endpoints for MinIO, email settings.
- Frontend: uses built Next.js standalone server (`/app/web/.next/standalone/web/server.js`), `NEXT_PUBLIC_API_BASE_URL` defaults to `http://localhost:3006/api`.
- Healthchecks: DB uses `pg_isready`; Redis `redis-cli ping`; MinIO HTTP live; API uses TCP 8000 connect.

## Setup / Bring-Up
1) From repo root: `cd plane-selfhost`.
2) Ensure host folders exist/writable: `pgdata`, `redisdata`, `uploads`, `backups/db`, `backups/minio`.
3) Run `docker compose up -d --remove-orphans`.
4) Wait for health: `docker compose ps` should show API healthy; Web should be up after API.
5) Access: Web `http://localhost:3005`, API `http://localhost:3006` (no dedicated /health endpoint; TCP check only). MinIO console `http://localhost:9001` (default creds minioadmin/minioadmin).

### First-Login / Auth
- Initial 401s on `/api/users/me/*` mean no session yet. Create a superuser inside API: `docker exec -it plane-selfhost-plane-api-1 python manage.py createsuperuser`, then log in via the UI at `http://localhost:3005`.
- Ensure browser hits port 3005 (edge proxy). Cookies are SameSite=Lax; avoid blocking cookies.
- Current bootstrap admin (change after login):
  - email: maharajanabishek@gmail.com
  - username: abizhek_m
  - password: admin

### If you get stuck on the welcome screen with 401s
- Root cause: the instance flags start as "not configured" and no instance admin is linked, so `/auth/sign-in/` redirects with `INSTANCE_NOT_CONFIGURED`.
- Fix steps (already applied once, rerun if DB is reset):
  1) Make superuser an instance admin: `docker exec plane-selfhost-plane-api-1 python manage.py create_instance_admin maharajanabishek@gmail.com`
  2) Mark instance setup done: `docker exec plane-selfhost-plane-api-1 python manage.py shell -c "from plane.license.models import Instance; inst=Instance.objects.first(); inst.is_setup_done=True; inst.is_signup_screen_visited=True; inst.domain='http://localhost:3005'; inst.save();"`
  3) Sign in via browser at `http://localhost:3005` (edge proxy). This should drop you on onboarding instead of looping.
  4) If the UI keeps routing to `/god-mode`, we added an edge rewrite to map `/god-mode/*` back to `/`. Hitting `http://localhost:3005` and clicking Get started now stays on the normal app routes.

### Edge Proxy
- `plane-edge` (nginx) fronts both web and API on port 3005. `/api/` is proxied to `plane-api:8000/api/`; everything else to `plane-web:3000`.
- Frontend consumes `NEXT_PUBLIC_API_BASE_URL`; if blank in the baked bundle, edge still routes `/api` correctly when the browser uses 3005.

### Static Assets (Next.js)
- Web runs the built standalone server at `.next/standalone/web/server.js` with symlinks to `/.next/static` and `public` to avoid 404s on `_next/static/*`.

## Backup & Logging
- Postgres backup job (`db-backup`) runs `pg_dump` every `${BACKUP_INTERVAL:-86400}` seconds to `backups/db`. Files named `plane-YYYYMMDD-HHMMSS.sql`.
- MinIO backup job (`minio-backup`) mirrors `plane-uploads` to `backups/minio/plane-uploads` every `${BACKUP_INTERVAL:-86400}` seconds.
- Log rotation: json-file with 10MB chunks, 5 files retained. Consider forwarding to a central store if needed.
- Restore hints:
  - Postgres: `psql -h localhost -U plane -d plane -f backups/db/<file>.sql` (stop app or ensure quiescence).
  - MinIO: `mc mirror ./backups/minio/plane-uploads myminio/plane-uploads` after `mc alias set`.

## Things to Consider for Reimplementation / Hardening
- Secrets: replace `SECRET_KEY`, MinIO creds, email creds, OAuth IDs; avoid defaults in production.
- TLS/Ingress: add reverse proxy (Traefik/NGINX/Caddy) for HTTPS termination; update `WEB_URL`, CORS, and ALLOWED_HOSTS accordingly.
- Health endpoints: API image lacks a native HTTP health route; consider adding one upstream or keep TCP check.
- Celery: broker/result now on Redis; if you introduce RabbitMQ, adjust env and add service.
- DB durability: configure Postgres WAL settings and backups off-box (object storage) for DR.
- MinIO replication: if higher durability needed, push mirrored backups to external storage.
- Monitoring: add Prometheus/Grafana or lightweight checks; tail logs via `docker logs` with rotation in place.
- Scaling: increase `GUNICORN_WORKERS`, move to external DB/Redis, and front with a proper ingress if multi-host.

## Ops / Management
- Start/stop: `docker compose up -d` / `docker compose down` (in `plane-selfhost`).
- Status: `docker compose ps`.
- Logs: `docker compose logs -f plane-api` (or any service).
- Backups cadence: tune `BACKUP_INTERVAL` env for `db-backup` and `minio-backup` services.
- Cleanup: prune old backups in `backups/` and old rotated logs if disk is constrained.
- Upgrades: pull new images, review env changes, and recreate (`docker compose pull && docker compose up -d --force-recreate`).
