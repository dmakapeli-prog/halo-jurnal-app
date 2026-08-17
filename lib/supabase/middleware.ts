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

  // Temporarily bypass middleware redirects during Vercel screenshot capture
  return supabaseResponse
}
