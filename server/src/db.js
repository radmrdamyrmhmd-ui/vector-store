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

    await client.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
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

    const projectCount = await client.query('SELECT count(*)::int AS c FROM projects')
    if (projectCount.rows[0].c === 0) {
      for (const project of DEFAULT_PROJECTS) {
        await client.query(
          `INSERT INTO projects (slug, title, summary, description, status, sort)
           VALUES ($1, $2, $3, $4, $5, $6)
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
