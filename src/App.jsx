import { Route, Routes } from 'react-router-dom'
import { SiteProvider } from './lib/site.jsx'
import { AuthProvider } from './lib/auth.jsx'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Mission from './pages/Mission.jsx'
import Activities from './pages/Activities.jsx'
import ActivityDetail from './pages/ActivityDetail.jsx'
import Projects from './pages/Projects.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import Donate from './pages/Donate.jsx'
import DonateResult from './pages/DonateResult.jsx'
import Transparency from './pages/Transparency.jsx'
import Stories from './pages/Stories.jsx'
import StoryDetail from './pages/StoryDetail.jsx'
import Volunteer from './pages/Volunteer.jsx'
import Contact from './pages/Contact.jsx'
import Legal from './pages/Legal.jsx'
import NotFound from './pages/NotFound.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminLogin from './pages/admin/Login.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'
import AdminProjects from './pages/admin/AdminProjects.jsx'
import AdminStories from './pages/admin/AdminStories.jsx'
import AdminActivities from './pages/admin/AdminActivities.jsx'
import AdminReports from './pages/admin/AdminReports.jsx'
import AdminDonations from './pages/admin/AdminDonations.jsx'
import AdminVolunteers from './pages/admin/AdminVolunteers.jsx'
import AdminMessages from './pages/admin/AdminMessages.jsx'
import AdminSettings from './pages/admin/AdminSettings.jsx'

export default function App() {
  return (
    <AuthProvider>
      <SiteProvider>
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
            <Route path="donate/result" element={<DonateResult />} />
            <Route path="transparency" element={<Transparency />} />
            <Route path="stories" element={<Stories />} />
            <Route path="stories/:slug" element={<StoryDetail />} />
            <Route path="volunteer" element={<Volunteer />} />
            <Route path="contact" element={<Contact />} />
            <Route path="legal" element={<Legal />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="stories" element={<AdminStories />} />
            <Route path="activities" element={<AdminActivities />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="donations" element={<AdminDonations />} />
            <Route path="volunteers" element={<AdminVolunteers />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </SiteProvider>
    </AuthProvider>
  )
}
