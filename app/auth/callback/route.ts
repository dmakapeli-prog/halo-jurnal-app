import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/beranda'
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  const supabase = await createClient()
  let authenticated = false

  // Handle PKCE flow (code exchange) — used by magic link / email confirmation
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      authenticated = true
    }
  }

  // Handle token_hash flow (older Supabase email templates)
  if (!authenticated && token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'email',
    })
    if (!error) {
      authenticated = true
    }
  }

  if (authenticated) {
    // Redirect to a client-side page that will handle profile completion
    // (uploading KTP from localStorage, etc.)
    // The profile completion logic runs on the client side since
    // localStorage data is only accessible in the browser
    const redirectUrl = new URL(`/auth/complete-profile`, request.url)
    redirectUrl.searchParams.set('next', next)
    return NextResponse.redirect(redirectUrl)
  }

  // Return the user to login with error
  const errorUrl = new URL(`/login`, request.url)
  errorUrl.searchParams.set('error', 'auth')
  return NextResponse.redirect(errorUrl)
}
