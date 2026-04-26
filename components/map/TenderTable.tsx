'use client'
import { useState, useMemo } from 'react'
import { formatEur, formatDate, getDeadlineBadge } from '@/lib/utils/match-reasons'
import TenderSlideOver from './TenderSlideOver'
import type { Match } from '@/types'

interface TenderTableProps {
  matches: Match[]
  clientCode: string
}

const LABEL_BADGE: Record<string, { text: string; class: string }> = {
  alta:  { text: 'Alta', class: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  media: { text: 'Media', class: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  bassa: { text: 'Bassa', class: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
}

type SortKey = 'match_score' | 'gara_amount_eur' | 'distanza_km' | 'giorni_alla_scadenza'

export default function TenderTable({ matches, clientCode }: TenderTableProps) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('match_score')
  const [sortAsc, setSortAsc] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 50

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return matches.filter(m =>
      !q ||
      m.gara_buyer.toLowerCase().includes(q) ||
      (m.gara_locality ?? '').toLowerCase().includes(q) ||
      (m.gara_cpv_description ?? '').toLowerCase().includes(q) ||
      (m.gara_regione ?? '').toLowerCase().includes(q)
    )
  }, [matches, search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = Number(a[sortKey] ?? (sortKey === 'match_score' ? 0 : 99999))
      const bv = Number(b[sortKey] ?? (sortKey === 'match_score' ? 0 : 99999))
      return sortAsc ? av - bv : bv - av
    })
  }, [filtered, sortKey, sortAsc])

  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(false) }
    setPage(0)
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-gray-600 ml-1">↕</span>
    return <span className="text-emerald-400 ml-1">{sortAsc ? '↑' : '↓'}</span>
  }

  return (
    <>
      {/* Search bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
            placeholder="Cerca per buyer, comune, settore…"
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
        <span className="text-gray-500 text-sm tabular-nums">{filtered.length} gare</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.03]">
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Priorità</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider">Stazione Appaltante</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider hidden md:table-cell">Settore</th>
              <th
                className="px-4 py-3 text-right text-xs text-gray-500 font-medium uppercase tracking-wider cursor-pointer hover:text-gray-300 select-none"
                onClick={() => toggleSort('gara_amount_eur')}
              >
                Importo<SortIcon col="gara_amount_eur" />
              </th>
              <th
                className="px-4 py-3 text-right text-xs text-gray-500 font-medium uppercase tracking-wider cursor-pointer hover:text-gray-300 select-none hidden lg:table-cell"
                onClick={() => toggleSort('distanza_km')}
              >
                Distanza<SortIcon col="distanza_km" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs text-gray-500 font-medium uppercase tracking-wider cursor-pointer hover:text-gray-300 select-none hidden lg:table-cell"
                onClick={() => toggleSort('giorni_alla_scadenza')}
              >
                Scadenza<SortIcon col="giorni_alla_scadenza" />
              </th>
              <th className="px-4 py-3 text-center text-xs text-gray-500 font-medium uppercase tracking-wider">
                <button
                  onClick={() => toggleSort('match_score')}
                  className="hover:text-gray-300 select-none"
                >Score<SortIcon col="match_score" /></button>
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.map((m, i) => {
              const badge = LABEL_BADGE[m.match_label] ?? LABEL_BADGE.bassa
              const deadline = getDeadlineBadge(m.gara_deadline, m.giorni_alla_scadenza)
              const deadlineColor = deadline.color === 'red' ? 'text-red-400' : deadline.color === 'orange' ? 'text-orange-400' : 'text-gray-400'
              return (
                <tr
                  key={m.gara_ocid}
                  className={`border-b border-white/[0.04] hover:bg-white/[0.04] cursor-pointer transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}
                  onClick={() => setSelectedMatch(m)}
                >
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badge.class}`}>
                      {badge.text}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white font-medium line-clamp-1">{m.gara_buyer}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{m.gara_locality}{m.gara_provincia ? ` · ${m.gara_provincia}` : ''}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-gray-300 text-xs line-clamp-2">{m.gara_cpv_description ?? m.gara_cpv_id ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-white font-medium tabular-nums">{formatEur(m.gara_amount_eur)}</span>
                  </td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell">
                    <span className="text-gray-300 tabular-nums">
                      {m.distanza_km != null ? `${Math.round(Number(m.distanza_km))} km` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="text-gray-300 text-xs">{formatDate(m.gara_deadline)}</p>
                    <p className={`text-xs mt-0.5 ${deadlineColor}`}>{deadline.text}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.06] text-white text-xs font-bold tabular-nums">
                      {m.match_score}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-gray-500 text-sm">
            Pagina {page + 1} di {totalPages} ({sorted.length} risultati)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg border border-white/[0.10] text-white text-sm disabled:opacity-30 hover:bg-white/[0.06] transition-colors"
            >
              ← Precedente
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-lg border border-white/[0.10] text-white text-sm disabled:opacity-30 hover:bg-white/[0.06] transition-colors"
            >
              Successiva →
            </button>
          </div>
        </div>
      )}

      <TenderSlideOver
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
        clientCode={clientCode}
      />
    </>
  )
}
