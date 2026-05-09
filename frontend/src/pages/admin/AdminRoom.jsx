/**
 * FFZone – Admin Room Management
 * Set Room ID/Password and auto-broadcast to approved players.
 */
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { FiKey, FiSend, FiArrowLeft, FiEye, FiEyeOff } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import AdminLayout from './AdminLayout'

export default function AdminRoom() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [roomId,  setRoomId]  = useState('')
  const [roomPwd, setRoomPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)

  const { data: t } = useQuery({
    queryKey: ['tournament', id],
    queryFn: () => api.get(`/tournaments/${id}/`).then(r => r.data),
    onSuccess: (data) => {
      if (data.room_id) setRoomId(data.room_id)
      if (data.room_password) setRoomPwd(data.room_password)
    },
  })

  const { data: regs } = useQuery({
    queryKey: ['admin-regs', id],
    queryFn: () => api.get(`/payments/${id}/all/`).then(r => r.data),
  })

  const broadcastMut = useMutation({
    mutationFn: () => api.post(`/tournaments/${id}/room/`, { room_id: roomId, room_password: roomPwd }),
    onSuccess: (res) => toast.success(res.data.message),
    onError: (err) => toast.error(err.response?.data?.error || 'Broadcast failed.'),
  })

  const approvedCount = (regs || []).filter(r => r.status === 'approved').length

  return (
    <AdminLayout>
      <div className="max-w-xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition">
          <FiArrowLeft /> Back
        </button>

        <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
          <FiKey className="text-[#0066ff]" /> Room Management
        </h1>
        {t && <p className="text-white/50 text-sm mb-6">{t.title}</p>}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card p-4 text-center">
            <div className="text-2xl font-black text-green-400">{approvedCount}</div>
            <div className="text-white/40 text-xs">Approved Players</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-black text-[#00f5ff]">{(regs||[]).filter(r=>r.status==='pending').length}</div>
            <div className="text-white/40 text-xs">Pending</div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <div>
            <label className="text-white/60 text-xs font-semibold uppercase block mb-1">Room ID *</label>
            <input value={roomId} onChange={e => setRoomId(e.target.value)}
              placeholder="e.g. 12345678" className="input-dark font-mono tracking-widest text-center text-lg" />
          </div>
          <div className="relative">
            <label className="text-white/60 text-xs font-semibold uppercase block mb-1">Room Password *</label>
            <input type={showPwd ? 'text' : 'password'} value={roomPwd} onChange={e => setRoomPwd(e.target.value)}
              placeholder="e.g. ffzone2024" className="input-dark font-mono tracking-widest text-center text-lg pr-10" />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 bottom-3 text-white/40 hover:text-white">
              {showPwd ? <FiEyeOff size={15}/> : <FiEye size={15}/>}
            </button>
          </div>

          <div className="bg-[#0066ff]/5 border border-[#0066ff]/20 rounded-xl p-4 text-sm text-[#0066ff]">
            <FiSend size={14} className="inline mr-2" />
            Broadcasting to <strong>{approvedCount}</strong> approved player{approvedCount !== 1 ? 's' : ''}
          </div>

          <button onClick={() => broadcastMut.mutate()} disabled={broadcastMut.isPending || !roomId || !roomPwd}
            className="btn-cyan w-full py-3 flex items-center justify-center gap-2">
            {broadcastMut.isPending
              ? <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              : <><FiSend size={16}/> Broadcast Room Info</>}
          </button>
        </div>

        {/* Registered players list */}
        {regs?.length > 0 && (
          <div className="card p-5 mt-4">
            <h3 className="text-white font-bold mb-3">Registered Players</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {regs.map(r => (
                <div key={r._id} className="flex items-center justify-between text-sm py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-white/80">{r.user_name}</span>
                  <span className={`badge text-[10px] ${r.status==='approved' ? 'badge-upcoming' : r.status==='rejected' ? 'badge-completed' : 'badge-open'}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
