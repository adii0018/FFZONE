/**
 * FFZone – My Matches Page
 * Shows joined tournaments, status, room info, leaderboard.
 */
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { FiClock, FiLock, FiUnlock, FiAward, FiCheck, FiX } from 'react-icons/fi'
import { GiTrophy, GiCrossedSwords } from 'react-icons/gi'
import { FaTrophy } from 'react-icons/fa'
import { format } from 'date-fns'
import api from '../lib/api'

import PageLoader from '../components/PageLoader'

const STATUS_BADGE = {
  pending:  { label: 'Pending',  cls: 'badge-open',      icon: <FiClock /> },
  approved: { label: 'Approved', cls: 'badge-upcoming',  icon: <FiCheck /> },
  rejected: { label: 'Rejected', cls: 'badge-completed', icon: <FiX /> },
}

function KillLeaderboard({ tournamentId }) {
  const { data } = useQuery({
    queryKey: ['results', tournamentId],
    queryFn:  () => api.get(`/tournaments/${tournamentId}/results/`).then(r => r.data),
  })

  if (!data?.length) return null

  const top5 = data.slice(0, 5)
  return (
    <div className="mt-3 bg-[#0B0F1A] rounded-xl p-3 border border-white/5">
      <h4 className="text-white/60 text-xs font-bold uppercase mb-2 flex items-center gap-1"><FaTrophy className="text-[#F97316]" /> Leaderboard</h4>
      {top5.map((r, i) => (
        <div key={r._id} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black w-5 ${i===0?'text-yellow-400':i===1?'text-white/60':i===2?'text-orange-400':'text-white/30'}`}>
              #{i+1}
            </span>
            <span className="text-white/80 text-xs">{r.user_name || `Player ${r.user_id}`}</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[#F97316]">{r.kills} kills</span>
            {r.prize_won > 0 && <span className="text-yellow-400">₹{r.prize_won}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MatchesPage() {
  const { data: regs, isLoading } = useQuery({
    queryKey: ['my-registrations'],
    queryFn:  () => api.get('/tournaments/my-registrations/').then(r => r.data),
  })

  if (isLoading) return <PageLoader />


  return (
    <div className="min-h-screen bg-[#0B0F1A] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-2"><GiCrossedSwords className="text-[#F97316]" /> My Matches</h1>
        <p className="text-white/50 text-sm mb-8">All tournaments you've joined</p>

        {!regs?.length ? (
          <div className="text-center py-20 text-white/30">
            <GiCrossedSwords size={56} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">No tournaments joined yet.</p>
            <Link to="/tournaments" className="btn-fire text-sm mt-4 inline-block">Browse Tournaments</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {regs.map(reg => {
              const t   = reg.tournament || {}
              const cfg = STATUS_BADGE[reg.status] || STATUS_BADGE.pending
              return (
                <div key={reg._id} className="card p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-white font-bold text-base">{t.title || 'Tournament'}</h3>
                      <p className="text-white/40 text-xs mt-0.5">
                        {t.mode} • {t.map} • {t.start_time ? format(new Date(t.start_time), 'dd MMM, hh:mm a') : '—'}
                      </p>
                    </div>
                    <span className={`badge ${cfg.cls} shrink-0 flex items-center gap-1`}>{cfg.icon} {cfg.label}</span>
                  </div>

                  {/* Payment method */}
                  <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
                    <span>Payment: {reg.payment_method?.toUpperCase()}</span>
                    {reg.transaction_id && <span>• TXN: {reg.transaction_id}</span>}
                  </div>

                  {/* Room info */}
                  {reg.status === 'approved' && t.room_id ? (
                    <div className="bg-[#22D3EE]/10 border border-[#22D3EE]/20 rounded-xl p-4 mb-3">
                      <div className="flex items-center gap-2 text-[#22D3EE] text-xs font-bold mb-2">
                        <FiUnlock size={12} /> Room Access Granted
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div>
                          <div className="text-[#22D3EE] font-mono font-black">{t.room_id}</div>
                          <div className="text-white/40 text-[10px]">Room ID</div>
                        </div>
                        <div>
                          <div className="text-[#22D3EE] font-mono font-black">{t.room_password}</div>
                          <div className="text-white/40 text-[10px]">Password</div>
                        </div>
                      </div>
                    </div>
                  ) : reg.status === 'approved' ? (
                    <div className="flex items-center gap-2 text-white/30 text-xs mb-3 bg-white/5 rounded-lg p-3">
                      <FiLock size={12} /> Room ID will be shared before the match starts.
                    </div>
                  ) : null}

                  {/* Prize pool */}
                  <div className="flex items-center justify-between">
                    <span className="text-[#F97316] text-sm font-bold">₹{t.prize_pool?.toLocaleString()} Prize Pool</span>
                    <Link to={`/tournament/${t.id}`} className="text-white/40 hover:text-white text-xs transition">
                      View Details →
                    </Link>
                  </div>

                  {/* Kill leaderboard if tournament completed */}
                  {t.status === 'completed' && <KillLeaderboard tournamentId={t.id} />}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
