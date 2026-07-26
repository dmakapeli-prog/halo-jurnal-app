import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | undefined

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    )
  }

  if (typeof window === 'undefined') {
    return createBrowserClient(supabaseUrl, supabaseAnonKey, {
      cookieOptions: {
        maxAge: 60 * 60 * 24 * 14,
        path: '/',
        sameSite: 'lax',
      },
    })
  }

  if (!client) {
    client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      cookieOptions: {
        maxAge: 60 * 60 * 24 * 14,
        path: '/',
        sameSite: 'lax',
      },
    })
  }

  return client
}
