/**
 * FFZone – Admin Players Management
 * List all players, ban/warn actions.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiSlash, FiAlertTriangle, FiSearch, FiUserX, FiUserCheck } from 'react-icons/fi'
import { GiFlame } from 'react-icons/gi'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import AdminLayout from './AdminLayout'

const RANK_COLORS = { Bronze:'#cd7f32', Silver:'#c0c0c0', Gold:'#ffd700', Platinum:'#22D3EE', Diamond:'#b9f2ff' }

export default function AdminPlayers() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [warnId, setWarnId] = useState(null)
  const [warnMsg, setWarnMsg] = useState('')

  const { data: players, isLoading } = useQuery({
    queryKey: ['admin-players'],
    queryFn: () => api.get('/auth/admin/players/').then(r => r.data),
  })

  const banMut = useMutation({
    mutationFn: ({ id, action }) => api.post(`/auth/admin/players/${id}/ban/`, { action }),
    onSuccess: (_, { action }) => { toast.success(`Player ${action}ned.`); qc.invalidateQueries(['admin-players']) },
    onError: () => toast.error('Action failed.'),
  })

  const warnMut = useMutation({
    mutationFn: ({ id, reason }) => api.post(`/auth/admin/players/${id}/warn/`, { reason }),
    onSuccess: () => { toast.success('Warning sent.'); setWarnId(null); setWarnMsg('') },
    onError: () => toast.error('Warning failed.'),
  })

  const filtered = (players || []).filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-black text-white mb-6">👥 Player Management</h1>

        {/* Search */}
        <div className="relative mb-6">
          <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..." className="input-dark pl-10" />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(p => {
              const rankColor = RANK_COLORS[p.rank] || '#F97316'
              return (
                <div key={p._id} className={`card p-4 flex items-center gap-4 ${p.is_banned ? 'opacity-50' : ''}`}>
                  <div className="w-10 h-10 rounded-full border flex items-center justify-center font-black shrink-0"
                    style={{ background: `${rankColor}15`, borderColor: `${rankColor}30`, color: rankColor }}>
                    {(p.name||'?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm flex items-center gap-2">
                      {p.name}
                      {p.is_banned && <span className="badge badge-completed text-[10px]">Banned</span>}
                    </p>
                    <p className="text-white/40 text-xs">{p.email} • UID: {p.uid||'—'}</p>
                  </div>
                  <div className="text-center hidden md:block">
                    <div className="text-xs font-bold" style={{ color: rankColor }}>{p.rank || 'Bronze'}</div>
                    <div className="text-white/30 text-[10px]">{p.kills||0}K / {p.wins||0}W</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setWarnId(p.django_id)}
                      className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center hover:bg-yellow-500/20 transition"
                      title="Warn Player">
                      <FiAlertTriangle size={13} />
                    </button>
                    <button
                      onClick={() => banMut.mutate({ id: p.django_id, action: p.is_banned ? 'unban' : 'ban' })}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition border ${
                        p.is_banned
                          ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
                          : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                      }`}
                      title={p.is_banned ? 'Unban' : 'Ban'}>
                      {p.is_banned ? <FiUserCheck size={13} /> : <FiUserX size={13} />}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Warn modal */}
      {warnId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-md">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <FiAlertTriangle className="text-yellow-400" /> Send Warning
            </h3>
            <textarea value={warnMsg} onChange={e => setWarnMsg(e.target.value)}
              placeholder="Reason for warning..." rows={3} className="input-dark resize-none mb-4" />
            <div className="flex gap-2">
              <button onClick={() => warnMut.mutate({ id: warnId, reason: warnMsg || 'Violation of tournament rules.' })}
                className="btn-fire flex-1 py-2 text-sm">Send Warning</button>
              <button onClick={() => { setWarnId(null); setWarnMsg('') }} className="btn-ghost px-4 py-2 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
