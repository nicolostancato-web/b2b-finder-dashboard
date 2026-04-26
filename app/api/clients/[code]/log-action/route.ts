import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db/client'
import { getSession } from '@/lib/utils/session'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const session = await getSession()
  const { code } = await params

  if (!session || session.codice !== code) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
  }

  const { action, tender_id } = await req.json().catch(() => ({}))
  const sql = getDb()

  await sql`
    INSERT INTO client_access_logs (codice_cliente, action, user_agent)
    VALUES (${code}, ${action ?? 'unknown'}, ${tender_id ?? null})
  `.catch(() => {})

  return NextResponse.json({ ok: true })
}
