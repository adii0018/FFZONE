/**
 * FFZone – Admin Payment Approval Queue
 * Review QR screenshot proofs, approve or reject.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiCheck, FiX, FiEye, FiClock } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import AdminLayout from './AdminLayout'

export default function AdminPayments() {
  const qc = useQueryClient()
  const [preview, setPreview]   = useState(null)
  const [rejectId, setRejectId] = useState(null)
  const [reason,   setReason]   = useState('')

  const { data: pending, isLoading } = useQuery({
    queryKey: ['pending-payments'],
    queryFn: () => api.get('/payments/pending/').then(r => r.data),
    refetchInterval: 15000,
  })

  const approveMut = useMutation({
    mutationFn: (id) => api.post(`/payments/${id}/approve/`),
    onSuccess: () => { toast.success('Approved! Player notified.'); qc.invalidateQueries(['pending-payments']) },
    onError: () => toast.error('Approval failed.'),
  })

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }) => api.post(`/payments/${id}/reject/`, { reason }),
    onSuccess: () => {
      toast.success('Rejected. Player notified.')
      qc.invalidateQueries(['pending-payments'])
      setRejectId(null); setReason('')
    },
    onError: () => toast.error('Rejection failed.'),
  })

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-white">💳 Payment Approvals</h1>
          <span className="badge badge-open">{pending?.length || 0} Pending</span>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}
          </div>
        ) : !pending?.length ? (
          <div className="text-center py-16 text-white/30">
            <FiClock size={48} className="mx-auto mb-4 opacity-20" />
            <p>No pending payments. All clear! ✅</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map(reg => (
              <div key={reg._id} className="card p-4">
                <div className="flex items-start gap-4">
                  {/* Screenshot thumb */}
                  {reg.screenshot && (
                    <button onClick={() => setPreview(reg.screenshot)} className="shrink-0">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-[#0B0F1A] relative group">
                        <img src={reg.screenshot} alt="proof" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <FiEye size={18} className="text-white" />
                        </div>
                      </div>
                    </button>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{reg.user_name}</p>
                    <p className="text-white/40 text-xs mt-0.5">Tournament ID: {reg.tournament_id}</p>
                    <p className="text-[#22D3EE] text-xs font-mono mt-1">TXN: {reg.transaction_id}</p>
                    <p className="text-white/30 text-xs">Method: {reg.payment_method?.toUpperCase()}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => approveMut.mutate(reg._id)} disabled={approveMut.isPending}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold hover:bg-green-500/20 transition">
                      <FiCheck size={13} /> Approve
                    </button>
                    <button onClick={() => setRejectId(reg._id)}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition">
                      <FiX size={13} /> Reject
                    </button>
                  </div>
                </div>

                {/* Reject form */}
                {rejectId === reg._id && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
                    <input value={reason} onChange={e => setReason(e.target.value)}
                      placeholder="Reason for rejection..." className="input-dark text-sm flex-1" />
                    <button onClick={() => rejectMut.mutate({ id: reg._id, reason: reason || 'Payment proof invalid.' })}
                      className="btn-fire text-sm px-4">Send</button>
                    <button onClick={() => setRejectId(null)} className="btn-ghost text-sm px-3">Cancel</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Screenshot preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreview(null)} className="absolute -top-10 right-0 text-white/60 hover:text-white">
              <FiX size={24} />
            </button>
            <img src={preview} alt="Payment proof" className="w-full rounded-2xl border border-white/10" />
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
