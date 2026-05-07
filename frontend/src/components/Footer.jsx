/**
 * FFZone – Footer
 */

import { Link } from 'react-router-dom'
import { GiFlame } from 'react-icons/gi'
import { FaInstagram, FaWhatsapp, FaDiscord } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(249,115,22,0.1)] bg-[#0a0d17] mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Brand */}
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <GiFlame className="text-[#F97316] text-2xl" />
            <span className="text-xl font-black">FF<span className="text-[#F97316]">ZONE</span></span>
          </div>
          <p className="text-white/50 text-sm leading-relaxed max-w-sm">
            The premier Free Fire Esports Tournament Platform. Compete, win, and rise through the ranks.
          </p>
          <div className="flex gap-4 mt-4">
            <a href="#" className="text-white/40 hover:text-[#F97316] transition"><FaInstagram size={20} /></a>
            <a href="#" className="text-white/40 hover:text-[#25D366] transition"><FaWhatsapp size={20} /></a>
            <a href="#" className="text-white/40 hover:text-[#5865F2] transition"><FaDiscord size={20} /></a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-white font-semibold mb-3">Platform</h4>
          <ul className="space-y-2">
            {[['/', 'Home'], ['/tournaments', 'Tournaments'], ['/team-finder', 'Team Finder'], ['/matches', 'My Matches']].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="text-white/50 hover:text-[#F97316] text-sm transition">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3">Legal</h4>
          <ul className="space-y-2">
            {[['#', 'Terms of Service'], ['#', 'Privacy Policy'], ['#', 'Refund Policy']].map(([to, label]) => (
              <li key={label}>
                <a href={to} className="text-white/50 hover:text-[#F97316] text-sm transition">{label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 py-4 text-center text-white/30 text-xs">
        © 2024 FFZone. Made with 🔥 | Not affiliated with Garena Free Fire.
      </div>
    </footer>
  )
}
