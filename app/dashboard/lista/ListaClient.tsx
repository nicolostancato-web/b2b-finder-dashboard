'use client'
import AppSidebar from '@/layout/AppSidebar'
import AppHeader from '@/layout/AppHeader'
import TenderTable from '@/components/map/TenderTable'
import { useSidebar } from '@/context/SidebarContext'
import type { ClientProfile, Match } from '@/types'

interface ListaClientProps {
  profile: ClientProfile
  matches: Match[]
}

function ListaInner({ profile, matches }: ListaClientProps) {
  const { isExpanded } = useSidebar()
  const sidebarWidth = isExpanded ? 220 : 64

  return (
    <div className="bg-[#0A0A0F] min-h-screen">
      <AppSidebar />

      <div
        className="fixed top-0 right-0 bottom-0 transition-all duration-300 overflow-y-auto"
        style={{ left: sidebarWidth }}
      >
        <AppHeader profile={profile} matches={matches} />

        <main className="px-6 py-6" style={{ marginTop: 64 }}>
          <div className="mb-6">
            <h1 className="text-white text-xl font-semibold">Lista gare</h1>
            <p className="text-gray-500 text-sm mt-1">
              Tutte le gare compatibili con il tuo profilo, ordinate per punteggio
            </p>
          </div>

          {matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.05] flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="w-8 h-8 text-gray-600">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <p className="text-white font-medium mb-1">Nessuna gara disponibile</p>
              <p className="text-gray-500 text-sm">Il matcher non ha trovato gare per il tuo profilo</p>
            </div>
          ) : (
            <TenderTable matches={matches} clientCode={profile.codice_cliente} />
          )}
        </main>
      </div>
    </div>
  )
}

export default function ListaClient(props: ListaClientProps) {
  return <ListaInner {...props} />
}
