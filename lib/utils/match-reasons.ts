import type { Match } from '@/types'

export function generateMatchReasons(match: Match): string[] {
  const reasons: string[] = []

  if ((match.score_cpv_ateco ?? 0) >= 18) {
    reasons.push(
      `Settore in linea col tuo business (${match.gara_cpv_description ?? match.gara_cpv_id ?? 'CPV compatibile'})`
    )
  } else if ((match.score_cpv_ateco ?? 0) >= 10) {
    reasons.push('Settore parzialmente compatibile con la tua attività')
  }

  const km = match.distanza_km ?? 999
  if (km < 30) {
    reasons.push(`A pochi km dalla tua sede (${km} km)`)
  } else if (km < 100) {
    reasons.push(`Distanza ragionevole per il budget previsto (${km} km)`)
  } else if (km < 300) {
    reasons.push(`Budget elevato giustifica la distanza (${Math.round(km)} km)`)
  }

  if ((match.score_dimensione ?? 0) >= 12) {
    reasons.push('Dimensione gara compatibile con la tua azienda')
  } else if ((match.score_dimensione ?? 0) >= 8) {
    reasons.push('Importo gara gestibile per il tuo profilo')
  }

  if ((match.score_soa ?? 0) >= 20) {
    reasons.push('Categoria lavori adatta al tuo profilo tecnico')
  }

  const giorni = match.giorni_alla_scadenza
  if (giorni != null && giorni > 21) {
    reasons.push(`Hai ${giorni} giorni per preparare l'offerta`)
  } else if (giorni != null && giorni > 7) {
    reasons.push(`Scadenza ravvicinata: ${giorni} giorni rimanenti`)
  } else if (giorni != null && giorni > 0) {
    reasons.push(`⚠️ Scadenza urgente: ${giorni} giorni`)
  }

  return reasons.slice(0, 5)
}

export function formatEur(amount: number): string {
  if (amount >= 1_000_000) return `€${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `€${Math.round(amount / 1_000)}k`
  return `€${amount.toLocaleString('it-IT')}`
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
