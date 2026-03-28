import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Public routes — no auth required ──
  if (
    pathname === '/' ||
    pathname === '/api/sms/webhook' ||
    pathname === '/api/admin/check-passcode' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // API routes — skip role enforcement (individual routes guard themselves)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Redirect legacy /login → /
  if (pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ── Unauthenticated → login ──
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  const brokerEmail = process.env.BROKER_EMAIL ?? 'broker@glrealty.com'
  const adminEmail  = process.env.ADMIN_EMAIL  ?? 'admin@glrealty.com'
  const email = user.email ?? ''

  function redirect(to: string) {
    const url = request.nextUrl.clone()
    url.pathname = to
    return NextResponse.redirect(url)
  }

  // ── ROLE: Admin ──
  // admin@glrealty.com → /glradmin only
  if (email === adminEmail) {
    if (!pathname.startsWith('/glradmin')) return redirect('/glradmin')
    return supabaseResponse
  }

  // ── ROLE: Broker ──
  // broker@glrealty.com → all CRM routes, not /glradmin or /agent-dashboard
  if (email === brokerEmail) {
    if (pathname.startsWith('/glradmin'))     return redirect('/dashboard')
    if (pathname.startsWith('/agent-dashboard')) return redirect('/dashboard')
    return supabaseResponse
  }

  // ── ROLE: Agent ──
  // Everyone else → /agent-dashboard only
  if (!pathname.startsWith('/agent-dashboard')) return redirect('/agent-dashboard')
  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
