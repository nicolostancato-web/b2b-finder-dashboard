'use client'

import { useRouter } from 'next/navigation'
import type { ClientProfile, Match } from '@/types'

interface HeaderProps {
  profile: ClientProfile
  matches: Match[]
}

export default function Header({ profile, matches }: HeaderProps) {
  const router = useRouter()

  const alta = matches.filter((m) => m.match_label === 'alta').length
  const total = matches.length

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <header className="h-[60px] flex items-center justify-between px-6 border-b border-white/10 bg-[#0A0A0F]/80 backdrop-blur-md z-50">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
          <span className="text-white font-bold text-xs">B2</span>
        </div>
        <span className="text-white font-semibold text-base tracking-tight">B2B Finder</span>
      </div>

      {/* Nome cliente */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <p className="text-white font-medium text-sm">{profile.ragione_sociale}</p>
        <p className="text-[#6B6B7B] text-xs text-center">{profile.sede_comune} · Tier {profile.tier}</p>
      </div>

      {/* Stats + logout */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-white text-sm font-medium">{total} gare matchanti</p>
          <p className="text-emerald-400 text-xs">{alta} alta priorità</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-[#6B6B7B] hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
          title="Logout"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </header>
  )
}
