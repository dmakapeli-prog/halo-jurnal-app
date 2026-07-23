import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/beranda'
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  // Prepare the redirect URL first so we can attach cookies to it
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const redirectBase = isLocalEnv
    ? origin
    : forwardedHost
      ? `https://${forwardedHost}`
      : origin

  // Create a response object that we can attach cookies to
  // We'll update the redirect URL later based on auth result
  let redirectTo = `${redirectBase}${next}`

  // Build a Supabase client that reads cookies from the incoming request
  // and writes cookies to the outgoing response.
  // This is the correct pattern for Route Handlers per @supabase/ssr docs.
  const response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.headers.get('cookie')
            ? parseCookies(request.headers.get('cookie')!)
            : []
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...options })
          })
        },
      },
    }
  )

  let authenticated = false

  // Handle PKCE flow (code exchange) — used by email confirmation with signUp
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      authenticated = true
    } else {
      console.error('exchangeCodeForSession error:', error.message)
    }
  }

  // Handle token_hash flow (older email templates or password recovery)
  if (!authenticated && token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'email' | 'recovery',
    })
    if (!error) {
      authenticated = true
    } else {
      console.error('verifyOtp error:', error.message)
    }
  }

  if (authenticated) {
    // For signup confirmations, redirect to complete-profile
    // For password reset, redirect to the specified `next` URL
    if (next === '/beranda' && !token_hash) {
      // Default signup flow: go through profile completion
      redirectTo = `${redirectBase}/auth/complete-profile?next=${encodeURIComponent(next)}`
    } else {
      redirectTo = `${redirectBase}${next}`
    }
  } else {
    // Authentication failed — redirect to login with a specific error message
    redirectTo = `${redirectBase}/login?error=auth`
  }

  // Create the final redirect response and copy ALL cookies from the
  // intermediate response (including the session cookies set by Supabase)
  const finalResponse = NextResponse.redirect(redirectTo)
  response.cookies.getAll().forEach((cookie) => {
    finalResponse.cookies.set(cookie.name, cookie.value, cookie)
  })

  return finalResponse
}

/**
 * Parse a raw Cookie header string into the format expected by @supabase/ssr
 */
function parseCookies(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(';').map((cookie) => {
    const [name, ...rest] = cookie.trim().split('=')
    return { name: name.trim(), value: rest.join('=').trim() }
  })
}
