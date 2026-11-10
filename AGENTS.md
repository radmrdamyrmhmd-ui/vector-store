# YAS SPORTS — runtime notes for agents

Persian (RTL) sports-footwear storefront. Two services in one repo:

- `web/` — React 18 + Vite 6 SPA (port 3000, the preview entry point).
- `api/` — Express 4 + Postgres API (port 4000, reached through the Vite `/api` proxy).
- `db` — `postgres:16` with a named volume.

## Run it

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

First boot takes a minute: each app service runs `npm install` into its own named
volume before starting `npm run dev`. The API creates its schema and seeds
categories, 11 products and the admin account on startup (`api/src/bootstrap.js`),
so no separate migration step exists.

Local service checks:

```bash
docker compose -f docker-compose.base44.yml exec -T api npm run dev      # restart-safe
curl -s localhost:3000/api/health
docker compose -f docker-compose.base44.yml logs --tail 50 api web
```

There are no tests or linters in the repo. A build of every route (catches syntax
errors in files the dev server never rendered) is the quickest compile check:

```bash
docker compose -f docker-compose.base44.yml exec -T web sh -c "npx vite build --outDir /tmp/dist --emptyOutDir"
```

## Things worth knowing

- **Single origin.** The browser only talks to port 3000; Vite proxies `/api` to
  `http://api:4000`. Auth is an httpOnly JWT cookie (`yas_token`), so keep this
  wiring — splitting origins would break the session cookie.
- **Admin account** comes from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in
  `.env.base44-defaults` (dev defaults: `admin@yas-sports.ir` / `yasadmin1405`).
  The seed only inserts it when the email is missing, so changing the password
  value later does not update an existing user.
- **Cart** lives in `localStorage` (`yas_cart_v1`) through `CartContext`; orders are
  recomputed and stock is decremented server-side in `POST /api/orders`
  (`api/src/routes/orders.js`), so never trust prices from the client.
- **Payment is not connected.** Checkout records a `pending` order and says so
  explicitly on screen — do not describe it as a real payment.
- **Uploads** (admin product images) go to the `yas_uploads` volume, served at
  `/api/uploads/*`; product images shipped with the repo live in
  `web/public/images/`.
- **Preview hosts.** `web/vite.config.js` allows the sandbox proxy host only when
  `BASE44_PREVIEW_MODE === '1'` (uses `BASE44_SANDBOX_HOST_DOMAIN`); unset keeps
  Vite's default behaviour.
- Test data rule: a checkout smoke test creates a real order. Delete it
  (`delete from orders where code = '…'`) and restore the affected product's
  stock afterwards.

## Layout

- `web/src/pages` — route screens (`admin/` holds the guarded panel).
- `web/src/components` — header, footer, cart drawer, product card, home sections.
- `web/src/styles` — `base.css` (tokens/typography/buttons), `site.css`,
  `admin.css`. Design tokens: `#F0F0F0` surface, `#101010` dark, `#111111` ink,
  `#777777` muted, `#E4E4E4` hairlines, 14px card radius, Vazirmatn.
