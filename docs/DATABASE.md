# پایگاه داده

موتور: **PostgreSQL 16**. تعریف کامل در `server/src/schema.sql` است و در هر بوت API اجرا می‌شود؛
همه دستورها idempotent هستند (`CREATE TABLE IF NOT EXISTS`، `ADD COLUMN IF NOT EXISTS`)، بنابراین
برای پروژه‌های در حال اجرا هم بی‌خطر است.

## ۱. جدول‌ها

### `users`
| ستون | نوع | توضیح |
| --- | --- | --- |
| `id` | serial PK | |
| `email` | text unique | با حروف کوچک ذخیره می‌شود |
| `password_hash` | text | bcrypt (cost 10) |
| `name` | text | نام نمایشی |
| `role` | text | `admin` \| `editor` \| `viewer` |
| `is_active` | boolean | غیرفعال = ورود ممنوع |
| `last_login_at` | timestamptz | آخرین ورود موفق |
| `created_at` | timestamptz | |

### `settings`
کلید/مقدار JSON؛ کلید `site` تمام متن‌های سایت را نگه می‌دارد (نام، Hero، درباره، تماس، شبکه‌های
اجتماعی، `demo_mode`، `demo_note`، `donation_notice`، `people_supported`، `last_updated`).
مقادیر پیش‌فرض جدید با `value = defaults || value` ادغام می‌شوند تا مقادیر ویرایش‌شده بازنویسی نشوند.

### `activities` (حوزه‌های فعالیت)
`slug`, `title`, `summary`, `body`, `icon`, `image_url`, `sort`, `is_active`

### `projects` (پروژه‌های حمایتی)
`slug`, `title`, `summary`, `description`, `image_url`, `target_amount`, `location`, `status`
(`active` \| `completed` \| `planned`), `is_active`, `sort`, `is_sample`, `meta_description`

### `stories` (اخبار و مقالات)
`slug`, `title`, `excerpt`, `body`, `image_url`, `author`, `category`, `published_at`,
`is_published`, `is_sample`, `meta_description`, `reading_minutes`

### `pages` (صفحه‌های ثابت و دلخواه)
`slug`, `title`, `subtitle`, `body`, `meta_title`, `meta_description`, `is_published`, `sort`,
`updated_at`, `created_at`. صفحه‌های `privacy` و `terms` نشانی ثابت `/privacy` و `/terms` دارند؛
بقیه در `/p/:slug` سرو می‌شوند.

### `donations`
`tracking_code` (یکتا، قالب `HO-XXXXXX`), `project_id` (FK, `ON DELETE SET NULL`), `amount`
(بزرگ‌تر از صفر), `donor_name`, `donor_phone`, `is_anonymous`, `note`, `status`
(`pending` \| `paid` \| `failed` \| `canceled`), `gateway`, `gateway_reference`,
**`simulated`** (boolean), `created_at`, `paid_at`.

> `simulated = true` یعنی پرداخت آزمایشی. این رکوردها هرگز در آمار کمک‌های واقعی جمع نمی‌شوند.

### `volunteers`
`full_name`, `phone`, `email`, `city`, `skills`, `interests` (text[]), `note`, `status`
(`new` \| `contacted` \| `accepted` \| `rejected`), `created_at`

### `contact_messages`
`name`, `phone`, `email`, `subject`, `message`, `is_read`, `created_at`

### `newsletter_subscribers`
`email` (unique), `created_at`

### `financial_reports` (گزارش‌های فعالیت)
`title`, `period`, `summary`, `amount_spent`, `file_url`, `published_at`, `is_sample`

### `media`
`url`, `filename`, `original_name`, `mime`, `size_bytes`, `uploaded_by` (FK), `created_at`

### `audit_log`
`user_id` (FK, `ON DELETE SET NULL`), `user_email`, `action`, `entity`, `entity_id`, `detail`,
`ip`, `created_at` + ایندکس روی زمان.

## ۲. اجرای مستقیم

```bash
# داخل کانتینر دیتابیس
docker compose -f docker-compose.base44.yml exec -T db \
  psql -U hamrahan -d hamrahan -c "SELECT count(*) FROM projects;"
```

اتصال از سرویس API: `DATABASE_URL=postgres://hamrahan:hamrahan@db:5432/hamrahan`.

## ۳. پشتیبان‌گیری

**از داشبورد:** دکمه «دریافت پشتیبان» یک فایل JSON از محتوا و فرم‌ها می‌دهد (بدون رمز عبور).

**پشتیبان کامل با pg_dump:**

```bash
docker compose -f docker-compose.base44.yml exec -T db \
  pg_dump -U hamrahan -d hamrahan -F c -f /tmp/backup.dump
docker compose -f docker-compose.base44.yml cp db:/tmp/backup.dump ./backup.dump
```

**بازیابی:**

```bash
docker compose -f docker-compose.base44.yml cp ./backup.dump db:/tmp/restore.dump
docker compose -f docker-compose.base44.yml exec -T db \
  pg_restore -U hamrahan -d hamrahan --clean --if-exists /tmp/restore.dump
```

پیشنهاد: پشتیبان روزانه با کرون و نگهداری نسخه‌ها در فضای جدا از سرور؛ فایل پشتیبان حاوی اطلاعات
تماس افراد است و باید رمزگذاری‌شده نگهداری شود.

## ۴. افزودن ستون یا جدول جدید

1. دستور idempotent را به انتهای `server/src/schema.sql` اضافه کنید
   (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...`).
2. در `routes/admin.js` و `routes/public.js` فیلد را در ورودی/خروجی لحاظ کنید.
3. سرویس `api` را restart کنید (`docker compose restart api`) — شما در بوت اجرا می‌شود.
