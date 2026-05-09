/**
 * FFZone – Payment Page
 * QR screenshot upload OR Razorpay modal.
 */
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { FiUpload, FiCheckCircle, FiArrowLeft } from 'react-icons/fi'
import { GiFlame } from 'react-icons/gi'
import toast from 'react-hot-toast'
import api from '../lib/api'

// Razorpay script loader
function loadRazorpay() {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

export default function PaymentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [method, setMethod] = useState('qr')
  const [txnId, setTxnId] = useState('')
  const [screenshot, setScreenshot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const { data: t } = useQuery({
    queryKey: ['tournament', id],
    queryFn: () => api.get(`/tournaments/${id}/`).then(r => r.data),
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: files => setScreenshot(files[0]),
  })

  const handleQRSubmit = async (e) => {
    e.preventDefault()
    if (!screenshot) return toast.error('Please upload payment screenshot.')
    if (!txnId)      return toast.error('Enter transaction ID.')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('transaction_id', txnId)
      fd.append('screenshot', screenshot)
      await api.post(`/payments/${id}/qr/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setDone(true)
      toast.success('Proof submitted! Awaiting admin approval.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed.')
    } finally { setLoading(false) }
  }

  const handleRazorpay = async () => {
    const ok = await loadRazorpay()
    if (!ok) return toast.error('Razorpay failed to load.')
    setLoading(true)
    try {
      const { data } = await api.post(`/payments/${id}/razorpay/order/`)
      const rzp = new window.Razorpay({
        key:         data.key,
        amount:      data.amount,
        currency:    data.currency,
        name:        'FFZone',
        description: data.tournament?.title,
        order_id:    data.order_id,
        handler: async (response) => {
          try {
            await api.post(`/payments/${id}/razorpay/verify/`, response)
            setDone(true)
            toast.success('Payment verified! You are registered 🔥')
          } catch { toast.error('Verification failed. Contact support.') }
        },
        theme: { color: '#00f5ff' },
      })
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create order.')
    } finally { setLoading(false) }
  }

  if (done) return (
    <div className="min-h-screen bg-[#050d1a] flex items-center justify-center px-4">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="card p-10 text-center max-w-md">
        <FiCheckCircle size={60} className="text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-white mb-2">
          {method === 'qr' ? 'Proof Submitted!' : 'Registered!'}
        </h2>
        <p className="text-white/50 text-sm mb-6">
          {method === 'qr'
            ? 'Admin will review your proof. Check My Matches for updates.'
            : 'Payment confirmed! Room ID will be shared before the match.'}
        </p>
        <button onClick={() => navigate('/matches')} className="btn-fire w-full py-3">
          Go to My Matches
        </button>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#050d1a] py-8 px-4">
      <div className="max-w-lg mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition">
          <FiArrowLeft /> Back
        </button>

        {/* Tournament info */}
        {t && (
          <div className="card p-4 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#00f5ff]/10 border border-[#00f5ff]/20 flex items-center justify-center">
              <GiFlame className="text-[#00f5ff] text-xl" />
            </div>
            <div>
              <h2 className="text-white font-bold">{t.title}</h2>
              <p className="text-white/50 text-sm">{t.mode} • {t.map} • Entry: ₹{t.entry_fee}</p>
            </div>
          </div>
        )}

        {/* Method toggle */}
        <div className="flex bg-[#111827] rounded-xl p-1 mb-6 border border-[rgba(249,115,22,0.15)]">
          {[['qr','📱 QR / UPI'],['razorpay','💳 Razorpay']].map(([m, label]) => (
            <button key={m} onClick={() => setMethod(m)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${method===m ? 'bg-[#00f5ff] text-white' : 'text-white/50 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>

        {method === 'qr' ? (
          <div className="card p-6">
            {/* QR Code display */}
            <div className="text-center mb-6">
              <p className="text-white/60 text-sm mb-3">Scan to pay ₹{t?.entry_fee || '—'}</p>
              <div className="w-48 h-48 mx-auto rounded-xl border-2 border-[#00f5ff]/30 bg-white flex items-center justify-center">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=ffzone@upi&pn=FFZone&am=100" alt="QR Code" className="w-44 h-44 rounded" />
              </div>
              <p className="text-[#00f5ff] font-mono text-sm mt-2">ffzone@upi</p>
              <p className="text-white/40 text-xs mt-1">PhonePe / GPay / Paytm</p>
            </div>

            <form onSubmit={handleQRSubmit} className="space-y-4">
              <div>
                <label className="text-white/60 text-xs font-semibold uppercase block mb-1">Transaction ID *</label>
                <input value={txnId} onChange={e => setTxnId(e.target.value)}
                  placeholder="Enter UPI transaction ID" className="input-dark" required />
              </div>

              <div>
                <label className="text-white/60 text-xs font-semibold uppercase block mb-1">Payment Screenshot *</label>
                <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragActive ? 'border-[#00f5ff] bg-[#00f5ff]/5' : 'border-white/15 hover:border-[#00f5ff]/40'
                }`}>
                  <input {...getInputProps()} />
                  {screenshot ? (
                    <div className="flex items-center justify-center gap-2 text-green-400">
                      <FiCheckCircle size={18} />
                      <span className="text-sm font-medium">{screenshot.name}</span>
                    </div>
                  ) : (
                    <div>
                      <FiUpload size={24} className="mx-auto text-white/30 mb-2" />
                      <p className="text-white/40 text-sm">Drop screenshot here or click to upload</p>
                    </div>
                  )}
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-fire w-full py-3 flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '📤 Submit Proof'}
              </button>
            </form>
          </div>
        ) : (
          <div className="card p-6 text-center">
            <div className="text-5xl mb-4">💳</div>
            <h3 className="text-white font-bold text-lg mb-2">Pay with Razorpay</h3>
            <p className="text-white/50 text-sm mb-2">Secure payment via Card, UPI, or Netbanking</p>
            <div className="text-[#00f5ff] text-3xl font-black mb-6">₹{t?.entry_fee}</div>
            <button onClick={handleRazorpay} disabled={loading}
              className="btn-fire w-full py-3 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '⚡ Pay Now'}
            </button>
            <p className="text-white/30 text-xs mt-3">Instant approval on successful payment</p>
          </div>
        )}
      </div>
    </div>
  )
}
