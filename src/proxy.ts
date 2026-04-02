import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname === '/' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) return NextResponse.next()

  let res = NextResponse.next({ request })

  const sb = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(list) {
          list.forEach(({ name, value }) => request.cookies.set(name, value))
          res = NextResponse.next({ request })
          list.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/', request.url))

  const em = user.email ?? ''
  const BROKER = process.env.NEXT_PUBLIC_BROKER_EMAIL ?? 'broker@glrealty.com'
  const ADMIN  = process.env.NEXT_PUBLIC_ADMIN_EMAIL  ?? 'admin@glrealty.com'

  const crmRoutes = ['/dashboard', '/agents', '/leads', '/messages', '/documents', '/pipeline', '/tasks']

  if (crmRoutes.some(r => pathname.startsWith(r))) {
    if (em !== BROKER) return NextResponse.redirect(new URL('/', request.url))
    return res
  }

  if (pathname.startsWith('/glradmin')) {
    if (em !== ADMIN) return NextResponse.redirect(new URL('/', request.url))
    return res
  }

  if (pathname.startsWith('/agent-dashboard')) {
    if (em === BROKER || em === ADMIN) return NextResponse.redirect(new URL('/', request.url))
    return res
  }

  return NextResponse.redirect(new URL('/', request.url))
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }
