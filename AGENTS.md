# Environment notes for agents

## What this app is

Persian (RTL) charity website for «همراهان امید». Frontend: React 18 + Vite + Tailwind (repo root).
Backend: Express + PostgreSQL in `server/`. Admin panel at `/admin`, admin API under `/api/admin`.

## Running it (sandbox)

```bash
docker compose -f docker-compose.base44.yml up -d --build
docker compose -f docker-compose.base44.yml ps
docker compose -f docker-compose.base44.yml logs --tail=60 api web
```

- `web` = Vite dev server on host port 3000 (proxies `/api` and `/uploads` to `api:8000`).
- `api` = `node --watch server/src/index.js`, host port 8000.
- `db` = postgres:16-alpine, state in the `db-data` volume.
- `uploads` volume is mounted at `/app/uploads` in the API and served at `/uploads/...`.
- Dependency installs run on container start (`npm install`) with named volumes for `node_modules`,
  so package changes need a service restart, not an image rebuild.

## Database and seed

`server/src/db.js` runs `schema.sql` on every boot (idempotent) and seeds only when tables are
empty: the admin user, `settings.site` (all site copy), 4 activity areas and the 5 sample projects
from the brief. Sample projects intentionally have **no target amount** so the UI shows
«اطلاعات در حال به‌روزرسانی است» instead of invented numbers.

Admin credentials: `ADMIN_EMAIL` / `ADMIN_PASSWORD` (defaults in `.env.base44-defaults`,
overridable by `/run/base44/app.env`). Change the password from the admin panel.

## Gotchas

- `JWT_SECRET` signs the admin session cookie. If unset the API falls back to an ephemeral key and
  sessions reset on restart; the platform delivers a generated value through `/run/base44/app.env`.
- The Vite dev server allowlist is extended with `.${BASE44_SANDBOX_HOST_DOMAIN}` only when
  `BASE44_PREVIEW_MODE === "1"` (`vite.config.js`). `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` is also
  passed through by compose.
- Payments are disabled without `PAYMENT_GATEWAY=zarinpal` + `PAYMENT_MERCHANT_ID`; a donation then
  stays `pending`. Never mark a donation `paid` manually — public totals read from that status.
- Admin uploads accept images (jpg/png/webp/avif) and PDF up to 8 MB. SVG is rejected on purpose.

## Verifying

```bash
curl -s localhost:3000/api/health
curl -s localhost:3000/api/site | head -c 200
curl -s localhost:3000/api/projects | head -c 200
curl -s -o /dev/null -w '%{http_code}\n' localhost:3000/
```

Admin flow: `/admin` → login → projects/stories/activities/reports/settings; lists refetch only on
mount, so re-enter the route (or reload) after a mutation made outside the forms.

No test runner or linter is configured in this repo.
