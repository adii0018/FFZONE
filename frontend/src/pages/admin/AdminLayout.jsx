import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { GiFlame } from 'react-icons/gi'
import { FiGrid, FiList, FiDollarSign, FiUsers, FiKey, FiAward, FiLogOut } from 'react-icons/fi'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'
import StarField from '../../components/StarField'

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
    <div className="flex min-h-screen bg-[#050d1a] text-white relative overflow-hidden">
      {/* Starfield Background */}
      <StarField />
      
      {/* Subtle Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00f5ff]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[#00FF9C]/5 blur-[120px] pointer-events-none" />

      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#071428]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 z-[100]">
        <Link to="/" className="flex items-center gap-2">
          <GiFlame className="text-[#00f5ff] text-xl" />
          <span className="font-black text-white uppercase tracking-tighter">FF<span className="text-[#00f5ff]">ZONE</span></span>
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
      <aside className={`fixed lg:static top-0 left-0 h-full w-64 shrink-0 bg-[#071428]/95 backdrop-blur-xl border-r border-white/5 flex flex-col z-[100] transition-transform duration-300 transform ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-20 flex items-center gap-2 px-6 border-b border-white/5">
          <GiFlame className="text-[#00f5ff] text-2xl animate-pulse" />
          <div className="flex flex-col">
            <span className="font-black text-white text-lg leading-none tracking-tighter uppercase">FF<span className="text-[#00f5ff]">ZONE</span></span>
            <span className="text-[10px] text-[#00f5ff] font-bold uppercase tracking-[0.2em] mt-1">Admin Panel</span>
          </div>
        </div>
        <nav className="flex-1 py-8 space-y-2 px-4 overflow-y-auto">
          <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] px-4 mb-4">Command Center</p>
          {NAV.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                pathname === to
                  ? 'bg-[#00f5ff]/10 text-[#00f5ff] border border-[#00f5ff]/20 shadow-[0_0_20px_-10px_rgba(0,245,255,0.5)]'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}>
              <Icon size={18} className={pathname === to ? 'animate-pulse' : ''} />
              {label}
            </Link>
          ))}
        </nav>
        
        <div className="p-6 border-t border-white/5 bg-black/20 space-y-3">
          <Link to="/" className="flex items-center gap-3 text-white/30 hover:text-white text-xs px-4 py-2.5 transition-all font-bold rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5">
            <FiKey size={14} /> Back to Arena
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 text-white/30 hover:text-red-500 text-xs px-4 py-2.5 transition-all font-bold rounded-lg border border-transparent hover:border-red-500/10 hover:bg-red-500/5">
            <FiLogOut size={14} /> System Exit
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="relative flex-1 min-w-0 pt-16 lg:pt-0 overflow-auto z-10 custom-scrollbar">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
