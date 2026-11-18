// Link previews for social networks.
//
// The public site is a React SPA, so a crawler that does not run JavaScript
// would only ever see the generic shell in index.html. Social crawlers
// (Facebook, X/Twitter, LinkedIn, WhatsApp, Telegram, Slack, Discord) get a
// small HTML document carrying the page's real title, description and image.
// Search engines are deliberately not matched here — they render JavaScript and
// must keep receiving the normal application shell.

import { query } from './db.js'
import { publicBaseUrl } from './payments.js'

const SOCIAL_BOT =
  /(facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|pinterest|skypeuripreview|embedly|vkshare|redditbot|mastodon|bluesky|iframely)/i

const DEFAULT_IMAGE = '/og-image.png'
const DEFAULT_TITLE = 'همراهان امید | حمایت از زنان و کودکان بلوچ'
const DEFAULT_DESCRIPTION =
  'معرفی حوزه‌های فعالیت، پروژه‌های حمایتی، اخبار و فرم‌های مشارکت در حمایت از زنان و کودکان بلوچ.'

const STATIC_PAGES = {
  '/': {},
  '/about': { title: 'درباره ما', description: 'داستان، ارزش‌ها و مسیر شکل‌گیری مجموعه همراهان امید.' },
  '/mission': { title: 'مأموریت ما', description: 'مأموریت همراهان امید در آموزش، توانمندسازی و حمایت اجتماعی.' },
  '/activities': { title: 'حوزه‌های فعالیت', description: 'آموزش، توانمندسازی زنان، حمایت معیشتی و سلامت.' },
  '/projects': { title: 'پروژه‌های حمایتی', description: 'فهرست پروژه‌های حمایتی با هدف، محل اجرا و وضعیت هر پروژه.' },
  '/transparency': { title: 'شفافیت مالی', description: 'گزارش‌های مالی و آمار کمک‌های دریافتی.' },
  '/stories': { title: 'اخبار و مقالات', description: 'گزارش‌ها و روایت‌های مجموعه همراهان امید.' },
  '/volunteer': { title: 'همکاری و داوطلبی', description: 'راه‌های همکاری داوطلبانه با همراهان امید.' },
  '/contact': { title: 'تماس با ما', description: 'راه‌های ارتباط با مجموعه همراهان امید.' },
  '/privacy': { title: 'حریم خصوصی', description: 'سیاست حفظ حریم خصوصی کاربران و حامیان.' },
  '/terms': { title: 'شرایط استفاده', description: 'شرایط استفاده از وب‌سایت همراهان امید.' },
}

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)

const absolute = (url) => {
  if (!url) return `${publicBaseUrl()}${DEFAULT_IMAGE}`
  return /^https?:\/\//i.test(url) ? url : `${publicBaseUrl()}${url}`
}

async function siteName() {
  try {
    const result = await query("SELECT value FROM settings WHERE key = 'site'")
    return result.rows[0]?.value?.site_name || 'همراهان امید'
  } catch {
    return 'همراهان امید'
  }
}

async function resolveMeta(path) {
  if (path in STATIC_PAGES) return STATIC_PAGES[path]

  const project = path.match(/^\/projects\/([^/]+)$/)
  if (project) {
    const result = await query(
      'SELECT title, summary, image_url FROM projects WHERE slug = $1 AND is_active = true',
      [decodeURIComponent(project[1])]
    )
    if (result.rowCount === 0) return null
    const row = result.rows[0]
    return { title: row.title, description: row.summary, image: row.image_url, type: 'article' }
  }

  const story = path.match(/^\/stories\/([^/]+)$/)
  if (story) {
    const result = await query(
      'SELECT title, excerpt, image_url FROM stories WHERE slug = $1 AND is_published = true',
      [decodeURIComponent(story[1])]
    )
    if (result.rowCount === 0) return null
    const row = result.rows[0]
    return { title: row.title, description: row.excerpt, image: row.image_url, type: 'article' }
  }

  const activity = path.match(/^\/activities\/([^/]+)$/)
  if (activity) {
    const result = await query(
      'SELECT title, summary, image_url FROM activities WHERE slug = $1 AND is_active = true',
      [decodeURIComponent(activity[1])]
    )
    if (result.rowCount === 0) return null
    const row = result.rows[0]
    return { title: row.title, description: row.summary, image: row.image_url }
  }

  const page = path.match(/^\/p\/([^/]+)$/)
  if (page) {
    const result = await query(
      `SELECT title, subtitle, meta_title, meta_description
       FROM pages WHERE slug = $1 AND is_published = true`,
      [decodeURIComponent(page[1])]
    )
    if (result.rowCount === 0) return null
    const row = result.rows[0]
    return {
      title: row.meta_title || row.title,
      description: row.meta_description || row.subtitle,
    }
  }

  return null
}

function renderHtml({ title, description, image, canonical, type, name }) {
  const fullTitle = title ? `${title} | ${name}` : DEFAULT_TITLE
  const text = description || DEFAULT_DESCRIPTION
  const picture = absolute(image)
  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(fullTitle)}</title>
<meta name="description" content="${escapeHtml(text)}">
<link rel="canonical" href="${escapeHtml(canonical)}">
<meta property="og:site_name" content="${escapeHtml(name)}">
<meta property="og:locale" content="fa_IR">
<meta property="og:type" content="${escapeHtml(type || 'website')}">
<meta property="og:title" content="${escapeHtml(fullTitle)}">
<meta property="og:description" content="${escapeHtml(text)}">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:image" content="${escapeHtml(picture)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${escapeHtml(name)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(fullTitle)}">
<meta name="twitter:description" content="${escapeHtml(text)}">
<meta name="twitter:image" content="${escapeHtml(picture)}">
</head>
<body>
<h1>${escapeHtml(fullTitle)}</h1>
<p>${escapeHtml(text)}</p>
<p><a href="${escapeHtml(canonical)}">مشاهده صفحه</a></p>
</body>
</html>`
}

export async function socialPreview(req, res, next) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next()
  if (!SOCIAL_BOT.test(req.get('user-agent') || '')) return next()

  try {
    const meta = await resolveMeta(req.path.replace(/\/+$/, '') || '/')
    if (!meta) return next()
    const canonical = `${publicBaseUrl()}${req.path.replace(/\/+$/, '') || '/'}`
    const body = renderHtml({ ...meta, canonical, name: await siteName() })
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=300')
    res.status(200).send(body)
  } catch (error) {
    console.error('[prerender] could not build preview', error?.message || error)
    next()
  }
}
