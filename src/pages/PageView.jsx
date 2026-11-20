import { Navigate, useParams } from 'react-router-dom'
import { api } from '../lib/api.js'
import { useResource } from '../lib/useResource.js'
import { Breadcrumbs } from '../components/blocks.jsx'
import RichText from '../components/RichText.jsx'
import { Button, Empty, Notice, PageHero } from '../components/ui.jsx'
import { formatDate } from '../lib/format.js'
import { breadcrumbJsonLd, jsonLdGraph, useSeo, webPageJsonLd } from '../lib/seo.jsx'

/**
 * Renders a page stored in the `pages` table, so privacy, terms and any page an
 * operator adds are edited in the panel rather than in the source.
 */
export default function PageView({ slug: fixedSlug, eyebrow = 'اطلاعات حقوقی' }) {
  const params = useParams()
  const slug = fixedSlug || params.slug
  const { data: page, loading, error } = useResource(() => api(`/pages/${slug}`), [slug])

  useSeo({
    title: page?.meta_title || page?.title,
    description: page?.meta_description || page?.subtitle || undefined,
    path: fixedSlug === 'privacy' ? '/privacy' : fixedSlug === 'terms' ? '/terms' : `/p/${slug}`,
    noindex: Boolean(error) || (!loading && !page),
    jsonLd: page
      ? jsonLdGraph(
          webPageJsonLd({
            title: page.meta_title || page.title,
            description: page.meta_description || page.subtitle,
            path:
              fixedSlug === 'privacy'
                ? '/privacy'
                : fixedSlug === 'terms'
                  ? '/terms'
                  : `/p/${page.slug}`,
          }),
          breadcrumbJsonLd([
            { label: 'صفحه اصلی', to: '/' },
            { label: page.title, to: `/p/${page.slug}` },
          ])
        )
      : undefined,
  })

  // The legal pages have their own routes; /p/privacy would be a duplicate URL.
  if (!fixedSlug && (slug === 'privacy' || slug === 'terms')) {
    return <Navigate to={`/${slug}`} replace />
  }

  if (loading) {
    return (
      <div className="container-x max-w-3xl py-20">
        <div className="h-8 w-56 animate-pulse rounded-full bg-cream" />
        <div className="mt-6 space-y-3">
          <div className="h-4 w-full animate-pulse rounded-full bg-cream/80" />
          <div className="h-4 w-11/12 animate-pulse rounded-full bg-cream/80" />
          <div className="h-4 w-9/12 animate-pulse rounded-full bg-cream/80" />
        </div>
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="container-x max-w-3xl py-20">
        <Empty
          title="این صفحه پیدا نشد"
          text={error || 'ممکن است نشانی صفحه تغییر کرده یا منتشر نشده باشد.'}
          action={
            <Button to="/" variant="outline" size="sm">
              بازگشت به صفحه اصلی
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <>
      <PageHero eyebrow={eyebrow} title={page.title} text={page.subtitle} />

      <section className="py-12 sm:py-16">
        <div className="container-x max-w-3xl">
          <Breadcrumbs items={[{ label: page.title }]} />
          <RichText text={page.body} />
          {page.updated_at && (
            <p className="mt-10 border-t border-line pt-5 text-[11.5px] text-muted">
              آخرین به‌روزرسانی این متن: {formatDate(page.updated_at)}
            </p>
          )}
          <Notice tone="info" className="mt-8">
            برای پرسش درباره این متن یا درخواست اصلاح اطلاعات، از{' '}
            <a href="/contact" className="font-medium text-brand underline underline-offset-4">
              صفحه تماس با ما
            </a>{' '}
            استفاده کنید.
          </Notice>
        </div>
      </section>
    </>
  )
}
