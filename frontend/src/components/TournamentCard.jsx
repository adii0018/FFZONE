import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiUsers, FiClock, FiMapPin, FiZap } from 'react-icons/fi'
import { GiTrophy, GiCrossedSwords } from 'react-icons/gi'
import { format } from 'date-fns'
import { getImageUrl } from '../lib/api'

const STATUS_CONFIG = {
  live:      { label: 'LIVE',      cls: 'badge-live',      dot: 'bg-[#FF007F] animate-pulse' },
  upcoming:  { label: 'UPCOMING',  cls: 'badge-upcoming',  dot: 'bg-[#00D2FF]' },
  open:      { label: 'OPEN',      cls: 'badge-open',      dot: 'bg-[#00FF9C]' },
  completed: { label: 'COMPLETED', cls: 'badge-completed', dot: 'bg-white/30' },
}

const MAP_COLOR = {
  Bermuda:   '#00D2FF',
  Purgatory: '#00FF9C',
  Kalahari:  '#FF007F',
}

export default function TournamentCard({ tournament }) {
  const {
    _id, title, mode, map, entry_fee, prize_pool,
    max_slots, filled_slots = 0, start_time, status, banner,
  } = tournament

  const cfg        = STATUS_CONFIG[status] || STATUS_CONFIG.upcoming
  const pct        = Math.min(100, Math.round((filled_slots / max_slots) * 100))
  const mapColor   = MAP_COLOR[map] || '#FF007F'
  const startDate  = start_time ? format(new Date(start_time), 'dd MMM, hh:mm a') : '—'

  // Detect if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <motion.div
      whileHover={prefersReducedMotion ? {} : { y: -10, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="card overflow-hidden group cursor-pointer hover:shadow-[0_20px_50px_rgba(255,0,127,0.2)] transition-all duration-500 touch-manipulation"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Banner */}
      <div className="relative h-44 sm:h-40 overflow-hidden bg-[#05070A]">
        {banner ? (
          <img
            src={getImageUrl(banner)}
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-70"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = `
                <div class="absolute inset-0 flex items-center justify-center bg-[#05070A] opacity-20">
                  <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="80" width="80" xmlns="http://www.w3.org/2000/svg" style="color: #FF007F">
                    <path d="M7 2h10l4 12H3L7 2z"></path>
                    <path d="M12 2v12"></path>
                    <path d="M12 18v4"></path>
                    <path d="M8 18l1 4"></path>
                    <path d="M16 18l-1 4"></path>
                  </svg>
                </div>
              `;
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <GiCrossedSwords size={80} color="#FF007F" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E121A] via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute top-4 left-4">
          <span className={`badge ${cfg.cls} flex items-center gap-2 px-3 py-1`}>
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>

        {/* Map tag */}
        <div className="absolute top-4 right-4" style={{ color: mapColor }}>
          <span className="text-[10px] font-black bg-black/60 px-3 py-1 rounded-sm border backdrop-blur-md uppercase tracking-tighter" style={{ borderColor: `${mapColor}40` }}>
            <FiMapPin size={10} className="inline mr-1" />{map}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <h3 className="font-black text-white text-base sm:text-lg mb-2 line-clamp-1 group-hover:text-[#FF007F] transition-colors tracking-tight">
          {title}
        </h3>

        <div className="flex items-center gap-3 sm:gap-4 text-xs text-white/50 mb-4 font-bold uppercase tracking-wider flex-wrap">
          <span className="flex items-center gap-1.5"><GiCrossedSwords size={13} className="text-[#FF007F]" />{mode}</span>
          <span className="flex items-center gap-1.5"><FiClock size={13} className="text-[#00D2FF]" />{startDate}</span>
        </div>

        {/* Prize & Entry */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-[#FF007F]/10 border border-[#FF007F]/20 rounded-xl p-3 text-center group-hover:bg-[#FF007F]/20 transition-colors">
            <div className="text-[#FF007F] font-black text-base sm:text-lg">₹{prize_pool?.toLocaleString()}</div>
            <div className="text-white/40 text-[9px] font-black uppercase tracking-widest">Prize Pool</div>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center group-hover:bg-white/10 transition-colors">
            <div className="text-white font-black text-base sm:text-lg">₹{entry_fee}</div>
            <div className="text-white/40 text-[9px] font-black uppercase tracking-widest">Entry Fee</div>
          </div>
        </div>

        {/* Slot progress */}
        <div className="mb-5">
          <div className="flex justify-between text-[10px] text-white/60 mb-2 font-black uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><FiUsers size={12} className="text-[#00FF9C]" />{filled_slots}/{max_slots} slots</span>
            <span className="text-[#00FF9C]">{pct}% Full</span>
          </div>
          <div className="slot-bar-track h-2">
            <div className="slot-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <Link
          to={`/tournament/${_id}`}
          className="btn-fire w-full text-center text-sm font-black py-3.5 sm:py-3 block uppercase tracking-widest shadow-lg shadow-[#FF007F]/20 min-h-[48px] flex items-center justify-center gap-2"
          onClick={(e) => e.stopPropagation()}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <FiZap className="animate-pulse" size={16} />
          View Details
        </Link>
      </div>
    </motion.div>
  )
}
