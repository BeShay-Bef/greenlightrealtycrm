import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Always public ──
  if (
    pathname === '/' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // ── Build session-aware Supabase client ──
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

  function redirect(to: string) {
    const url = request.nextUrl.clone()
    url.pathname = to
    return NextResponse.redirect(url)
  }

  // Unauthenticated → login
  if (!user) return redirect('/')

  const email       = user.email ?? ''
  const brokerEmail = process.env.NEXT_PUBLIC_BROKER_EMAIL ?? 'broker@glrealty.com'
  const adminEmail  = process.env.NEXT_PUBLIC_ADMIN_EMAIL  ?? 'admin@glrealty.com'

  // ── /glradmin → admin only ──
  if (pathname.startsWith('/glradmin')) {
    if (email === adminEmail) return supabaseResponse
    return redirect('/')
  }

  // ── CRM routes → broker only ──
  const crmRoutes = [
    '/dashboard', '/pipeline', '/agents', '/leads',
    '/tasks', '/messages', '/documents',
  ]
  if (crmRoutes.some(r => pathname.startsWith(r))) {
    if (email === brokerEmail) return supabaseResponse
    return redirect('/')
  }

  // ── /agent-dashboard → must exist in agents table ──
  if (pathname.startsWith('/agent-dashboard')) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/agents?email=eq.${encodeURIComponent(email)}&select=id&limit=1`,
        {
          headers: {
            apikey:        process.env.SUPABASE_SERVICE_ROLE_KEY!,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
          },
          cache: 'no-store',
        }
      )
      const rows: unknown[] = await res.json()
      if (!Array.isArray(rows) || rows.length === 0) return redirect('/')
    } catch {
      return redirect('/')
    }
    return supabaseResponse
  }

  return redirect('/')
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
