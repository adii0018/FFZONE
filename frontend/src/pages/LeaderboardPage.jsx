/**
 * FFZone – Leaderboard (Coming Soon)
 */

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GiPodium, GiTrophy, GiCrossedSwords } from 'react-icons/gi'
import { FiClock, FiBell } from 'react-icons/fi'

const FAKE_RANKS = [
  { rank: 1, name: '???', kills: '??', points: '????', color: '#FFD700' },
  { rank: 2, name: '???', kills: '??', points: '????', color: '#C0C0C0' },
  { rank: 3, name: '???', kills: '??', points: '????', color: '#CD7F32' },
  { rank: 4, name: '???', kills: '??', points: '???',  color: '#ffffff40' },
  { rank: 5, name: '???', kills: '??', points: '???',  color: '#ffffff40' },
]

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-[#050d1a] relative overflow-hidden">

      {/* Animated background */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#00f5ff]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#7C3AED]/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-20 right-10 w-32 h-32 rounded-full border border-[#00f5ff]/10 animate-spin-slow pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-20 h-20 rounded-full border border-[#7C3AED]/15 animate-spin-slow pointer-events-none" style={{ animationDuration: '15s' }} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-20 flex flex-col items-center text-center">

        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 12 }}
          className="mb-8 relative"
        >
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#00f5ff]/20 to-[#7C3AED]/20 border border-[#00f5ff]/30 flex items-center justify-center glow-fire mx-auto">
            <GiPodium size={56} className="text-[#00f5ff]" />
          </div>
          {/* Orbiting dot */}
          <div className="absolute inset-0 animate-spin-slow">
            <div className="w-3 h-3 rounded-full bg-[#00f5ff] absolute -top-1 left-1/2 -translate-x-1/2 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <span className="inline-flex items-center gap-2 bg-[#00f5ff]/10 border border-[#00f5ff]/30 rounded-full px-4 py-1.5 text-xs text-[#00f5ff] font-bold mb-5 uppercase tracking-widest">
            <FiClock size={12} className="animate-pulse" /> Coming Soon
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
            Global{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f5ff] to-[#ea580c] text-glow-fire">
              Leaderboard
            </span>
          </h1>
          <p className="text-white/50 text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            The ultimate ranking arena is being forged. Top players will be ranked
            by kills, wins &amp; prize earnings across all FFZone tournaments.
          </p>
        </motion.div>

        {/* Blurred fake leaderboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full mt-12 relative"
        >
          {/* Blur overlay */}
          <div className="absolute inset-0 z-10 backdrop-blur-[6px] bg-[#050d1a]/40 rounded-2xl flex flex-col items-center justify-center gap-3 border border-white/5">
            <GiTrophy size={36} className="text-[#00f5ff] animate-pulse-glow" />
            <p className="text-white font-black text-lg">Unlocks Soon</p>
            <p className="text-white/40 text-sm">Be ready to claim your rank 🔥</p>
          </div>

          {/* Fake table behind blur */}
          <div className="card overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-4 px-5 py-3 bg-white/[0.03] border-b border-white/5">
              <span className="text-white/30 text-xs font-bold uppercase tracking-widest">Rank</span>
              <span className="text-white/30 text-xs font-bold uppercase tracking-widest">Player</span>
              <span className="text-white/30 text-xs font-bold uppercase tracking-widest text-center">Kills</span>
              <span className="text-white/30 text-xs font-bold uppercase tracking-widest text-right">Points</span>
            </div>
            {FAKE_RANKS.map((r) => (
              <div key={r.rank} className="grid grid-cols-4 px-5 py-4 border-b border-white/5 items-center">
                <div className="flex items-center gap-2">
                  {r.rank <= 3 ? (
                    <GiTrophy size={18} style={{ color: r.color }} />
                  ) : (
                    <span className="text-white/30 font-bold text-sm">#{r.rank}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
                    <GiCrossedSwords size={14} className="text-white/20" />
                  </div>
                  <span className="text-white/20 font-bold text-sm">{r.name}</span>
                </div>
                <span className="text-white/20 font-bold text-sm text-center">{r.kills}</span>
                <span className="text-right font-black text-sm" style={{ color: r.color, opacity: 0.3 }}>{r.points}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <Link to="/tournaments" className="btn-fire px-8 py-3 flex items-center gap-2">
            <GiCrossedSwords size={17} /> Browse Tournaments
          </Link>
          <Link to="/" className="btn-ghost px-8 py-3 flex items-center gap-2">
            Back to Home
          </Link>
        </motion.div>

      </div>
    </div>
  )
}
