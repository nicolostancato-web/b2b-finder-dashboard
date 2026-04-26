import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db/client'
import { createSession, COOKIE_NAME } from '@/lib/utils/session'
import type { ClientProfile } from '@/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const sql = getDb()

  const rows = await sql<ClientProfile[]>`
    SELECT * FROM client_profiles WHERE codice_cliente = ${code}
  `

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Codice non valido' }, { status: 401 })
  }

  const profile = rows[0]

  if (!profile.subscription_active) {
    return NextResponse.json({ error: 'Subscription non attiva' }, { status: 403 })
  }

  sql`INSERT INTO client_access_logs (codice_cliente, action) VALUES (${code}, 'login')`
    .catch(() => {})

  sql`UPDATE client_profiles SET last_login_at = NOW() WHERE codice_cliente = ${code}`
    .catch(() => {})

  const token = await createSession(code)

  const response = NextResponse.json({
    codice: profile.codice_cliente,
    ragione_sociale: profile.ragione_sociale,
    sede: {
      lat: profile.sede_lat,
      lng: profile.sede_lng,
      comune: profile.sede_comune,
      provincia: profile.sede_provincia,
      regione: profile.sede_regione,
    },
    tier: profile.tier,
    regioni_interesse: profile.regioni_interesse,
    importo_min: profile.importo_min,
    importo_max: profile.importo_max,
  })

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  return response
}
