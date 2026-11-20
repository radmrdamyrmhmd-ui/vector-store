import { useEffect } from 'react'

export const SITE_NAME = 'همراهان امید'
const DEFAULT_TITLE = 'همراهان امید | نمونه‌کار وب‌سایت خیریه حمایت از زنان و کودکان بلوچ'
const DEFAULT_DESCRIPTION =
  'نمونه‌کار وب‌سایت خیریه «همراهان امید»: معرفی حوزه‌های فعالیت، پروژه‌های حمایتی، اخبار و فرم‌های مشارکت در حمایت از زنان و کودکان بلوچ.'

// Crawlers that run JavaScript still benefit from explicit preview limits; pages
// that must stay out of the index (admin, checkout) use the noindex variant.
const ROBOTS_INDEX = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
const ROBOTS_NOINDEX = 'noindex, nofollow'

export const siteUrl = () =>
  (import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin || '').replace(/\/$/, '')

/** Every canonical, Open Graph and structured-data URL must be absolute. */
export const absoluteUrl = (path = '/') => {
  if (/^https?:\/\//i.test(path)) return path
  return `${siteUrl()}${path.startsWith('/') ? '' : '/'}${path}`
}

function setMeta(attr, key, content) {
  if (!content) return
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function removeMeta(attr, key) {
  document.head.querySelectorAll(`meta[${attr}="${key}"]`).forEach((tag) => tag.remove())
}

function setLink(rel, href, attributes = {}) {
  if (!href) return
  const selector = Object.entries(attributes)
    .map(([name, value]) => `[${name}="${value}"]`)
    .join('')
  let tag = document.head.querySelector(`link[rel="${rel}"]${selector}`)
  if (!tag) {
    tag = document.createElement('link')
    tag.setAttribute('rel', rel)
    Object.entries(attributes).forEach(([name, value]) => tag.setAttribute(name, value))
    document.head.appendChild(tag)
  }
  tag.setAttribute('href', href)
}

// One <script type="application/ld+json"> per node, indexed by position, so a
// page can publish several graphs and stale ones are removed on navigation.
function setJsonLd(data) {
  const nodes = data ? (Array.isArray(data) ? data : [data]) : []
  nodes.forEach((node, index) => {
    const id = `seo-jsonld-${index}`
    let script = document.getElementById(id)
    if (!script) {
      script = document.createElement('script')
      script.id = id
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(node)
  })
  let index = nodes.length
  let stale = document.getElementById(`seo-jsonld-${index}`)
  while (stale) {
    stale.remove()
    index += 1
    stale = document.getElementById(`seo-jsonld-${index}`)
  }
}

/**
 * Per-page metadata for the SPA: title, description, canonical, hreflang,
 * Open Graph, Twitter card and optional structured data.
 */
export function useSeo({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image,
  type = 'website',
  jsonLd,
  noindex = false,
  publishedAt,
}) {
  // Comparing the serialised payload keeps the effect from re-running on every
  // render while still reacting to data that arrives asynchronously.
  const jsonLdPayload = jsonLd ? JSON.stringify(jsonLd) : ''

  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE
    document.title = fullTitle

    const routePath = path || window.location.pathname
    const canonical = absoluteUrl(routePath)
    const ogImage = image ? absoluteUrl(image) : absoluteUrl('/og-image.png')

    setMeta('name', 'description', description)
    setMeta('name', 'robots', noindex ? ROBOTS_NOINDEX : ROBOTS_INDEX)
    setLink('canonical', canonical)
    setLink('alternate', canonical, { hreflang: 'fa-IR' })
    setLink('alternate', canonical, { hreflang: 'x-default' })

    setMeta('property', 'og:site_name', SITE_NAME)
    setMeta('property', 'og:locale', 'fa_IR')
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', canonical)
    setMeta('property', 'og:image', ogImage)
    setMeta('property', 'og:image:width', '1200')
    setMeta('property', 'og:image:height', '630')
    setMeta('property', 'og:image:alt', fullTitle)
    // Article tags must not linger on a page that is not an article.
    if (publishedAt) {
      setMeta('property', 'article:published_time', publishedAt)
    } else {
      removeMeta('property', 'article:published_time')
    }

    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', ogImage)
    setMeta('name', 'twitter:image:alt', fullTitle)

    setJsonLd(jsonLdPayload ? JSON.parse(jsonLdPayload) : null)
  }, [title, description, path, image, type, noindex, publishedAt, jsonLdPayload])
}

/* ------------------------------ structured data ----------------------------- */

const ORGANIZATION_DESCRIPTION =
  'نمونه‌کار نمایشی یک مجموعه خیریه با تمرکز بر آموزش، توانمندسازی و حمایت از زنان و کودکان بلوچ. این مجموعه فعال نیست و محتوای سایت نمونه است.'

/**
 * Only verifiable, self-described facts are published. No registration number,
 * address, phone or licence is invented for a demonstration project.
 */
export const organizationJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  alternateName: 'Hamrahan Omid',
  url: siteUrl(),
  logo: absoluteUrl('/og-image.png'),
  description: ORGANIZATION_DESCRIPTION,
  disambiguatingDescription: 'نمونه‌کار نمایشی؛ مؤسسه فعال نیست.',
})

export const websiteJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: siteUrl(),
  inLanguage: 'fa-IR',
  description: ORGANIZATION_DESCRIPTION,
})

export const webPageJsonLd = ({ title, description, path, type = 'WebPage' }) => ({
  '@context': 'https://schema.org',
  '@type': type,
  name: title,
  description,
  url: absoluteUrl(path),
  inLanguage: 'fa-IR',
  isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: siteUrl() },
})

export const articleJsonLd = ({ title, description, published_at, image, path }) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  datePublished: published_at,
  inLanguage: 'fa-IR',
  image: [image ? absoluteUrl(image) : absoluteUrl('/og-image.png')],
  mainEntityOfPage: absoluteUrl(path),
  author: { '@type': 'Organization', name: SITE_NAME },
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    logo: { '@type': 'ImageObject', url: absoluteUrl('/og-image.png') },
  },
})

export const breadcrumbJsonLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.label,
    item: absoluteUrl(item.to || '/'),
  })),
})

export const itemListJsonLd = ({ name, items }) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  numberOfItems: items.length,
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: absoluteUrl(item.to),
    name: item.label,
  })),
})

/** Combines several nodes into one @graph script. */
export const jsonLdGraph = (...nodes) => ({
  '@context': 'https://schema.org',
  '@graph': nodes.map(({ '@context': _context, ...rest }) => rest),
})
