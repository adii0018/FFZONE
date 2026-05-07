/**
 * FFZone – Admin Dashboard
 * Global stats + revenue/joins chart + pending approvals.
 */
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { FiUsers, FiDollarSign, FiClock, FiActivity, FiPlus } from 'react-icons/fi'
import { GiFlame, GiTrophy } from 'react-icons/gi'
import { FaTrophy } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import AdminLayout from './AdminLayout'

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon size={18} style={{ color }} />
        </div>
        {sub && <span className="text-xs text-white/30">{sub}</span>}
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-white/50 text-xs mt-0.5">{label}</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card p-3 text-xs">
      <p className="text-white font-bold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/tournaments/admin/stats/').then(r => r.data),
    refetchInterval: 30000,
  })

  const stats = data || {}

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <GiFlame className="text-[#F97316]" /> Admin Dashboard
            </h1>
            <p className="text-white/50 text-sm mt-1">Overview of FFZone platform</p>
          </div>
          <Link to="/admin/tournaments/create" className="btn-fire flex items-center gap-2 text-sm">
            + New Tournament
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {[...Array(5)].map((_, i) => <div key={i} className="card h-28 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <StatCard icon={GiTrophy}     label="Total Tournaments"   value={stats.total_tournaments   || 0} color="#F97316" />
            <StatCard icon={FiActivity}   label="Live Now"            value={stats.live_tournaments    || 0} color="#ef4444" />
            <StatCard icon={FiUsers}      label="Total Players"       value={stats.total_players       || 0} color="#22D3EE" />
            <StatCard icon={FiClock}      label="Pending Approvals"   value={stats.pending_approvals   || 0} color="#ffd700" sub="action needed" />
            <StatCard icon={FiDollarSign} label="Total Revenue"       value={`₹${(stats.total_revenue||0).toLocaleString()}`} color="#7C3AED" />
          </div>
        )}

        {/* Pending approvals quick link */}
        {(stats.pending_approvals || 0) > 0 && (
          <div className="card p-4 mb-6 border-yellow-500/20 bg-yellow-500/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiClock size={20} className="text-yellow-400" />
              <div>
                <p className="text-white font-semibold text-sm">{stats.pending_approvals} payment proof{stats.pending_approvals > 1 ? 's' : ''} awaiting review</p>
                <p className="text-white/40 text-xs">Review and approve to grant room access</p>
              </div>
            </div>
            <Link to="/admin/payments" className="btn-fire text-sm py-1.5 px-4">Review Now</Link>
          </div>
        )}

        {/* Analytics chart */}
        {stats.chart_data?.length > 0 && (
          <div className="card p-6">
            <h2 className="text-white font-bold mb-5 flex items-center gap-2"><FiActivity /> Tournament Analytics (Last 10)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.chart_data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="title" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="joins"   name="Joins"   fill="#F97316" radius={[4,4,0,0]} />
                <Bar dataKey="revenue" name="Revenue (₹)" fill="#7C3AED" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Quick action links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            ['/admin/tournaments/create', <FiPlus />, 'Create Tournament', '#F97316'],
            ['/admin/payments',           <FiDollarSign />, 'Review Payments',  '#22D3EE'],
            ['/admin/players',            <FiUsers />, 'Manage Players',   '#7C3AED'],
            ['/admin/tournaments',        <FaTrophy />, 'All Tournaments',  '#ffd700'],
          ].map(([to, icon, label, color]) => (
            <Link key={to} to={to}
              className="card p-4 flex flex-col items-center justify-center gap-2 text-sm font-bold transition hover:scale-105"
              style={{ color }}>
              <div className="text-2xl">{icon}</div>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
