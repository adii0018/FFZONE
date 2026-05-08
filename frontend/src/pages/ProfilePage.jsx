/**
 * FFZone – Player Profile Page
 * Stats, badges, rank, match history, avatar upload.
 */
import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FiEdit2, FiCamera, FiSave, FiX, FiClipboard } from 'react-icons/fi'
import { FaUser, FaMedal, FaGem, FaCrown } from 'react-icons/fa'
import { GiFlame, GiTrophy, GiTargetShot } from 'react-icons/gi'
import toast from 'react-hot-toast'
import api, { getImageUrl, getAvatarUrl } from '../lib/api'
import useAuthStore from '../store/authStore'

import PageLoader from '../components/PageLoader'

const RANKS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']
const RANK_COLORS = { Bronze:'#cd7f32', Silver:'#c0c0c0', Gold:'#ffd700', Platinum:'#22D3EE', Diamond:'#b9f2ff' }
const RANK_ICONS  = { Bronze:<FaMedal />, Silver:<FaMedal />, Gold:<FaMedal />, Platinum:<FaGem />, Diamond:<FaCrown /> }

function RankProgress({ rank }) {
  const idx   = RANKS.indexOf(rank)
  const pct   = ((idx) / (RANKS.length - 1)) * 100
  const color = RANK_COLORS[rank] || '#F97316'
  return (
    <div>
      <div className="flex justify-between text-xs text-white/40 mb-2">
        {RANKS.map((r, i) => (
          <span key={r} className={i <= idx ? 'font-bold' : ''} style={{ color: i <= idx ? RANK_COLORS[r] : undefined }}>
            {RANK_ICONS[r]}
          </span>
        ))}
      </div>
      <div className="slot-bar-track">
        <div className="slot-bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, #F97316, ${color})` }} />
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const qc = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [name, setName]       = useState(user?.name || '')
  const [uid,  setUid]        = useState(user?.uid  || '')
  const fileRef = useRef()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get('/auth/profile/').then(r => r.data),
  })

  const { data: regsData } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: () => api.get('/tournaments/my-registrations/').then(r => r.data),
  })

  const updateMut = useMutation({
    mutationFn: (fd) => api.patch('/auth/profile/update/', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      toast.success('Profile updated!')
      qc.invalidateQueries(['my-profile'])
      setEditing(false)
    },
    onError: () => toast.error('Update failed.'),
  })

  const handleSave = () => {
    const fd = new FormData()
    fd.append('name', name)
    fd.append('uid', uid)
    updateMut.mutate(fd)
  }

  const handleAvatar = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('avatar', file)
    updateMut.mutate(fd)
  }

  const p     = profile || {}
  const rank  = p.rank || user?.rank || 'Bronze'
  const color = RANK_COLORS[rank] || '#F97316'
  const history = (regsData || []).filter(r => r.tournament?.status === 'completed').slice(0, 5)

  if (isLoading) return <PageLoader />


  return (
    <div className="min-h-screen bg-[#0B0F1A] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black text-white mb-6 flex items-center gap-2"><FaUser className="text-[#F97316]" /> My Profile</h1>

        {/* Profile card */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full border-2 overflow-hidden flex items-center justify-center"
                style={{ borderColor: color, background: `${color}20` }}>
                <img 
                  src={p.avatar_url ? getImageUrl(p.avatar_url) : getAvatarUrl(p.email || p.name)} 
                  alt="avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#F97316] flex items-center justify-center hover:bg-[#ea580c] transition">
                <FiCamera size={13} className="text-white" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </div>

            {/* Info */}
            <div className="flex-1 w-full">
              {editing ? (
                <div className="space-y-2">
                  <input value={name} onChange={e => setName(e.target.value)}
                    placeholder="Display Name" className="input-dark text-sm" />
                  <input value={uid} onChange={e => setUid(e.target.value)}
                    placeholder="Free Fire UID" className="input-dark text-sm" />
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-black text-white">{p.name || user?.name}</h2>
                  <p className="text-white/50 text-sm">{p.email}</p>
                  <p className="text-white/40 text-xs mt-0.5">UID: {p.uid || '—'}</p>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={() => editing ? handleSave() : setEditing(true)}
                className={editing ? 'btn-fire py-1.5 px-3 text-sm flex items-center gap-1' : 'btn-ghost py-1.5 px-3 text-sm flex items-center gap-1'}>
                {editing ? <><FiSave size={13}/>Save</> : <><FiEdit2 size={13}/>Edit</>}
              </button>
              {editing && (
                <button onClick={() => setEditing(false)} className="btn-ghost py-1.5 px-3 text-sm">
                  <FiX size={13}/>
                </button>
              )}
            </div>
          </div>

          {/* Rank progress */}
          <div className="mt-5 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-xs font-bold uppercase">Rank Progress</span>
              <span className="font-black text-sm flex items-center gap-1" style={{ color }}>{RANK_ICONS[rank]} {rank}</span>
            </div>
            <RankProgress rank={rank} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Kills',   value: p.kills   || 0, icon: GiTargetShot, color: '#F97316' },
            { label: 'Wins',    value: p.wins     || 0, icon: GiTrophy,    color: '#ffd700' },
            { label: 'Matches', value: p.matches  || 0, icon: GiFlame,     color: '#7C3AED' },
          ].map(({ label, value, icon: Icon, color: c }) => (
            <div key={label} className="card p-4 text-center">
              <Icon size={20} style={{ color: c }} className="mx-auto mb-1" />
              <div className="text-xl font-black text-white">{value}</div>
              <div className="text-white/40 text-xs">{label}</div>
            </div>
          ))}
        </div>

        {/* Badges */}
        {p.badges?.length > 0 && (
          <div className="card p-5 mb-6">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2"><FaMedal /> Badges Earned</h3>
            <div className="flex flex-wrap gap-2">
              {p.badges.map((b, i) => (
                <span key={i} className="badge badge-open">{b}</span>
              ))}
            </div>
          </div>
        )}

        {/* Match history */}
        {history.length > 0 && (
          <div className="card p-5">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2"><FiClipboard /> Recent Match History</h3>
            <div className="space-y-2">
              {history.map(reg => {
                const t = reg.tournament || {}
                return (
                  <div key={reg._id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-white/80 text-sm">{t.title}</p>
                      <p className="text-white/40 text-xs">{t.mode} • {t.map}</p>
                    </div>
                    <span className="badge badge-completed">Completed</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
