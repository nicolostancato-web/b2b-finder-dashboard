'use client'
import { useRouter } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'
import type { ClientProfile, Match } from '@/types'

interface AppHeaderProps {
  profile: ClientProfile
  matches: Match[]
}

export default function AppHeader({ profile, matches }: AppHeaderProps) {
  const router = useRouter()
  const { isExpanded, toggleSidebar, toggleMobileSidebar } = useSidebar()

  const alta = matches.filter(m => m.match_label === 'alta').length

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  function handleToggle() {
    if (window.innerWidth >= 1024) toggleSidebar()
    else toggleMobileSidebar()
  }

  return (
    <header className={`fixed top-0 right-0 z-40 flex items-center justify-between h-16
      bg-[#111118]/80 backdrop-blur-md border-b border-white/[0.06] px-4
      transition-all duration-300
      ${isExpanded ? 'left-[220px]' : 'left-[64px]'}
      max-lg:left-0
    `}>
      {/* Hamburger */}
      <button
        onClick={handleToggle}
        className="p-2 rounded-lg text-gray-400 hover:bg-white/[0.08] hover:text-white transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Centro: nome + stats */}
      <div className="flex items-center gap-4">
        <span className="text-white font-semibold text-sm hidden sm:block">{profile.ragione_sociale}</span>
        <div className="hidden md:flex items-center gap-3">
          <StatPill label="Gare" value={matches.length} />
          <StatPill label="Alta priorità" value={alta} accent />
        </div>
      </div>

      {/* Destra: logout */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 border border-white/10 rounded-lg px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
          <span>{profile.sede_comune}</span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-gray-400 hover:bg-white/[0.08] hover:text-white transition-colors"
          title="Logout"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </header>
  )
}

function StatPill({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
      ${accent
        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
        : 'bg-white/[0.06] text-gray-300 border border-white/10'
      }`}>
      <span className="font-bold tabular-nums">{value}</span>
      <span>{label}</span>
    </div>
  )
}
