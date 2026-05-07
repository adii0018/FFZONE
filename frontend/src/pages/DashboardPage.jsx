/**
 * FFZone – Player Dashboard
 */
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GiFlame, GiTrophy, GiTargetShot } from 'react-icons/gi'
import { format } from 'date-fns'
import api from '../lib/api'
import useAuthStore from '../store/authStore'
import TournamentCard from '../components/TournamentCard'

const RANK_CONFIG = {
  Bronze:   { color: '#cd7f32', icon: '🥉', next: 'Silver' },
  Silver:   { color: '#c0c0c0', icon: '🥈', next: 'Gold' },
  Gold:     { color: '#ffd700', icon: '🥇', next: 'Platinum' },
  Platinum: { color: '#22D3EE', icon: '💎', next: 'Diamond' },
  Diamond:  { color: '#b9f2ff', icon: '👑', next: null },
}

function NotificationsList() {
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/auth/notifications/').then(r => r.data),
    refetchInterval: 30000,
  })
  const notifs = (data || []).slice(0, 5)
  if (!notifs.length) return <div className="text-white/30 text-sm text-center py-4">No new notifications.</div>
  return (
    <div className="space-y-2">
      {notifs.map(n => (
        <div key={n._id} className={`card p-3 text-sm border-l-2 ${n.read ? 'border-white/10' : 'border-[#F97316]'}`}>
          <p className="text-white/80">{n.message}</p>
          <p className="text-white/30 text-xs mt-1">{n.created_at ? format(new Date(n.created_at), 'dd MMM, hh:mm a') : ''}</p>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const rank = user?.rank || 'Bronze'
  const rankCfg = RANK_CONFIG[rank] || RANK_CONFIG.Bronze

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get('/auth/profile/').then(r => r.data),
  })

  const { data: regsData } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: () => api.get('/tournaments/my-registrations/').then(r => r.data),
  })

  const { data: featuredData } = useQuery({
    queryKey: ['featured-dash'],
    queryFn: () => api.get('/tournaments/?status=upcoming').then(r => r.data),
  })

  const regs     = (regsData || []).filter(r => r.tournament?.status !== 'completed').slice(0, 3)
  const featured = featuredData?.tournaments?.slice(0, 3) || []
  const p        = profile || {}

  return (
    <div className="min-h-screen bg-[#0B0F1A] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <GiFlame className="text-[#F97316] text-2xl animate-pulse" />
            <h1 className="text-2xl font-black text-white">
              Welcome back, <span className="text-[#F97316]">{user?.name?.split(' ')[0]}</span>!
            </h1>
          </div>
          <p className="text-white/50 text-sm ml-9">Ready to dominate today?</p>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Rank',    value: `${rankCfg.icon} ${rank}`, color: rankCfg.color },
            { label: 'Kills',   value: p.kills   || 0,  color: '#F97316' },
            { label: 'Matches', value: p.matches  || 0,  color: '#22D3EE' },
            { label: 'Wins',    value: p.wins     || 0,  color: '#7C3AED' },
          ].map(({ label, value, color }) => (
            <motion.div key={label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="card p-4 text-center">
              <div className="text-xl font-black" style={{ color }}>{value}</div>
              <div className="text-white/40 text-xs mt-0.5">{label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-black text-white">⚔️ Active Tournaments</h2>
              <Link to="/matches" className="text-[#F97316] text-sm hover:underline">View All</Link>
            </div>
            {regs.length > 0 ? regs.map(reg => {
              const t = reg.tournament || {}
              return (
                <div key={reg._id} className="card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 border border-[#F97316]/20 flex items-center justify-center shrink-0">
                    <GiTrophy className="text-[#F97316]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate">{t.title}</h3>
                    <p className="text-white/40 text-xs">{t.mode} • {t.start_time ? format(new Date(t.start_time), 'dd MMM') : '—'}</p>
                  </div>
                  <span className={`badge shrink-0 ${reg.status==='approved' ? 'badge-upcoming' : reg.status==='rejected' ? 'badge-completed' : 'badge-open'}`}>
                    {reg.status}
                  </span>
                </div>
              )
            }) : (
              <div className="card p-8 text-center text-white/30">
                <GiTargetShot size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">No active tournaments. Join one!</p>
                <Link to="/tournaments" className="btn-fire text-xs mt-3 inline-block px-4 py-2">Browse</Link>
              </div>
            )}
            <div className="mt-6">
              <h2 className="text-lg font-black text-white mb-3">🔔 Notifications</h2>
              <NotificationsList />
            </div>
          </div>

          <div className="space-y-4">
            <div className="card p-5 text-center" style={{ borderColor: `${rankCfg.color}30` }}>
              <div className="text-4xl mb-2">{rankCfg.icon}</div>
              <div className="text-xl font-black" style={{ color: rankCfg.color }}>{rank}</div>
              <div className="text-white/40 text-xs mb-3">Current Rank</div>
              {rankCfg.next && <div className="text-[10px] text-white/30">Keep playing to reach <span style={{ color: rankCfg.color }}>{rankCfg.next}</span></div>}
            </div>
            {p.badges?.length > 0 && (
              <div className="card p-4">
                <h3 className="text-white/60 text-xs font-bold uppercase mb-3">🏅 Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {p.badges.map((b, i) => <span key={i} className="badge badge-open text-xs">{b}</span>)}
                </div>
              </div>
            )}
            <div className="card p-4 space-y-2">
              <h3 className="text-white/60 text-xs font-bold uppercase mb-2">Quick Links</h3>
              {[['/tournaments','🎮 Browse Tournaments'],['/team-finder','🤝 Find Team'],['/profile','👤 My Profile']].map(([to, label]) => (
                <Link key={to} to={to} className="block text-white/60 hover:text-[#F97316] text-sm transition py-1.5 border-b border-white/5 last:border-0">{label}</Link>
              ))}
            </div>
          </div>
        </div>

        {featured.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-white">🔥 Upcoming Tournaments</h2>
              <Link to="/tournaments" className="text-[#F97316] text-sm hover:underline">See All</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {featured.map(t => <TournamentCard key={t._id} tournament={t} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
