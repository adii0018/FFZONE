/**
 * FFZone – Admin Tournaments List
 * View all tournaments, set status, navigate to room & results pages.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { FiEdit2, FiKey, FiAward, FiTrash2 } from 'react-icons/fi'
import { GiCrossedSwords } from 'react-icons/gi'
import { FaTrophy } from 'react-icons/fa'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import AdminLayout from './AdminLayout'

const STATUS_OPTS = ['upcoming', 'live', 'completed', 'cancelled']

export default function AdminTournaments() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-tournaments'],
    queryFn: () => api.get('/tournaments/').then(r => r.data),
  })

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/tournaments/${id}/update/`, { status }),
    onSuccess: () => { toast.success('Status updated.'); qc.invalidateQueries(['admin-tournaments']) },
    onError: () => toast.error('Update failed.'),
  })

  const deleteMut = useMutation({
    mutationFn: (id) => api.delete(`/tournaments/${id}/delete/`),
    onSuccess: () => { toast.success('Deleted.'); qc.invalidateQueries(['admin-tournaments']) },
    onError: () => toast.error('Delete failed.'),
  })

  const tournaments = data?.tournaments || []

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-white flex items-center gap-2"><FaTrophy className="text-[#F97316]" /> Tournaments</h1>
          <Link to="/admin/tournaments/create" className="btn-fire text-sm">+ Create New</Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <GiCrossedSwords size={48} className="mx-auto mb-4 opacity-20" />
            <p>No tournaments yet. Create one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tournaments.map(t => (
              <div key={t._id} className="card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm truncate">{t.title}</h3>
                  <p className="text-white/40 text-xs mt-0.5">
                    {t.mode} • {t.map} • ₹{t.entry_fee} entry • {t.filled_slots||0}/{t.max_slots} slots
                    {t.start_time ? ` • ${format(new Date(t.start_time), 'dd MMM, hh:mm a')}` : ''}
                  </p>
                </div>

                {/* Status selector */}
                <select
                  value={t.status}
                  onChange={e => statusMut.mutate({ id: t._id, status: e.target.value })}
                  className="bg-[#0B0F1A] border border-white/10 text-white/70 text-xs rounded-lg px-2 py-1.5 outline-none focus:border-[#F97316]"
                >
                  {STATUS_OPTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/admin/room/${t._id}`} title="Set Room Info"
                    className="w-8 h-8 rounded-lg bg-[#22D3EE]/10 border border-[#22D3EE]/20 text-[#22D3EE] flex items-center justify-center hover:bg-[#22D3EE]/20 transition">
                    <FiKey size={13} />
                  </Link>
                  <Link to={`/admin/results/${t._id}`} title="Enter Results"
                    className="w-8 h-8 rounded-lg bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#7C3AED] flex items-center justify-center hover:bg-[#7C3AED]/20 transition">
                    <FiAward size={13} />
                  </Link>
                  <button
                    onClick={() => { if (window.confirm('Delete this tournament?')) deleteMut.mutate(t._id) }}
                    className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition">
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
