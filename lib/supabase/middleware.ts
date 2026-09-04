import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        maxAge: 60 * 60 * 24 * 14,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const maxAge = (options && typeof options.maxAge === 'number' && options.maxAge > 0)
              ? options.maxAge
              : 60 * 60 * 24 * 14
            const opts = {
              ...options,
              maxAge,
              path: options?.path || '/',
              sameSite: options?.sameSite || 'lax',
              secure: process.env.NODE_ENV === 'production',
            }
            request.cookies.set({ name, value, ...opts })
          })
          supabaseResponse = NextResponse.next({
            request,
          })
        },
      },
    }
  )

  const pathname = request.nextUrl.pathname

  // Admin Route Protection Guard
  if (pathname.startsWith('/admin')) {
    try {
      // Allow access to /admin/login, but redirect logged-in admins to dashboard
      if (pathname === '/admin/login') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          if (profile?.role === 'admin' || profile?.role === 'superadmin') {
            const url = request.nextUrl.clone()
            url.pathname = '/admin'
            return NextResponse.redirect(url)
          }
        }
        return supabaseResponse
      }

      // Check user authentication for all other /admin routes
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/login'
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
      }

      // Check role authorization in profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/login'
        url.searchParams.set('error', 'unauthorized')
        return NextResponse.redirect(url)
      }
    } catch (err) {
      console.error('Middleware admin auth error:', err)
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

