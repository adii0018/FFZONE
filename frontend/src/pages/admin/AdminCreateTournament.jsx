/**
 * FFZone – Admin Create Tournament Page
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { FiUpload, FiCheckCircle, FiArrowLeft } from 'react-icons/fi'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import AdminLayout from './AdminLayout'

const MODES = ['Solo', 'Duo', 'Squad']
const MAPS  = ['Bermuda', 'Purgatory', 'Kalahari']

export default function AdminCreateTournament() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [banner,  setBanner]  = useState(null)
  const [form, setForm] = useState({
    title: '', mode: 'Squad', map: 'Bermuda',
    entry_fee: '', prize_pool: '', max_slots: '',
    start_time: '', rules: '',
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] }, maxFiles: 1,
    onDrop: f => setBanner(f[0]),
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (banner) fd.append('banner', banner)
      await api.post('/tournaments/create/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Tournament created!')
      navigate('/admin/tournaments')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Creation failed.')
    } finally { setLoading(false) }
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition">
          <FiArrowLeft /> Back
        </button>
        <h1 className="text-2xl font-black text-white mb-6">🏆 Create Tournament</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="card p-5 space-y-4">
            <h2 className="text-white font-bold">Basic Info</h2>
            <div>
              <label className="text-white/60 text-xs font-semibold uppercase block mb-1">Title *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="e.g. Friday Night Blitz" className="input-dark" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-xs font-semibold uppercase block mb-1">Mode *</label>
                <select value={form.mode} onChange={e => set('mode', e.target.value)} className="input-dark">
                  {MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/60 text-xs font-semibold uppercase block mb-1">Map *</label>
                <select value={form.map} onChange={e => set('map', e.target.value)} className="input-dark">
                  {MAPS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Financials */}
          <div className="card p-5 space-y-4">
            <h2 className="text-white font-bold">Prize & Entry</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-white/60 text-xs font-semibold uppercase block mb-1">Entry Fee (₹) *</label>
                <input type="number" value={form.entry_fee} onChange={e => set('entry_fee', e.target.value)}
                  placeholder="50" className="input-dark" required />
              </div>
              <div>
                <label className="text-white/60 text-xs font-semibold uppercase block mb-1">Prize Pool (₹) *</label>
                <input type="number" value={form.prize_pool} onChange={e => set('prize_pool', e.target.value)}
                  placeholder="500" className="input-dark" required />
              </div>
              <div>
                <label className="text-white/60 text-xs font-semibold uppercase block mb-1">Max Slots *</label>
                <input type="number" value={form.max_slots} onChange={e => set('max_slots', e.target.value)}
                  placeholder="12" className="input-dark" required />
              </div>
            </div>
            <div>
              <label className="text-white/60 text-xs font-semibold uppercase block mb-1">Start Time *</label>
              <input type="datetime-local" value={form.start_time} onChange={e => set('start_time', e.target.value)}
                className="input-dark" required />
            </div>
          </div>

          {/* Rules */}
          <div className="card p-5">
            <h2 className="text-white font-bold mb-3">Rules & Info</h2>
            <textarea value={form.rules} onChange={e => set('rules', e.target.value)}
              placeholder="Tournament rules, squad requirements, fair play policy..."
              rows={5} className="input-dark resize-none" />
          </div>

          {/* Banner upload */}
          <div className="card p-5">
            <h2 className="text-white font-bold mb-3">Banner Image</h2>
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragActive ? 'border-[#F97316] bg-[#F97316]/5' : 'border-white/15 hover:border-[#F97316]/40'
            }`}>
              <input {...getInputProps()} />
              {banner ? (
                <div>
                  <img src={URL.createObjectURL(banner)} alt="preview"
                    className="w-full h-32 object-cover rounded-lg mb-2 opacity-80" />
                  <p className="text-green-400 text-sm flex items-center justify-center gap-1">
                    <FiCheckCircle size={14} /> {banner.name}
                  </p>
                </div>
              ) : (
                <div>
                  <FiUpload size={28} className="mx-auto text-white/30 mb-2" />
                  <p className="text-white/40 text-sm">Drop banner image or click to upload</p>
                  <p className="text-white/20 text-xs mt-1">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-fire w-full py-3 text-base flex items-center justify-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '🏆 Create Tournament'}
          </button>
        </form>
      </div>
    </AdminLayout>
  )
}
