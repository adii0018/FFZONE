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
    staleTime: 2 * 60 * 1000,        // Fresh for 2 minutes
    cacheTime: 10 * 60 * 1000,       // Cache for 10 minutes
    refetchOnWindowFocus: true,       // Refetch when user returns
  })

  const tournaments = data?.tournaments || []
  const total       = data?.total || 0
  const totalPages  = Math.ceil(total / 12)

  if (isLoading && !data) return <PageLoader />

  return (
    <div className="min-h-screen bg-[#050d1a] py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-2">
            <FaGamepad className="text-[#00f5ff]" /> Tournaments
          </h1>
          <p className="text-white/50 text-sm">{total} tournaments available</p>
        </div>

        {/* Filters */}
        <div className="card p-4 sm:p-5 mb-8 flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2 text-[#00f5ff] font-bold text-sm w-full sm:w-auto">
            <FiFilter size={18} />
            <span className="sm:hidden">Filters</span>
          </div>

          {/* Status tabs */}
          <div className="flex gap-2 flex-wrap w-full sm:w-auto">
            {STATUSES.map(s => (
              <button key={s} onClick={() => { setStatus(s); setPage(1) }}
                className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all touch-manipulation min-h-[44px] ${
                  status===s ? 'bg-[#00f5ff] text-white' : 'text-white/50 hover:text-white border border-white/10 hover:border-white/30'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-px h-px sm:h-6 bg-white/10" />

          {/* Mode */}
          <div className="flex gap-2 flex-wrap w-full sm:w-auto">
            {MODES.map(m => (
              <button key={m} onClick={() => { setMode(m); setPage(1) }}
                className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all touch-manipulation min-h-[44px] ${
                  mode===m ? 'bg-[#7C3AED] text-white' : 'text-white/50 hover:text-white border border-white/10 hover:border-white/30'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-px h-px sm:h-6 bg-white/10" />

          {/* Map */}
          <div className="flex gap-2 flex-wrap w-full sm:w-auto">
            {MAPS.map(mp => (
              <button key={mp} onClick={() => { setMap(mp); setPage(1) }}
                className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all touch-manipulation min-h-[44px] ${
                  map===mp ? 'bg-[#0066ff] text-[#050d1a]' : 'text-white/50 hover:text-white border border-white/10 hover:border-white/30'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {mp}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {tournaments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {tournaments.map(t => <TournamentCard key={t._id} tournament={t} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-white/30">
            <GiCrossedSwords size={56} className="mx-auto mb-4 opacity-20" />
            <p className="text-base sm:text-lg mb-4">No tournaments match your filters.</p>
            <button 
              onClick={() => { setStatus('All'); setMode('All'); setMap('All') }}
              className="btn-ghost text-sm mt-4 min-h-[44px] px-6"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 sm:gap-3 mt-10 flex-wrap px-2">
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i+1)}
                className={`w-12 h-12 sm:w-10 sm:h-10 rounded-lg text-sm font-bold transition-all touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center ${
                  page===i+1 ? 'bg-[#00f5ff] text-white' : 'card text-white/50 hover:text-white'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
                aria-label={`Page ${i+1}`}
                aria-current={page===i+1 ? 'page' : undefined}
              >
                {i+1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
