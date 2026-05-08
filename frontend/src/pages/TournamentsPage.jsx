/**
 * FFZone – Tournaments Browse Page
 * Filter by status, mode, map with live/upcoming/completed tabs.
 */
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FiSearch, FiFilter } from 'react-icons/fi'
import { GiCrossedSwords } from 'react-icons/gi'
import api from '../lib/api'
import { FaGamepad } from 'react-icons/fa'
import TournamentCard from '../components/TournamentCard'
import PageLoader from '../components/PageLoader'

const MODES   = ['All', 'Solo', 'Duo', 'Squad']
const STATUSES= ['All', 'upcoming', 'live', 'completed']
const MAPS    = ['All', 'Bermuda', 'Purgatory', 'Kalahari']

export default function TournamentsPage() {
  const [status, setStatus] = useState('All')
  const [mode,   setMode]   = useState('All')
  const [map,    setMap]    = useState('All')
  const [page,   setPage]   = useState(1)

  const params = new URLSearchParams()
  if (status !== 'All') params.set('status', status)
  if (mode   !== 'All') params.set('mode',   mode)
  if (map    !== 'All') params.set('map',    map)
  params.set('page', page)

  const { data, isLoading } = useQuery({
    queryKey: ['tournaments', status, mode, map, page],
    queryFn:  () => api.get(`/tournaments/?${params}`).then(r => r.data),
    keepPreviousData: true,
  })

  const tournaments = data?.tournaments || []
  const total       = data?.total || 0
  const totalPages  = Math.ceil(total / 12)

  if (isLoading && !data) return <PageLoader />

  return (
    <div className="min-h-screen bg-[#0B0F1A] py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-2">
            <FaGamepad className="text-[#F97316]" /> Tournaments
          </h1>
          <p className="text-white/50 text-sm">{total} tournaments available</p>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-8 flex flex-wrap gap-4 items-center">
          <FiFilter className="text-[#F97316]" />

          {/* Status tabs */}
          <div className="flex gap-1 flex-wrap">
            {STATUSES.map(s => (
              <button key={s} onClick={() => { setStatus(s); setPage(1) }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  status===s ? 'bg-[#F97316] text-white' : 'text-white/50 hover:text-white border border-white/10 hover:border-white/30'
                }`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-white/10 hidden md:block" />

          {/* Mode */}
          <div className="flex gap-1 flex-wrap">
            {MODES.map(m => (
              <button key={m} onClick={() => { setMode(m); setPage(1) }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  mode===m ? 'bg-[#7C3AED] text-white' : 'text-white/50 hover:text-white border border-white/10 hover:border-white/30'
                }`}>
                {m}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-white/10 hidden md:block" />

          {/* Map */}
          <div className="flex gap-1 flex-wrap">
            {MAPS.map(mp => (
              <button key={mp} onClick={() => { setMap(mp); setPage(1) }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  map===mp ? 'bg-[#22D3EE] text-[#0B0F1A]' : 'text-white/50 hover:text-white border border-white/10 hover:border-white/30'
                }`}>
                {mp}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {tournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tournaments.map(t => <TournamentCard key={t._id} tournament={t} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-white/30">
            <GiCrossedSwords size={56} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg">No tournaments match your filters.</p>
            <button onClick={() => { setStatus('All'); setMode('All'); setMap('All') }}
              className="btn-ghost text-sm mt-4">Clear Filters</button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i+1)}
                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                  page===i+1 ? 'bg-[#F97316] text-white' : 'card text-white/50 hover:text-white'
                }`}>
                {i+1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
