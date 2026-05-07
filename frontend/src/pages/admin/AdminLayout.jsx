/**
 * FFZone – Admin Layout shared sidebar
 */
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { GiFlame } from 'react-icons/gi'
import { FiGrid, FiList, FiDollarSign, FiUsers, FiKey, FiAward, FiLogOut } from 'react-icons/fi'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/admin/dashboard',          icon: FiGrid,       label: 'Dashboard' },
  { to: '/admin/tournaments',        icon: FiList,       label: 'Tournaments' },
  { to: '/admin/payments',           icon: FiDollarSign, label: 'Payments' },
  { to: '/admin/players',            icon: FiUsers,      label: 'Players' },
]

export default function AdminLayout({ children }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    toast.success('Logged out.')
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-[#0B0F1A]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-[#111827] border-r border-[rgba(249,115,22,0.1)] flex flex-col">
        <div className="h-16 flex items-center gap-2 px-4 border-b border-[rgba(249,115,22,0.1)]">
          <GiFlame className="text-[#F97316] text-xl" />
          <span className="font-black text-white">FF<span className="text-[#F97316]">ZONE</span> Admin</span>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                pathname === to
                  ? 'bg-[#F97316]/15 text-[#F97316] border border-[#F97316]/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}>
              <Icon size={16} />{label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5">
          <Link to="/" className="flex items-center gap-2 text-white/40 hover:text-white text-xs px-3 py-2 transition mb-1">
            ← Player View
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 text-white/40 hover:text-red-400 text-xs px-3 py-2 transition">
            <FiLogOut size={13} /> Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  )
}
