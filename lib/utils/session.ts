import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? 'b2b-finder-secret-change-in-production'
)
const COOKIE_NAME = 'b2b_session'

export async function createSession(codice: string): Promise<string> {
  return new SignJWT({ codice })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(SECRET)
}

export async function getSession(): Promise<{ codice: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return { codice: payload.codice as string }
  } catch {
    return null
  }
}

export { COOKIE_NAME }
