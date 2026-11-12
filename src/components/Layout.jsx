import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'

const TITLES = [
  ['/activities', 'فعالیت‌های ما'],
  ['/projects', 'پروژه‌های حمایتی'],
  ['/donate', 'حمایت مالی'],
  ['/transparency', 'گزارش عملکرد و شفافیت مالی'],
  ['/stories', 'داستان‌ها و اخبار'],
  ['/volunteer', 'همکاری و داوطلبی'],
  ['/contact', 'تماس با ما'],
  ['/legal', 'قوانین و حریم خصوصی'],
  ['/mission', 'مأموریت و اهداف'],
  ['/about', 'درباره ما'],
]

const DEFAULT_TITLE = 'همراهان امید | حمایت از زنان و کودکان بلوچ'

export default function Layout() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const match = TITLES.find(([path]) => pathname === path || pathname.startsWith(`${path}/`))
    document.title = match ? `${match[1]} | همراهان امید` : DEFAULT_TITLE
  }, [pathname])

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.replace('#', ''))
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0 })
  }, [pathname, hash])

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:right-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-brand focus:px-5 focus:py-2 focus:text-sm focus:text-cream"
      >
        پرش به محتوای اصلی
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
