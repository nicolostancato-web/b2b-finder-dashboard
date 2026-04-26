'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import AppSidebar from '@/layout/AppSidebar'
import AppHeader from '@/layout/AppHeader'
import ColorLegend from '@/components/map/ColorLegend'
import TenderSlideOver from '@/components/map/TenderSlideOver'
import { useSidebar } from '@/context/SidebarContext'
import type { ClientProfile, Match } from '@/types'

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0F]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Caricamento mappa…</p>
      </div>
    </div>
  ),
})

interface DashboardClientProps {
  profile: ClientProfile
  matches: Match[]
}

function DashboardInner({ profile, matches }: DashboardClientProps) {
  const { isExpanded } = useSidebar()
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const counts = {
    alta:  matches.filter(m => m.match_label === 'alta').length,
    media: matches.filter(m => m.match_label === 'media').length,
    bassa: matches.filter(m => m.match_label === 'bassa').length,
  }

  const sidebarWidth = isExpanded ? 220 : 64

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <AppSidebar />

      <div
        className="flex flex-col min-h-screen transition-all duration-300 max-lg:ml-0"
        style={{ marginLeft: sidebarWidth }}
      >
        <AppHeader profile={profile} matches={matches} />

        {/* Mappa full screen sotto header */}
        <main className="flex-1 relative" style={{ marginTop: 64 }}>
          {matches.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.05] flex items-center justify-center mx-auto mb-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-8 h-8 text-gray-600">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <p className="text-white font-medium mb-1">Nessuna gara disponibile</p>
                <p className="text-gray-500 text-sm">Il matcher non ha trovato gare per il tuo profilo</p>
              </div>
            </div>
          ) : (
            <>
              <MapView
                matches={matches}
                centerLat={profile.sede_lat ?? 45.46}
                centerLng={profile.sede_lng ?? 9.19}
                activeFilter={activeFilter}
                selectedOcid={selectedMatch?.gara_ocid ?? null}
                onSelectMatch={setSelectedMatch}
              />
              <ColorLegend
                counts={counts}
                activeFilter={activeFilter}
                onFilter={setActiveFilter}
              />
            </>
          )}
        </main>
      </div>

      <TenderSlideOver
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
        clientCode={profile.codice_cliente}
      />
    </div>
  )
}

export default function DashboardClient(props: DashboardClientProps) {
  return <DashboardInner {...props} />
}
