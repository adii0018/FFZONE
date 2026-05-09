/**
 * FFZone – Team Finder Page
 * Browse/post Duo & Squad partner requests.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FiPlus, FiUsers, FiMessageSquare, FiCheck } from 'react-icons/fi'
import { FaHandshake } from 'react-icons/fa'
import { GiCrossedSwords } from 'react-icons/gi'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../lib/api'
import useAuthStore from '../store/authStore'

const MODES = ['All', 'Duo', 'Squad']

function PostCard({ post, onFill, isOwn }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className={`card p-5 ${post.is_filled ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#00f5ff]/20 border border-[#00f5ff]/30 flex items-center justify-center text-[#00f5ff] font-bold text-sm">
              {post.user_name?.[0]?.toUpperCase() || '?'}
            </div>
            <span className="text-white font-semibold">{post.user_name}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <span className={`badge ${post.mode === 'Duo' ? 'badge-upcoming' : 'badge-open'}`}>
            <GiCrossedSwords size={10} /> {post.mode}
          </span>
          {post.is_filled && <span className="badge badge-completed">Filled</span>}
        </div>
      </div>

      {post.message && (
        <p className="text-white/60 text-sm leading-relaxed mb-3 bg-white/5 rounded-lg p-3">
          "{post.message}"
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-white/30 text-xs">
          {post.created_at ? format(new Date(post.created_at), 'dd MMM, hh:mm a') : ''}
        </span>
        {isOwn && !post.is_filled && (
          <button onClick={() => onFill(post._id)}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition">
            <FiCheck size={11} /> Mark Filled
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default function TeamFinderPage() {
  const { user, isAuthenticated } = useAuthStore()
  const qc = useQueryClient()
  const [mode, setMode] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [formMode, setFormMode] = useState('Duo')
  const [message, setMessage] = useState('')

  const { data: posts, isLoading } = useQuery({
    queryKey: ['team-finder', mode],
    queryFn: () => api.get(`/tournaments/team-finder/${mode !== 'All' ? `?mode=${mode}` : ''}`).then(r => r.data),
  })

  const createMut = useMutation({
    mutationFn: (data) => api.post('/tournaments/team-finder/create/', data),
    onSuccess: () => {
      toast.success('Team post created!')
      qc.invalidateQueries(['team-finder'])
      setShowForm(false)
      setMessage('')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed.'),
  })

  const fillMut = useMutation({
    mutationFn: (postId) => api.patch(`/tournaments/team-finder/${postId}/fill/`),
    onSuccess: () => { toast.success('Marked as filled.'); qc.invalidateQueries(['team-finder']) },
  })

  return (
    <div className="min-h-screen bg-[#050d1a] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-2"><FaHandshake className="text-[#7C3AED]" /> Team Finder</h1>
            <p className="text-white/50 text-sm mt-1">Find Duo & Squad partners</p>
          </div>
          {isAuthenticated() && (
            <button onClick={() => setShowForm(!showForm)} className="btn-fire flex items-center gap-2 text-sm">
              <FiPlus size={15} /> Post Request
            </button>
          )}
        </div>

        {/* Post form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="card p-5 mb-6">
            <h3 className="text-white font-bold mb-4">New Team Request</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                {['Duo', 'Squad'].map(m => (
                  <button key={m} onClick={() => setFormMode(m)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border ${
                      formMode === m ? 'bg-[#00f5ff] text-white border-[#00f5ff]' : 'text-white/50 border-white/10 hover:text-white'
                    }`}>
                    {m}
                  </button>
                ))}
              </div>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Tell others about yourself – rank, play style, time zone..."
                rows={3}
                className="input-dark resize-none"
              />
              <div className="flex gap-2">
                <button onClick={() => createMut.mutate({ mode: formMode, message })}
                  disabled={createMut.isPending}
                  className="btn-fire flex-1 py-2 text-sm">
                  {createMut.isPending ? 'Posting...' : 'Post Request'}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-ghost px-4 py-2 text-sm">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Mode filter */}
        <div className="flex gap-2 mb-6">
          {MODES.map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                mode === m ? 'bg-[#00f5ff] text-white' : 'text-white/50 border border-white/10 hover:text-white'
              }`}>
              {m}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card h-28 animate-pulse">
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-white/5 rounded w-1/3" />
                  <div className="h-3 bg-white/5 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : posts?.length > 0 ? (
          <div className="space-y-4">
            {posts.map(p => (
              <PostCard key={p._id} post={p}
                isOwn={user?.id === p.user_id}
                onFill={(id) => fillMut.mutate(id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-white/30">
            <FiUsers size={48} className="mx-auto mb-4 opacity-20" />
            <p>No team requests yet. Be the first to post!</p>
          </div>
        )}
      </div>
    </div>
  )
}
