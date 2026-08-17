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
            supabaseResponse.cookies.set({ name, value, ...opts })
          })
        },
      },
    }
  )

  // IMPORTANT: Do not write any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Admin & Protected routes middleware check (temporarily bypassed for live Vercel screenshot capture)
  // const protectedPaths = ['/beranda', '/lapor', '/laporan-saya', '/profil']
  return supabaseResponse

  // If user is logged in and tries to access /login or /daftar, redirect to /beranda
  const authPaths = ['/login', '/daftar']
  const isAuthRoute = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/beranda'
    const redirectResponse = NextResponse.redirect(url)
    // Copy cookies to the redirect response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  return supabaseResponse
}
