import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { Router } from 'express'
import multer from 'multer'
import bcrypt from 'bcryptjs'
import { query } from '../db.js'
import { adminOnly, canWrite, requireAuth, requireRole } from '../auth.js'
import { ROLES, auditMiddleware, logEvent } from '../audit.js'
import { rateLimit } from '../rate-limit.js'
import { toSlug } from '../lib/slug.js'

const router = Router()

// Every panel request needs a signed-in, active user; the access level is
// enforced here, on the server, for every mutation.
router.use(requireAuth)
// Generous ceiling for a real editing session (the panel loads several lists at
// once), but enough to blunt scripted scraping of the panel API.
router.use(rateLimit({ name: 'admin-api', limit: 300, windowMs: 60 * 1000 }))
router.use(auditMiddleware)
router.use((req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD') return next()
  return canWrite(req, res, next)
})

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
  'demo_note',
  'donation_notice',
]

// Persian titles are transliterated to a stable ASCII slug (server/src/lib/slug.js),
// so a published URL never changes between edits and stays readable for crawlers.
function slugify(value, prefix) {
  const slug = toSlug(value)
  if (slug.length >= 3) return slug
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
  upload.single('file')(req, res, async (error) => {
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
    const url = `/uploads/${req.file.filename}`
    try {
      const inserted = await query(
        `INSERT INTO media (url, filename, original_name, mime, size_bytes, uploaded_by)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, url, original_name, mime, size_bytes, created_at`,
        [
          url,
          req.file.filename,
          (req.file.originalname || '').slice(0, 200),
          req.file.mimetype || null,
          req.file.size || null,
          req.user?.id || null,
        ]
      )
      res.status(201).json({ url, media: inserted.rows[0] })
    } catch {
      res.status(201).json({ url })
    }
  })
})

router.get('/stats', async (req, res, next) => {
  try {
    const canSeePersonalData = ['admin', 'editor'].includes(req.user?.role)
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
          COALESCE(SUM(amount) FILTER (WHERE status = 'paid' AND simulated = false), 0)::bigint AS paid_total,
          count(*) FILTER (WHERE status = 'paid' AND simulated = false)::int AS paid_count,
          count(*) FILTER (WHERE status = 'pending')::int AS pending_count,
          count(*) FILTER (WHERE status = 'paid' AND simulated = true)::int AS simulated_count
        FROM donations
      `),
      query(`
        SELECT d.tracking_code, d.amount, d.status, d.simulated, d.created_at, d.is_anonymous, p.title AS project_title
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
      recentDonations: canSeePersonalData ? recentDonations.rows : [],
      recentVolunteers: canSeePersonalData ? recentVolunteers.rows : [],
    })
  } catch (error) {
    next(error)
  }
})

/* ------------------------------- projects ------------------------------- */

router.get('/projects', async (_req, res, next) => {
  try {
    const result = await query(`
      SELECT p.*,
        COALESCE((SELECT SUM(d.amount) FROM donations d WHERE d.project_id = p.id AND d.status = 'paid' AND d.simulated = false), 0)::bigint AS raised_amount,
        COALESCE((SELECT SUM(d.amount) FROM donations d WHERE d.project_id = p.id AND d.status = 'paid' AND d.simulated = true), 0)::bigint AS simulated_amount
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
      `INSERT INTO projects (slug, title, summary, description, image_url, target_amount, location, status, is_active, sort, is_sample, meta_description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
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
        toBool(req.body?.is_sample, false),
        clean(req.body?.meta_description, 300) || null,
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
    const current = await query('SELECT slug FROM projects WHERE id = $1', [id])
    if (current.rowCount === 0) return res.status(404).json({ error: 'پروژه پیدا نشد.' })
    // The slug is the public URL: editing the title must not change it.
    const slug = await uniqueSlug('projects', req.body?.slug || current.rows[0].slug, 'project', id)
    const result = await query(
      `UPDATE projects SET slug=$1, title=$2, summary=$3, description=$4, image_url=$5,
        target_amount=$6, location=$7, status=$8, is_active=$9, sort=$10, is_sample=$11, meta_description=$12
       WHERE id=$13 RETURNING *`,
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
        toBool(req.body?.is_sample, false),
        clean(req.body?.meta_description, 300) || null,
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
    const current = await query('SELECT slug FROM activities WHERE id = $1', [id])
    if (current.rowCount === 0) return res.status(404).json({ error: 'حوزه فعالیت پیدا نشد.' })
    const slug = await uniqueSlug('activities', req.body?.slug || current.rows[0].slug, 'activity', id)
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
    category: clean(body?.category, 40) || 'خبر',
    published_at: clean(body?.published_at, 40) || new Date().toISOString(),
    is_published: toBool(body?.is_published, isUpdate ? false : false),
    is_sample: toBool(body?.is_sample, false),
    meta_description: clean(body?.meta_description, 300) || null,
  }
}

router.post('/stories', async (req, res, next) => {
  try {
    const payload = storyPayload(req.body)
    if (payload.title.length < 3) return res.status(400).json({ error: 'عنوان مقاله را وارد کنید.' })
    const slug = await uniqueSlug('stories', req.body?.slug || payload.title, 'story')
    const result = await query(
      `INSERT INTO stories (slug, title, excerpt, body, image_url, author, category, published_at, is_published, is_sample, meta_description)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        slug,
        payload.title,
        payload.excerpt,
        payload.body,
        payload.image_url,
        payload.author,
        payload.category,
        payload.published_at,
        payload.is_published,
        payload.is_sample,
        payload.meta_description,
      ]
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
    if (payload.title.length < 3) return res.status(400).json({ error: 'عنوان مقاله را وارد کنید.' })
    const current = await query('SELECT slug FROM stories WHERE id = $1', [id])
    if (current.rowCount === 0) return res.status(404).json({ error: 'مقاله پیدا نشد.' })
    const slug = await uniqueSlug('stories', req.body?.slug || current.rows[0].slug, 'story', id)
    const result = await query(
      `UPDATE stories SET slug=$1, title=$2, excerpt=$3, body=$4, image_url=$5, author=$6,
        category=$7, published_at=$8, is_published=$9, is_sample=$10, meta_description=$11
       WHERE id=$12 RETURNING *`,
      [
        slug,
        payload.title,
        payload.excerpt,
        payload.body,
        payload.image_url,
        payload.author,
        payload.category,
        payload.published_at,
        payload.is_published,
        payload.is_sample,
        payload.meta_description,
        id,
      ]
    )
    if (result.rowCount === 0) return res.status(404).json({ error: 'مقاله پیدا نشد.' })
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

// Personal data of donors and volunteers is not readable by the read-only
// "viewer" role; it needs an editor or an admin.
const piiReaders = requireRole('admin', 'editor')

router.get('/donations', piiReaders, async (req, res, next) => {
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
              d.note, d.status, d.simulated, d.gateway, d.gateway_reference, d.created_at, d.paid_at,
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

router.get('/volunteers', piiReaders, async (_req, res, next) => {
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

router.get('/messages', piiReaders, async (_req, res, next) => {
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

router.get('/subscribers', piiReaders, async (_req, res, next) => {
  try {
    const result = await query('SELECT id, email, created_at FROM newsletter_subscribers ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

/* ---------------------------------- pages ---------------------------------- */

router.get('/pages', async (_req, res, next) => {
  try {
    const result = await query('SELECT * FROM pages ORDER BY sort, id')
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

function pagePayload(body) {
  return {
    title: clean(body?.title, 160),
    subtitle: clean(body?.subtitle, 400),
    body: clean(body?.body, 30000),
    meta_title: clean(body?.meta_title, 160) || null,
    meta_description: clean(body?.meta_description, 300) || null,
    is_published: toBool(body?.is_published),
    sort: Number(body?.sort || 0),
  }
}

router.post('/pages', async (req, res, next) => {
  try {
    const payload = pagePayload(req.body)
    if (payload.title.length < 3) return res.status(400).json({ error: 'عنوان صفحه را وارد کنید.' })
    const slug = await uniqueSlug('pages', req.body?.slug || payload.title, 'page')
    const result = await query(
      `INSERT INTO pages (slug, title, subtitle, body, meta_title, meta_description, is_published, sort)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        slug,
        payload.title,
        payload.subtitle,
        payload.body,
        payload.meta_title,
        payload.meta_description,
        payload.is_published,
        payload.sort,
      ]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

router.put('/pages/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const payload = pagePayload(req.body)
    if (payload.title.length < 3) return res.status(400).json({ error: 'عنوان صفحه را وارد کنید.' })
    const current = await query('SELECT slug FROM pages WHERE id = $1', [id])
    if (current.rowCount === 0) return res.status(404).json({ error: 'صفحه پیدا نشد.' })
    // The slug addresses a public route, so only a new page may choose it.
    const slug = await uniqueSlug('pages', req.body?.slug || current.rows[0].slug, 'page', id)
    const result = await query(
      `UPDATE pages SET slug=$1, title=$2, subtitle=$3, body=$4, meta_title=$5,
        meta_description=$6, is_published=$7, sort=$8, updated_at=now()
       WHERE id=$9 RETURNING *`,
      [
        slug,
        payload.title,
        payload.subtitle,
        payload.body,
        payload.meta_title,
        payload.meta_description,
        payload.is_published,
        payload.sort,
        id,
      ]
    )
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

router.delete('/pages/:id', async (req, res, next) => {
  try {
    await query('DELETE FROM pages WHERE id = $1', [Number(req.params.id)])
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

/* ---------------------------------- media ---------------------------------- */

router.get('/media', async (req, res, next) => {
  try {
    const kind = clean(req.query.kind, 20)
    const params = []
    let where = ''
    if (kind === 'image') {
      where = "WHERE mime LIKE 'image/%'"
    } else if (kind === 'document') {
      where = "WHERE mime NOT LIKE 'image/%'"
    }
    const result = await query(
      `SELECT m.id, m.url, m.filename, m.original_name, m.mime, m.size_bytes, m.created_at,
              u.email AS uploaded_by
       FROM media m LEFT JOIN users u ON u.id = m.uploaded_by
       ${where}
       ORDER BY m.created_at DESC LIMIT 300`,
      params
    )
    const totals = await query(
      `SELECT count(*)::int AS files, COALESCE(SUM(size_bytes), 0)::bigint AS bytes FROM media`
    )
    res.json({ items: result.rows, totals: totals.rows[0] })
  } catch (error) {
    next(error)
  }
})

router.delete('/media/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const found = await query('SELECT url, filename FROM media WHERE id = $1', [id])
    if (found.rowCount === 0) return res.status(404).json({ error: 'فایل پیدا نشد.' })
    await query('DELETE FROM media WHERE id = $1', [id])
    // Only files inside the upload directory are removable.
    const target = path.join(UPLOAD_DIR, path.basename(found.rows[0].filename))
    fs.promises.unlink(target).catch(() => {})
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

/* ---------------------------------- users ---------------------------------- */

router.get('/users', adminOnly, async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT id, email, name, role, is_active, created_at, last_login_at
       FROM users ORDER BY created_at`
    )
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)

router.post('/users', adminOnly, async (req, res, next) => {
  try {
    const email = clean(req.body?.email, 160).toLowerCase()
    const name = clean(req.body?.name, 120) || 'کاربر'
    const role = clean(req.body?.role, 20) || 'editor'
    const password = String(req.body?.password || '')
    if (!isEmail(email)) return res.status(400).json({ error: 'ایمیل معتبر نیست.' })
    if (!ROLES.includes(role)) return res.status(400).json({ error: 'سطح دسترسی معتبر نیست.' })
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'رمز عبور باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد.' })
    }
    const exists = await query('SELECT id FROM users WHERE email = $1', [email])
    if (exists.rowCount > 0) {
      return res.status(409).json({ error: 'کاربری با این ایمیل قبلاً ثبت شده است.' })
    }
    const hash = await bcrypt.hash(password, 10)
    const result = await query(
      `INSERT INTO users (email, password_hash, name, role) VALUES ($1,$2,$3,$4)
       RETURNING id, email, name, role, is_active, created_at`,
      [email, hash, name, role]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

router.put('/users/:id', adminOnly, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const target = await query('SELECT * FROM users WHERE id = $1', [id])
    if (target.rowCount === 0) return res.status(404).json({ error: 'کاربر پیدا نشد.' })
    const current = target.rows[0]
    const role = clean(req.body?.role, 20) || current.role
    const isActive = toBool(req.body?.is_active, current.is_active)
    const name = clean(req.body?.name, 120) || current.name
    if (!ROLES.includes(role)) return res.status(400).json({ error: 'سطح دسترسی معتبر نیست.' })

    if (id === req.user.id && (!isActive || role !== 'admin')) {
      return res.status(400).json({
        error: 'نمی‌توانید دسترسی مدیر حساب خودتان را حذف کنید.',
      })
    }

    const admins = await query(
      "SELECT count(*)::int AS c FROM users WHERE role = 'admin' AND is_active = true AND id <> $1",
      [id]
    )
    if (current.role === 'admin' && (role !== 'admin' || !isActive) && admins.rows[0].c === 0) {
      return res.status(400).json({ error: 'دست‌کم یک مدیر فعال باید باقی بماند.' })
    }

    const result = await query(
      `UPDATE users SET name=$1, role=$2, is_active=$3 WHERE id=$4
       RETURNING id, email, name, role, is_active, created_at, last_login_at`,
      [name, role, isActive, id]
    )
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

router.post('/users/:id/password', adminOnly, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const password = String(req.body?.password || '')
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'رمز عبور باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد.' })
    }
    const hash = await bcrypt.hash(password, 10)
    const result = await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, email',
      [hash, id]
    )
    if (result.rowCount === 0) return res.status(404).json({ error: 'کاربر پیدا نشد.' })
    await logEvent({ req, action: 'password_reset', entity: 'users', entityId: id })
    res.json({ message: 'رمز عبور کاربر بازنشانی شد.' })
  } catch (error) {
    next(error)
  }
})

router.delete('/users/:id', adminOnly, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (id === req.user.id) {
      return res.status(400).json({ error: 'حساب خودتان را نمی‌توانید حذف کنید.' })
    }
    const target = await query('SELECT role FROM users WHERE id = $1', [id])
    if (target.rowCount === 0) return res.status(404).json({ error: 'کاربر پیدا نشد.' })
    if (target.rows[0].role === 'admin') {
      const admins = await query(
        "SELECT count(*)::int AS c FROM users WHERE role = 'admin' AND is_active = true AND id <> $1",
        [id]
      )
      if (admins.rows[0].c === 0) {
        return res.status(400).json({ error: 'دست‌کم یک مدیر فعال باید باقی بماند.' })
      }
    }
    await query('DELETE FROM users WHERE id = $1', [id])
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})

/* ------------------------------- audit trail ------------------------------- */

router.get('/audit', adminOnly, async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit || 100), 500)
    const action = clean(req.query.action, 40)
    const params = []
    let where = ''
    if (action) {
      params.push(action)
      where = 'WHERE action = $1'
    }
    const result = await query(
      `SELECT id, user_email, action, entity, entity_id, detail, ip, created_at
       FROM audit_log ${where} ORDER BY created_at DESC LIMIT ${limit}`,
      params
    )
    const actions = await query(
      'SELECT action, count(*)::int AS c FROM audit_log GROUP BY action ORDER BY c DESC'
    )
    res.json({ items: result.rows, actions: actions.rows })
  } catch (error) {
    next(error)
  }
})

/* --------------------------------- backup ---------------------------------- */

router.get('/backup', adminOnly, async (_req, res, next) => {
  try {
    const [settings, activities, projects, stories, pages, reports, donations, volunteers, messages, subscribers] =
      await Promise.all([
        query('SELECT * FROM settings'),
        query('SELECT * FROM activities ORDER BY id'),
        query('SELECT * FROM projects ORDER BY id'),
        query('SELECT * FROM stories ORDER BY id'),
        query('SELECT * FROM pages ORDER BY id'),
        query('SELECT * FROM financial_reports ORDER BY id'),
        query('SELECT * FROM donations ORDER BY id'),
        query('SELECT * FROM volunteers ORDER BY id'),
        query('SELECT * FROM contact_messages ORDER BY id'),
        query('SELECT * FROM newsletter_subscribers ORDER BY id'),
      ])
    const payload = {
      generated_at: new Date().toISOString(),
      format: 'hamrahan-omid-backup/v1',
      note: 'This export contains contact details. Store it privately. User passwords are never included.',
      tables: {
        settings: settings.rows,
        activities: activities.rows,
        projects: projects.rows,
        stories: stories.rows,
        pages: pages.rows,
        financial_reports: reports.rows,
        donations: donations.rows,
        volunteers: volunteers.rows,
        contact_messages: messages.rows,
        newsletter_subscribers: subscribers.rows,
      },
    }
    const stamp = new Date().toISOString().slice(0, 10)
    res.setHeader('Content-Disposition', `attachment; filename="hamrahan-backup-${stamp}.json"`)
    res.type('application/json').send(JSON.stringify(payload, null, 2))
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

router.put('/settings', adminOnly, async (req, res, next) => {
  try {
    const incoming = req.body || {}
    const next = {}
    for (const key of SETTINGS_TEXT_KEYS) {
      if (key in incoming) next[key] = clean(incoming[key], 4000)
    }
    if ('demo_mode' in incoming) {
      next.demo_mode = toBool(incoming.demo_mode, true)
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
