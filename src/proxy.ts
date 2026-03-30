import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/' || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

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

  // Primary: session from cookies
  let { data: { user } } = await supabase.auth.getUser()

  // Fallback: token from Authorization header
  if (!user) {
    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { data } = await supabase.auth.getUser(token)
      user = data.user
    }
  }

  if (!user) return NextResponse.redirect(new URL('/', request.url))

  const brokerEmail = process.env.NEXT_PUBLIC_BROKER_EMAIL ?? 'broker@glrealty.com'
  const adminEmail  = process.env.NEXT_PUBLIC_ADMIN_EMAIL  ?? 'admin@glrealty.com'

  if (pathname.startsWith('/dashboard')) {
    if (user.email !== brokerEmail) return NextResponse.redirect(new URL('/', request.url))
  }

  if (pathname.startsWith('/glradmin')) {
    if (user.email !== adminEmail) return NextResponse.redirect(new URL('/', request.url))
  }

  if (pathname.startsWith('/agent-dashboard')) {
    if (user.email === brokerEmail || user.email === adminEmail) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }
