# راهنمای استقرار مستقل (Production)

این سند مراحل انتشار نسخه واقعی سایت «همراهان امید» را روی یک سرور لینوکسی توضیح می‌دهد.
سندهای مرتبط: `docs/ENVIRONMENT.md` (متغیرها)، `docs/ARCHITECTURE.md`، `docs/API.md`.

## ۱. پیش‌نیازها

- Node.js 22 و npm
- PostgreSQL 16
- یک reverse proxy با TLS (nginx یا مشابه) که هم فایل‌های استاتیک و هم API را سرو کند
- یک دامنه با گواهی HTTPS

## ۲. متغیرهای محیطی الزامی

| نام | مقدار در Production | توضیح |
| --- | --- | --- |
| `NODE_ENV` | `production` | هشدارهای امنیتی و رفتار کوکی به آن وابسته است |
| `DATABASE_URL` | `postgres://user:pass@host:5432/db` | اتصال به PostgreSQL |
| `JWT_SECRET` | رشته تصادفی ۳۲ بایت یا بیشتر | بدون آن، نشست‌ها با هر restart باطل می‌شوند |
| `ADMIN_EMAIL` | ایمیل واقعی مدیر | حساب مدیر فقط از این مقدار ساخته می‌شود |
| `ADMIN_PASSWORD` | رمز قوی (حداقل ۱۲ کاراکتر) | رمز جای‌نگهدار توسعه در Production **پذیرفته نمی‌شود** |
| `PUBLIC_BASE_URL` | `https://example.org` | مبنای canonical، sitemap، OG image و callback درگاه |
| `DEMO_MODE` | `false` یا حذف‌شده | حالت نمایشی فقط با `true` روشن می‌شود |
| `UPLOAD_DIR` | مسیر پایدار فایل‌ها | پیش‌فرض `/app/uploads` |

اختیاری (درگاه پرداخت): `PAYMENT_GATEWAY=zarinpal` و `PAYMENT_MERCHANT_ID`.
بدون این دو، کمک‌ها در حالت شبیه‌سازی‌شده ثبت می‌شوند و در هیچ آمار عمومی حساب نمی‌شوند.

> **اطلاعات ورود آزمایشی sandbox:** فقط در محیط توسعه/پیش‌نمایش Base44، فایل
> `.env.base44-defaults` مقدار `ADMIN_EMAIL=admin@hamrahanomid.ir` و `ADMIN_PASSWORD=Hamrahan1404!`
> را دارد. سرور در `NODE_ENV=production` این رمز را رد می‌کند و هیچ حسابی با آن نمی‌سازد
> (`server/src/config.js`). در سرور واقعی این دو متغیر را از Secret Store تنظیم کنید.

## ۳. ساخت و اجرا

```bash
# ۱) وابستگی‌ها و بیلد فرانت‌اند
npm ci
npm run build            # خروجی: dist/

# ۲) وابستگی‌های API
cd server && npm ci && cd ..

# ۳) اجرای API (schema و seed خودکار در اولین بوت)
NODE_ENV=production node server/src/index.js
```

- `server/src/db.js` فایل `schema.sql` را در هر بوت اجرا می‌کند (idempotent). جدول‌های
  `rate_limits` و ستون `users.session_version` هم از همین مسیر ساخته می‌شوند.
- حساب مدیر تنها زمانی ساخته می‌شود که `ADMIN_EMAIL` و `ADMIN_PASSWORD` معتبر باشند؛ در غیر این صورت
  فقط هشدار در لاگ ثبت می‌شود و هیچ رمز پیش‌فرضی ساخته نمی‌شود.
- بررسی‌های زمان بوت در `server/src/config.js` هشدار می‌دهند اگر `JWT_SECRET` نباشد، `DEMO_MODE`
  روشن باشد، رمز مدیر ضعیف/جای‌نگهدار باشد یا `PUBLIC_BASE_URL` روی HTTPS نباشد.

## ۴. سرو کردن سایت (reverse proxy)

فرانت‌اند یک SPA است: همه مسیرهای عمومی باید `dist/index.html` را برگردانند و `/api`، `/uploads`،
`sitemap.xml` و `robots.txt` به API بروند. برای اینکه پیش‌نمایش لینک در شبکه‌های اجتماعی تصویر و
عنوان درست داشته باشد، درخواست‌های crawlerهای شبکه‌های اجتماعی باید به API برسند (منطق در
`server/src/prerender.js`).

نمونه nginx:

```nginx
map $http_user_agent $social_bot {
  default 0;
  ~*(facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot) 1;
}

server {
  listen 443 ssl http2;
  server_name example.org;
  root /srv/hamrahan/dist;

  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Content-Type-Options nosniff always;
  add_header Referrer-Policy strict-origin-when-cross-origin always;

  location /api/        { proxy_pass http://127.0.0.1:8000; proxy_set_header X-Forwarded-For $remote_addr; proxy_set_header X-Forwarded-Proto https; }
  location /uploads/    { proxy_pass http://127.0.0.1:8000; }
  location = /sitemap.xml { proxy_pass http://127.0.0.1:8000; }
  location = /robots.txt  { proxy_pass http://127.0.0.1:8000; }

  location / {
    if ($social_bot) { proxy_pass http://127.0.0.1:8000; break; }
    try_files $uri /index.html;
  }
}
```

`X-Forwarded-For` لازم است تا محدودیت نرخ بر اساس IP واقعی کاربر شمرده شود (Express با
`trust proxy` آن را می‌خواند).

## ۵. محدودیت نرخ درخواست

شمارنده‌ها در جدول `rate_limits` پایگاه داده نگه‌داری می‌شوند؛ بنابراین بین چند پروسه API مشترک‌اند و
با restart صفر نمی‌شوند. ردیف‌های منقضی هر ۱۰ دقیقه پاک می‌شوند.

| مسیر | محدودیت |
| --- | --- |
| `POST /api/auth/login` | ۸ تلاش در ۱۰ دقیقه برای هر IP+ایمیل، و ۲۰ تلاش در ۱۰ دقیقه برای هر IP |
| `POST /api/auth/password` | ۶ بار در ۱۰ دقیقه برای هر کاربر |
| `POST /api/contact` | ۸ بار در ۱۰ دقیقه برای هر IP |
| `POST /api/volunteers` | ۸ بار در ۱۰ دقیقه برای هر IP |
| `POST /api/donations` | ۱۵ بار در ۱۰ دقیقه برای هر IP |
| `GET /api/donations/:tracking` | ۶۰ بار در ۱۰ دقیقه برای هر IP |
| `/api/admin/*` | ۳۰۰ درخواست در دقیقه برای هر IP |

پاسخ درخواست بیش از حد: `429` با پیام فارسی و هدر `Retry-After`.

## ۶. سئو و پیش‌نمایش لینک

- اسلاگ‌ها از عنوان فارسی با transliteration قطعی ساخته می‌شوند (`server/src/lib/slug.js`)؛ ویرایش
  عنوان، آدرس منتشرشده را تغییر نمی‌دهد.
- `public/og-image.png` (۱۲۰۰×۶۳۰) تصویر پیش‌فرض اشتراک‌گذاری است؛ صفحات دارای تصویر، تصویر خود را
  استفاده می‌کنند.
- `sitemap.xml` و `robots.txt` پویا از API تولید می‌شوند.
- متاتگ‌های کلاینتی با `src/lib/seo.jsx` و متاتگ‌های crawlerهای شبکه اجتماعی با
  `server/src/prerender.js` تنظیم می‌شوند.

## ۷. چک‌لیست قبل از انتشار

- [ ] `NODE_ENV=production` و `JWT_SECRET` قوی تنظیم شده است.
- [ ] `ADMIN_PASSWORD` واقعی و قوی است (رمز جای‌نگهدار رد می‌شود) و در Secret Store نگه‌داری می‌شود.
- [ ] `DEMO_MODE` خاموش است (نوار «نمونه‌کار نمایشی» و پرداخت شبیه‌سازی‌شده دیده نمی‌شود).
- [ ] `PUBLIC_BASE_URL` روی HTTPS است تا کوکی نشست با `Secure` ارسال شود.
- [ ] `npm test` و `npm run lint` بدون خطا اجرا شده‌اند.
- [ ] `npm run build` بدون خطا تمام شده است.
- [ ] `GET /api/admin/projects` بدون نشست، `401` برمی‌گرداند.
- [ ] پشتیبان‌گیری از دیتابیس و پوشه `UPLOAD_DIR` تنظیم شده است.
