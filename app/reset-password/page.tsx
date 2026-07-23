'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Masukkan email Anda.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    const supabase = createClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/reset-password/confirm`,
    })

    if (resetError) {
      setError(resetError.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <>
      <Navbar showLoginButton={false} />
      <main className="min-h-screen pt-[64px] md:pt-[80px] flex items-center justify-center bg-[#fcf9f4] p-4">
        <div className="w-full max-w-md p-8 bg-white border border-[#debfbf] rounded-[0.5rem] shadow-sm text-center">
          <span className="material-symbols-outlined text-5xl text-[#6b0218] mb-4">
            lock_reset
          </span>
          <h1 className="font-['Libre_Franklin'] text-[24px] font-bold text-[#6b0218] mb-4">
            Reset Password
          </h1>
          
          {success ? (
            <div className="text-center">
              <p className="font-['Public_Sans'] text-[16px] text-[#574141] mb-6">
                Link reset password telah dikirim ke email <strong>{email}</strong>. Silakan cek inbox (dan folder spam) Anda.
              </p>
              <Link
                href="/login"
                className="inline-block w-full bg-[#6b0218] text-white py-3 rounded-[0.25rem] font-semibold hover:bg-[#8b1e2c] transition-colors"
              >
                Kembali ke Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-6 text-left">
              <p className="font-['Public_Sans'] text-[14px] text-[#574141] text-center mb-6">
                Masukkan email yang terdaftar untuk menerima link reset password.
              </p>
              
              {error && (
                <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a] rounded-[0.25rem] text-[#93000a] font-['Public_Sans'] text-[14px]">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-['Public_Sans'] text-[14px] font-semibold block text-[#574141]">
                  Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#574141]/50">
                    mail
                  </span>
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-white border-[1.5px] border-[#debfbf] rounded-[0.25rem] focus:ring-2 focus:ring-[#6b0218] focus:border-[#6b0218] transition-all font-['Public_Sans'] text-[16px]"
                    placeholder="e.g. user@mail.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6b0218] text-white py-4 rounded-[0.25rem] font-['Public_Sans'] text-[14px] font-semibold text-lg hover:bg-[#8b1e2c] transition-all shadow-sm active:scale-95 disabled:opacity-50 min-h-[48px]"
              >
                {loading ? 'Mengirim...' : 'Kirim Link Reset'}
              </button>

              <div className="text-center mt-4">
                <Link href="/login" className="text-[14px] text-[#6b0218] font-bold hover:underline">
                  Kembali ke Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
