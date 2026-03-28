import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/' || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (n) => request.cookies.get(n)?.value,
        set: (n, v, o) => response.cookies.set(n, v, o),
        remove: (n, o) => response.cookies.set(n, '', o),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.redirect(new URL('/', request.url))

  if (pathname.startsWith('/dashboard')) {
    if (user.email !== 'broker@glrealty.com') return NextResponse.redirect(new URL('/', request.url))
  }

  if (pathname.startsWith('/glradmin')) {
    if (user.email !== 'admin@glrealty.com') return NextResponse.redirect(new URL('/', request.url))
  }

  if (pathname.startsWith('/agent-dashboard')) {
    if (user.email === 'broker@glrealty.com' || user.email === 'admin@glrealty.com') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }
