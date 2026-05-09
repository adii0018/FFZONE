/**
 * FFZone – Footer
 */

import { Link } from 'react-router-dom'
import { GiFlame } from 'react-icons/gi'
import { FaInstagram, FaWhatsapp, FaDiscord, FaFire, FaYoutube } from 'react-icons/fa'
import { MdOutlineMail } from 'react-icons/md'

export default function Footer() {
  return (
    <footer className="relative pt-20 pb-6 mt-20 overflow-hidden font-sans border-t border-white/5">
      {/* Free Fire Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/footer-bg.jpg')" }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050810]/90 via-[#050810]/80 to-[#050810]/95" />
      {/* Extra orange tint glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00f5ff]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00f5ff]/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-16">
          
          {/* Brand & Socials */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <div className="relative">
                <div className="absolute inset-0 bg-[#00f5ff] blur-md opacity-40 group-hover:opacity-80 transition-opacity rounded-full"></div>
                <GiFlame className="text-[#00f5ff] text-3xl relative z-10" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white group-hover:text-[#00f5ff] transition-colors">
                FF<span className="text-[#00f5ff]">ZONE</span>
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed">
              The premier Free Fire Esports Platform. Assemble your squad, dominate the battlefield, and rise through the competitive ranks. Tactical kineticism at its core.
            </p>
            <div className="flex gap-3 sm:gap-4 items-center mt-2 flex-wrap">
              <a 
                href="#" 
                className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-[#00f5ff] hover:text-white hover:scale-110 hover:shadow-[0_0_15px_rgba(249,115,22,0.5)] transition-all duration-300 touch-manipulation min-w-[44px] min-h-[44px]"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                aria-label="Instagram"
              >
                <FaInstagram size={20} />
              </a>
              <a 
                href="#" 
                className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-[#25D366] hover:text-white hover:scale-110 hover:shadow-[0_0_15px_rgba(37,211,102,0.5)] transition-all duration-300 touch-manipulation min-w-[44px] min-h-[44px]"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={20} />
              </a>
              <a 
                href="#" 
                className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-[#5865F2] hover:text-white hover:scale-110 hover:shadow-[0_0_15px_rgba(88,101,242,0.5)] transition-all duration-300 touch-manipulation min-w-[44px] min-h-[44px]"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                aria-label="Discord"
              >
                <FaDiscord size={20} />
              </a>
              <a 
                href="#" 
                className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-[#FF0000] hover:text-white hover:scale-110 hover:shadow-[0_0_15px_rgba(255,0,0,0.5)] transition-all duration-300 touch-manipulation min-w-[44px] min-h-[44px]"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                aria-label="YouTube"
              >
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00f5ff]"></span> Navigation
            </h4>
            <ul className="space-y-3">
              {[
                { path: '/', label: 'Home' },
                { path: '/tournaments', label: 'Tournaments' },
                { path: '/team-finder', label: 'Team Finder' },
                { path: '/matches', label: 'My Matches' },
                { path: '/dashboard', label: 'Dashboard' }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="text-white/60 hover:text-[#00f5ff] hover:translate-x-1 inline-block text-sm transition-all duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00f5ff]"></span> Support
            </h4>
            <ul className="space-y-3">
              {[
                { path: '/terms',   label: 'Terms of Service' },
                { path: '/privacy', label: 'Privacy Policy' },
                { path: '/refund',  label: 'Refund Policy' },
                { path: '/contact', label: 'Contact Us' },
                { path: '/faq',     label: 'FAQ' },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link to={link.path} className="text-white/60 hover:text-[#00f5ff] hover:translate-x-1 inline-block text-sm transition-all duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg flex items-center gap-2">
              <MdOutlineMail className="text-[#00f5ff]" /> Stay Updated
            </h4>
            <p className="text-white/60 text-sm mb-4 leading-relaxed">
              Subscribe to our newsletter for the latest tournament updates, news, and exclusive drops.
            </p>
            <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#00f5ff] focus:ring-1 focus:ring-[#00f5ff] transition-all"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-[#00f5ff] hover:bg-[#ea580c] text-white font-bold py-3.5 sm:py-3 px-4 rounded-lg text-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] min-h-[48px] touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                SUBSCRIBE NOW
              </button>
            </form>
          </div>

        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-8"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-white/40 text-sm flex items-center justify-center md:justify-start gap-1">
            © {new Date().getFullYear()} FFZone. Made with <FaFire className="text-[#00f5ff] animate-pulse" /> for the community.
          </p>
          <p className="text-white/30 text-xs">
            Not affiliated with Garena Free Fire. All trademarks belong to their respective owners.
          </p>
        </div>

      </div>
    </footer>
  )
}
