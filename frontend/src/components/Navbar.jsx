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

  const handleLogout = () => {
    logout()
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
    <nav className={`sticky w-full top-0 z-[60] transition-all duration-500 ${
      scrolled
        ? 'bg-[#05070A]/85 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.4)]'
        : 'bg-[#05070A] border-b border-[rgba(255,0,127,0.05)]'
    }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-[72px] flex items-center justify-between gap-4">

        {/* ── Logo ────────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2 group relative z-50 flex-shrink-0">
          <div className="absolute -inset-4 bg-gradient-to-r from-[#FF007F]/20 to-transparent blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          <GiFlame className="text-[#FF007F] text-3xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 drop-shadow-[0_0_8px_rgba(255,0,127,0.6)]" />
          <span className="text-2xl font-black text-white tracking-wider relative">
            FF<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF007F] to-[#D4006A]">ZONE</span>
          </span>
          {/* Live badge */}
          <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full ml-1">
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
                  ? 'text-white bg-[#FF007F]/10 border border-[#FF007F]/20'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`text-base transition-colors ${isActive(to) ? 'text-[#FF007F]' : 'group-hover:text-[#FF007F]'}`} />
              {label}
              {isActive(to) && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-gradient-to-r from-[#FF007F] to-[#D4006A] rounded-full"></span>
              )}
            </Link>
          ))}

          {/* Leaderboard link (coming soon) - Hide for admins */}
          {!isAdminPage && !isAdmin() && (
            <Link
              to="/leaderboard"
              className={`relative flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-all duration-300 group text-white/60 hover:text-white hover:bg-white/5`}
            >
              <GiPodium className="text-base group-hover:text-[#FF007F] transition-colors" />
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
                <FiHelpCircle className={`text-base transition-colors ${helpOpen ? 'text-[#FF007F]' : ''}`} />
                Help
                <FiChevronDown className={`text-xs transition-transform duration-300 ${helpOpen ? 'rotate-180 text-[#FF007F]' : ''}`} />
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
                      <div className="w-9 h-9 rounded-lg bg-[#FF007F]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#FF007F]/20 transition-colors">
                        <Icon className="text-[#FF007F]" size={16} />
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold group-hover:text-[#FF007F] transition-colors">{label}</p>
                        <p className="text-white/40 text-xs">{desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-white/5 px-4 py-3 bg-white/[0.02]">
                  <Link to="/contact" onClick={() => setHelpOpen(false)} className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-[#FF007F]/10 border border-[#FF007F]/20 text-[#FF007F] text-sm font-bold hover:bg-[#FF007F]/20 transition-colors">
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
                <Link to="/admin/dashboard" className="flex items-center gap-1.5 text-xs font-bold text-[#FF007F] bg-[#FF007F]/10 px-3 py-1.5 rounded-lg border border-[#FF007F]/20 hover:bg-[#FF007F]/20 transition-colors">
                  <FiShield size={13} /> ADMIN
                </Link>
              )}
              <div className="h-8 w-px bg-white/10"></div>
              <Link to="/profile" className="flex items-center gap-2 group hover:bg-white/5 pr-3 py-1 pl-1 rounded-full transition-all border border-transparent hover:border-white/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF007F] to-[#D4006A] p-[1.5px] group-hover:shadow-[0_0_15px_rgba(255,0,127,0.4)] transition-shadow overflow-hidden">
                  <div className="w-full h-full rounded-full bg-[#0E121A] flex items-center justify-center overflow-hidden">
                    <img 
                      src={getAvatarUrl(user?.email || user?.name)} 
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
                <span className="absolute inset-0 bg-gradient-to-r from-[#FF007F] via-[#D4006A] to-[#FF007F] opacity-70 group-hover:opacity-100 bg-[length:200%_auto] animate-gradient transition-opacity duration-300"></span>
                <div className="relative bg-[#05070A] px-5 py-2 rounded-[7px] group-hover:bg-transparent transition-all duration-300">
                  <span className="text-sm font-bold text-white relative z-10">Join Free 🔥</span>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* ── Mobile Hamburger ──────────────────────────────── */}
        <button className="lg:hidden relative z-[70] p-2 text-white/80 hover:text-white transition-colors" onClick={() => setOpen(!open)}>
          {open ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* ── Mobile Menu ───────────────────────────────────── */}
      <div className={`fixed inset-0 bg-[#05070A] z-[65] transition-all duration-300 lg:hidden flex flex-col ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Sticky mini-header inside menu */}
        <div className="flex items-center justify-between px-6 h-[72px] border-b border-white/5 flex-shrink-0">
          <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <GiFlame className="text-[#FF007F] text-2xl" />
            <span className="text-xl font-black text-white">FF<span className="text-[#FF007F]">ZONE</span></span>
          </Link>
          <button onClick={() => setOpen(false)} className="p-2 text-white/60 hover:text-white transition-colors">
            <FiX size={24} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className={`flex-1 overflow-y-auto px-6 py-6 transition-all duration-500 ${open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="flex flex-col gap-2">

          {/* Mobile nav links */}
          <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-2 ml-1">Navigate</p>
          {allNavLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-4 px-5 py-4 rounded-xl font-bold text-lg transition-all ${
                isActive(to)
                  ? 'text-[#FF007F] bg-[#FF007F]/10 border border-[#FF007F]/20'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={22} className={isActive(to) ? 'text-[#FF007F]' : ''} />
              {label}
            </Link>
          ))}

          {/* Leaderboard - Hide for admins */}
          {!isAdminPage && !isAdmin() && (
            <Link to="/leaderboard" onClick={() => setOpen(false)} className="flex items-center gap-4 px-5 py-4 rounded-xl font-bold text-lg text-white/70 hover:text-white hover:bg-white/5 transition-all">
              <GiPodium size={22} /> Leaderboard <span className="text-xs text-[#00D2FF] ml-1 bg-[#00D2FF]/10 px-2 py-0.5 rounded-full">SOON</span>
            </Link>
          )}

          <div className="h-px bg-white/5 my-3"></div>

          {/* Support section - Hide for admins */}
          {!isAdminPage && !isAdmin() && (
            <>
              <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-2 ml-1">Support</p>
              {HELP_LINKS.map(({ to, icon: Icon, label }) => (
                <Link key={to} to={to} onClick={() => setOpen(false)} className="flex items-center gap-4 px-5 py-3.5 rounded-xl font-semibold text-base text-white/60 hover:text-white hover:bg-white/5 transition-all">
                  <Icon size={18} /> {label}
                </Link>
              ))}
              <div className="h-px bg-white/5 my-3"></div>
            </>
          )}

          {isAuthenticated() ? (
            <div className="flex flex-col gap-3">
              {isAdmin() && (
                <Link to="/admin/dashboard" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#FF007F]/10 text-[#FF007F] font-bold border border-[#FF007F]/20">
                  <FiShield /> Admin Dashboard
                </Link>
              )}
              <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/5 text-white font-bold border border-white/10">
                <div className="w-6 h-6 rounded-full overflow-hidden">
                  <img src={getAvatarUrl(user?.email || user?.name)} alt="avatar" className="w-full h-full object-cover" />
                </div>
                My Profile
              </Link>
              <button onClick={() => { handleLogout(); setOpen(false) }} className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-500/10 text-red-400 font-bold border border-red-500/20">
                <FiLogOut /> Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link to="/login" onClick={() => setOpen(false)} className="text-center py-3.5 rounded-xl bg-white/5 text-white font-bold border border-white/10">
                Login
              </Link>
              <Link to="/login?tab=register" onClick={() => setOpen(false)} className="text-center py-3.5 rounded-xl bg-gradient-to-r from-[#FF007F] to-[#D4006A] text-white font-bold shadow-[0_0_30px_rgba(255,0,127,0.3)]">
                Join Free 🔥
              </Link>
            </div>
          )}
          </div>
        </div>
      </div>
    </nav>
  )
}
