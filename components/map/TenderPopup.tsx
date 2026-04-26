'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { generateMatchReasons, formatEur, formatDate } from '@/lib/utils/match-reasons'
import type { Match } from '@/types'

interface TenderPopupProps {
  match: Match | null
  onClose: () => void
  clientCode: string
}

const LABEL_COLORS: Record<string, string> = {
  alta:  'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  media: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  bassa: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

export default function TenderPopup({ match, onClose, clientCode }: TenderPopupProps) {
  if (!match) return null

  const reasons = generateMatchReasons(match)

  async function logAction(action: string) {
    fetch(`/api/clients/${clientCode}/log-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, tender_id: match?.gara_ocid }),
    }).catch(() => {})
  }

  return (
    <Dialog open={!!match} onOpenChange={onClose}>
      <DialogContent className="bg-[#131320] border-white/10 text-white max-w-lg p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[#A0A0B0] text-xs mb-1 uppercase tracking-wide">
                {match.gara_locality}{match.gara_provincia ? ` (${match.gara_provincia})` : ''}
              </p>
              <h2 className="text-white font-semibold text-lg leading-tight line-clamp-2">
                {match.gara_buyer}
              </h2>
            </div>
            <Badge className={`flex-shrink-0 font-semibold text-sm px-3 py-1 border ${LABEL_COLORS[match.match_label]}`}>
              Score {match.match_score}
            </Badge>
          </div>
          {match.gara_cpv_description && (
            <p className="text-[#A0A0B0] text-sm mt-2 line-clamp-2">{match.gara_cpv_description}</p>
          )}
        </div>

        {/* Metriche */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="grid grid-cols-3 gap-3">
            <MetricCard label="Importo" value={formatEur(match.gara_amount_eur)} />
            <MetricCard label="Scadenza" value={formatDate(match.gara_deadline)} />
            <MetricCard label="Distanza"
              value={match.distanza_km != null ? `${Math.round(match.distanza_km)} km` : '—'} />
          </div>
        </div>

        {/* Motivi */}
        <div className="px-6 py-4 border-b border-white/10">
          <p className="text-[#A0A0B0] text-xs font-medium uppercase tracking-wider mb-3">
            Perché ti suggeriamo questa gara
          </p>
          <ul className="space-y-2">
            {reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#E0E0F0]">
                <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                <span>{r}</span>
              </li>
            ))}
            {reasons.length === 0 && (
              <li className="text-[#6B6B7B] text-sm">Match basato su profilo combinato</li>
            )}
          </ul>
        </div>

        {/* Azioni */}
        <div className="px-6 py-4 flex gap-3">
          {match.gara_source_url ? (
            <a
              href={match.gara_source_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => logAction('open_anac_link')}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm text-center transition-colors flex items-center justify-center gap-2"
            >
              <span>📂</span> Apri Bando ANAC
            </a>
          ) : (
            <button disabled className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 text-[#6B6B7B] font-medium text-sm cursor-not-allowed">
              Bando non disponibile
            </button>
          )}
          <button
            onClick={() => logAction('save_tender')}
            className="py-2.5 px-4 rounded-xl border border-white/20 hover:bg-white/10 text-white font-medium text-sm transition-colors flex items-center gap-2"
          >
            <span>⭐</span> Salva
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 text-center">
      <p className="text-[#6B6B7B] text-xs mb-1">{label}</p>
      <p className="text-white font-semibold text-sm">{value}</p>
    </div>
  )
}
