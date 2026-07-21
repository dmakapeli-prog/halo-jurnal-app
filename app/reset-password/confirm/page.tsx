'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'

export default function ConfirmResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password || password.length < 8) {
      setError('Password minimal 8 karakter.')
      return
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
    } else {
      setSuccessMsg('Password berhasil diubah, silakan login.')
      // Sign out immediately so they have to login with new password
      await supabase.auth.signOut()
      
      // Delay before redirecting to allow user to read the message
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  }

  return (
    <>
      <Navbar showLoginButton={false} />
      <main className="min-h-screen pt-[80px] flex items-center justify-center bg-[#fcf9f4] p-4">
        <div className="w-full max-w-md p-8 bg-white border border-[#debfbf] rounded-[0.5rem] shadow-sm">
          <div className="text-center mb-6">
            <span className="material-symbols-outlined text-5xl text-[#6b0218] mb-4">
              password
            </span>
            <h1 className="font-['Libre_Franklin'] text-[24px] font-bold text-[#6b0218] mb-2">
              Buat Password Baru
            </h1>
            <p className="font-['Public_Sans'] text-[14px] text-[#574141]">
              Silakan masukkan password baru untuk akun Anda.
            </p>
          </div>
          
          {successMsg ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-[0.25rem] text-green-800 font-['Public_Sans'] text-[14px] text-center">
              <span className="material-symbols-outlined text-4xl mb-2 text-green-600">check_circle</span>
              <p className="font-bold">{successMsg}</p>
              <p className="text-sm mt-1">Mengalihkan ke halaman login...</p>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-6">
              {error && (
                <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a] rounded-[0.25rem] text-[#93000a] font-['Public_Sans'] text-[14px]">
                  {error}
                </div>
              )}

              {/* Password Baru */}
              <div>
                <label className="block font-['Public_Sans'] text-[14px] font-bold mb-2 text-[#1c1c19]">
                  Password Baru
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8b7171]">
                    lock
                  </span>
                  <input
                    className="w-full pl-12 pr-12 py-3 bg-white border border-[#debfbf] rounded-[0.25rem] focus:ring-2 focus:ring-[#6b0218] focus:border-[#6b0218] outline-none transition-all font-['Public_Sans'] text-[16px]"
                    placeholder="Minimal 8 karakter"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b7171] hover:text-[#6b0218]"
                    disabled={loading}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password Baru */}
              <div>
                <label className="block font-['Public_Sans'] text-[14px] font-bold mb-2 text-[#1c1c19]">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8b7171]">
                    lock
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-white border border-[#debfbf] rounded-[0.25rem] focus:ring-2 focus:ring-[#6b0218] focus:border-[#6b0218] outline-none transition-all font-['Public_Sans'] text-[16px]"
                    placeholder="Ulangi password baru Anda"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6b0218] text-white py-4 rounded-[0.25rem] font-['Public_Sans'] text-[14px] font-semibold text-lg hover:bg-[#8b1e2c] transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
