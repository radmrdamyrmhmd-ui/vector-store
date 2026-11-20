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

Admin credentials come from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (sandbox defaults in
`.env.base44-defaults`, overridable by `/run/base44/app.env`). No built-in password exists: with
`NODE_ENV=production` the sandbox placeholder and any password under 12 characters are refused, so
no admin account is created from them. `DEMO_MODE` (`true` in the sandbox defaults, off otherwise)
drives the sample-content ribbon and simulated payments and overrides the panel toggle.

Rate limiting (`server/src/rate-limit.js`) is a Postgres fixed-window counter in `rate_limits`, so it
is shared across processes and survives restarts. Login, password change, contact, volunteer,
donation, tracking lookup and the whole admin API are limited; over-limit answers `429` +
`Retry-After`. The table is pruned every 10 minutes.

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

## Tests and lint

Vitest + React Testing Library (jsdom) and ESLint 9 (flat config) are configured.

```bash
docker exec app-web-1 sh -c "cd /workspace && npm test"      # vitest run
docker exec app-web-1 sh -c "cd /workspace && npm run lint"  # eslint src server/src
```

`src/lib/phone.js` is the single source of phone validation on the client
(`isValidPhone`, `normalizePhone`, `phoneInputValue`); `server/src/lib/phone.js` is the same logic on
the API, which is the authority. `src/lib/phone.parity.test.js` fails if the two ever disagree.
Tests live next to the code (`*.test.js(x)`), including `server/src/**/*.test.js`.

Other server modules worth knowing:

- `server/src/lib/slug.js` — Persian → ASCII slug transliteration. Slugs are deterministic, and a
  PUT without an explicit slug keeps the current one, so published URLs never move.
- `server/src/prerender.js` — server-rendered HTML for crawlers (search engines and social
  previews): title, description, H1, real database text, internal links, canonical, Open Graph and
  JSON-LD. Unknown routes get `404` + `noindex`; `/admin` gets `404`; duplicate URLs are `301`
  (`/legal`, `/p/privacy`, `/p/terms`, trailing slash). Mounted on the API, so a production reverse
  proxy must send crawler requests to the API; see `docs/DEPLOYMENT.md`.
- `src/lib/seo.jsx` — client-side metadata (`useSeo`) plus the JSON-LD builders (WebSite,
  Organization, WebPage, Article, BreadcrumbList, ItemList). Never publish registration numbers,
  addresses or licences for this demonstration project.
- `vite.config.js` `seo-crawler-proxy` — in dev the Vite server forwards crawler requests to the
  API, so link previews and crawler HTML work on the public port too.
- Routes in `src/App.jsx` are lazy-loaded; a new page must be added there with `lazy()` so the
  first bundle stays small.
- `server/src/config.js` — `DEMO_MODE`, production password rules and boot-time warnings.
- Session tokens carry `sv`; `users.session_version` is bumped on a password change, which signs out
  every older session (`/api/auth/me` included).
- The `viewer` role cannot read donor/volunteer/contact personal data or mutate anything.
