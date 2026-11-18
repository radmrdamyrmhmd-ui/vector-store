import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'
import bcrypt from 'bcryptjs'

const { Pool } = pg
const here = path.dirname(fileURLToPath(import.meta.url))

export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgres://hamrahan:hamrahan@127.0.0.1:5432/hamrahan',
  max: 10,
})

export const query = (text, params) => pool.query(text, params)

const DEFAULT_SITE = {
  site_name: 'همراهان امید',
  site_subtitle: 'بنیاد خیریه حمایت از زنان و کودکان بلوچ',
  hero_title: 'با هم، آینده‌ای روشن‌تر می‌سازیم',
  hero_text:
    'ما در کنار زنان و کودکان بلوچ ایستاده‌ایم تا با فراهم کردن فرصت‌های آموزش، توانمندسازی و حمایت اجتماعی، مسیر زندگی بهتری برای آن‌ها بسازیم.',
  hero_note: 'هر قدم کوچک، می‌تواند آغاز یک تغییر بزرگ باشد.',
  hero_image: '',
  about_image: '',
  about_title: 'ما برای ساختن امید کنار هم هستیم',
  about_text:
    'باور داریم هر زن و هر کودک، فارغ از محل زندگی و شرایط اقتصادی، شایسته فرصت برابر برای رشد، آموزش و داشتن آینده‌ای امن است.\n\nفعالیت ما با هدف حمایت از زنان و کودکان بلوچ و ایجاد فرصت‌هایی برای زندگی بهتر شکل گرفته است.',
  mission_title: 'مأموریت ما',
  mission_text:
    'همراهان امید با تمرکز بر آموزش، توانمندسازی اقتصادی و حمایت اجتماعی، در کنار خانواده‌های بلوچ می‌ایستد تا فرصت‌های واقعی برای رشد کودکان و استقلال زنان فراهم شود.',
  phone: '',
  email: '',
  address: '',
  instagram: '',
  telegram: '',
  whatsapp: '',
  footer_about:
    'همراهان امید مجموعه‌ای مردم‌نهاد است که برای فراهم کردن فرصت‌های آموزش، سلامت و توانمندسازی زنان و کودکان بلوچ فعالیت می‌کند.',
  legal_owner: 'مجموعه همراهان امید',
  people_supported: null,
  last_updated: null,
  // This build is a portfolio demonstration. The ribbon tells every visitor that
  // the organisation is not operating and that the numbers are sample data.
  demo_mode: true,
  demo_note:
    'این وب‌سایت یک نمونه‌کار نمایشی است؛ «همراهان امید» یک مؤسسه فعال نیست و محتوای آن نمونه است.',
  donation_notice:
    'پرداخت در این نسخه شبیه‌سازی می‌شود. هیچ اطلاعات کارت بانکی دریافت نمی‌شود و مبلغی از حساب شما کسر نمی‌گردد.',
}

const DEFAULT_ACTIVITIES = [
  {
    slug: 'education',
    title: 'آموزش کودکان',
    summary:
      'فراهم کردن فرصت‌های آموزشی، کمک به تحصیل و حمایت از رشد استعدادهای کودکان.',
    body:
      'ما با تأمین لوازم تحصیلی، حمایت از ادامه تحصیل کودکان بازمانده از مدرسه و برگزاری کلاس‌های تقویتی، تلاش می‌کنیم هیچ کودکی به دلیل شرایط اقتصادی از آموزش محروم نماند.',
    icon: 'book',
    sort: 1,
  },
  {
    slug: 'women-empowerment',
    title: 'توانمندسازی زنان',
    summary:
      'ایجاد فرصت‌های یادگیری مهارت، اشتغال‌زایی و استقلال اقتصادی زنان.',
    body:
      'دوره‌های مهارت‌آموزی، پشتیبانی از کسب‌وکارهای خرد و همراهی در بازاریابی محصولات، مسیر استقلال اقتصادی زنان سرپرست خانوار را هموار می‌کند.',
    icon: 'sparkles',
    sort: 2,
  },
  {
    slug: 'livelihood',
    title: 'حمایت معیشتی',
    summary: 'کمک به تأمین نیازهای ضروری خانواده‌های کم‌برخوردار.',
    body:
      'بسته‌های معیشتی، کمک‌هزینه مسکن و حمایت در شرایط بحرانی، بخشی از تلاش ما برای کاهش فشار اقتصادی بر خانواده‌های نیازمند است.',
    icon: 'basket',
    sort: 3,
  },
  {
    slug: 'health',
    title: 'سلامت و رفاه',
    summary: 'حمایت از دسترسی به خدمات سلامت، بهداشت و امکانات ضروری.',
    body:
      'همراهی در هزینه‌های درمان، ارائه بسته‌های بهداشتی و آگاه‌سازی سلامت مادر و کودک، از مهم‌ترین برنامه‌های این حوزه است.',
    icon: 'heart',
    sort: 4,
  },
]

const DEFAULT_PROJECTS = [
  {
    slug: 'school-support',
    title: 'حمایت تحصیلی از کودکان بلوچ',
    summary:
      'همراهی کودکان بازمانده از تحصیل برای بازگشت به مدرسه و ادامه تحصیل.',
    description:
      'این پروژه با شناسایی کودکان بازمانده از تحصیل و همکاری با خانواده‌ها، زمینه بازگشت آن‌ها به مدرسه را فراهم می‌کند. ثبت‌نام، تأمین لوازم تحصیلی و پیگیری تحصیلی بخشی از این مسیر است.',
    status: 'active',
    sort: 1,
  },
  {
    slug: 'school-supplies',
    title: 'تأمین لوازم آموزشی',
    summary:
      'تهیه نوشت‌افزار، کیف و کتاب برای دانش‌آموزان کم‌برخوردار.',
    description:
      'در مناطق کم‌برخوردار، تأمین لوازم آموزشی برای بسیاری از خانواده‌ها دشوار است. این پروژه بسته‌های کامل لوازم تحصیلی را پیش از آغاز سال تحصیلی به دانش‌آموزان می‌رساند.',
    status: 'active',
    sort: 2,
  },
  {
    slug: 'women-skills',
    title: 'آموزش مهارت‌های شغلی به زنان',
    summary:
      'برگزاری دوره‌های مهارت‌آموزی برای استقلال اقتصادی زنان سرپرست خانوار.',
    description:
      'دوره‌های خیاطی، صنایع دستی و مهارت‌های کارآفرینی، همراه با آموزش بازاریابی محصولات، برای زنان سرپرست خانوار برگزار می‌شود تا مسیر درآمد پایدار شکل بگیرد.',
    status: 'active',
    sort: 3,
  },
  {
    slug: 'family-support',
    title: 'حمایت از خانواده‌های نیازمند',
    summary:
      'کمک معیشتی به خانواده‌هایی که در شرایط دشوار اقتصادی قرار دارند.',
    description:
      'این پروژه با ارزیابی نیاز خانواده‌ها، بسته‌های معیشتی و کمک‌هزینه ضروری را به‌صورت هدفمند در اختیار آن‌ها قرار می‌دهد.',
    status: 'active',
    sort: 4,
  },
  {
    slug: 'health-support',
    title: 'تأمین نیازهای بهداشتی و درمانی',
    summary:
      'همراهی در هزینه درمان و تأمین بسته‌های بهداشتی برای مادران و کودکان.',
    description:
      'دسترسی به خدمات سلامت یکی از پایه‌های زندگی سالم است. این پروژه هزینه‌های درمانی ضروری و بسته‌های بهداشتی مادر و کودک را پوشش می‌دهد.',
    status: 'active',
    sort: 5,
  },
]

const DEFAULT_PAGES = [
  {
    slug: 'privacy',
    title: 'سیاست حفظ حریم خصوصی',
    subtitle:
      'این متن نمونه است و برای نمایش ساختار یک صفحه سیاست حریم خصوصی در پنل مدیریت قابل ویرایش است.',
    meta_title: 'سیاست حفظ حریم خصوصی',
    meta_description:
      'توضیح نحوه جمع‌آوری، استفاده و نگهداری اطلاعات در وب‌سایت همراهان امید (نمونه‌کار نمایشی).',
    body: `## اطلاعاتی که ثبت می‌کنیم
در فرم‌های کمک، داوطلبی، تماس و خبرنامه، اطلاعاتی مانند نام، شماره تماس، ایمیل و توضیحات شما ثبت می‌شود. این اطلاعات فقط برای پاسخ‌گویی به همان درخواست استفاده می‌شود.

در نسخه نمایشی این وب‌سایت، اطلاعات واردشده در فرم‌ها در پایگاه داده همان نمونه ذخیره می‌شود و برای هیچ شخص یا سازمان دیگری ارسال نمی‌گردد.

## اطلاعات پرداخت
هیچ اطلاعات کارت بانکی در این وب‌سایت دریافت، پردازش یا ذخیره نمی‌شود. پرداخت‌ها در نسخه نمایشی شبیه‌سازی شده‌اند و فقط یک رکورد آزمایشی با برچسب «شبیه‌سازی‌شده» ثبت می‌کنند.

## دسترسی به اطلاعات
اطلاعات اهداکنندگان، داوطلبان و پیام‌های تماس فقط برای کاربران مجاز پنل مدیریت با سطح دسترسی مناسب قابل مشاهده است و در صفحات عمومی نمایش داده نمی‌شود.

## اطلاعات افراد تحت حمایت
اطلاعات هویتی کودکان و خانواده‌های تحت حمایت، از جمله تصاویر شناسایی‌پذیر، در این وب‌سایت منتشر نمی‌شود. تصاویر به‌کاررفته در این نسخه، تصاویر گرافیکی هستند.

## نگهداری و حذف
هر زمان بخواهید اطلاعات خود را حذف کنید، از طریق صفحه تماس با ما اطلاع دهید تا رکورد مربوط حذف شود.

## امنیت
ارتباط با سایت از طریق HTTPS انجام می‌شود، رمزهای عبور با الگوریتم هش ذخیره می‌شوند و دسترسی به پنل مدیریت با کنترل سطح دسترسی سمت سرور محدود شده است.`,
  },
  {
    slug: 'terms',
    title: 'شرایط استفاده',
    subtitle:
      'این متن نمونه است و برای نمایش ساختار یک صفحه شرایط استفاده در پنل مدیریت قابل ویرایش است.',
    meta_title: 'شرایط استفاده',
    meta_description:
      'شرایط استفاده از وب‌سایت همراهان امید: ماهیت نمایشی محتوا، کمک‌های شبیه‌سازی‌شده و مسئولیت‌پذیری.',
    body: `## ماهیت این وب‌سایت
این وب‌سایت یک نمونه‌کار طراحی و توسعه است. «همراهان امید» در این نسخه یک مؤسسه فعال نیست؛ پروژه‌ها، داستان‌ها، گزارش‌ها و اعداد نمایش‌داده‌شده نمونه هستند و نباید به‌عنوان اطلاعات واقعی یا مستند در نظر گرفته شوند.

## استفاده از محتوا
استفاده از مطالب این نمونه‌کار با ذکر منبع آزاد است. تغییر یا بازنشر گمراه‌کننده محتوا مجاز نیست.

## کمک‌های مالی
همه کمک‌ها در این نسخه شبیه‌سازی‌شده هستند: فقط یک رکورد آزمایشی با کد پیگیری ثبت می‌شود و هیچ مبلغی از حساب بانکی کسر نمی‌شود. هیچ داده کارت بانکی دریافت یا ذخیره نمی‌گردد.

## فرم‌های عمومی
ثبت درخواست داوطلبی، پیام تماس یا عضویت در خبرنامه به معنی ایجاد تعهد خدمت‌رسانی از سوی این نمونه‌کار نیست.

## مسئولیت‌پذیری
تلاش شده است ساختار و رفتار سایت مانند یک وب‌سایت واقعی باشد، اما این نسخه برای اهداف نمایشی ارائه می‌شود و هیچ ضمانتی برای کاربرد عملیاتی آن وجود ندارد.`,
  },
]

const DEFAULT_STORIES = [
  {
    slug: 'sample-school-year',
    title: 'آغاز سال تحصیلی؛ روایتی نمونه از یک روز مدرسه',
    excerpt:
      'این متن نمونه است و برای نمایش ساختار صفحه اخبار و مقالات نوشته شده است؛ نه گزارش یک رویداد واقعی.',
    category: 'خبر',
    author: 'تیم محتوا (نمونه)',
    body: `این یک مقاله نمونه است که برای نمایش ساختار بخش اخبار و مقالات در نمونه‌کار قرار داده شده است. متن آن درباره هیچ رویداد واقعی نیست.

## چرا این متن نمونه است
هدف از این صفحه نمایش چیدمان عنوان، تصویر شاخص، خلاصه و متن کامل است. مدیر مجموعه می‌تواند متن واقعی را از پنل مدیریت جایگزین کند.

## ساختار یک خبر
یک خبر معمولاً با یک پاراگراف خلاصه آغاز می‌شود، سپس جزئیات رویداد، افراد دخیل و نتیجه‌ای که به دست آمده را شرح می‌دهد. در پایان، گزارش به مسیر بعدی پروژه اشاره می‌کند.

## نکته درباره داده‌ها
هیچ آمار، شماره ثبت یا مجوز واقعی در این متن وجود ندارد. هر عددی که در بخش‌های دیگر سایت می‌بینید از پایگاه داده خوانده می‌شود و اگر خالی باشد، به‌جای عدد ساختگی پیام «اطلاعات در حال به‌روزرسانی است» نمایش داده می‌شود.

## جمع‌بندی
این مقاله بخشی از نمونه‌کار است و برای آزمایش ویرایشگر محتوا در پنل مدیریت قابل تغییر است.`,
  },
  {
    slug: 'sample-skills-workshop',
    title: 'کارگاه مهارت‌آموزی؛ الگوی نمونه برگزاری یک دوره',
    excerpt:
      'یک گزارش نمونه درباره چگونگی برگزاری دوره‌های مهارت‌آموزی؛ محتوای نمایشی برای نمونه‌کار.',
    category: 'گزارش',
    author: 'تیم محتوا (نمونه)',
    body: `این متن، الگویی نمونه از یک گزارش فعالیت است. هیچ دوره‌ای با این مشخصات برگزار نشده است.

## ساختار دوره
دوره‌های مهارت‌آموزی معمولاً با ارزیابی نیاز شرکت‌کنندگان آغاز می‌شوند و با آموزش عملی، تمرین و پیگیری ادامه پیدا می‌کنند.

## ثبت و پیگیری
در نمونه واقعی، هر دوره با فهرست شرکت‌کنندگان، حضور و غیاب و ارزیابی پایان دوره مستند می‌شود. این مستندات به تصمیم‌گیری درباره دوره بعدی کمک می‌کند.

## چرا این صفحه وجود دارد
این مقاله برای نمایش دسته‌بندی «گزارش» در بخش اخبار و مقالات استفاده می‌شود و توسط مدیر قابل ویرایش یا حذف است.`,
  },
  {
    slug: 'sample-sustainable-support',
    title: 'حمایت پایدار از کودکان؛ پنج نکته برای طراحی برنامه',
    excerpt:
      'یادداشتی نمونه درباره اصول طراحی برنامه‌های حمایتی؛ محتوای آموزشی نمایشی، نه توصیه تخصصی.',
    category: 'مقاله',
    author: 'تیم محتوا (نمونه)',
    body: `این یادداشت نمونه است و برای نمایش قالب مقالات تحلیلی در سایت قرار گرفته است.

## ۱. نیازسنجی پیش از اجرا
برنامه‌ای که بر پایه نیازسنجی محلی طراحی شود، احتمال تداوم بیشتری دارد.

## ۲. مشارکت خانواده
هر برنامه‌ای که خانواده را بیرون بگذارد، در بلندمدت شکننده است.

## ۳. مستندسازی
ثبت دقیق روند اجرا امکان یادگیری و اصلاح را فراهم می‌کند.

## ۴. سنجش نتیجه
شاخص‌های ساده و قابل اندازه‌گیری بهتر از آمار بزرگ و غیرقابل ردیابی هستند.

## ۵. شفافیت
انتشار گزارش‌های قابل فهم، اعتماد را می‌سازد. در این نمونه‌کار، اعداد شفافیت از پایگاه داده خوانده می‌شوند.

این متن نمونه است و جای توصیه تخصصی را نمی‌گیرد.`,
  },
  {
    slug: 'sample-return-to-school',
    title: 'بازگشت به مدرسه؛ یک روایت نمونه',
    excerpt:
      'روایتی نمونه برای نمایش دسته‌بندی «داستان» در بخش اخبار و مقالات؛ درباره هیچ فرد واقعی نیست.',
    category: 'داستان',
    author: 'تیم محتوا (نمونه)',
    body: `این داستان نمونه است و درباره هیچ فرد واقعی نیست. برای نمایش ساختار روایت در نمونه‌کار نوشته شده است.

## نقطه شروع
هر روایت با یک موقعیت مشخص آغاز می‌شود: یک خانواده، یک تصمیم و یک مانع.

## مسیر همراهی
در این الگوی نمونه، همراهی از شناسایی نیاز آغاز و با پیگیری مستمر ادامه پیدا می‌کند.

## نتیجه
نتیجه‌ای که در روایت‌های واقعی ثبت می‌شود باید مستند و با رضایت آگاهانه افراد باشد. در این نسخه نمایشی چنین چیزی وجود ندارد.

## یادداشت
برای انتشار روایت واقعی، مدیر مجموعه باید متن، تصویر و رضایت‌نامه را از پنل مدیریت ثبت کند.`,
  },
]

const DEFAULT_REPORTS = [
  {
    title: 'گزارش نمونه فعالیت — دوره اول',
    period: 'نمونه',
    summary:
      'این گزارش نمونه است و هیچ هزینه واقعی را مستند نمی‌کند. برای نمایش ساختار بخش گزارش‌های فعالیت در نمونه‌کار منتشر شده است.',
  },
  {
    title: 'گزارش نمونه فعالیت — دوره دوم',
    period: 'نمونه',
    summary:
      'این گزارش نمونه است و آمار یا هزینه‌کرد واقعی ندارد. مدیر مجموعه می‌تواند گزارش واقعی و فایل PDF را از پنل مدیریت جایگزین کند.',
  },
]

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@hamrahanomid.ir').toLowerCase()
    const adminPassword = process.env.ADMIN_PASSWORD || 'Hamrahan1404!'
    const existingAdmin = await client.query('SELECT id FROM users WHERE email = $1', [
      adminEmail,
    ])
    if (existingAdmin.rowCount === 0) {
      const hash = await bcrypt.hash(adminPassword, 10)
      await client.query(
        'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)',
        [adminEmail, hash, 'مدیر مجموعه', 'admin']
      )
    }

    // Defaults are merged under the stored value so a new default key reaches an
    // existing installation without overwriting anything an operator saved.
    await client.query(
      `INSERT INTO settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = $2::jsonb || settings.value`,
      ['site', JSON.stringify(DEFAULT_SITE)]
    )

    const activityCount = await client.query('SELECT count(*)::int AS c FROM activities')
    if (activityCount.rows[0].c === 0) {
      for (const activity of DEFAULT_ACTIVITIES) {
        await client.query(
          `INSERT INTO activities (slug, title, summary, body, icon, sort)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (slug) DO NOTHING`,
          [
            activity.slug,
            activity.title,
            activity.summary,
            activity.body,
            activity.icon,
            activity.sort,
          ]
        )
      }
    }

    // Seeded project rows carry the "نمونه" badge; rows created by an operator do not.
    await client.query(
      `UPDATE projects SET is_sample = true WHERE slug = ANY($1::text[])`,
      [DEFAULT_PROJECTS.map((project) => project.slug)]
    )

    const pageCount = await client.query('SELECT count(*)::int AS c FROM pages')
    if (pageCount.rows[0].c === 0) {
      for (const page of DEFAULT_PAGES) {
        await client.query(
          `INSERT INTO pages (slug, title, subtitle, body, meta_title, meta_description, sort)
           VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (slug) DO NOTHING`,
          [
            page.slug,
            page.title,
            page.subtitle,
            page.body,
            page.meta_title,
            page.meta_description,
            page.slug === 'privacy' ? 1 : 2,
          ]
        )
      }
    }

    const storyCount = await client.query('SELECT count(*)::int AS c FROM stories')
    if (storyCount.rows[0].c === 0) {
      for (const [index, story] of DEFAULT_STORIES.entries()) {
        await client.query(
          `INSERT INTO stories (slug, title, excerpt, body, author, category, published_at, is_published, is_sample)
           VALUES ($1,$2,$3,$4,$5,$6, now() - ($7 || ' days')::interval, true, true)
           ON CONFLICT (slug) DO NOTHING`,
          [
            story.slug,
            story.title,
            story.excerpt,
            story.body,
            story.author,
            story.category,
            index * 9,
          ]
        )
      }
    }

    const reportCount = await client.query('SELECT count(*)::int AS c FROM financial_reports')
    if (reportCount.rows[0].c === 0) {
      for (const [index, report] of DEFAULT_REPORTS.entries()) {
        await client.query(
          `INSERT INTO financial_reports (title, period, summary, published_at, is_sample)
           VALUES ($1,$2,$3, now() - ($4 || ' days')::interval, true)`,
          [report.title, report.period, report.summary, index * 30]
        )
      }
    }

    const projectCount = await client.query('SELECT count(*)::int AS c FROM projects')
    if (projectCount.rows[0].c === 0) {
      for (const project of DEFAULT_PROJECTS) {
        await client.query(
          `INSERT INTO projects (slug, title, summary, description, status, sort, is_sample)
           VALUES ($1, $2, $3, $4, $5, $6, true)
           ON CONFLICT (slug) DO NOTHING`,
          [
            project.slug,
            project.title,
            project.summary,
            project.description,
            project.status,
            project.sort,
          ]
        )
      }
    }

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function initDb() {
  const schema = fs.readFileSync(path.join(here, 'schema.sql'), 'utf8')
  await pool.query(schema)
  await seed()
}
