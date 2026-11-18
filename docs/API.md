# مرجع API

پیشوند همه مسیرها `/api` است (در توسعه از طریق پورت ۳۰۰۰ پروکسی می‌شود). همه پاسخ‌ها JSON هستند.
خطاها شکل `{ "error": "پیام فارسی" }` دارند و پیام‌ها جزئیات داخلی را افشا نمی‌کنند.

---

## ۱. عمومی (`server/src/routes/public.js`)

| متد | مسیر | توضیح |
| --- | --- | --- |
| GET | `/health` | بررسی اتصال پایگاه داده |
| GET | `/site` | تنظیمات + حوزه‌ها + ۳ پروژه + ۳ مقاله + آمار + وضعیت پرداخت |
| GET | `/activities` | فهرست حوزه‌های فعال |
| GET | `/projects` | پروژه‌های فعال با `raised_amount` و `simulated_amount` |
| GET | `/projects/:slug` | جزئیات پروژه (`404` اگر غیرفعال یا ناموجود) |
| GET | `/stories` | مقالات منتشرشده |
| GET | `/stories/:slug` | جزئیات مقاله |
| GET | `/pages` | فهرست صفحه‌های منتشرشده (بدون متن کامل) |
| GET | `/pages/:slug` | متن کامل صفحه |
| GET | `/transparency` | آمار شفافیت + گزارش‌های فعالیت |
| POST | `/donations` | ثبت کمک (محدودیت: ۱۵ درخواست/۱۰ دقیقه per IP) |
| GET | `/donations/:tracking` | وضعیت کمک با کد پیگیری |
| POST | `/donations/:tracking/simulate` | تأیید پرداخت شبیه‌سازی‌شده |
| POST | `/donations/:tracking/cancel` | لغو کمک در انتظار |
| GET | `/payments/callback` | بازگشت از درگاه زرین‌پال (فقط با تأیید وریفای) |
| POST | `/volunteers` | فرم داوطلبی (۸/۱۰ دقیقه) |
| POST | `/contact` | پیام تماس (۸/۱۰ دقیقه) |
| POST | `/newsletter` | عضویت خبرنامه (۱۰/۱۰ دقیقه) |

### نمونه‌های درخواست

**ثبت کمک:**

```http
POST /api/donations
Content-Type: application/json

{
  "amount": 250000,
  "donor_name": "نام اهداکننده",
  "donor_phone": "09123456789",
  "project_id": 2,
  "is_anonymous": false,
  "note": "اختیاری"
}
```

پاسخ بدون درگاه واقعی:

```json
{
  "mode": "simulation",
  "tracking": "HO-1A2B3C",
  "amount": 250000,
  "project_title": "حمایت تحصیلی از کودکان بلوچ",
  "message": "درخواست کمک شما ثبت شد. در این نسخه پرداخت شبیه‌سازی می‌شود."
}
```

پاسخ با درگاه فعال: `{ "mode": "gateway", "tracking": "...", "redirectUrl": "https://..." }`.

**تأیید شبیه‌سازی:**

```http
POST /api/donations/HO-1A2B3C/simulate
```

```json
{
  "tracking_code": "HO-1A2B3C",
  "amount": "250000",
  "status": "paid",
  "simulated": true,
  "paid_at": "2026-11-18T09:09:38.002Z",
  "project_title": null
}
```

اگر درگاه واقعی فعال باشد: `409`. اگر رکورد قبلاً پرداخت شده باشد، همان رسید برگردانده می‌شود
(idempotent).

اعتبارسنجی کمک: مبلغ بین ۱۰٬۰۰۰ و ۵۰۰٬۰۰۰٬۰۰۰ تومان؛ نام حداقل ۳ کاراکتر مگر `is_anonymous`؛
شماره موبایل ایران؛ پروژه باید فعال باشد.

---

## ۲. احراز هویت (`server/src/routes/auth.js`)

| متد | مسیر | توضیح |
| --- | --- | --- |
| POST | `/auth/login` | `{ email, password }` → کوکی `ho_session` + کاربر |
| POST | `/auth/logout` | پاک‌کردن کوکی |
| GET | `/auth/me` | کاربر جاری یا `{ user: null }` |
| POST | `/auth/password` | تغییر رمز خود (نیازمند ورود) |

- ورود: ۸ تلاش ناموفق در ۱۰ دقیقه به ازای `IP + email` → `429`.
- پیام خطای ورود همیشه یکسان است (عدم افشای وجود حساب).
- رمز جدید: حداقل ۸ کاراکتر، شامل حرف و عدد.

---

## ۳. پنل مدیریت (`server/src/routes/admin.js`)

همه مسیرها نیازمند نشست معتبر هستند. خواندن برای همه نقش‌ها، تغییر فقط برای `admin`/`editor`، و
مسیرهای نشان‌دار فقط `admin`.

| متد | مسیر | نقش | توضیح |
| --- | --- | --- | --- |
| GET | `/admin/stats` | همه | شمارنده‌ها و آخرین رکوردها |
| GET/POST/PUT/DELETE | `/admin/projects[/:id]` | خواندن: همه · تغییر: editor+ | |
| GET/POST/PUT/DELETE | `/admin/activities[/:id]` | همان | |
| GET/POST/PUT/DELETE | `/admin/stories[/:id]` | همان | |
| GET/POST/PUT/DELETE | `/admin/pages[/:id]` | همان | |
| GET/POST/PUT/DELETE | `/admin/reports[/:id]` | همان | |
| POST | `/admin/upload` | editor+ | بارگذاری تصویر/PDF (۸MB) |
| GET | `/admin/media` | همه | `?kind=image|document` |
| DELETE | `/admin/media/:id` | editor+ | حذف رکورد و فایل دیسک |
| GET | `/admin/donations` | همه | `?status=paid|pending|failed|canceled` |
| GET | `/admin/volunteers` | همه | |
| PATCH/DELETE | `/admin/volunteers/:id` | editor+ | تغییر وضعیت / حذف |
| GET | `/admin/messages` | همه | |
| PATCH/DELETE | `/admin/messages/:id` | editor+ | خوانده‌شدن / حذف |
| GET | `/admin/subscribers` | همه | اعضای خبرنامه |
| GET | `/admin/users` | **admin** | فهرست کاربران |
| POST | `/admin/users` | **admin** | ایجاد کاربر |
| PUT | `/admin/users/:id` | **admin** | نام/نقش/فعال‌بودن |
| POST | `/admin/users/:id/password` | **admin** | بازنشانی رمز |
| DELETE | `/admin/users/:id` | **admin** | حذف کاربر |
| GET | `/admin/audit` | **admin** | `?limit=100&action=login` |
| GET | `/admin/backup` | **admin** | خروجی JSON از محتوا و فرم‌ها |
| GET/PUT | `/admin/settings` | خواندن: همه · نوشتن: **admin** | |

### قواعد محافظتی کاربران

- نمی‌توانید نقش یا فعال‌بودن حساب خودتان را حذف کنید.
- حذف/غیرفعال‌کردن آخرین `admin` فعال ممکن نیست.
- ایمیل تکراری → `409`.

### سکوی فایل

`POST /api/admin/upload` با `multipart/form-data` و فیلد `file`. پاسخ:
`{ "url": "/uploads/xxx.png", "media": { ... } }`.
پسوندهای مجاز: jpg, jpeg, png, webp, avif, pdf. **SVG عمداً رد می‌شود** (خطر XSS).

---

## ۴. سئو

| مسیر | توضیح |
| --- | --- |
| `GET /robots.txt` (ریشه) | قواعد خزش + نشانی نقشه سایت |
| `GET /sitemap.xml` (ریشه) | همه مسیرهای عمومی از پایگاه داده |

این دو مسیر خارج از `/api` هستند و در `server/src/index.js` ساخته می‌شوند؛ در توسعه Vite آن‌ها را
پروکسی می‌کند.
