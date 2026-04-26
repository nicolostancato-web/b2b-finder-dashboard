import type { Match } from '@/types'

export interface MatchReason {
  icon: '✅' | '⚠️' | '❌'
  titolo: string
  spiegazione: string
}

export function generateMatchReasons(match: Match): MatchReason[] {
  const reasons: MatchReason[] = []

  // Settore CPV
  const cpvScore = match.score_cpv_ateco ?? 0
  if (cpvScore >= 18) {
    reasons.push({
      icon: '✅',
      titolo: 'Settore in linea',
      spiegazione: `${match.gara_cpv_description ?? match.gara_cpv_id ?? 'CPV compatibile'} — corrisponde alla tua attività`,
    })
  } else if (cpvScore >= 10) {
    reasons.push({
      icon: '⚠️',
      titolo: 'Settore parzialmente compatibile',
      spiegazione: `${match.gara_cpv_description ?? 'CPV parzialmente compatibile'} con la tua attività`,
    })
  }

  // Distanza
  const km = Math.round(match.distanza_km ?? 999)
  if (km < 30) {
    reasons.push({
      icon: '✅',
      titolo: 'Vicinanza geografica eccellente',
      spiegazione: `A soli ${km} km dalla tua sede`,
    })
  } else if (km < 100) {
    reasons.push({
      icon: '✅',
      titolo: 'Distanza ragionevole',
      spiegazione: `A ${km} km dalla tua sede — facilmente raggiungibile`,
    })
  } else if (km < 300) {
    reasons.push({
      icon: '⚠️',
      titolo: 'Distanza significativa',
      spiegazione: `${km} km — valuta i costi di trasferta`,
    })
  } else {
    reasons.push({
      icon: '⚠️',
      titolo: 'Gara fuori regione',
      spiegazione: `${km} km — considera se vale la logistica`,
    })
  }

  // Dimensione gara
  const dimScore = match.score_dimensione ?? 0
  if (dimScore >= 12) {
    reasons.push({
      icon: '✅',
      titolo: 'Dimensione gara adeguata',
      spiegazione: `Importo ${formatEurFull(match.gara_amount_eur)} compatibile con la tua azienda`,
    })
  } else if (dimScore >= 8) {
    reasons.push({
      icon: '⚠️',
      titolo: 'Importo al limite del tuo profilo',
      spiegazione: `${formatEurFull(match.gara_amount_eur)} — verifica la capacità finanziaria`,
    })
  }

  // SOA
  if ((match.score_soa ?? 0) >= 20) {
    reasons.push({
      icon: '✅',
      titolo: 'Categoria SOA compatibile',
      spiegazione: 'Il tipo di lavoro è adatto al tuo profilo tecnico',
    })
  }

  // Scadenza
  const giorni = match.giorni_alla_scadenza
  if (giorni != null && giorni > 30) {
    reasons.push({
      icon: '✅',
      titolo: 'Tempo sufficiente',
      spiegazione: `${giorni} giorni per preparare l'offerta`,
    })
  } else if (giorni != null && giorni > 7) {
    reasons.push({
      icon: '⚠️',
      titolo: 'Tempo limitato',
      spiegazione: `Solo ${giorni} giorni rimanenti — affrettati`,
    })
  } else if (giorni != null && giorni > 0) {
    reasons.push({
      icon: '❌',
      titolo: 'Scadenza imminente',
      spiegazione: `Restano solo ${giorni} giorni`,
    })
  }

  return reasons.slice(0, 5)
}

// FIX 7: Full number format — "€489.000" not "€489k"
export function formatEur(amount: number | string | null | undefined): string {
  const n = Number(amount)
  if (isNaN(n) || n === 0) return '—'
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n)
}

// Internal helper without € symbol for descriptions
function formatEurFull(amount: number | string | null | undefined): string {
  return formatEur(amount)
}

// FIX 7: Date format with days remaining badge data
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function getDeadlineBadge(dateStr: string | null, giorni: number | null): {
  text: string
  color: 'red' | 'orange' | 'green' | 'gray'
} {
  if (!dateStr) return { text: '—', color: 'gray' }
  const g = giorni ?? Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
  if (g < 0) return { text: `Scaduta da ${Math.abs(g)} giorni`, color: 'red' }
  if (g === 0) return { text: 'Scade oggi', color: 'red' }
  if (g <= 7) return { text: `Tra ${g} giorni`, color: 'red' }
  if (g <= 30) return { text: `Tra ${g} giorni`, color: 'orange' }
  return { text: `Tra ${g} giorni`, color: 'green' }
}
