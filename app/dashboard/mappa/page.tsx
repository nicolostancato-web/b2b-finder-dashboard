import { redirect } from 'next/navigation'
import { getSession } from '@/lib/utils/session'
import { getDb } from '@/lib/db/client'
import type { ClientProfile, Match } from '@/types'
import DashboardClient from '../DashboardClient'

const MATCH_QUERY = `
  m.gara_ocid, m.company_id,
  m.gara_buyer, m.gara_amount_eur, m.gara_cpv_id, m.gara_cpv_description,
  m.gara_locality, m.gara_provincia, m.gara_regione,
  m.gara_lat, m.gara_lng, m.gara_macro_area,
  m.gara_deadline, m.gara_release_date, m.gara_source_url,
  m.company_ragione_sociale, m.company_sede_comune,
  m.company_sede_provincia, m.company_sede_regione,
  m.company_sede_lat, m.company_sede_lng,
  m.match_score, m.match_label,
  m.score_soa, m.score_cpv_ateco, m.score_geografia,
  m.score_dimensione, m.score_contattabilita, m.score_qualita,
  m.distanza_km, m.rapporto_importo_fatturato,
  m.giorni_alla_scadenza, m.breakdown_json
`

export default async function MappaPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const sql = getDb()

  const profiles = await sql<ClientProfile[]>`
    SELECT * FROM client_profiles WHERE codice_cliente = ${session.codice}
  `
  if (!profiles.length || !profiles[0].subscription_active) redirect('/login')
  const profile = profiles[0]

  const matches = await sql<Match[]>`
    SELECT ${sql.unsafe(MATCH_QUERY)}
    FROM matches m
    WHERE m.company_id = (
      SELECT c.id FROM companies c WHERE c.partita_iva = ${profile.partita_iva} LIMIT 1
    )
    AND m.gara_lat IS NOT NULL AND m.gara_lng IS NOT NULL
    ORDER BY m.match_score DESC
    LIMIT 200
  `

  return (
    <DashboardClient
      profile={profile}
      matches={matches as unknown as Match[]}
    />
  )
}
