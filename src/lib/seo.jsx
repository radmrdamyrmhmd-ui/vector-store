import { useEffect } from 'react'

const SITE_NAME = 'همراهان امید'
const DEFAULT_DESCRIPTION =
  'نمونه‌کار وب‌سایت خیریه «همراهان امید»: معرفی حوزه‌های فعالیت، پروژه‌های حمایتی، اخبار و فرم‌های مشارکت در حمایت از زنان و کودکان بلوچ.'

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

function setLink(rel, href) {
  if (!href) return
  let tag = document.head.querySelector(`link[rel="${rel}"]`)
  if (!tag) {
    tag = document.createElement('link')
    tag.setAttribute('rel', rel)
    document.head.appendChild(tag)
  }
  tag.setAttribute('href', href)
}

function setJsonLd(id, data) {
  const existing = document.getElementById(id)
  if (!data) {
    existing?.remove()
    return
  }
  const script = existing || document.createElement('script')
  script.id = id
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(data)
  if (!existing) document.head.appendChild(script)
}

export const siteUrl = () =>
  (import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin || '').replace(/\/$/, '')

/**
 * Per-page metadata for the SPA: title, description, canonical, Open Graph,
 * Twitter card and optional structured data.
 */
export function useSeo({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image,
  type = 'website',
  jsonLd,
  noindex = false,
}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | حمایت از زنان و کودکان بلوچ`
    document.title = fullTitle

    const canonical = `${siteUrl()}${path || window.location.pathname}`
    setMeta('name', 'description', description)
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    setLink('canonical', canonical)

    setMeta('property', 'og:site_name', SITE_NAME)
    setMeta('property', 'og:locale', 'fa_IR')
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', canonical)
    if (image) setMeta('property', 'og:image', image.startsWith('http') ? image : `${siteUrl()}${image}`)

    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary')
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', description)
    if (image) {
      setMeta('name', 'twitter:image', image.startsWith('http') ? image : `${siteUrl()}${image}`)
    }

    setJsonLd('seo-jsonld', jsonLd || null)
  }, [title, description, path, image, type, jsonLd, noindex])
}

export const organizationJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'NGO',
  name: SITE_NAME,
  alternateName: 'Hamrahan Omid',
  description:
    'نمونه‌کار وب‌سایت یک مجموعه خیریه با تمرکز بر آموزش، توانمندسازی و سلامت زنان و کودکان بلوچ.',
  url: siteUrl(),
})

export const articleJsonLd = ({ title, description, published_at, image, path }) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: title,
  description,
  datePublished: published_at,
  image: image ? [image.startsWith('http') ? image : `${siteUrl()}${image}`] : undefined,
  mainEntityOfPage: `${siteUrl()}${path}`,
  publisher: { '@type': 'Organization', name: SITE_NAME },
})

export const breadcrumbJsonLd = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.label,
    item: `${siteUrl()}${item.to || ''}`,
  })),
})
