/**
 * FFZone – Tournament Card Component
 */

import { Link } from 'react-router-dom'
import { FiUsers, FiClock, FiMapPin, FiZap } from 'react-icons/fi'
import { GiTrophy, GiCrossedSwords } from 'react-icons/gi'
import { format } from 'date-fns'

const STATUS_CONFIG = {
  live:      { label: 'LIVE',      cls: 'badge-live',      dot: 'bg-red-500 animate-pulse' },
  upcoming:  { label: 'UPCOMING',  cls: 'badge-upcoming',  dot: 'bg-cyan-400' },
  open:      { label: 'OPEN',      cls: 'badge-open',      dot: 'bg-orange-400' },
  completed: { label: 'COMPLETED', cls: 'badge-completed', dot: 'bg-white/30' },
}

const MAP_COLOR = {
  Bermuda:   '#22D3EE',
  Purgatory: '#7C3AED',
  Kalahari:  '#F97316',
}

export default function TournamentCard({ tournament }) {
  const {
    _id, title, mode, map, entry_fee, prize_pool,
    max_slots, filled_slots = 0, start_time, status, banner,
  } = tournament

  const cfg        = STATUS_CONFIG[status] || STATUS_CONFIG.upcoming
  const pct        = Math.min(100, Math.round((filled_slots / max_slots) * 100))
  const mapColor   = MAP_COLOR[map] || '#F97316'
  const startDate  = start_time ? format(new Date(start_time), 'dd MMM, hh:mm a') : '—'

  return (
    <div className="card overflow-hidden group cursor-pointer animate-fade-in">
      {/* Banner */}
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-[#1a1f2e] to-[#0B0F1A]">
        {banner ? (
          <img src={banner} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <GiCrossedSwords size={80} color="#F97316" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={`badge ${cfg.cls} flex items-center gap-1.5`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>

        {/* Map tag */}
        <div className="absolute top-3 right-3" style={{ color: mapColor }}>
          <span className="text-xs font-bold bg-black/50 px-2 py-0.5 rounded-full border" style={{ borderColor: `${mapColor}40` }}>
            <FiMapPin size={9} className="inline mr-1" />{map}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-white text-base mb-1 line-clamp-1 group-hover:text-[#F97316] transition-colors">
          {title}
        </h3>

        <div className="flex items-center gap-3 text-xs text-white/50 mb-3">
          <span className="flex items-center gap-1"><GiCrossedSwords size={11} />{mode}</span>
          <span className="flex items-center gap-1"><FiClock size={11} />{startDate}</span>
        </div>

        {/* Prize & Entry */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-[#F97316]/10 rounded-lg p-2 text-center">
            <div className="text-[#F97316] font-bold text-sm">₹{prize_pool?.toLocaleString()}</div>
            <div className="text-white/40 text-[10px]">Prize Pool</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <div className="text-white font-semibold text-sm">₹{entry_fee}</div>
            <div className="text-white/40 text-[10px]">Entry Fee</div>
          </div>
        </div>

        {/* Slot progress */}
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-white/40 mb-1">
            <span className="flex items-center gap-1"><FiUsers size={10} />{filled_slots}/{max_slots} slots</span>
            <span>{pct}%</span>
          </div>
          <div className="slot-bar-track">
            <div className="slot-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <Link
          to={`/tournament/${_id}`}
          className="btn-fire w-full text-center text-sm py-2 block"
          onClick={(e) => e.stopPropagation()}
        >
          <FiZap className="inline mr-1" size={13} />
          View Details
        </Link>
      </div>
    </div>
  )
}
