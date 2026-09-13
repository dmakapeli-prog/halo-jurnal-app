'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function AdminLoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next') || '/admin'
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(
    errorParam === 'unauthorized'
      ? 'Akses ditolak: Anda harus login menggunakan akun Administrator untuk mengakses halaman tersebut.'
      : ''
  )

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMsg('Harap masukkan email dan password Admin.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      const supabase = createClient()

      // 1. Authenticate credentials via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setErrorMsg('Email atau password yang Anda masukkan salah.')
        } else if (authError.message.includes('Email not confirmed')) {
          setErrorMsg('Email belum dikonfirmasi. Periksa kotak masuk email Anda.')
        } else {
          setErrorMsg(authError.message)
        }
        setLoading(false)
        return
      }

      if (!authData.user) {
        setErrorMsg('Gagal melakukan verifikasi autentikasi.')
        setLoading(false)
        return
      }

      // 2. Authorize role in profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', authData.user.id)
        .single()

      if (profileError || !profile) {
        // Fallback: If no profile row exists, deny admin access safely
        await supabase.auth.signOut()
        setErrorMsg('Gagal memverifikasi profil akun. Hak akses admin tidak ditemukan.')
        setLoading(false)
        return
      }

      if (profile.role !== 'admin' && profile.role !== 'superadmin') {
        // User is logged in as standard citizen -> Sign out immediately to protect admin session
        await supabase.auth.signOut()
        setErrorMsg(
          `Akses Ditolak: Akun "${profile.full_name || email}" terdaftar sebagai (${profile.role || 'citizen'}) dan tidak memiliki wewenang untuk mengakses Control Panel Admin.`
        )
        setLoading(false)
        return
      }

      // 3. Login & Authorization successful -> Redirect to Admin Dashboard
      router.push(nextUrl)
      router.refresh()
    } catch (err: any) {
      console.error('Error during admin login:', err)
      setErrorMsg(err.message || 'Terjadi kesalahan sistem saat memproses login admin.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fcf9f4] text-gray-900 flex flex-col justify-center items-center p-4 relative font-['Public_Sans'] overflow-hidden">
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-red-100/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] bg-amber-100/40 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 border border-red-100 shadow-sm mb-4 text-[#6b0218]">
            <span className="material-symbols-outlined text-[32px]">shield</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-[11px] font-semibold uppercase tracking-wider text-[#6b0218] mb-3">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            Restricted Area • Admin Portal
          </div>

          <h1 className="font-['Libre_Franklin'] text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 mb-1">
            Control Panel Admin
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-['Public_Sans']">
            PT Media Jurnal Sukabumi — Portal Administrasi Internal
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleAdminLogin} className="space-y-5">
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
              <span className="material-symbols-outlined text-red-600 text-lg shrink-0 mt-0.5">error</span>
              <div className="flex-1 font-['Public_Sans']">{errorMsg}</div>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block">
              Email Administrator
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                admin_panel_settings
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jurnalsukabumi.com"
                disabled={loading}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block">
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={loading}
                className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-[#6b0218] hover:bg-[#8b1e2c] text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-red-900/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.98]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Memverifikasi Otorisasi...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl">login</span>
                <span>Masuk ke Dashboard Admin</span>
              </>
            )}
          </button>
        </form>

        {/* Security Footer Notice */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center space-y-4">
          <div className="flex items-center justify-center gap-1.5 text-gray-500 text-xs">
            <span className="material-symbols-outlined text-sm text-gray-400">lock_reset</span>
            <span>Seluruh aktivitas autentikasi dicatat untuk keamanan.</span>
          </div>

          <div>
            <Link
              href="/login"
              className="text-xs sm:text-sm text-gray-600 hover:text-red-600 font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              <span>Kembali ke Halaman Login Publik / Warga</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="mt-8 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} PT Media Jurnal Sukabumi. Secure Admin Gateway.
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fcf9f4] flex items-center justify-center text-gray-800">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#6b0218]"></div>
        </div>
      }
    >
      <AdminLoginPageContent />
    </Suspense>
  )
}
