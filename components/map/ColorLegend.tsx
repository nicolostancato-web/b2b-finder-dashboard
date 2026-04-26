'use client'

interface ColorLegendProps {
  counts: { alta: number; media: number; bassa: number }
  activeFilter: string | null
  onFilter: (label: string | null) => void
}

const LABELS = [
  { key: 'alta',  color: '#10B981', label: 'Alta priorità' },
  { key: 'media', color: '#F59E0B', label: 'Media' },
  { key: 'bassa', color: '#F97316', label: 'Bassa' },
] as const

export default function ColorLegend({ counts, activeFilter, onFilter }: ColorLegendProps) {
  return (
    <div className="absolute bottom-8 right-4 z-10 rounded-xl border border-white/10 bg-[#131320]/90 backdrop-blur-md p-4 shadow-2xl min-w-[180px]">
      <p className="text-[#A0A0B0] text-xs font-medium mb-3 uppercase tracking-wider">Priorità</p>
      <div className="space-y-2">
        {LABELS.map(({ key, color, label }) => {
          const count = counts[key]
          const active = activeFilter === key
          return (
            <button
              key={key}
              onClick={() => onFilter(active ? null : key)}
              className={`w-full flex items-center gap-3 px-2 py-1.5 rounded-lg transition-all text-left
                ${active ? 'bg-white/15' : 'hover:bg-white/10'}
                ${activeFilter && !active ? 'opacity-40' : 'opacity-100'}`}
            >
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-white text-sm flex-1">{label}</span>
              <span className="text-[#A0A0B0] text-xs tabular-nums">{count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
