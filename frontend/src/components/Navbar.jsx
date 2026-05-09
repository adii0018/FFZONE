/**
 * FFZone – Navbar (Enhanced)
 */

import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { FiMenu, FiX, FiUser, FiLogOut, FiShield, FiChevronDown, FiHelpCircle, FiMail, FiFileText } from 'react-icons/fi'
import { GiFlame, GiTrophy, GiCrosshair, GiPodium, GiSwordsPower } from 'react-icons/gi'
import { MdPeople, MdLeaderboard } from 'react-icons/md'
import { HiSparkles } from 'react-icons/hi'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import { getAvatarUrl } from '../lib/api'
import AuthLoader from './AuthLoader'

// ─── Help Dropdown items ─────────────────────────────────────
const HELP_LINKS = [
  { to: '/faq',     icon: FiHelpCircle, label: 'FAQ',            desc: 'Common questions answered' },
  { to: '/contact', icon: FiMail,       label: 'Contact Us',     desc: 'Reach out to our team' },
  { to: '/terms',   icon: FiFileText,   label: 'Terms of Service', desc: 'Platform rules & terms' },
]

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [open, setOpen]         = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const helpRef = useRef(null)

  // Check if current page is admin panel
  const isAdminPage = location.pathname.startsWith('/admin')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close help dropdown on outside click
  useEffect(() => {
    function onClickOutside(e) {
      if (helpRef.current && !helpRef.current.contains(e.target)) setHelpOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setOpen(false) }, [location.pathname])

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    setLoggingOut(false)
    toast.success('Logged out.')
    navigate('/')
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  const publicLinks = [
    { to: '/tournaments', label: 'Tournaments', icon: GiTrophy },
    // Hide Team Finder for admins to keep it clean
    ...(!isAdminPage && !isAdmin() ? [{ to: '/team-finder', label: 'Team Finder',  icon: MdPeople }] : []),
  ]

  const authLinks = isAuthenticated() ? [
    // Hide My Matches and Dashboard for admins
    ...(!isAdminPage && !isAdmin() ? [{ to: '/matches',   label: 'My Matches', icon: GiSwordsPower }] : []),
    ...(!isAdminPage && !isAdmin() ? [{ to: '/dashboard', label: 'Dashboard',  icon: MdLeaderboard }] : []),
  ] : []

  const allNavLinks = [...publicLinks, ...authLinks]

  return (
    <>
      {loggingOut && <AuthLoader message="Logging out..." />}
      <nav className={`sticky w-full top-0 z-[60] transition-all duration-500 ${
      scrolled
        ? 'bg-[#050d1a]/85 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
        : 'bg-[#050d1a] border-b border-[rgba(0,245,255,0.05)]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-[64px] sm:h-[72px] flex items-center justify-between gap-2 sm:gap-4">

        {/* ── Logo ────────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group relative z-50 flex-shrink-0 min-w-0">
          <div className="absolute -inset-4 bg-gradient-to-r from-[#00f5ff]/20 to-transparent blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <GiFlame className="text-[#00f5ff] text-2xl sm:text-3xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 drop-shadow-[0_0_8px_rgba(0,245,255,0.6)] flex-shrink-0" />
          <span className="text-xl sm:text-2xl font-black text-white tracking-wider relative whitespace-nowrap">
            FF<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f5ff] to-[#0066ff]">ZONE</span>
          </span>
          {/* Live badge */}
          <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full ml-1 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>LIVE
          </span>
        </Link>

        {/* ── Desktop Nav ─────────────────────────────────── */}
        <div className="hidden lg:flex items-center gap-1 bg-white/[0.02] border border-white/5 px-4 py-2 rounded-full backdrop-blur-md">
          {allNavLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`relative flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-300 group ${
                isActive(to)
                  ? 'text-white bg-[#00f5ff]/10 border border-[#00f5ff]/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`text-base transition-colors ${isActive(to) ? 'text-[#00f5ff]' : 'group-hover:text-[#00f5ff]'}`} />
              {label}
              {isActive(to) && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-gradient-to-r from-[#00f5ff] to-[#0066ff] rounded-full"></span>
              )}
            </Link>
          ))}

          {/* Leaderboard link (coming soon) - Hide for admins */}
          {!isAdminPage && !isAdmin() && (
            <Link
              to="/leaderboard"
              className={`relative flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-300 group text-white/60 hover:text-white hover:bg-white/5`}
            >
              <GiPodium className="text-base group-hover:text-[#00f5ff] transition-colors" />
              Leaderboard
              <span className="text-[9px] font-bold text-[#00D2FF] bg-[#00D2FF]/10 border border-[#00D2FF]/30 px-1.5 py-0.5 rounded-full ml-0.5">SOON</span>
            </Link>
          )}

          {/* Help Dropdown - Hide for admins */}
          {!isAdminPage && !isAdmin() && (
            <div className="relative" ref={helpRef}>
              <button
                onClick={() => setHelpOpen(o => !o)}
                className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-300 ${
                  helpOpen ? 'text-white bg-white/5' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <FiHelpCircle className={`text-base transition-colors ${helpOpen ? 'text-[#00f5ff]' : ''}`} />
                Help
                <FiChevronDown className={`text-xs transition-transform duration-300 ${helpOpen ? 'rotate-180 text-[#00f5ff]' : ''}`} />
              </button>

              {/* Dropdown panel */}
              <div className={`absolute top-full right-0 mt-3 w-64 bg-[#0D1120]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 origin-top-right ${
                helpOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
              }`}>
                <div className="p-2">
                  {HELP_LINKS.map(({ to, icon: Icon, label, desc }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setHelpOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 group transition-all duration-200"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#00f5ff]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#00f5ff]/20 transition-colors">
                        <Icon className="text-[#00f5ff]" size={16} />
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold group-hover:text-[#00f5ff] transition-colors">{label}</p>
                        <p className="text-white/40 text-xs">{desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-white/5 px-4 py-3 bg-white/[0.02]">
                  <Link to="/contact" onClick={() => setHelpOpen(false)} className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-[#00f5ff]/10 border border-[#00f5ff]/20 text-[#00f5ff] text-sm font-bold hover:bg-[#00f5ff]/20 transition-colors">
                    <HiSparkles size={14} /> Get Support
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Actions ────────────────────────────────── */}
        <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
          {isAuthenticated() ? (
            <div className="flex items-center gap-3">
              {isAdmin() && (
                <Link to="/admin/dashboard" className="flex items-center gap-1.5 text-xs font-bold text-[#00f5ff] bg-[#00f5ff]/10 px-3 py-1.5 rounded-lg border border-[#00f5ff]/20 hover:bg-[#00f5ff]/20 transition-colors">
                  <FiShield size={13} /> ADMIN
                </Link>
              )}
              <div className="h-8 w-px bg-white/10"></div>
              <Link to="/profile" className="flex items-center gap-2 group hover:bg-white/5 pr-3 py-1 pl-1 rounded-full transition-all border border-transparent hover:border-white/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00f5ff] to-[#0066ff] p-[1.5px] group-hover:shadow-[0_0_15px_rgba(0,245,255,0.4)] transition-shadow overflow-hidden">
                  <div className="w-full h-full rounded-full bg-[#071428] flex items-center justify-center overflow-hidden">
                    <img 
                      src={getAvatarUrl(user?.email)} 
                      alt="avatar" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                  {user?.name?.split(' ')[0] || 'Player'}
                </span>
              </Link>
              <button onClick={handleLogout} className="text-white/40 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-full transition-all" title="Logout">
                <FiLogOut size={17} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 text-sm font-bold text-white/70 hover:text-white transition-colors">
                Login
              </Link>
              <Link to="/login?tab=register" className="relative group overflow-hidden rounded-lg p-[1px]">
                <span className="absolute inset-0 bg-gradient-to-r from-[#00f5ff] via-[#0066ff] to-[#00f5ff] opacity-70 group-hover:opacity-100 bg-[length:200%_auto] animate-gradient transition-opacity duration-300"></span>
                <div className="relative bg-[#050d1a] px-5 py-2 rounded-[7px] group-hover:bg-transparent transition-all duration-300">
                  <span className="text-sm font-bold text-white relative z-10">Join Free 🔥</span>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* ── Mobile Hamburger ──────────────────────────────── */}
        <button 
          className="lg:hidden relative z-[70] p-2.5 text-white/80 hover:text-white transition-colors flex-shrink-0 touch-manipulation active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center" 
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <FiX size={26} /> : <FiMenu size={26} />}
        </button>
      </div>

      {/* ── Mobile Menu ───────────────────────────────────── */}
      <div className={`fixed inset-0 bg-[#050d1a] z-[65] transition-all duration-300 lg:hidden flex flex-col ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Sticky mini-header inside menu */}
        <div className="flex items-center justify-between px-4 sm:px-6 h-[64px] sm:h-[72px] border-b border-white/5 flex-shrink-0">
          <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-1.5 sm:gap-2">
            <GiFlame className="text-[#00f5ff] text-xl sm:text-2xl" />
            <span className="text-lg sm:text-xl font-black text-white">FF<span className="text-[#00f5ff]">ZONE</span></span>
          </Link>
          <button 
            onClick={() => setOpen(false)} 
            className="p-2.5 text-white/60 hover:text-white transition-colors touch-manipulation active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <FiX size={26} />
          </button>
        </div>

        {/* Scrollable content with proper mobile optimization */}
        <div className={`flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 sm:py-6 transition-all duration-500 -webkit-overflow-scrolling-touch ${open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="flex flex-col gap-2.5 pb-6 min-h-full">

          {/* Mobile nav links */}
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-3 ml-1 px-1">Navigate</p>
          {allNavLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all touch-manipulation active:scale-98 min-h-[52px] ${
                isActive(to)
                  ? 'text-[#00f5ff] bg-[#00f5ff]/10 border border-[#00f5ff]/20'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Icon size={22} className={`flex-shrink-0 ${isActive(to) ? 'text-[#00f5ff]' : ''}`} />
              <span className="truncate">{label}</span>
            </Link>
          ))}

          {/* Leaderboard - Hide for admins */}
          {!isAdminPage && !isAdmin() && (
            <Link 
              to="/leaderboard" 
              onClick={() => setOpen(false)} 
              className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-4 sm:py-4 rounded-xl font-bold text-base sm:text-lg text-white/70 hover:text-white hover:bg-white/5 transition-all touch-manipulation active:scale-98 min-h-[52px]"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <GiPodium size={22} className="flex-shrink-0" /> 
              <span className="truncate">Leaderboard</span>
              <span className="text-[10px] sm:text-xs text-[#00D2FF] ml-auto bg-[#00D2FF]/10 px-2 py-1 rounded-full flex-shrink-0 font-bold">SOON</span>
            </Link>
          )}

          <div className="h-px bg-white/5 my-3 sm:my-4"></div>

          {/* Support section - Hide for admins */}
          {!isAdminPage && !isAdmin() && (
            <>
              <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-3 ml-1 px-1">Support</p>
              {HELP_LINKS.map(({ to, icon: Icon, label }) => (
                <Link 
                  key={to} 
                  to={to} 
                  onClick={() => setOpen(false)} 
                  className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl font-semibold text-sm sm:text-base text-white/60 hover:text-white hover:bg-white/5 transition-all touch-manipulation active:scale-98 min-h-[48px]"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <Icon size={20} className="flex-shrink-0" /> 
                  <span className="truncate">{label}</span>
                </Link>
              ))}
              <div className="h-px bg-white/5 my-3 sm:my-4"></div>
            </>
          )}

          {isAuthenticated() ? (
            <div className="flex flex-col gap-3 sm:gap-3">
              {isAdmin() && (
                <Link 
                  to="/admin/dashboard" 
                  onClick={() => setOpen(false)} 
                  className="flex items-center justify-center gap-2 py-4 sm:py-4 rounded-xl bg-[#00f5ff]/10 text-[#00f5ff] font-bold border border-[#00f5ff]/20 touch-manipulation active:scale-98 transition-transform min-h-[52px]"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <FiShield className="flex-shrink-0" size={20} /> 
                  <span className="truncate">Admin Dashboard</span>
                </Link>
              )}
              <Link 
                to="/profile" 
                onClick={() => setOpen(false)} 
                className="flex items-center justify-center gap-2 py-4 sm:py-4 rounded-xl bg-white/5 text-white font-bold border border-white/10 touch-manipulation active:scale-98 transition-transform min-h-[52px]"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <div className="w-6 h-6 sm:w-6 sm:h-6 rounded-full overflow-hidden flex-shrink-0">
                  <img src={getAvatarUrl(user?.email)} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <span className="truncate">My Profile</span>
              </Link>
              <button 
                onClick={() => { handleLogout(); setOpen(false) }} 
                className="flex items-center justify-center gap-2 py-4 sm:py-4 rounded-xl bg-red-500/10 text-red-400 font-bold border border-red-500/20 touch-manipulation active:scale-98 transition-transform min-h-[52px]"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <FiLogOut className="flex-shrink-0" size={20} /> 
                <span className="truncate">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:gap-3">
              <Link 
                to="/login" 
                onClick={() => setOpen(false)} 
                className="text-center py-4 sm:py-4 rounded-xl bg-white/5 text-white font-bold border border-white/10 touch-manipulation active:scale-98 transition-transform min-h-[52px] flex items-center justify-center"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Login
              </Link>
              <Link 
                to="/login?tab=register" 
                onClick={() => setOpen(false)} 
                className="text-center py-4 sm:py-4 rounded-xl bg-gradient-to-r from-[#00f5ff] to-[#0066ff] text-[#050d1a] font-bold shadow-[0_0_30px_rgba(0,245,255,0.3)] touch-manipulation active:scale-98 transition-transform min-h-[52px] flex items-center justify-center"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Join Free 🔥
              </Link>
            </div>
          )}
          </div>
        </div>
      </div>
    </nav>
    </>
  )
}
