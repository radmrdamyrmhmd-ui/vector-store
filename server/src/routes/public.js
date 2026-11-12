import { Router } from 'express'
import crypto from 'node:crypto'
import { query } from '../db.js'
import {
  createPayment,
  gatewayConfig,
  publicBaseUrl,
  verifyPayment,
} from '../payments.js'

const router = Router()

const INTERESTS = [
  'آموزش',
  'فعالیت اجتماعی',
  'تولید محتوا',
  'طراحی و برنامه‌نویسی',
  'پشتیبانی اجرایی',
  'کمک‌های مردمی',
]

const clean = (value, max = 500) => String(value ?? '').trim().slice(0, max)
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
const isPhone = (value) => /^0?9\d{9}$/.test(value.replace(/[\s-]/g, ''))
const normalizePhone = (value) => {
  const digits = value.replace(/[^\d]/g, '')
  return digits.startsWith('98') ? `0${digits.slice(2)}` : digits.startsWith('9') ? `0${digits}` : digits
}
const toAmount = (value) => {
  const digits = String(value ?? '').replace(/[^\d]/g, '')
  const amount = Number(digits)
  return Number.isFinite(amount) ? amount : 0
}

async function getSettings() {
  const result = await query("SELECT value FROM settings WHERE key = 'site'")
  return result.rows[0]?.value || {}
}

const PROJECT_FIELDS = `
  p.id, p.slug, p.title, p.summary, p.description, p.image_url, p.target_amount,
  p.location, p.status, p.created_at,
  COALESCE((SELECT SUM(d.amount) FROM donations d WHERE d.project_id = p.id AND d.status = 'paid'), 0)::bigint AS raised_amount,
  (SELECT count(*) FROM donations d WHERE d.project_id = p.id AND d.status = 'paid')::int AS donors_count
`

async function impact() {
  const settings = await getSettings()
  const totals = await query(`
    SELECT
      COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0)::bigint AS total_received,
      count(*) FILTER (WHERE status = 'paid')::int AS paid_donations,
      max(paid_at) FILTER (WHERE status = 'paid') AS last_paid_at
    FROM donations
  `)
  const projects = await query(`
    SELECT
      count(*) FILTER (WHERE status = 'active')::int AS active,
      count(*) FILTER (WHERE status = 'completed')::int AS completed
    FROM projects WHERE is_active = true
  `)
  return {
    total_received: Number(totals.rows[0].total_received || 0),
    paid_donations: totals.rows[0].paid_donations || 0,
    last_paid_at: totals.rows[0].last_paid_at,
    active_projects: projects.rows[0].active || 0,
    completed_projects: projects.rows[0].completed || 0,
    people_supported:
      settings.people_supported === null || settings.people_supported === undefined
        ? null
        : Number(settings.people_supported),
    last_updated: settings.last_updated || null,
  }
}

router.get('/health', async (_req, res) => {
  try {
    await query('SELECT 1')
    res.json({ ok: true })
  } catch {
    res.status(503).json({ ok: false })
  }
})

router.get('/site', async (_req, res, next) => {
  try {
    const [settings, activities, projects, stories, stats] = await Promise.all([
      getSettings(),
      query(
        'SELECT id, slug, title, summary, icon, image_url FROM activities WHERE is_active = true ORDER BY sort, id'
      ),
      query(
        `SELECT ${PROJECT_FIELDS} FROM projects p WHERE p.is_active = true ORDER BY p.sort, p.created_at DESC LIMIT 3`
      ),
      query(
        `SELECT id, slug, title, excerpt, image_url, published_at FROM stories
         WHERE is_published = true ORDER BY published_at DESC LIMIT 3`
      ),
      impact(),
    ])
    res.json({
      settings,
      activities: activities.rows,
      projects: projects.rows,
      stories: stories.rows,
      impact: stats,
      payment: { online: gatewayConfig().enabled },
      volunteerInterests: INTERESTS,
    })
  } catch (error) {
    next(error)
  }
})

router.get('/activities', async (_req, res, next) => {
  try {
    const result = await query(
      'SELECT id, slug, title, summary, body, icon, image_url FROM activities WHERE is_active = true ORDER BY sort, id'
    )
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

router.get('/projects', async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT ${PROJECT_FIELDS} FROM projects p WHERE p.is_active = true ORDER BY p.sort, p.created_at DESC`
    )
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

router.get('/projects/:slug', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT ${PROJECT_FIELDS} FROM projects p WHERE p.slug = $1 AND p.is_active = true`,
      [req.params.slug]
    )
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'پروژه موردنظر پیدا نشد.' })
    }
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

router.get('/stories', async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT id, slug, title, excerpt, image_url, author, published_at
       FROM stories WHERE is_published = true ORDER BY published_at DESC`
    )
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

router.get('/stories/:slug', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, slug, title, excerpt, body, image_url, author, published_at
       FROM stories WHERE slug = $1 AND is_published = true`,
      [req.params.slug]
    )
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'داستان موردنظر پیدا نشد.' })
    }
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

router.get('/transparency', async (_req, res, next) => {
  try {
    const [stats, reports] = await Promise.all([
      impact(),
      query(
        `SELECT id, title, period, summary, amount_spent, file_url, published_at
         FROM financial_reports ORDER BY published_at DESC`
      ),
    ])
    res.json({ impact: stats, reports: reports.rows })
  } catch (error) {
    next(error)
  }
})

router.post('/donations', async (req, res, next) => {
  try {
    const amount = toAmount(req.body?.amount)
    if (amount < 10000) {
      return res.status(400).json({ error: 'حداقل مبلغ کمک ۱۰٬۰۰۰ تومان است.' })
    }
    if (amount > 500000000) {
      return res.status(400).json({ error: 'برای مبالغ بالاتر از ۵۰۰ میلیون تومان با ما تماس بگیرید.' })
    }

    const isAnonymous = Boolean(req.body?.is_anonymous)
    const donorName = clean(req.body?.donor_name, 120)
    const donorPhone = normalizePhone(clean(req.body?.donor_phone, 20))

    if (!isAnonymous && donorName.length < 3) {
      return res.status(400).json({ error: 'نام و نام خانوادگی را کامل وارد کنید.' })
    }
    if (!isPhone(donorPhone)) {
      return res.status(400).json({ error: 'شماره موبایل معتبر نیست. نمونه: ۰۹۱۲۳۴۵۶۷۸۹' })
    }

    let projectId = null
    if (req.body?.project_id) {
      const project = await query(
        'SELECT id FROM projects WHERE id = $1 AND is_active = true',
        [Number(req.body.project_id)]
      )
      if (project.rowCount === 0) {
        return res.status(400).json({ error: 'پروژه انتخاب‌شده معتبر نیست.' })
      }
      projectId = project.rows[0].id
    }

    const trackingCode = `HO-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
    const inserted = await query(
      `INSERT INTO donations (tracking_code, project_id, amount, donor_name, donor_phone, is_anonymous, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING tracking_code`,
      [
        trackingCode,
        projectId,
        amount,
        isAnonymous ? null : donorName,
        donorPhone,
        isAnonymous,
        clean(req.body?.note, 500) || null,
      ]
    )

    const payment = await createPayment({
      amount,
      description: 'کمک به همراهان امید',
      trackingCode,
      mobile: donorPhone,
    })

    if (payment.ok) {
      await query(
        'UPDATE donations SET gateway = $1, gateway_reference = $2 WHERE tracking_code = $3',
        [payment.gateway, payment.reference, trackingCode]
      )
      return res.status(201).json({
        mode: 'gateway',
        tracking: inserted.rows[0].tracking_code,
        redirectUrl: payment.redirectUrl,
      })
    }

    return res.status(201).json({
      mode: 'pending',
      tracking: inserted.rows[0].tracking_code,
      message:
        'درخواست کمک شما ثبت شد. درگاه پرداخت آنلاین هنوز به سایت متصل نشده است؛ همکاران ما برای هماهنگی با شما تماس می‌گیرند.',
    })
  } catch (error) {
    next(error)
  }
})

router.get('/donations/:tracking', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT d.tracking_code, d.amount, d.status, d.created_at, d.paid_at, p.title AS project_title
       FROM donations d LEFT JOIN projects p ON p.id = d.project_id
       WHERE d.tracking_code = $1`,
      [req.params.tracking]
    )
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'کد پیگیری پیدا نشد.' })
    }
    res.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})

// Gateway return URL. The donation is marked paid only after the gateway itself
// confirms the authority — never from query-string flags alone.
router.get('/payments/callback', async (req, res) => {
  const tracking = clean(req.query.tracking, 40)
  const authority = clean(req.query.Authority || req.query.authority, 120)
  const status = clean(req.query.Status || req.query.status, 20)
  const back = `${publicBaseUrl()}/donate/result?tracking=${encodeURIComponent(tracking)}`

  try {
    const donation = await query(
      'SELECT id, amount, status, gateway_reference FROM donations WHERE tracking_code = $1',
      [tracking]
    )
    if (donation.rowCount === 0) {
      return res.redirect(`${back}&state=not_found`)
    }
    const row = donation.rows[0]
    if (row.status === 'paid') {
      return res.redirect(`${back}&state=paid`)
    }
    // The authority must be the one we created for this donation, otherwise a paid
    // transaction could be replayed onto another record.
    if (status.toUpperCase() !== 'OK' || !authority || authority !== row.gateway_reference) {
      await query("UPDATE donations SET status = 'canceled' WHERE id = $1", [row.id])
      return res.redirect(`${back}&state=canceled`)
    }

    const verification = await verifyPayment({ authority, amount: row.amount })
    if (verification.ok) {
      await query(
        "UPDATE donations SET status = 'paid', paid_at = now(), gateway = 'zarinpal', gateway_reference = $1 WHERE id = $2",
        [verification.reference, row.id]
      )
      return res.redirect(`${back}&state=paid`)
    }
    await query("UPDATE donations SET status = 'failed' WHERE id = $1", [row.id])
    return res.redirect(`${back}&state=failed`)
  } catch (error) {
    console.error('[payments] callback error', error)
    return res.redirect(`${back}&state=failed`)
  }
})

router.post('/volunteers', async (req, res, next) => {
  try {
    const fullName = clean(req.body?.full_name, 120)
    const phone = normalizePhone(clean(req.body?.phone, 20))
    const email = clean(req.body?.email, 160)
    const city = clean(req.body?.city, 80)
    const skills = clean(req.body?.skills, 600)
    const note = clean(req.body?.note, 1000)
    const interests = Array.isArray(req.body?.interests)
      ? req.body.interests.filter((item) => INTERESTS.includes(item)).slice(0, INTERESTS.length)
      : []

    if (fullName.length < 3) {
      return res.status(400).json({ error: 'نام و نام خانوادگی را کامل وارد کنید.' })
    }
    if (!isPhone(phone)) {
      return res.status(400).json({ error: 'شماره تماس معتبر نیست. نمونه: ۰۹۱۲۳۴۵۶۷۸۹' })
    }
    if (email && !isEmail(email)) {
      return res.status(400).json({ error: 'ایمیل وارد‌شده معتبر نیست.' })
    }
    if (interests.length === 0) {
      return res.status(400).json({ error: 'حداقل یک زمینه همکاری را انتخاب کنید.' })
    }

    await query(
      `INSERT INTO volunteers (full_name, phone, email, city, skills, interests, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [fullName, phone, email || null, city || null, skills || null, interests, note || null]
    )
    res.status(201).json({
      message: 'درخواست همکاری شما ثبت شد. به‌زودی با شما تماس می‌گیریم.',
    })
  } catch (error) {
    next(error)
  }
})

router.post('/contact', async (req, res, next) => {
  try {
    const name = clean(req.body?.name, 120)
    const phone = clean(req.body?.phone, 20)
    const email = clean(req.body?.email, 160)
    const subject = clean(req.body?.subject, 160)
    const message = clean(req.body?.message, 2000)

    if (name.length < 3) {
      return res.status(400).json({ error: 'نام خود را کامل وارد کنید.' })
    }
    if (!phone && !email) {
      return res.status(400).json({ error: 'برای پاسخ‌گویی، شماره تماس یا ایمیل را وارد کنید.' })
    }
    if (phone && !isPhone(normalizePhone(phone))) {
      return res.status(400).json({ error: 'شماره تماس معتبر نیست.' })
    }
    if (email && !isEmail(email)) {
      return res.status(400).json({ error: 'ایمیل وارد‌شده معتبر نیست.' })
    }
    if (message.length < 10) {
      return res.status(400).json({ error: 'متن پیام باید حداقل ۱۰ کاراکتر باشد.' })
    }

    await query(
      'INSERT INTO contact_messages (name, phone, email, subject, message) VALUES ($1, $2, $3, $4, $5)',
      [name, phone ? normalizePhone(phone) : null, email || null, subject || null, message]
    )
    res.status(201).json({ message: 'پیام شما ثبت شد. در اولین فرصت پاسخ می‌دهیم.' })
  } catch (error) {
    next(error)
  }
})

router.post('/newsletter', async (req, res, next) => {
  try {
    const email = clean(req.body?.email, 160).toLowerCase()
    if (!isEmail(email)) {
      return res.status(400).json({ error: 'یک ایمیل معتبر وارد کنید.' })
    }
    await query(
      'INSERT INTO newsletter_subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
      [email]
    )
    res.status(201).json({ message: 'عضویت شما در خبرنامه ثبت شد.' })
  } catch (error) {
    next(error)
  }
})

export default router
