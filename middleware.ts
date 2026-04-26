import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? 'b2b-finder-secret-change-in-production'
)
const COOKIE_NAME = 'b2b_session'

const PUBLIC_PATHS = ['/login', '/api/clients/', '/api/auth/']

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  if (PUBLIC_PATHS.some((p) => path.startsWith(p))) return NextResponse.next()
  if (path === '/') return NextResponse.redirect(new URL('/login', req.url))

  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.redirect(new URL('/login', req.url))

  try {
    await jwtVerify(token, SECRET)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
