import fs from 'node:fs'
import express from 'express'
import cookieParser from 'cookie-parser'
import { initDb, query } from './db.js'
import { publicBaseUrl } from './payments.js'
import publicRoutes from './routes/public.js'
import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js'
import { crawlerPreview } from './prerender.js'
import { checkProductionConfig } from './config.js'
import { pruneRateLimits } from './rate-limit.js'

const app = express()
const port = Number(process.env.PORT || 8000)
const uploadDir = process.env.UPLOAD_DIR || '/app/uploads'

fs.mkdirSync(uploadDir, { recursive: true })

app.set('trust proxy', 1)
app.disable('x-powered-by')
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

// Conservative hardening headers. No X-Frame-Options: the app is intentionally
// rendered inside the editor preview iframe.
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  // Only announced when the deployment is actually served over HTTPS.
  if (/^https:/i.test(publicBaseUrl())) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  next()
})

app.use(
  '/uploads',
  express.static(uploadDir, {
    maxAge: '7d',
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff')
    },
  })
)

/* --------------------------------- sitemap -------------------------------- */

const STATIC_PATHS = [
  '/',
  '/about',
  '/mission',
  '/activities',
  '/projects',
  '/donate',
  '/transparency',
  '/stories',
  '/volunteer',
  '/contact',
  '/privacy',
  '/terms',
]

const escapeXml = (value) =>
  String(value).replace(/[<>&'"]/g, (char) => `&#${char.charCodeAt(0)};`)

app.get('/robots.txt', (_req, res) => {
  res
    .type('text/plain')
    .send(
      [
        'User-agent: *',
        'Allow: /',
        '',
        '# Private areas and machine endpoints',
        'Disallow: /admin',
        'Disallow: /api/',
        'Disallow: /donate/checkout',
        'Disallow: /donate/result',
        'Disallow: /legal',
        '',
        '# No crawl-delay: the API rate limits per visitor instead.',
        '',
        `Sitemap: ${publicBaseUrl()}/sitemap.xml`,
        '',
      ].join('\n')
    )
})

app.get('/sitemap.xml', async (_req, res) => {
  const base = publicBaseUrl()
  try {
    const [projects, stories, pages] = await Promise.all([
      query('SELECT slug, created_at FROM projects WHERE is_active = true ORDER BY sort, id'),
      query('SELECT slug, published_at FROM stories WHERE is_published = true ORDER BY published_at DESC'),
      query('SELECT slug, updated_at FROM pages WHERE is_published = true'),
    ])
    const urls = [
      ...STATIC_PATHS.map((path) => ({ loc: `${base}${path}`, priority: path === '/' ? '1.0' : '0.8' })),
      ...projects.rows.map((row) => ({
        loc: `${base}/projects/${row.slug}`,
        lastmod: row.created_at?.toISOString?.().slice(0, 10),
        priority: '0.7',
      })),
      ...stories.rows.map((row) => ({
        loc: `${base}/stories/${row.slug}`,
        lastmod: row.published_at?.toISOString?.().slice(0, 10),
        priority: '0.6',
      })),
      // Seeded pages live on their own route; anything else is served at /p/:slug.
      ...pages.rows
        .filter((row) => !['privacy', 'terms'].includes(row.slug))
        .map((row) => ({
          loc: `${base}/p/${row.slug}`,
          lastmod: row.updated_at?.toISOString?.().slice(0, 10),
          priority: '0.4',
        })),
    ]
    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (item) =>
      `  <url><loc>${escapeXml(item.loc)}</loc>${
        item.lastmod ? `<lastmod>${item.lastmod}</lastmod>` : ''
      }<priority>${item.priority}</priority></url>`
  )
  .join('\n')}
</urlset>
`
    res.type('application/xml').send(body)
  } catch (error) {
    console.error('[sitemap] could not build', error)
    res.status(500).type('text/plain').send('sitemap unavailable')
  }
})

// Crawlers (search engines and social previews) get per-page HTML for the public
// routes; browsers continue to the normal application.
app.use(crawlerPreview)

// JSON endpoints are never search results.
app.use('/api', (_req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')
  next()
})

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api', publicRoutes)

app.use((_req, res) => {
  res.status(404).json({ error: 'مسیر موردنظر پیدا نشد.' })
})

app.use((error, _req, res, _next) => {
  console.error('[api] unhandled error', error)
  res.status(error.status || 500).json({ error: 'خطای غیرمنتظره در سرور رخ داد. لطفاً دوباره تلاش کنید.' })
})

initDb()
  .then(() => {
    checkProductionConfig()
    pruneRateLimits()
    // Expired counters are removed periodically so the table stays small.
    setInterval(pruneRateLimits, 10 * 60 * 1000).unref()
    app.listen(port, '0.0.0.0', () => {
      console.log(`[api] listening on 0.0.0.0:${port}`)
    })
  })
  .catch((error) => {
    console.error('[api] database initialisation failed', error)
    process.exit(1)
  })
