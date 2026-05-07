/**
 * FFZone – Root App with React Router
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import useAuthStore from './store/authStore'

// ── Layouts ────────────────────────────────────────────────────────────────
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// ── Player Pages ───────────────────────────────────────────────────────────
import LandingPage        from './pages/LandingPage'
import AuthPage           from './pages/AuthPage'
import DashboardPage      from './pages/DashboardPage'
import TournamentsPage    from './pages/TournamentsPage'
import TournamentDetail   from './pages/TournamentDetail'
import PaymentPage        from './pages/PaymentPage'
import MatchesPage        from './pages/MatchesPage'
import TeamFinderPage     from './pages/TeamFinderPage'
import ProfilePage        from './pages/ProfilePage'
import LeaderboardPage    from './pages/LeaderboardPage'

// ── Static / Legal Pages ──────────────────────────────────────────────────
import TermsPage          from './pages/TermsPage'
import PrivacyPolicyPage  from './pages/PrivacyPolicyPage'
import RefundPolicyPage   from './pages/RefundPolicyPage'
import ContactPage        from './pages/ContactPage'
import FAQPage            from './pages/FAQPage'

// ── Admin Pages ────────────────────────────────────────────────────────────
import AdminDashboard     from './pages/admin/AdminDashboard'
import AdminTournaments   from './pages/admin/AdminTournaments'
import AdminCreateTournament from './pages/admin/AdminCreateTournament'
import AdminPayments      from './pages/admin/AdminPayments'
import AdminPlayers       from './pages/admin/AdminPlayers'
import AdminRoom          from './pages/admin/AdminRoom'
import AdminResults       from './pages/admin/AdminResults'

const qc = new QueryClient()

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin } = useAuthStore()
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin()) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111827',
              color: '#fff',
              border: '1px solid rgba(249,115,22,0.3)',
              borderRadius: '0.75rem',
            },
          }}
        />

        <Routes>
          {/* ── Public ─────────────────────────────────────── */}
          <Route path="/" element={<><Navbar /><LandingPage /><Footer /></>} />
          <Route path="/login"       element={<AuthPage />} />
          <Route path="/tournaments" element={<><Navbar /><TournamentsPage /><Footer /></>} />
          <Route path="/tournament/:id" element={<><Navbar /><TournamentDetail /><Footer /></>} />
          <Route path="/leaderboard" element={<><Navbar /><LeaderboardPage /><Footer /></>} />

          {/* ── Player Protected ────────────────────────────── */}
          <Route path="/dashboard" element={
            <ProtectedRoute><Navbar /><DashboardPage /><Footer /></ProtectedRoute>
          } />
          <Route path="/payment/:id" element={
            <ProtectedRoute><Navbar /><PaymentPage /><Footer /></ProtectedRoute>
          } />
          <Route path="/matches" element={
            <ProtectedRoute><Navbar /><MatchesPage /><Footer /></ProtectedRoute>
          } />
          <Route path="/team-finder" element={
            <ProtectedRoute><Navbar /><TeamFinderPage /><Footer /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Navbar /><ProfilePage /><Footer /></ProtectedRoute>
          } />

          {/* ── Admin Protected ─────────────────────────────── */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/tournaments" element={
            <ProtectedRoute adminOnly><AdminTournaments /></ProtectedRoute>
          } />
          <Route path="/admin/tournaments/create" element={
            <ProtectedRoute adminOnly><AdminCreateTournament /></ProtectedRoute>
          } />
          <Route path="/admin/payments" element={
            <ProtectedRoute adminOnly><AdminPayments /></ProtectedRoute>
          } />
          <Route path="/admin/players" element={
            <ProtectedRoute adminOnly><AdminPlayers /></ProtectedRoute>
          } />
          <Route path="/admin/room/:id" element={
            <ProtectedRoute adminOnly><AdminRoom /></ProtectedRoute>
          } />
          <Route path="/admin/results/:id" element={
            <ProtectedRoute adminOnly><AdminResults /></ProtectedRoute>
          } />

          {/* ── Legal / Static Pages ─────────────────────── */}
          <Route path="/terms"   element={<><Navbar /><TermsPage /><Footer /></>} />
          <Route path="/privacy" element={<><Navbar /><PrivacyPolicyPage /><Footer /></>} />
          <Route path="/refund"  element={<><Navbar /><RefundPolicyPage /><Footer /></>} />
          <Route path="/contact" element={<><Navbar /><ContactPage /><Footer /></>} />
          <Route path="/faq"     element={<><Navbar /><FAQPage /><Footer /></>} />

          {/* ── Catch-all ─────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
