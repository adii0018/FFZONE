import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GiFlame, GiTrophy, GiTargetShot, GiCrossedSwords } from 'react-icons/gi'
import { FaMedal, FaGem, FaCrown, FaGamepad, FaHandshake, FaUser, FaFire } from 'react-icons/fa'
import { format } from 'date-fns'
import api from '../lib/api'
import useAuthStore from '../store/authStore'
import TournamentCard from '../components/TournamentCard'
import StarField from '../components/StarField'

const RANK_CONFIG = {
  Bronze:   { color: '#cd7f32', icon: <FaMedal />, next: 'Silver' },
  Silver:   { color: '#c0c0c0', icon: <FaMedal />, next: 'Gold' },
  Gold:     { color: '#ffd700', icon: <FaMedal />, next: 'Platinum' },
  Platinum: { color: '#00D2FF', icon: <FaGem />, next: 'Diamond' },
  Diamond:  { color: '#00FF9C', icon: <FaCrown />, next: null },
}

function NotificationsList() {
  const { data, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/auth/notifications/').then(r => r.data),
    
    // Smart refetching strategy
    refetchOnWindowFocus: true,      // Refresh when user returns to tab
    refetchOnMount: true,             // Refresh on component mount
    refetchInterval: false,           // Disable auto-polling (save battery & data)
    
    // Caching strategy
    staleTime: 2 * 60 * 1000,        // Consider data fresh for 2 minutes
    cacheTime: 10 * 60 * 1000,       // Keep in cache for 10 minutes
    
    // Error handling
    retry: 2,
    retryDelay: 1000,
  })
  
  const notifs = (data || []).slice(0, 5)
  
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white/60 text-xs font-bold uppercase tracking-wider">Recent Updates</h3>
        <button 
          onClick={() => refetch()} 
          disabled={isRefetching}
          className="text-[#FF007F] text-xs font-bold hover:text-[#FF007F]/80 transition-colors disabled:opacity-50 flex items-center gap-1"
          aria-label="Refresh notifications"
        >
          <svg 
            className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isRefetching ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {notifs.length > 0 ? (
        <div className="space-y-2">
          {notifs.map(n => (
            <div key={n._id} className={`card p-3 text-sm border-l-2 ${n.read ? 'border-white/10' : 'border-[#FF007F]'}`}>
              <p className="text-white/80">{n.message}</p>
              <p className="text-white/30 text-xs mt-1">{n.created_at ? format(new Date(n.created_at), 'dd MMM, hh:mm a') : ''}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-white/30 text-sm text-center py-4">No new notifications.</div>
      )}
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
    staleTime: 5 * 60 * 1000,        // Profile data fresh for 5 minutes
    cacheTime: 15 * 60 * 1000,       // Cache for 15 minutes
    refetchOnWindowFocus: false,      // Profile doesn't change often
  })

  const { data: regsData } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: () => api.get('/tournaments/my-registrations/').then(r => r.data),
    staleTime: 2 * 60 * 1000,        // Fresh for 2 minutes
    cacheTime: 10 * 60 * 1000,       // Cache for 10 minutes
    refetchOnWindowFocus: true,       // Refetch when user returns
  })

  const { data: featuredData } = useQuery({
    queryKey: ['featured-dash'],
    queryFn: () => api.get('/tournaments/?status=upcoming').then(r => r.data),
    staleTime: 5 * 60 * 1000,        // Tournaments don't change rapidly
    cacheTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const regs     = (regsData || []).filter(r => r.tournament?.status !== 'completed').slice(0, 3)
  const featured = featuredData?.tournaments?.slice(0, 3) || []
  const p        = profile || {}

  return (
    <div className="min-h-screen bg-[#05070A] py-12 px-4 relative overflow-hidden">
      <StarField />
      
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF007F]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[#00D2FF]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <GiFlame className="text-[#FF007F] text-3xl animate-pulse" />
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase">
              Welcome back, <span className="text-[#FF007F] text-glow-fire">{user?.name?.split(' ')[0]}</span>!
            </h1>
          </div>
          <p className="text-white/50 text-base ml-11 font-medium">Ready to dominate today?</p>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          {[
            { label: 'Rank',    value: rank, icon: rankCfg.icon, color: rankCfg.color },
            { label: 'Kills',   value: p.kills   || 0,  color: '#FF007F' },
            { label: 'Matches', value: p.matches  || 0,  color: '#00D2FF' },
            { label: 'Wins',    value: p.wins     || 0,  color: '#00FF9C' },
          ].map(({ label, value, icon, color }) => (
            <motion.div key={label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="card p-6 text-center group hover:bg-white/5 transition-all">
              <div className="text-2xl font-black flex items-center justify-center gap-2" style={{ color }}>
                {icon && <span className="text-xl">{icon}</span>}
                {value}
              </div>
              <div className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1.5">{label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tight"><GiCrossedSwords className="text-[#FF007F]" /> Active Tournaments</h2>
                <Link to="/matches" className="text-[#FF007F] text-sm font-bold hover:underline">View All</Link>
              </div>
              <div className="space-y-3">
                {regs.length > 0 ? regs.map(reg => {
                  const t = reg.tournament || {}
                  return (
                    <div key={reg._id} className="card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 group">
                      <div className="w-12 h-12 rounded-xl bg-[#FF007F]/10 border border-[#FF007F]/20 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                        <GiTrophy className="text-[#FF007F] text-xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-black text-base truncate group-hover:text-[#FF007F] transition-colors">{t.title}</h3>
                        <p className="text-white/40 text-sm font-medium">{t.mode} • {t.start_time ? format(new Date(t.start_time), 'dd MMM') : '—'}</p>
                      </div>
                      <div className="w-full sm:w-auto flex justify-end">
                        <span className={`badge shrink-0 px-3 py-1 ${reg.status==='approved' ? 'badge-open' : reg.status==='rejected' ? 'badge-completed' : 'badge-upcoming'}`}>
                          {reg.status}
                        </span>
                      </div>
                    </div>
                  )
                }) : (
                  <div className="card p-12 text-center text-white/30 border-dashed">
                    <GiTargetShot size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="text-base font-medium">No active tournaments. Join one!</p>
                    <Link to="/tournaments" className="btn-fire text-sm mt-5 inline-block px-8 py-2.5">Browse Tournaments</Link>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-black text-white mb-4 uppercase tracking-tight flex items-center gap-2">🔔 Notifications</h2>
              <NotificationsList />
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-8 text-center relative overflow-hidden group" style={{ borderColor: `${rankCfg.color}40` }}>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-6xl mb-4 flex justify-center drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" style={{ color: rankCfg.color }}>{rankCfg.icon}</div>
              <div className="text-2xl font-black uppercase tracking-tighter" style={{ color: rankCfg.color }}>{rank}</div>
              <div className="text-white/40 text-sm font-bold uppercase tracking-widest mt-1 mb-4">Current Rank</div>
              {rankCfg.next && (
                <div className="text-xs text-white/40 font-medium bg-white/5 py-2 px-4 rounded-full inline-block border border-white/5">
                  Reach <span className="font-bold text-white" style={{ color: rankCfg.color }}>{rankCfg.next}</span> for elite rewards
                </div>
              )}
            </div>

            {p.badges?.length > 0 && (
              <div className="card p-5">
                <h3 className="text-white/40 text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2"><FaMedal className="text-[#FF007F]" /> Achieved Badges</h3>
                <div className="flex flex-wrap gap-2">
                  {p.badges.map((b, i) => <span key={i} className="badge badge-open text-xs py-1.5 px-3">{b}</span>)}
                </div>
              </div>
            )}

            <div className="card p-6 space-y-3">
              <h3 className="text-white/40 text-xs font-black uppercase tracking-[0.2em] mb-4">Quick Navigation</h3>
              {[
                { to: '/tournaments', icon: <FaGamepad />, label: 'Browse Tournaments' },
                { to: '/team-finder', icon: <FaHandshake />, label: 'Find Team' },
                { to: '/profile', icon: <FaUser />, label: 'My Profile' }
              ].map(({ to, icon, label }) => (
                <Link key={to} to={to} className="flex items-center gap-3 text-white/60 hover:text-[#FF007F] text-sm font-bold transition-all py-3 border-b border-white/5 last:border-0 hover:translate-x-1">
                  <span className="text-[#FF007F] opacity-50">{icon}</span> {label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {featured.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
                <FaFire className="text-[#FF007F] animate-pulse" /> Recommended <span className="text-[#FF007F]">Tournaments</span>
              </h2>
              <Link to="/tournaments" className="text-[#FF007F] text-sm font-bold hover:underline">See All Arena →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featured.map(t => <TournamentCard key={t._id} tournament={t} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
