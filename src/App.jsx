import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { SiteProvider } from './lib/site.jsx'
import { AuthProvider } from './lib/auth.jsx'
import Layout from './components/Layout.jsx'

// Route-level code splitting: the first paint only loads the shell and the page
// being visited, which keeps the initial bundle small on mobile connections.
const Home = lazy(() => import('./pages/Home.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
const Mission = lazy(() => import('./pages/Mission.jsx'))
const Activities = lazy(() => import('./pages/Activities.jsx'))
const ActivityDetail = lazy(() => import('./pages/ActivityDetail.jsx'))
const Projects = lazy(() => import('./pages/Projects.jsx'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail.jsx'))
const Donate = lazy(() => import('./pages/Donate.jsx'))
const DonateCheckout = lazy(() => import('./pages/DonateCheckout.jsx'))
const DonateResult = lazy(() => import('./pages/DonateResult.jsx'))
const Transparency = lazy(() => import('./pages/Transparency.jsx'))
const Stories = lazy(() => import('./pages/Stories.jsx'))
const StoryDetail = lazy(() => import('./pages/StoryDetail.jsx'))
const Volunteer = lazy(() => import('./pages/Volunteer.jsx'))
const Contact = lazy(() => import('./pages/Contact.jsx'))
const PageView = lazy(() => import('./pages/PageView.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout.jsx'))
const AdminLogin = lazy(() => import('./pages/admin/Login.jsx'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard.jsx'))
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects.jsx'))
const AdminStories = lazy(() => import('./pages/admin/AdminStories.jsx'))
const AdminActivities = lazy(() => import('./pages/admin/AdminActivities.jsx'))
const AdminPages = lazy(() => import('./pages/admin/AdminPages.jsx'))
const AdminReports = lazy(() => import('./pages/admin/AdminReports.jsx'))
const AdminMedia = lazy(() => import('./pages/admin/AdminMedia.jsx'))
const AdminDonations = lazy(() => import('./pages/admin/AdminDonations.jsx'))
const AdminVolunteers = lazy(() => import('./pages/admin/AdminVolunteers.jsx'))
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages.jsx'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers.jsx'))
const AdminAudit = lazy(() => import('./pages/admin/AdminAudit.jsx'))
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings.jsx'))

// A quiet placeholder the size of a page heading: nothing jumps when the route
// chunk arrives.
function RouteFallback() {
  return (
    <div className="container-x py-16" aria-busy="true" aria-live="polite">
      <div className="h-7 w-52 animate-pulse rounded-full bg-cream" />
      <div className="mt-5 h-4 w-full max-w-xl animate-pulse rounded-full bg-cream/80" />
      <div className="mt-3 h-4 w-4/5 max-w-lg animate-pulse rounded-full bg-cream/70" />
      <span className="sr-only">در حال بارگذاری صفحه…</span>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <SiteProvider>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="mission" element={<Mission />} />
              <Route path="activities" element={<Activities />} />
              <Route path="activities/:slug" element={<ActivityDetail />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/:slug" element={<ProjectDetail />} />
              <Route path="donate" element={<Donate />} />
              <Route path="donate/checkout/:tracking" element={<DonateCheckout />} />
              <Route path="donate/result" element={<DonateResult />} />
              <Route path="donate/result/:tracking" element={<DonateResult />} />
              <Route path="transparency" element={<Transparency />} />
              <Route path="stories" element={<Stories />} />
              <Route path="stories/:slug" element={<StoryDetail />} />
              <Route path="volunteer" element={<Volunteer />} />
              <Route path="contact" element={<Contact />} />
              <Route path="privacy" element={<PageView slug="privacy" eyebrow="حریم خصوصی" />} />
              <Route path="terms" element={<PageView slug="terms" eyebrow="اطلاعات حقوقی" />} />
              <Route path="p/:slug" element={<PageView />} />
              {/* Older links pointed at a combined legal page. */}
              <Route path="legal" element={<Navigate to="/privacy" replace />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="stories" element={<AdminStories />} />
              <Route path="activities" element={<AdminActivities />} />
              <Route path="pages" element={<AdminPages />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="donations" element={<AdminDonations />} />
              <Route path="volunteers" element={<AdminVolunteers />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="audit" element={<AdminAudit />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </Suspense>
      </SiteProvider>
    </AuthProvider>
  )
}
