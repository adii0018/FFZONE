import { useState, useEffect } from 'react'
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
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out.')
    navigate('/login')
  }

  // Close menu on route change
  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <div className="flex min-h-screen bg-[#0B0F1A]">
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#111827] border-b border-white/5 flex items-center justify-between px-4 z-[100]">
        <Link to="/" className="flex items-center gap-2">
          <GiFlame className="text-[#F97316] text-xl" />
          <span className="font-black text-white">FF<span className="text-[#F97316]">ZONE</span></span>
        </Link>
        <button onClick={() => setOpen(!open)} className="p-2 text-white/70 hover:text-white transition-colors">
          <FiGrid size={24} />
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`fixed lg:static top-0 left-0 h-full w-64 shrink-0 bg-[#111827] border-r border-white/5 flex flex-col z-[100] transition-transform duration-300 transform ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center gap-2 px-6 border-b border-white/5">
          <GiFlame className="text-[#F97316] text-2xl" />
          <span className="font-black text-white text-lg">FF<span className="text-[#F97316]">ZONE</span> <span className="text-xs text-white/40 uppercase ml-1">Admin</span></span>
        </div>
        <nav className="flex-1 py-6 space-y-2 px-4 overflow-y-auto">
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest px-2 mb-2">Main Menu</p>
          {NAV.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                pathname === to
                  ? 'bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}>
              <Icon size={18} />{label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5 bg-[#0B0F1A]/30">
          <Link to="/" className="flex items-center gap-2 text-white/40 hover:text-white text-xs px-4 py-2 transition font-bold">
            ← Player View
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 text-white/40 hover:text-red-400 text-xs px-4 py-2 transition font-bold">
            <FiLogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 pt-16 lg:pt-0 overflow-auto">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
