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

  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__testMatches = matches
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__testSelectMatch = (m: Match) => setSelectedMatch(m)
  }

  const counts = {
    alta:  matches.filter(m => m.match_label === 'alta').length,
    media: matches.filter(m => m.match_label === 'media').length,
    bassa: matches.filter(m => m.match_label === 'bassa').length,
  }

  const sidebarWidth = isExpanded ? 220 : 64

  return (
    <div className="bg-[#0A0A0F]">
      <AppSidebar />

      <div
        className="fixed top-0 right-0 bottom-0 transition-all duration-300"
        style={{ left: sidebarWidth }}
      >
        <AppHeader profile={profile} matches={matches} />

        <main className="absolute left-0 right-0 bottom-0" style={{ top: 64, height: 'calc(100% - 64px)' }}>
          {matches.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.05] flex items-center justify-center mx-auto mb-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-8 h-8 text-gray-600">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
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
                centerLat={Number(profile.sede_lat) || 45.46}
                centerLng={Number(profile.sede_lng) || 9.19}
                clientName={profile.ragione_sociale ?? undefined}
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
