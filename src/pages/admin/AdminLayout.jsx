import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import {
  FileText,
  FolderKanban,
  HandCoins,
  LayoutDashboard,
  Layers,
  LogOut,
  Mail,
  Newspaper,
  Settings,
  Users,
} from 'lucide-react'
import { ADMIN_NAV } from '../../lib/nav.js'
import { useAuth } from '../../lib/auth.jsx'
import { useSettings } from '../../lib/site.jsx'
import { Button, Spinner } from '../../components/ui.jsx'
import { Logo } from '../../components/Art.jsx'

const ICONS = {
  dashboard: LayoutDashboard,
  projects: FolderKanban,
  stories: Newspaper,
  activities: Layers,
  reports: FileText,
  donations: HandCoins,
  volunteers: Users,
  messages: Mail,
  settings: Settings,
}

export default function AdminLayout() {
  const { user, loading, logout } = useAuth()
  const settings = useSettings()
  const location = useLocation()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas">
        <Spinner label="در حال بررسی دسترسی…" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  async function handleLogout() {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col lg:flex-row">
        <aside className="border-line bg-white lg:min-h-screen lg:w-64 lg:shrink-0 lg:border-l">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <NavLink to="/admin" className="flex items-center gap-2">
              <Logo name={settings.site_name || 'همراهان امید'} subtitle="پنل مدیریت" />
            </NavLink>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:flex-col lg:overflow-visible" aria-label="منوی مدیریت">
            {ADMIN_NAV.map((item) => {
              const Icon = ICONS[item.icon] || LayoutDashboard
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    clsx(
                      'flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-[12.5px] transition',
                      isActive
                        ? 'bg-brand-50 font-medium text-brand'
                        : 'text-ink/70 hover:bg-cream hover:text-brand'
                    )
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
          <div className="hidden border-t border-line px-5 py-4 lg:block">
            <p className="text-[11.5px] text-muted">وارد شده به‌عنوان</p>
            <p className="mt-1 truncate text-[12px] font-medium text-ink">{user.email}</p>
            <Button variant="ghost" size="sm" className="mt-3 w-full justify-start" onClick={handleLogout}>
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              خروج از حساب
            </Button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex items-center justify-between gap-3 border-b border-line bg-white/80 px-4 py-3 backdrop-blur lg:px-8">
            <div className="flex items-center gap-2 text-[11.5px] text-muted">
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-brand">مدیر</span>
              <span className="hidden sm:inline">{settings.site_name || 'همراهان امید'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" to="/">
                مشاهده سایت
              </Button>
              <button
                type="button"
                onClick={handleLogout}
                className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition hover:text-red-600 lg:hidden"
                aria-label="خروج"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </header>
          <main className="px-4 py-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
