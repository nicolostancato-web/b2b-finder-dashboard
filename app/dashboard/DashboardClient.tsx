'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import Header from '@/components/shared/Header'
import ColorLegend from '@/components/map/ColorLegend'
import TenderPopup from '@/components/map/TenderPopup'
import type { ClientProfile, Match } from '@/types'

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0A0A0F]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[#A0A0B0] text-sm">Caricamento mappa…</p>
      </div>
    </div>
  ),
})

interface DashboardClientProps {
  profile: ClientProfile
  matches: Match[]
}

export default function DashboardClient({ profile, matches }: DashboardClientProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const counts = {
    alta:  matches.filter((m) => m.match_label === 'alta').length,
    media: matches.filter((m) => m.match_label === 'media').length,
    bassa: matches.filter((m) => m.match_label === 'bassa').length,
  }

  const centerLat = profile.sede_lat ?? 45.46
  const centerLng = profile.sede_lng ?? 9.19

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0F]">
      <Header profile={profile} matches={matches} />

      {/* Mappa full height */}
      <div className="relative flex-1 overflow-hidden">
        {matches.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-white text-lg font-medium mb-2">Nessuna gara disponibile</p>
              <p className="text-[#A0A0B0] text-sm">Il matcher non ha trovato gare per il tuo profilo.</p>
            </div>
          </div>
        ) : (
          <>
            <MapView
              matches={matches}
              centerLat={centerLat}
              centerLng={centerLng}
              activeFilter={activeFilter}
              onSelectMatch={setSelectedMatch}
            />
            <ColorLegend
              counts={counts}
              activeFilter={activeFilter}
              onFilter={setActiveFilter}
            />
          </>
        )}
      </div>

      <TenderPopup
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
        clientCode={profile.codice_cliente}
      />
    </div>
  )
}
