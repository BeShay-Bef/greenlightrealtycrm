import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/' || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Must create response first, then pass request into it so cookies flow correctly
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
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
