import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { Router } from 'express'
import multer from 'multer'
import { query } from '../db.js'
import { requireAdmin } from '../auth.js'

const router = Router()
router.use(requireAdmin)

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/app/uploads'
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const clean = (value, max = 500) => String(value ?? '').trim().slice(0, max)
const toAmount = (value) => {
  if (value === null || value === undefined || value === '') return null
  const digits = String(value).replace(/[^\d]/g, '')
  if (!digits) return null
  const amount = Number(digits)
  return Number.isFinite(amount) ? amount : null
}
const toBool = (value, fallback = true) =>
  value === undefined ? fallback : value === true || value === 'true' || value === 1 || value === '1'

const SETTINGS_TEXT_KEYS = [
  'site_name',
  'site_subtitle',
  'hero_title',
  'hero_text',
  'hero_note',
  'hero_image',
  'about_image',
  'about_title',
  'about_text',
  'mission_title',
  'mission_text',
  'phone',
  'email',
  'address',
  'instagram',
  'telegram',
  'whatsapp',
  'footer_about',
  'legal_owner',
]

function slugify(value, prefix) {
  const normalized = String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-\u0600-\u06FF]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  const latin = normalized.replace(/[^a-z0-9-]/g, '')
  if (latin.length >= 3) return latin
  return `${prefix}-${crypto.randomBytes(3).toString('hex')}`
}

async function uniqueSlug(table, desired, prefix, currentId) {
  const base = slugify(desired, prefix)
  let candidate = base
  for (let i = 2; i < 50; i += 1) {
    const existing = await query(`SELECT id FROM ${table} WHERE slug = $1`, [candidate])
    if (existing.rowCount === 0 || existing.rows[0].id === currentId) return candidate
    candidate = `${base}-${i}`
  }
  return `${base}-${crypto.randomBytes(3).toString('hex')}`
}

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.bin'
      cb(null, `${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}${ext}`)
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.pdf']
    const ext = path.extname(file.originalname).toLowerCase()
    if (!allowed.includes(ext)) {
      return cb(new Error('فقط تصویر (JPG، PNG، WEBP) یا فایل PDF مجاز است.'))
    }
    cb(null, true)
  },
})

router.post('/upload', (req, res) => {
  upload.single('file')(req, res, (error) => {
    if (error) {
      const message =
        error.code === 'LIMIT_FILE_SIZE'
          ? 'حجم فایل بیشتر از ۸ مگابایت است.'
          : error.message || 'بارگذاری فایل ناموفق بود.'
      return res.status(400).json({ error: message })
    }
    if (!req.file) {
      return res.status(400).json({ error: 'فایلی انتخاب نشده است.' })
    }
    res.status(201).json({ url: `/uploads/${req.file.filename}` })
  })
})

router.get('/stats', async (_req, res, next) => {
  try {
    const [counts, donations, recentDonations, recentVolunteers] = await Promise.all([
      query(`
        SELECT
          (SELECT count(*)::int FROM projects) AS projects,
          (SELECT count(*)::int FROM stories) AS stories,
          (SELECT count(*)::int FROM activities) AS activities,
          (SELECT count(*)::int FROM volunteers WHERE status = 'new') AS new_volunteers,
          (SELECT count(*)::int FROM contact_messages WHERE is_read = false) AS unread_messages,
          (SELECT count(*)::int FROM newsletter_subscribers) AS subscribers
      `),
      query(`
        SELECT
          COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0)::bigint AS paid_total,
          count(*) FILTER (WHERE status = 'paid')::int AS paid_count,
          count(*) FILTER (WHERE status = 'pending')::int AS pending_count
        FROM donations
      `),
      query(`
        SELECT d.tracking_code, d.amount, d.status, d.created_at, d.is_anonymous, p.title AS project_title
        FROM donations d LEFT JOIN projects p ON p.id = d.project_id
        ORDER BY d.created_at DESC LIMIT 6
      `),
      query(`
        SELECT id, full_name, city, created_at FROM volunteers ORDER BY created_at DESC LIMIT 5
      `),
    ])
    res.json({
      counts: counts.rows[0],
      donations: {
        paid_total: Number(donations.rows[0].paid_total || 0),
        paid_count: donations.rows[0].paid_count,
        pending_count: donations.rows[0].pending_count,
      },
      recentDonations: recentDonations.rows,
      recentVolunteers: recentVolunteers.rows,
    })
  } catch (error) {
    next(error)
  }
})

/* ------------------------------- projects ------------------------------- */

router.get('/projects', async (_req, res, next) => {
  try {
    const result = await query(`
      SELECT p.*, COALESCE((SELECT SUM(d.amount) FROM donations d WHERE d.project_id = p.id AND d.status = 'paid'), 0)::bigint AS raised_amount
      FROM projects p ORDER BY p.sort, p.created_at DESC
    `)
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

router.post('/projects', async (req, res, next) => {
  try {
    const title = clean(req.body?.title, 160)
    if (title.length < 3) {
      return res.status(400).json({ error: 'عنوان پروژه را وارد کنید.' })
    }
    const slug = await uniqueSlug('projects', req.body?.slug || title, 'project')
    const result = await query(
      `INSERT INTO projects (slug, title, summary, description, image_url, target_amount, location, status, is_active, sort)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        slug,
        title,
        clean(req.body?.summary, 400),
        clean(req.body?.description, 8000),
        clean(req.body?.image_url, 500) || null,
        toAmount(req.body?.target_amount),
        clean(req.body?.location, 120) || null,
        clean(req.body?.status, 20) || 'active',
        toBool(req.body?.is_active),
        Number(req.body?.sort || 0),
      ]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

router.put('/projects/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const title = clean(req.body?.title, 160)
    if (title.length < 3) {
      return res.status(400).json({ error: 'عنوان پروژه را وارد کنید.' })
    }
    const slug = await uniqueSlug('projects', req.body?.slug || title, 'project', id)
    const result = await query(
      `UPDATE projects SET slug=$1, title=$2, summary=$3, description=$4, image_url=$5,
        target_amount=$6, location=$7, status=$8, is_active=$9, sort=$10
       WHERE id=$11 RETURNING *`,
      [
        slug,
        title,
        clean(req.body?.summary, 400),
        clean(req.body?.description, 8000),
        clean(req.body?.image_url, 500) || null,
        toAmount(req.body?.target_amount),
        clean(req.body?.location, 120) || null,
        clean(req.body?.status, 20) || 'active',
        toBool(req.body?.is_active),
        Number(req.body?.sort || 0),
        id,
      ]
    )
    if (result.rowCount === 0) return res.status(404).json({ error: 'پروژه پیدا نشد.' })
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

router.delete('/projects/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM projects WHERE id = $1', [Number(req.params.id)])
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

/* ------------------------------ activities ------------------------------ */

router.get('/activities', async (_req, res, next) => {
  try {
    const result = await query('SELECT * FROM activities ORDER BY sort, id')
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

router.post('/activities', async (req, res, next) => {
  try {
    const title = clean(req.body?.title, 140)
    if (title.length < 3) return res.status(400).json({ error: 'عنوان حوزه فعالیت را وارد کنید.' })
    const slug = await uniqueSlug('activities', req.body?.slug || title, 'activity')
    const result = await query(
      `INSERT INTO activities (slug, title, summary, body, icon, image_url, sort, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        slug,
        title,
        clean(req.body?.summary, 400),
        clean(req.body?.body, 8000),
        clean(req.body?.icon, 30) || 'heart',
        clean(req.body?.image_url, 500) || null,
        Number(req.body?.sort || 0),
        toBool(req.body?.is_active),
      ]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

router.put('/activities/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const title = clean(req.body?.title, 140)
    if (title.length < 3) return res.status(400).json({ error: 'عنوان حوزه فعالیت را وارد کنید.' })
    const slug = await uniqueSlug('activities', req.body?.slug || title, 'activity', id)
    const result = await query(
      `UPDATE activities SET slug=$1, title=$2, summary=$3, body=$4, icon=$5, image_url=$6, sort=$7, is_active=$8
       WHERE id=$9 RETURNING *`,
      [
        slug,
        title,
        clean(req.body?.summary, 400),
        clean(req.body?.body, 8000),
        clean(req.body?.icon, 30) || 'heart',
        clean(req.body?.image_url, 500) || null,
        Number(req.body?.sort || 0),
        toBool(req.body?.is_active),
        id,
      ]
    )
    if (result.rowCount === 0) return res.status(404).json({ error: 'حوزه فعالیت پیدا نشد.' })
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

router.delete('/activities/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM activities WHERE id = $1', [Number(req.params.id)])
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

/* -------------------------------- stories -------------------------------- */

router.get('/stories', async (_req, res, next) => {
  try {
    const result = await query('SELECT * FROM stories ORDER BY published_at DESC')
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

function storyPayload(body, isUpdate = false) {
  return {
    title: clean(body?.title, 180),
    excerpt: clean(body?.excerpt, 500),
    body: clean(body?.body, 20000),
    image_url: clean(body?.image_url, 500) || null,
    author: clean(body?.author, 120) || null,
    published_at: clean(body?.published_at, 40) || new Date().toISOString(),
    is_published: toBool(body?.is_published, isUpdate ? false : false),
  }
}

router.post('/stories', async (req, res, next) => {
  try {
    const payload = storyPayload(req.body)
    if (payload.title.length < 3) return res.status(400).json({ error: 'عنوان داستان را وارد کنید.' })
    const slug = await uniqueSlug('stories', req.body?.slug || payload.title, 'story')
    const result = await query(
      `INSERT INTO stories (slug, title, excerpt, body, image_url, author, published_at, is_published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [slug, payload.title, payload.excerpt, payload.body, payload.image_url, payload.author, payload.published_at, payload.is_published]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

router.put('/stories/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const payload = storyPayload(req.body, true)
    if (payload.title.length < 3) return res.status(400).json({ error: 'عنوان داستان را وارد کنید.' })
    const slug = await uniqueSlug('stories', req.body?.slug || payload.title, 'story', id)
    const result = await query(
      `UPDATE stories SET slug=$1, title=$2, excerpt=$3, body=$4, image_url=$5, author=$6, published_at=$7, is_published=$8
       WHERE id=$9 RETURNING *`,
      [slug, payload.title, payload.excerpt, payload.body, payload.image_url, payload.author, payload.published_at, payload.is_published, id]
    )
    if (result.rowCount === 0) return res.status(404).json({ error: 'داستان پیدا نشد.' })
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

router.delete('/stories/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM stories WHERE id = $1', [Number(req.params.id)])
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

/* ---------------------------- financial reports ---------------------------- */

router.get('/reports', async (_req, res, next) => {
  try {
    const result = await query('SELECT * FROM financial_reports ORDER BY published_at DESC')
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

router.post('/reports', async (req, res, next) => {
  try {
    const title = clean(req.body?.title, 180)
    if (title.length < 3) return res.status(400).json({ error: 'عنوان گزارش را وارد کنید.' })
    const result = await query(
      `INSERT INTO financial_reports (title, period, summary, amount_spent, file_url, published_at)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [
        title,
        clean(req.body?.period, 80) || null,
        clean(req.body?.summary, 4000),
        toAmount(req.body?.amount_spent),
        clean(req.body?.file_url, 500) || null,
        clean(req.body?.published_at, 40) || new Date().toISOString(),
      ]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

router.put('/reports/:id', async (req, res, next) => {
  try {
    const title = clean(req.body?.title, 180)
    if (title.length < 3) return res.status(400).json({ error: 'عنوان گزارش را وارد کنید.' })
    const result = await query(
      `UPDATE financial_reports SET title=$1, period=$2, summary=$3, amount_spent=$4, file_url=$5, published_at=$6
       WHERE id=$7 RETURNING *`,
      [
        title,
        clean(req.body?.period, 80) || null,
        clean(req.body?.summary, 4000),
        toAmount(req.body?.amount_spent),
        clean(req.body?.file_url, 500) || null,
        clean(req.body?.published_at, 40) || new Date().toISOString(),
        Number(req.params.id),
      ]
    )
    if (result.rowCount === 0) return res.status(404).json({ error: 'گزارش پیدا نشد.' })
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

router.delete('/reports/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM financial_reports WHERE id = $1', [Number(req.params.id)])
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

/* --------------------------- incoming requests --------------------------- */

router.get('/donations', async (req, res, next) => {
  try {
    const status = clean(req.query.status, 20)
    const params = []
    let where = ''
    if (['pending', 'paid', 'failed', 'canceled'].includes(status)) {
      params.push(status)
      where = 'WHERE d.status = $1'
    }
    const result = await query(
      `SELECT d.id, d.tracking_code, d.amount, d.donor_name, d.donor_phone, d.is_anonymous,
              d.note, d.status, d.gateway, d.gateway_reference, d.created_at, d.paid_at,
              p.title AS project_title
       FROM donations d LEFT JOIN projects p ON p.id = d.project_id
       ${where}
       ORDER BY d.created_at DESC LIMIT 300`,
      params
    )
    const totals = await query(`
      SELECT status, COALESCE(SUM(amount), 0)::bigint AS total, count(*)::int AS count
      FROM donations GROUP BY status
    `)
    res.json({ items: result.rows, totals: totals.rows })
  } catch (error) {
    next(error)
  }
})

router.get('/volunteers', async (_req, res, next) => {
  try {
    const result = await query('SELECT * FROM volunteers ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

router.patch('/volunteers/:id', async (req, res, next) => {
  try {
    const status = clean(req.body?.status, 20)
    if (!['new', 'contacted', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'وضعیت انتخاب‌شده معتبر نیست.' })
    }
    await query('UPDATE volunteers SET status = $1 WHERE id = $2', [status, Number(req.params.id)])
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

router.delete('/volunteers/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM volunteers WHERE id = $1', [Number(req.params.id)])
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

router.get('/messages', async (_req, res, next) => {
  try {
    const result = await query('SELECT * FROM contact_messages ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

router.patch('/messages/:id', async (req, res, next) => {
  try {
    await query('UPDATE contact_messages SET is_read = $1 WHERE id = $2', [
      Boolean(req.body?.is_read),
      Number(req.params.id),
    ])
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

router.delete('/messages/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM contact_messages WHERE id = $1', [Number(req.params.id)])
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

router.get('/subscribers', async (_req, res, next) => {
  try {
    const result = await query('SELECT id, email, created_at FROM newsletter_subscribers ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

/* -------------------------------- settings -------------------------------- */

router.get('/settings', async (_req, res, next) => {
  try {
    const result = await query("SELECT value FROM settings WHERE key = 'site'")
    res.json(result.rows[0]?.value || {})
  } catch (error) {
    next(error)
  }
})

router.put('/settings', async (req, res, next) => {
  try {
    const incoming = req.body || {}
    const next = {}
    for (const key of SETTINGS_TEXT_KEYS) {
      if (key in incoming) next[key] = clean(incoming[key], 4000)
    }
    if ('people_supported' in incoming) {
      next.people_supported = toAmount(incoming.people_supported)
    }
    if ('last_updated' in incoming) {
      next.last_updated = clean(incoming.last_updated, 40) || null
    }

    const result = await query(
      `UPDATE settings SET value = value || $1::jsonb, updated_at = now()
       WHERE key = 'site' RETURNING value`,
      [JSON.stringify(next)]
    )
    res.json(result.rows[0]?.value || {})
  } catch (error) {
    next(error)
  }
})

export default router
