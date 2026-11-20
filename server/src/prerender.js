// Crawler-facing HTML.
//
// The public site is a React SPA, so a crawler that does not run JavaScript
// would only ever see the generic shell in index.html. Search engines and social
// previews therefore receive a small server-rendered document with the page's
// real title, description, headings, text, canonical URL, Open Graph/Twitter
// tags and JSON-LD. Browsers keep getting the normal application.
//
// Only content that exists in the database is published: no invented figures,
// registration numbers, addresses or licences.

import { query } from './db.js'
import { publicBaseUrl } from './payments.js'

const CRAWLER =
  /(googlebot|google-inspectiontool|adsbot-google|mediapartners-google|bingbot|msnbot|yandex|duckduckbot|baiduspider|applebot|slurp|ahrefsbot|semrushbot|screaming frog|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|pinterest|skypeuripreview|embedly|vkshare|redditbot|mastodon|bluesky|iframely|quora link preview|nuzzel|bitlybot)/i

const DEFAULT_IMAGE = '/og-image.png'
const DEFAULT_TITLE = 'همراهان امید | نمونه‌کار وب‌سایت خیریه حمایت از زنان و کودکان بلوچ'
const DEFAULT_DESCRIPTION =
  'نمونه‌کار وب‌سایت خیریه «همراهان امید»: معرفی حوزه‌های فعالیت، پروژه‌های حمایتی، اخبار و فرم‌های مشارکت در حمایت از زنان و کودکان بلوچ.'
const DEMO_NOTE =
  'این وب‌سایت یک نمونه‌کار نمایشی است؛ «همراهان امید» یک مؤسسه فعال نیست و محتوای آن نمونه است.'

const NAV = [
  { label: 'صفحه اصلی', to: '/' },
  { label: 'درباره ما', to: '/about' },
  { label: 'حوزه‌های فعالیت', to: '/activities' },
  { label: 'پروژه‌ها', to: '/projects' },
  { label: 'گزارش عملکرد', to: '/transparency' },
  { label: 'اخبار و مقالات', to: '/stories' },
  { label: 'داوطلبی', to: '/volunteer' },
  { label: 'تماس با ما', to: '/contact' },
]

const STATIC_PAGES = {
  '/': {
    title: null,
    description:
      'همراهان امید: نمونه‌کار وب‌سایت یک مجموعه خیریه با تمرکز بر آموزش، توانمندسازی زنان و حمایت اجتماعی از کودکان بلوچ.',
  },
  '/about': {
    title: 'درباره ما',
    description: 'داستان، ارزش‌ها و رویکرد همراهان امید در کار با جامعه محلی و حمایت از زنان و کودکان بلوچ.',
  },
  '/mission': {
    title: 'مأموریت و اهداف',
    description: 'مأموریت، اهداف و اصول کاری همراهان امید در آموزش، توانمندسازی اقتصادی و حمایت اجتماعی.',
  },
  '/activities': {
    title: 'حوزه‌های فعالیت',
    description: 'چهار حوزه فعالیت: آموزش کودکان، توانمندسازی زنان، حمایت معیشتی و دسترسی به سلامت.',
  },
  '/projects': {
    title: 'پروژه‌های حمایتی',
    description: 'فهرست پروژه‌های حمایتی با هدف، محل اجرا و وضعیت هر پروژه؛ مبالغ فقط از کمک‌های تأییدشده محاسبه می‌شود.',
  },
  '/transparency': {
    title: 'گزارش عملکرد و شفافیت',
    description: 'گزارش فعالیت و شفافیت مالی؛ اعداد از پایگاه داده خوانده می‌شود و آمار ساختگی منتشر نمی‌شود.',
  },
  '/stories': {
    title: 'اخبار و مقالات',
    description: 'اخبار، گزارش فعالیت‌ها و مقالات درباره کار خیریه و حمایت از زنان و کودکان بلوچ.',
  },
  '/volunteer': {
    title: 'همکاری و داوطلبی',
    description: 'راه‌های همکاری داوطلبانه در آموزش، تولید محتوا، طراحی و پشتیبانی اجرایی.',
  },
  '/contact': {
    title: 'تماس با ما',
    description: 'راه‌های ارتباط با مجموعه همراهان امید و فرم ارسال پیام.',
  },
  '/donate': {
    title: 'حمایت مالی',
    description: 'انتخاب مبلغ و پروژه برای حمایت از آموزش، توانمندسازی و سلامت زنان و کودکان بلوچ.',
  },
  '/privacy': {
    title: 'حریم خصوصی',
    description: 'سیاست حفظ حریم خصوصی کاربران، حامیان و داوطلبان در وب‌سایت همراهان امید.',
  },
  '/terms': {
    title: 'شرایط استفاده',
    description: 'شرایط استفاده از وب‌سایت همراهان امید و توضیح ماهیت نمایشی محتوای آن.',
  },
}

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`)

const absolute = (url) => {
  if (!url) return `${publicBaseUrl()}${DEFAULT_IMAGE}`
  return /^https?:\/\//i.test(url) ? url : `${publicBaseUrl()}${url}`
}

const stripTags = (value) =>
  String(value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

// The panel stores a light markdown subset; crawler HTML carries the plain text.
const plainText = (value) =>
  stripTags(value)
    .replace(/^#{1,6}\s*/, '')
    .replace(/^[-*•]\s*/, '')
    .trim()

const paragraphsOf = (value, limit = 8) =>
  String(value ?? '')
    .split(/\n{2,}|\r\n{1,}/)
    .map((part) => plainText(part))
    .filter((part) => part.length > 0)
    .slice(0, limit)

const formatDate = (value) => {
  if (!value) return null
  try {
    return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date(value))
  } catch {
    return String(value).slice(0, 10)
  }
}

async function siteSettings() {
  try {
    const result = await query("SELECT value FROM settings WHERE key = 'site'")
    return result.rows[0]?.value || {}
  } catch {
    return {}
  }
}

async function siteName() {
  return (await siteSettings()).site_name || 'همراهان امید'
}

const formatNumber = (value) => {
  try {
    return new Intl.NumberFormat('fa-IR').format(Number(value))
  } catch {
    return String(value)
  }
}

/* --------------------------------- content -------------------------------- */

async function staticMeta(path) {
  const page = STATIC_PAGES[path]
  if (!page) return null

  const settings = await siteSettings()
  const base = {
    kind: 'static',
    path,
    title: page.title,
    description: page.description,
    breadcrumb: path === '/' ? [] : [{ label: 'صفحه اصلی', to: '/' }, { label: page.title, to: path }],
    links: NAV.filter((item) => item.to !== path).slice(0, 5),
  }

  // The home page carries the organisation's own introduction from the panel.
  if (path === '/') {
    const [activities, projects, stories] = await Promise.all([
      query('SELECT slug, title, summary FROM activities WHERE is_active = true ORDER BY sort, id LIMIT 4'),
      query('SELECT slug, title, summary FROM projects WHERE is_active = true ORDER BY sort, id LIMIT 3'),
      query(
        'SELECT slug, title, excerpt FROM stories WHERE is_published = true ORDER BY published_at DESC LIMIT 3'
      ),
    ])
    return {
      ...base,
      h1: settings.hero_title || 'با هم، آینده‌ای روشن‌تر می‌سازیم',
      paragraphs: [settings.hero_text].filter(Boolean),
      items: [
        ...activities.rows.map((row) => ({
          title: row.title,
          summary: row.summary,
          to: `/activities/${row.slug}`,
        })),
        ...projects.rows.map((row) => ({
          title: row.title,
          summary: row.summary,
          to: `/projects/${row.slug}`,
        })),
        ...stories.rows.map((row) => ({
          title: row.title,
          summary: row.excerpt,
          to: `/stories/${row.slug}`,
        })),
      ],
      links: NAV.filter((item) => item.to !== '/').slice(0, 6),
    }
  }

  if (path === '/about') {
    return {
      ...base,
      h1: settings.about_title || 'ما برای ساختن امید کنار هم هستیم',
      paragraphs: paragraphsOf(settings.about_text),
    }
  }

  if (path === '/mission') {
    return {
      ...base,
      h1: 'مسیر ما برای ساختن فرصت‌های برابر',
      paragraphs: [stripTags(settings.mission_text)].filter(Boolean),
    }
  }

  if (path === '/activities') {
    const rows = await query(
      'SELECT slug, title, summary FROM activities WHERE is_active = true ORDER BY sort, id'
    )
    return {
      ...base,
      h1: 'چهار مسیر برای ساختن فرصت',
      items: rows.rows.map((row) => ({
        title: row.title,
        summary: row.summary,
        to: `/activities/${row.slug}`,
      })),
    }
  }

  if (path === '/projects') {
    const rows = await query(
      'SELECT slug, title, summary FROM projects WHERE is_active = true ORDER BY sort, id LIMIT 12'
    )
    return {
      ...base,
      h1: 'پروژه‌هایی که با هم پیش می‌بریم',
      items: rows.rows.map((row) => ({
        title: row.title,
        summary: row.summary,
        to: `/projects/${row.slug}`,
      })),
    }
  }

  if (path === '/stories') {
    const rows = await query(
      'SELECT slug, title, excerpt FROM stories WHERE is_published = true ORDER BY published_at DESC LIMIT 12'
    )
    return {
      ...base,
      h1: 'داستان‌هایی از امید و تغییر',
      items: rows.rows.map((row) => ({
        title: row.title,
        summary: row.excerpt,
        to: `/stories/${row.slug}`,
      })),
    }
  }

  // Only the numbers actually stored in the database are published.
  if (path === '/transparency') {
    const totals = await query(`
      SELECT COALESCE(SUM(amount) FILTER (WHERE status = 'paid' AND simulated = false), 0)::bigint AS total,
             count(*) FILTER (WHERE status = 'paid' AND simulated = false)::int AS count
      FROM donations
    `)
    const row = totals.rows[0]
    const total = Number(row.total || 0)
    return {
      ...base,
      h1: 'شفافیت و گزارش عملکرد',
      facts: [
        {
          label: 'مجموع کمک‌های تأییدشده',
          value: total > 0 ? `${formatNumber(total)} تومان` : 'اطلاعات در حال به‌روزرسانی است',
        },
        { label: 'تعداد کمک‌های تأییدشده', value: formatNumber(row.count || 0) },
      ],
    }
  }

  // The legal pages live in the database and are edited in the panel.
  if (path === '/privacy' || path === '/terms') {
    const result = await query(
      `SELECT title, subtitle, body, meta_title, meta_description
       FROM pages WHERE slug = $1 AND is_published = true`,
      [path.slice(1)]
    )
    if (result.rowCount > 0) {
      const row = result.rows[0]
      return {
        ...base,
        title: row.meta_title || row.title,
        description: row.meta_description || row.subtitle || page.description,
        h1: row.title,
        paragraphs: paragraphsOf(row.body),
      }
    }
  }

  if (path === '/volunteer') {
    return {
      ...base,
      h1: 'تو هم می‌توانی بخشی از این تغییر باشی',
      paragraphs: [
        'برای ساختن آینده‌ای بهتر، به همراهی انسان‌هایی نیاز داریم که به تغییر باور دارند. زمان، مهارت و همراهی شما می‌تواند مسیر یک کودک را تغییر دهد.',
      ],
    }
  }

  if (path === '/contact') {
    return {
      ...base,
      h1: 'بیایید گفت‌وگو را شروع کنیم',
      paragraphs: [
        'برای همکاری، کمک مالی، پیشنهاد پروژه یا هر پرسشی درباره فعالیت‌های مجموعه، از راه‌های این صفحه با ما در تماس باشید.',
      ],
    }
  }

  if (path === '/donate') {
    return {
      ...base,
      h1: 'سهم تو در ساختن آینده‌ای بهتر',
      paragraphs: [
        'با هر میزان کمک می‌توانی در مسیر آموزش، سلامت و توانمندسازی زنان و کودکان بلوچ همراه ما باشی. در این نسخه نمایشی، پرداخت شبیه‌سازی می‌شود و مبلغی از حساب کسر نمی‌گردد.',
      ],
    }
  }

  return { ...base, h1: page.title }
}

async function projectMeta(path) {
  const match = path.match(/^\/projects\/([^/]+)$/)
  if (!match) return null
  const slug = decodeURIComponent(match[1])
  const result = await query(
    `SELECT slug, title, summary, description, image_url, location, status, created_at
     FROM projects WHERE slug = $1 AND is_active = true`,
    [slug]
  )
  if (result.rowCount === 0) return null
  const row = result.rows[0]
  const others = await query(
    'SELECT slug, title FROM projects WHERE is_active = true AND slug <> $1 ORDER BY sort, id LIMIT 3',
    [slug]
  )
  const statusLabel = row.status === 'completed' ? 'تکمیل‌شده' : 'در حال اجرا'
  return {
    kind: 'project',
    path: `/projects/${row.slug}`,
    title: row.title,
    description: row.summary || stripTags(row.description).slice(0, 160),
    image: row.image_url,
    facts: [
      { label: 'وضعیت', value: statusLabel },
      ...(row.location ? [{ label: 'محل اجرا', value: row.location }] : []),
    ],
    paragraphs: paragraphsOf(row.description),
    breadcrumb: [
      { label: 'صفحه اصلی', to: '/' },
      { label: 'پروژه‌های حمایتی', to: '/projects' },
      { label: row.title, to: `/projects/${row.slug}` },
    ],
    links: others.rows.map((item) => ({ label: item.title, to: `/projects/${item.slug}` })),
    publishedAt: row.created_at,
  }
}

async function storyMeta(path) {
  const match = path.match(/^\/stories\/([^/]+)$/)
  if (!match) return null
  const slug = decodeURIComponent(match[1])
  const result = await query(
    `SELECT slug, title, excerpt, body, image_url, author, published_at
     FROM stories WHERE slug = $1 AND is_published = true`,
    [slug]
  )
  if (result.rowCount === 0) return null
  const row = result.rows[0]
  const others = await query(
    'SELECT slug, title FROM stories WHERE is_published = true AND slug <> $1 ORDER BY published_at DESC LIMIT 3',
    [slug]
  )
  return {
    kind: 'article',
    path: `/stories/${row.slug}`,
    title: row.title,
    description: row.excerpt || stripTags(row.body).slice(0, 160),
    image: row.image_url,
    paragraphs: paragraphsOf(row.body, 12),
    facts: [
      ...(row.author ? [{ label: 'نویسنده', value: row.author }] : []),
      ...(formatDate(row.published_at)
        ? [{ label: 'تاریخ انتشار', value: formatDate(row.published_at) }]
        : []),
    ],
    breadcrumb: [
      { label: 'صفحه اصلی', to: '/' },
      { label: 'اخبار و مقالات', to: '/stories' },
      { label: row.title, to: `/stories/${row.slug}` },
    ],
    links: others.rows.map((item) => ({ label: item.title, to: `/stories/${item.slug}` })),
    publishedAt: row.published_at,
  }
}

async function activityMeta(path) {
  const match = path.match(/^\/activities\/([^/]+)$/)
  if (!match) return null
  const slug = decodeURIComponent(match[1])
  const result = await query(
    'SELECT slug, title, summary, body, image_url FROM activities WHERE slug = $1 AND is_active = true',
    [slug]
  )
  if (result.rowCount === 0) return null
  const row = result.rows[0]
  const others = await query(
    'SELECT slug, title FROM activities WHERE is_active = true AND slug <> $1 ORDER BY sort, id LIMIT 3',
    [slug]
  )
  return {
    kind: 'activity',
    path: `/activities/${row.slug}`,
    title: row.title,
    description: row.summary || stripTags(row.body).slice(0, 160),
    image: row.image_url,
    paragraphs: paragraphsOf(row.body),
    breadcrumb: [
      { label: 'صفحه اصلی', to: '/' },
      { label: 'حوزه‌های فعالیت', to: '/activities' },
      { label: row.title, to: `/activities/${row.slug}` },
    ],
    links: others.rows.map((item) => ({ label: item.title, to: `/activities/${item.slug}` })),
  }
}

async function pageMeta(path) {
  const match = path.match(/^\/p\/([^/]+)$/)
  if (!match) return null
  const slug = decodeURIComponent(match[1])
  if (slug === 'privacy' || slug === 'terms') return { redirect: `/${slug}` }
  const result = await query(
    `SELECT slug, title, subtitle, body, meta_title, meta_description, updated_at
     FROM pages WHERE slug = $1 AND is_published = true`,
    [slug]
  )
  if (result.rowCount === 0) return null
  const row = result.rows[0]
  return {
    kind: 'page',
    path: `/p/${row.slug}`,
    title: row.meta_title || row.title,
    description: row.meta_description || row.subtitle || stripTags(row.body).slice(0, 160),
    paragraphs: paragraphsOf(row.body),
    facts: formatDate(row.updated_at)
      ? [{ label: 'آخرین به‌روزرسانی', value: formatDate(row.updated_at) }]
      : [],
    breadcrumb: [
      { label: 'صفحه اصلی', to: '/' },
      { label: row.title, to: `/p/${row.slug}` },
    ],
    links: [
      { label: 'تماس با ما', to: '/contact' },
      { label: 'حریم خصوصی', to: '/privacy' },
      { label: 'شرایط استفاده', to: '/terms' },
    ],
  }
}

async function resolvePage(path) {
  return (
    (await staticMeta(path)) ||
    (await projectMeta(path)) ||
    (await storyMeta(path)) ||
    (await activityMeta(path)) ||
    (await pageMeta(path))
  )
}

/* --------------------------------- render --------------------------------- */

function renderBreadcrumb(items) {
  if (!items || items.length === 0) return ''
  const list = items
    .map((item, index) => {
      const last = index === items.length - 1
      const inner = last
        ? `<span aria-current="page">${escapeHtml(item.label)}</span>`
        : `<a href="${escapeHtml(item.to)}">${escapeHtml(item.label)}</a>`
      return `<li>${inner}</li>`
    })
    .join('')
  return `<nav aria-label="مسیر صفحه"><ol>${list}</ol></nav>`
}

function renderJsonLd(nodes) {
  return nodes
    .filter(Boolean)
    .map(
      (node) =>
        `<script type="application/ld+json">${JSON.stringify(node).replace(/</g, '\\u003c')}</script>`
    )
    .join('\n')
}

function structuredData(meta, name) {
  const canonical = `${publicBaseUrl()}${meta.path}`
  const breadcrumb = meta.breadcrumb.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: meta.breadcrumb.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.label,
          item: `${publicBaseUrl()}${item.to}`,
        })),
      }
    : null

  if (meta.path === '/') {
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name,
        url: publicBaseUrl(),
        inLanguage: 'fa-IR',
        description: meta.description,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name,
        url: publicBaseUrl(),
        logo: `${publicBaseUrl()}${DEFAULT_IMAGE}`,
        description: DEMO_NOTE,
        disambiguatingDescription: 'نمونه‌کار نمایشی؛ مؤسسه فعال نیست.',
      },
    ]
  }

  if (meta.kind === 'article') {
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: meta.title,
        description: meta.description,
        datePublished: meta.publishedAt,
        inLanguage: 'fa-IR',
        image: [absolute(meta.image)],
        mainEntityOfPage: canonical,
        author: { '@type': 'Organization', name },
        publisher: {
          '@type': 'Organization',
          name,
          logo: { '@type': 'ImageObject', url: `${publicBaseUrl()}${DEFAULT_IMAGE}` },
        },
      },
      breadcrumb,
    ]
  }

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: meta.title,
      description: meta.description,
      url: canonical,
      inLanguage: 'fa-IR',
      isPartOf: { '@type': 'WebSite', name, url: publicBaseUrl() },
    },
    breadcrumb,
  ]
}

function renderHtml(meta, name) {
  const fullTitle = meta.title ? `${meta.title} | ${name}` : DEFAULT_TITLE
  const description = meta.description || DEFAULT_DESCRIPTION
  const canonical = `${publicBaseUrl()}${meta.path}`
  const image = absolute(meta.image)
  const robots = meta.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'

  const facts = (meta.facts || [])
    .map(
      (fact) =>
        `<li><span>${escapeHtml(fact.label)}:</span> <strong>${escapeHtml(fact.value)}</strong></li>`
    )
    .join('')
  const body = (meta.paragraphs || [])
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('\n')
  const items = (meta.items || [])
    .map(
      (item) =>
        `<article><h2><a href="${escapeHtml(item.to)}">${escapeHtml(item.title)}</a></h2>${
          item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ''
        }</article>`
    )
    .join('\n')
  const links = (meta.links || [])
    .map((item) => `<li><a href="${escapeHtml(item.to)}">${escapeHtml(item.label)}</a></li>`)
    .join('')
  const nav = NAV.map(
    (item) => `<a href="${escapeHtml(item.to)}">${escapeHtml(item.label)}</a>`
  ).join(' ')

  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(fullTitle)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${escapeHtml(canonical)}">
<link rel="alternate" hreflang="fa-IR" href="${escapeHtml(canonical)}">
<link rel="alternate" hreflang="x-default" href="${escapeHtml(canonical)}">
<meta property="og:site_name" content="${escapeHtml(name)}">
<meta property="og:locale" content="fa_IR">
<meta property="og:type" content="${meta.kind === 'article' ? 'article' : 'website'}">
<meta property="og:title" content="${escapeHtml(fullTitle)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${escapeHtml(fullTitle)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(fullTitle)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${escapeHtml(image)}">
<meta name="twitter:image:alt" content="${escapeHtml(fullTitle)}">
${renderJsonLd(structuredData(meta, name))}
</head>
<body>
<header><a href="/">${escapeHtml(name)}</a><nav aria-label="منوی اصلی">${nav}</nav></header>
${renderBreadcrumb(meta.breadcrumb)}
<main>
<h1>${escapeHtml(meta.h1 || meta.title || name)}</h1>
<p>${escapeHtml(description)}</p>
${facts ? `<ul>${facts}</ul>` : ''}
${body}
${items ? `<section><h2>فهرست</h2>${items}</section>` : ''}
${links ? `<section><h2>مطالب مرتبط</h2><ul>${links}</ul></section>` : ''}
</main>
<footer><p>${escapeHtml(DEMO_NOTE)}</p></footer>
</body>
</html>`
}

function renderNotFound(name) {
  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>صفحه پیدا نشد | ${escapeHtml(name)}</title>
<meta name="robots" content="noindex, nofollow">
</head>
<body>
<main>
<h1>این صفحه پیدا نشد</h1>
<p>ممکن است نشانی تغییر کرده باشد یا صفحه حذف شده باشد.</p>
<p><a href="/">بازگشت به صفحه اصلی</a> · <a href="/projects">پروژه‌های حمایتی</a></p>
</main>
</body>
</html>`
}

function sendHtml(res, status, body) {
  res.status(status)
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', status === 200 ? 'public, max-age=300' : 'no-store')
  res.setHeader('X-Robots-Tag', status === 200 ? 'index, follow' : 'noindex, nofollow')
  res.send(body)
}

export async function crawlerPreview(req, res, next) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return next()
  if (!CRAWLER.test(req.get('user-agent') || '')) return next()

  const original = req.path || '/'
  // API, uploads and build assets are never rewritten.
  if (/^\/(api|uploads|assets|src|node_modules|@)/.test(original)) return next()
  if (original === '/sitemap.xml' || original === '/robots.txt') return next()

  // One URL per page: a trailing slash or the old /legal path would otherwise
  // duplicate the canonical address.
  if (original !== '/' && original.endsWith('/')) {
    res.redirect(301, original.replace(/\/+$/, ''))
    return
  }
  if (original === '/legal') {
    res.redirect(301, '/privacy')
    return
  }

  try {
    const name = await siteName()

    if (original === '/admin' || original.startsWith('/admin/')) {
      sendHtml(res, 404, renderNotFound(name))
      return
    }
    if (original.startsWith('/donate/checkout') || original.startsWith('/donate/result')) {
      sendHtml(res, 200, renderHtml({ ...STATIC_PAGES['/donate'], path: original, title: 'تأیید پرداخت', breadcrumb: [], noindex: true, paragraphs: ['این صفحه خصوصی است و در نتایج جست‌وجو نمایش داده نمی‌شود.'] }, name))
      return
    }

    const meta = await resolvePage(original)
    if (meta?.redirect) {
      res.redirect(301, meta.redirect)
      return
    }
    if (!meta) {
      sendHtml(res, 404, renderNotFound(name))
      return
    }
    sendHtml(res, 200, renderHtml(meta, name))
  } catch (error) {
    console.error('[prerender] could not build page', error?.message || error)
    next()
  }
}

// Kept for callers that still import the old name.
export const socialPreview = crawlerPreview
