'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'

const NAV = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    path: '/dashboard/map',
    label: 'Mappa',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5"/>
      </svg>
    ),
  },
]

export default function AppSidebar() {
  const pathname = usePathname()
  const { isExpanded, isMobileOpen, toggleMobileSidebar } = useSidebar()

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full flex flex-col
          bg-[#111118] border-r border-white/[0.06]
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-[220px]' : 'w-[64px]'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">B2</span>
            </div>
            {isExpanded && (
              <span className="text-white font-semibold text-base tracking-tight whitespace-nowrap">
                B2B Finder
              </span>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {NAV.map(({ path, label, icon }) => {
              const active = pathname === path || (path === '/dashboard' && pathname === '/dashboard')
              return (
                <li key={path}>
                  <Link
                    href={path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150
                      ${active
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'text-gray-400 hover:bg-white/[0.06] hover:text-white'
                      }`}
                  >
                    <span className="flex-shrink-0">{icon}</span>
                    {isExpanded && (
                      <span className="text-sm font-medium whitespace-nowrap">{label}</span>
                    )}
                    {active && !isExpanded && (
                      <span className="absolute left-[60px] bg-[#1C1C2E] text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
                        {label}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className={`flex items-center gap-2 px-2 py-2 rounded-lg ${isExpanded ? '' : 'justify-center'}`}>
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-emerald-400">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </div>
            {isExpanded && (
              <div className="overflow-hidden">
                <p className="text-xs font-medium text-white truncate">B2B Finder</p>
                <p className="text-[10px] text-gray-500 truncate">Dashboard</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
