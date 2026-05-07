/**
 * FFZone – Navbar
 */

import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { FiMenu, FiX, FiBell, FiUser, FiLogOut, FiShield } from 'react-icons/fi'
import { GiFlame } from 'react-icons/gi'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore()
  const navigate   = useNavigate()
  const location   = useLocation()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out.')
    navigate('/')
  }

  const navLinks = [
    { to: '/tournaments', label: 'Tournaments' },
    { to: '/team-finder', label: 'Team Finder' },
    ...(isAuthenticated() ? [
      { to: '/matches',   label: 'My Matches' },
      { to: '/dashboard', label: 'Dashboard' },
    ] : []),
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-[rgba(249,115,22,0.15)] bg-[#0B0F1A]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <GiFlame className="text-[#F97316] text-2xl group-hover:scale-125 transition-transform" />
          <span className="text-xl font-black text-white tracking-wider">
            FF<span className="text-[#F97316]">ZONE</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm font-medium transition-colors hover:text-[#F97316] ${
                location.pathname === to ? 'text-[#F97316]' : 'text-white/70'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated() ? (
            <>
              {isAdmin() && (
                <Link to="/admin/dashboard" className="btn-ghost flex items-center gap-1 text-sm py-1.5 px-3">
                  <FiShield size={14} /> Admin
                </Link>
              )}
              <Link to="/profile" className="flex items-center gap-2 text-white/70 hover:text-white transition">
                <div className="w-8 h-8 rounded-full bg-[#F97316]/20 border border-[#F97316]/40 flex items-center justify-center">
                  <FiUser size={14} className="text-[#F97316]" />
                </div>
                <span className="text-sm font-medium">{user?.name?.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="btn-ghost py-1.5 px-3 text-sm flex items-center gap-1">
                <FiLogOut size={14} /> Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost py-1.5 px-4 text-sm">Login</Link>
              <Link to="/login?tab=register" className="btn-fire py-1.5 px-4 text-sm">Join Free</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[rgba(249,115,22,0.1)] bg-[#111827] px-4 py-4 space-y-3">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="block text-white/80 hover:text-[#F97316] font-medium transition"
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            {isAuthenticated() ? (
              <>
                {isAdmin() && (
                  <Link to="/admin/dashboard" onClick={() => setOpen(false)} className="btn-ghost text-center text-sm">
                    Admin Dashboard
                  </Link>
                )}
                <button onClick={() => { handleLogout(); setOpen(false) }} className="btn-ghost text-sm">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="btn-ghost text-center text-sm">Login</Link>
                <Link to="/login?tab=register" onClick={() => setOpen(false)} className="btn-fire text-center text-sm">Join Free</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
