'use client'
import { useEffect } from 'react'
import { generateMatchReasons, formatEur, formatDate } from '@/lib/utils/match-reasons'
import type { Match } from '@/types'

interface TenderSlideOverProps {
  match: Match | null
  onClose: () => void
  clientCode: string
}

const LABEL_CONFIG = {
  alta:  { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', dot: 'bg-emerald-400' },
  media: { color: 'text-amber-400',   bg: 'bg-amber-500/15 border-amber-500/30',     dot: 'bg-amber-400'   },
  bassa: { color: 'text-orange-400',  bg: 'bg-orange-500/15 border-orange-500/30',   dot: 'bg-orange-400'  },
}

function ScoreBar({ label, score, max = 25 }: { label: string; score: number; max?: number }) {
  const pct = Math.min(100, Math.round((score / max) * 100))
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-white font-medium tabular-nums">{pct}%</span>
      </div>
      <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3">
      <p className="text-[11px] text-gray-500 mb-1 uppercase tracking-wide">{label}</p>
      <p className="text-white font-semibold text-sm">{value}</p>
      {sub && <p className="text-gray-500 text-[10px] mt-0.5">{sub}</p>}
    </div>
  )
}

export default function TenderSlideOver({ match, onClose, clientCode }: TenderSlideOverProps) {
  const open = !!match

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  function logAction(action: string) {
    fetch(`/api/clients/${clientCode}/log-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, tender_id: match?.gara_ocid }),
    }).catch(() => {})
  }

  const cfg = match ? LABEL_CONFIG[match.match_label] : LABEL_CONFIG.bassa
  const reasons = match ? generateMatchReasons(match) : []

  return (
    <>
      {/* Backdrop mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div className={`fixed top-16 right-0 bottom-0 z-40 w-full max-w-[420px]
        bg-[#111118] border-l border-white/[0.06]
        flex flex-col overflow-hidden
        transition-transform duration-300 ease-out
        ${open ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {!match ? null : (
          <>
            {/* Header panel */}
            <div className="flex items-start justify-between p-5 border-b border-white/[0.06] flex-shrink-0">
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
                    {match.match_label === 'alta' ? 'Alta priorità' : match.match_label === 'media' ? 'Media' : 'Bassa'}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">Score {match.match_score}</span>
                </div>
                <h2 className="text-white font-semibold text-base leading-snug line-clamp-2">
                  {match.gara_buyer}
                </h2>
                <p className="text-gray-500 text-xs mt-1">
                  {match.gara_locality}{match.gara_provincia ? ` · ${match.gara_provincia}` : ''}
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1.5 rounded-lg text-gray-500 hover:bg-white/[0.08] hover:text-white transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Body scrollabile */}
            <div className="flex-1 overflow-y-auto">
              {/* Descrizione CPV */}
              {match.gara_cpv_description && (
                <div className="px-5 pt-4">
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                    {match.gara_cpv_description}
                  </p>
                </div>
              )}

              {/* Metric cards 2x2 */}
              <div className="px-5 py-4 grid grid-cols-2 gap-2">
                <MetricCard label="Importo" value={formatEur(match.gara_amount_eur)} />
                <MetricCard
                  label="Scadenza"
                  value={formatDate(match.gara_deadline)}
                  sub={match.giorni_alla_scadenza != null ? `${match.giorni_alla_scadenza} giorni` : undefined}
                />
                <MetricCard
                  label="Distanza"
                  value={match.distanza_km != null ? `${Math.round(match.distanza_km)} km` : '—'}
                />
                <MetricCard
                  label="CPV"
                  value={match.gara_cpv_id?.slice(0, 8) ?? '—'}
                  sub={match.gara_macro_area ?? undefined}
                />
              </div>

              {/* Match Breakdown */}
              <div className="px-5 py-4 border-t border-white/[0.06]">
                <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-3">
                  Match Breakdown
                </p>
                <div className="space-y-3">
                  <ScoreBar label="SOA compatibility" score={match.score_soa ?? 0} max={25} />
                  <ScoreBar label="Geographic fit"    score={match.score_geografia ?? 0} max={25} />
                  <ScoreBar label="Sector match"      score={match.score_cpv_ateco ?? 0} max={20} />
                  <ScoreBar label="Size compatibility" score={match.score_dimensione ?? 0} max={15} />
                </div>
              </div>

              {/* Motivi */}
              {reasons.length > 0 && (
                <div className="px-5 py-4 border-t border-white/[0.06]">
                  <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider mb-3">
                    Perché questa gara
                  </p>
                  <ul className="space-y-2">
                    {reasons.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-emerald-400 mt-0.5 text-base leading-none flex-shrink-0">✓</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bottom padding */}
              <div className="h-4"/>
            </div>

            {/* Footer bottoni */}
            <div className="p-4 border-t border-white/[0.06] space-y-2 flex-shrink-0">
              {match.gara_source_url ? (
                <a
                  href={match.gara_source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => logAction('open_anac_link')}
                  className="flex w-full items-center justify-center gap-2 py-2.5 rounded-xl
                    bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm
                    transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  Open ANAC Link
                </a>
              ) : (
                <button disabled className="w-full py-2.5 rounded-xl bg-white/[0.05] text-gray-600 font-medium text-sm cursor-not-allowed">
                  Bando non disponibile
                </button>
              )}
              <button
                onClick={() => logAction('save_tender')}
                className="w-full py-2.5 rounded-xl border border-white/[0.12] text-white
                  hover:bg-white/[0.06] font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Save
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
