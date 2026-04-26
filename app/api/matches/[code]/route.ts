import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db/client'
import { getSession } from '@/lib/utils/session'
import type { Match } from '@/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await getSession()
  const { code } = await params

  if (!session || session.codice !== code) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  const sql = getDb()

  const rows = await sql<Match[]>`
    SELECT
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
    FROM matches m
    WHERE m.company_id = (
      SELECT c.id FROM companies c
      WHERE c.partita_iva = (
        SELECT cp.partita_iva FROM client_profiles cp
        WHERE cp.codice_cliente = ${code}
      )
      LIMIT 1
    )
    ORDER BY m.match_score DESC
    LIMIT 200
  `

  return NextResponse.json(rows)
}
