'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const getSupabase = () => createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(
    searchParams.get('error') === 'auth'
      ? 'Terjadi kesalahan saat verifikasi. Silakan coba lagi.'
      : ''
  )
  const [successMsg] = useState(
    searchParams.get('success') === 'confirmed'
      ? 'Email berhasil dikonfirmasi! Silakan login dengan akun Anda.'
      : ''
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Masukkan email dan password Anda.')
      return
    }
    setLoading(true)
    setError('')

    const { error: signInError } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      if (signInError.message.includes('Email not confirmed')) {
        setError('Email belum dikonfirmasi, silakan cek email Anda.')
      } else {
        setError('Email atau password salah.')
      }
    } else {
      router.push('/beranda')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <>
      <Navbar showLoginButton={false} />

      {/* Main Content: Split Screen Layout */}
      <main className="min-h-screen flex flex-col lg:flex-row pt-[80px]">
        {/* Left Side: Branding/Illustration (Sticky) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-[#8b1e2c] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div
              className="w-full h-full bg-cover bg-center opacity-40 mix-blend-overlay"
              style={{
                backgroundImage: "url('/hero-banner.jpg')",
              }}
            ></div>
          </div>

          <div className="relative z-10 p-20 flex flex-col justify-center h-full text-white">
            <div className="mb-8">
              <span className="material-symbols-outlined text-6xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
                account_balance
              </span>
              <h1 className="font-['Libre_Franklin'] text-[48px] leading-[56px] tracking-[-0.02em] font-bold leading-tight mb-4">
                Membangun Kepercayaan Lewat Transparansi.
              </h1>
              <p className="font-['Public_Sans'] text-[18px] leading-[28px] text-white/90 max-w-lg">
                Halo Jurnal adalah portal aspirasi resmi yang menjamin setiap laporan masyarakat didengar, dicatat, dan ditindaklanjuti secara profesional.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 mt-12">
              <div className="p-6 bg-white/10 backdrop-blur-md rounded-[0.5rem] border border-white/20">
                <span className="material-symbols-outlined text-[#ffe08e] text-3xl mb-2">verified_user</span>
                <h3 className="font-['Libre_Franklin'] text-sm font-semibold mb-1">Data Terenkripsi</h3>
                <p className="font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold text-white/70">
                  Keamanan identitas pelapor adalah prioritas utama kami.
                </p>
              </div>
              <div className="p-6 bg-white/10 backdrop-blur-md rounded-[0.5rem] border border-white/20">
                <span className="material-symbols-outlined text-[#ffe08e] text-3xl mb-2">history_edu</span>
                <h3 className="font-['Libre_Franklin'] text-sm font-semibold mb-1">Respon Terukur</h3>
                <p className="font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold text-white/70">
                  Setiap jurnal aspirasi dipantau dan dikelola oleh tim Admin Jurnal Sukabumi secara real-time.
                </p>
              </div>
            </div>
          </div>
          {/* Footer-like element in Brand Side */}
          <div className="absolute bottom-10 left-20 z-10 flex gap-6">
            <span className="text-white/60 font-['Public_Sans'] text-[12px] leading-[16px] tracking-[0.04em] font-bold">
              © {new Date().getFullYear()} Halo Jurnal. Portal Aspirasi Masyarakat.
            </span>
          </div>
        </div>

        {/* Right Side: Interaction Forms */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-20 bg-[#fcf9f4]">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-8 sm:mb-10 text-center lg:text-left">
              <h2 className="font-['Libre_Franklin'] text-[26px] sm:text-[32px] leading-[34px] sm:leading-[40px] font-bold text-[#6b0218] mb-2">
                Selamat Datang Kembali
              </h2>
              <p className="font-['Public_Sans'] text-[14px] sm:text-[16px] leading-[22px] sm:leading-[24px] text-[#574141]">
                Masuk untuk melihat status laporan Anda.
              </p>
            </div>

            {/* Login Form */}
            <form className="space-y-5 sm:space-y-6" onSubmit={handleLogin}>
              {/* Success message */}
              {successMsg && (
                <div className="p-3 bg-green-50 border border-green-300 rounded-[0.25rem] text-green-800 font-['Public_Sans'] text-[14px] flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-600 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  {successMsg}
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a] rounded-[0.25rem] text-[#93000a] font-['Public_Sans'] text-[14px]">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold block text-[#574141]">
                  Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#574141]/50">
                    person
                  </span>
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-white border-[1.5px] border-[#debfbf] rounded-[0.25rem] focus:ring-2 focus:ring-[#6b0218] focus:border-[#6b0218] transition-all font-['Public_Sans'] text-[16px] leading-[24px]"
                    placeholder="e.g. user@mail.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold block text-[#574141]">
                    Password
                  </label>
                  <Link href="/reset-password" className="text-[12px] text-[#6b0218] font-bold hover:underline">
                    Lupa Password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#574141]/50">
                    lock
                  </span>
                  <input
                    className="w-full pl-10 pr-12 py-3 bg-white border-[1.5px] border-[#debfbf] rounded-[0.25rem] focus:ring-2 focus:ring-[#6b0218] focus:border-[#6b0218] transition-all font-['Public_Sans'] text-[16px] leading-[24px]"
                    placeholder="Masukkan password Anda"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#574141]/50 hover:text-[#6b0218]"
                    disabled={loading}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6b0218] text-white py-4 rounded-[0.25rem] font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold text-lg hover:bg-[#8b1e2c] transition-all shadow-sm active:scale-95 duration-100 disabled:opacity-50 min-h-[48px]"
              >
                {loading ? 'Masuk...' : 'Masuk Sekarang'}
              </button>
            </form>

            <p className="mt-6 sm:mt-8 text-center text-[#574141] font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold">
              Belum punya akun?{' '}
              <Link href="/daftar" className="text-[#6b0218] font-bold hover:underline">
                Daftar Akun Baru
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fcf9f4] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6b0218]"></div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}
