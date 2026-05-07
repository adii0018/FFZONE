/**
 * FFZone – Admin Results Entry
 * Enter kills & rankings, publish leaderboard, declare prize winners.
 */
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { FiArrowLeft, FiSave, FiAward } from 'react-icons/fi'
import { GiTrophy, GiTargetShot } from 'react-icons/gi'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import AdminLayout from './AdminLayout'

export default function AdminResults() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [rows, setRows] = useState({})

  const { data: t } = useQuery({
    queryKey: ['tournament', id],
    queryFn: () => api.get(`/tournaments/${id}/`).then(r => r.data),
  })

  const { data: regs } = useQuery({
    queryKey: ['admin-regs-results', id],
    queryFn: () => api.get(`/payments/${id}/all/`).then(r => r.data),
  })

  const { data: existingResults } = useQuery({
    queryKey: ['results', id],
    queryFn: () => api.get(`/tournaments/${id}/results/`).then(r => r.data),
    onSuccess: (data) => {
      const map = {}
      data.forEach(r => { map[r.user_id] = { kills: r.kills, rank: r.rank, prize_won: r.prize_won } })
      setRows(map)
    },
  })

  const submitMut = useMutation({
    mutationFn: (results) => api.post(`/tournaments/${id}/results/submit/`, { results }),
    onSuccess: (res) => toast.success(res.data.message),
    onError: () => toast.error('Submit failed.'),
  })

  const approved = (regs || []).filter(r => r.status === 'approved')

  const setRow = (uid, field, value) => {
    setRows(prev => ({ ...prev, [uid]: { ...(prev[uid] || {}), [field]: value } }))
  }

  const handleSubmit = () => {
    const results = approved.map(reg => ({
      user_id:   reg.user_id,
      kills:     parseInt(rows[reg.user_id]?.kills  || 0),
      rank:      parseInt(rows[reg.user_id]?.rank   || 0),
      prize_won: parseInt(rows[reg.user_id]?.prize_won || 0),
    }))
    submitMut.mutate(results)
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition">
          <FiArrowLeft /> Back
        </button>
        <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
          <GiTrophy className="text-[#F97316]" /> Enter Results
        </h1>
        {t && <p className="text-white/50 text-sm mb-6">{t.title} • {t.mode}</p>}

        {!approved.length ? (
          <div className="text-center py-16 text-white/30">
            <GiTargetShot size={48} className="mx-auto mb-4 opacity-20" />
            <p>No approved players yet.</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="card p-4 mb-2">
              <div className="grid grid-cols-5 gap-3 text-white/40 text-xs font-bold uppercase">
                <div className="col-span-2">Player</div>
                <div className="text-center">Kills</div>
                <div className="text-center">Rank</div>
                <div className="text-center">Prize (₹)</div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {approved.map((reg, idx) => {
                const row = rows[reg.user_id] || {}
                return (
                  <div key={reg._id} className="card p-4">
                    <div className="grid grid-cols-5 gap-3 items-center">
                      <div className="col-span-2">
                        <p className="text-white text-sm font-medium">{reg.user_name}</p>
                        <p className="text-white/30 text-xs">ID: {reg.user_id}</p>
                      </div>
                      <input type="number" min="0" value={row.kills || ''}
                        onChange={e => setRow(reg.user_id, 'kills', e.target.value)}
                        placeholder="0" className="input-dark text-center text-sm py-1.5" />
                      <input type="number" min="1" value={row.rank || ''}
                        onChange={e => setRow(reg.user_id, 'rank', e.target.value)}
                        placeholder="#" className="input-dark text-center text-sm py-1.5" />
                      <input type="number" min="0" value={row.prize_won || ''}
                        onChange={e => setRow(reg.user_id, 'prize_won', e.target.value)}
                        placeholder="0" className="input-dark text-center text-sm py-1.5" />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div className="card p-4 mb-4 flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Total Prize Pool</p>
                <p className="text-[#F97316] font-black text-lg">₹{t?.prize_pool?.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs">Prize Allocated</p>
                <p className="text-white font-black text-lg">
                  ₹{Object.values(rows).reduce((s, r) => s + parseInt(r.prize_won||0), 0).toLocaleString()}
                </p>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={submitMut.isPending}
              className="btn-fire w-full py-3 flex items-center justify-center gap-2">
              {submitMut.isPending
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><FiSave size={16}/> Publish Results & Notify Players</>}
            </button>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
