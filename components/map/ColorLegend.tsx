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
    <div className="absolute bottom-8 left-4 z-10 rounded-xl
      border border-white/[0.08] bg-[#111118]/90 backdrop-blur-md
      p-3 shadow-2xl min-w-[160px]">
      <p className="text-[10px] text-gray-500 font-medium mb-2 uppercase tracking-wider px-1">Priorità</p>
      <div className="space-y-1">
        {LABELS.map(({ key, color, label }) => {
          const count = counts[key]
          const active = activeFilter === key
          return (
            <button
              key={key}
              onClick={() => onFilter(active ? null : key)}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-all text-left text-sm
                ${active ? 'bg-white/10' : 'hover:bg-white/[0.06]'}
                ${activeFilter && !active ? 'opacity-40' : 'opacity-100'}`}
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-white flex-1">{label}</span>
              <span className="text-gray-500 text-xs tabular-nums">{count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
