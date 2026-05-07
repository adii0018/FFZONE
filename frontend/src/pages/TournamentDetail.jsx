/**
 * FFZone – Tournament Detail Page
 * Full info, countdown, rules, join button, share.
 */
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FiUsers, FiMapPin, FiClock, FiShare2, FiArrowLeft, FiTarget, FiAlertTriangle, FiClipboard } from 'react-icons/fi'
import { FaWhatsapp, FaInstagram, FaGamepad, FaCopy } from 'react-icons/fa'
import { GiTrophy, GiCrossedSwords, GiTargetShot } from 'react-icons/gi'
import { format } from 'date-fns'
import api from '../lib/api'
import useAuthStore from '../store/authStore'
import CountdownTimer from '../components/CountdownTimer'

const MAP_COLORS = { Bermuda: '#22D3EE', Purgatory: '#7C3AED', Kalahari: '#F97316' }
const MODE_ICONS = { Solo: <FiTarget />, Duo: <FiUsers />, Squad: <GiCrossedSwords /> }

export default function TournamentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const { data: t, isLoading, error } = useQuery({
    queryKey: ['tournament', id],
    queryFn: () => api.get(`/tournaments/${id}/`).then(r => r.data),
  })

  if (isLoading) return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-[#F97316]/30 border-t-[#F97316] rounded-full animate-spin" />
    </div>
  )

  if (error || !t) return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center text-white/50">
      Tournament not found.
    </div>
  )

  const mapColor  = MAP_COLORS[t.map] || '#F97316'
  const fillPct   = Math.min(100, Math.round(((t.filled_slots || 0) / t.max_slots) * 100))
  const shareUrl  = window.location.href
  const isFull    = (t.filled_slots || 0) >= t.max_slots
  const isClosed  = t.status === 'completed' || t.status === 'cancelled'

  return (
    <div className="min-h-screen bg-[#0B0F1A] py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition">
          <FiArrowLeft /> Back
        </button>

        {/* Banner */}
        <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden mb-6 border border-[rgba(249,115,22,0.2)]">
          {t.banner ? (
            <img src={t.banner} alt={t.title} className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a1f2e] to-[#0B0F1A] flex items-center justify-center">
              <GiCrossedSwords size={80} color="#F97316" className="opacity-20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6">
            <span className={`badge ${t.status === 'live' ? 'badge-live' : t.status === 'upcoming' ? 'badge-upcoming' : 'badge-completed'} mb-2`}>
              {t.status?.toUpperCase()}
            </span>
            <h1 className="text-2xl md:text-4xl font-black text-white">{t.title}</h1>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* Left – main info */}
          <div className="md:col-span-2 space-y-4">

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Prize Pool', value: `₹${t.prize_pool?.toLocaleString()}`, color: '#F97316', icon: GiTrophy },
                { label: 'Entry Fee',  value: `₹${t.entry_fee}`,  color: '#22D3EE', icon: GiTargetShot },
                { label: 'Mode',       value: <span className="flex items-center justify-center gap-1">{MODE_ICONS[t.mode]} {t.mode}</span>, color: '#7C3AED', icon: GiCrossedSwords },
                { label: 'Map',        value: t.map,              color: mapColor,   icon: FiMapPin },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="card p-3 text-center">
                  <div className="text-sm font-bold" style={{ color }}>{value}</div>
                  <div className="text-white/40 text-[11px] mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Countdown */}
            <div className="card p-5">
              <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <FiClock size={12} /> Starts In
              </h3>
              <CountdownTimer targetTime={t.start_time} />
              {t.start_time && (
                <p className="text-white/40 text-xs mt-2">
                  {format(new Date(t.start_time), 'EEEE, dd MMMM yyyy • hh:mm a')}
                </p>
              )}
            </div>

            {/* Slots */}
            <div className="card p-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/60 flex items-center gap-2"><FiUsers size={14}/> Slots</span>
                <span className="text-white font-bold">{t.filled_slots || 0} / {t.max_slots}</span>
              </div>
              <div className="slot-bar-track">
                <div className="slot-bar-fill" style={{ width: `${fillPct}%` }} />
              </div>
              {isFull && <p className="text-red-400 text-xs mt-2 flex items-center gap-1"><FiAlertTriangle /> Tournament is full</p>}
            </div>

            {/* Rules */}
            {t.rules && (
              <div className="card p-5">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <FiClipboard /> Rules & Info
                </h3>
                <div className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">{t.rules}</div>
              </div>
            )}

            {/* Room info (approved players only) */}
            {t.room_id && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="card p-5 border-[#22D3EE]/30 glow-cyan">
                <h3 className="text-[#22D3EE] font-bold mb-3 flex items-center gap-2"><FaGamepad /> Room Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#22D3EE]/10 rounded-lg p-3 text-center">
                    <div className="text-[#22D3EE] font-mono font-black text-lg">{t.room_id}</div>
                    <div className="text-white/40 text-xs">Room ID</div>
                  </div>
                  <div className="bg-[#22D3EE]/10 rounded-lg p-3 text-center">
                    <div className="text-[#22D3EE] font-mono font-black text-lg">{t.room_password}</div>
                    <div className="text-white/40 text-xs">Password</div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right – action panel */}
          <div className="space-y-4">
            <div className="card p-5 sticky top-20">
              <div className="text-center mb-4">
                <div className="text-2xl font-black text-[#F97316]">₹{t.prize_pool?.toLocaleString()}</div>
                <div className="text-white/40 text-xs">Total Prize Pool</div>
              </div>

              {isAuthenticated() && !isClosed && !isFull ? (
                <Link to={`/payment/${id}`} className="btn-fire w-full text-center py-3 block mb-3">
                  ⚡ Join Tournament – ₹{t.entry_fee}
                </Link>
              ) : !isAuthenticated() ? (
                <Link to="/login" className="btn-fire w-full text-center py-3 block mb-3">
                  Login to Join
                </Link>
              ) : (
                <button disabled className="btn-fire w-full py-3 opacity-40 cursor-not-allowed mb-3">
                  {isFull ? 'Tournament Full' : 'Closed'}
                </button>
              )}

              {/* Share */}
              <div>
                <p className="text-white/40 text-xs text-center mb-2">Share Tournament</p>
                <div className="flex gap-2">
                  <a href={`https://wa.me/?text=Check this tournament: ${shareUrl}`} target="_blank" rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-xs font-bold hover:bg-[#25D366]/20 transition">
                    <FaWhatsapp size={14} /> WhatsApp
                  </a>
                  <button onClick={() => { navigator.clipboard.writeText(shareUrl); }}
                    className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs font-bold hover:bg-white/10 transition">
                    <FaCopy /> Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
