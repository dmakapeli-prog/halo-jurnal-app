'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function DaftarPage() {
  const getSupabase = () => createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [ktpFile, setKtpFile] = useState<File | null>(null)
  const [ktpPreviewName, setKtpPreviewName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)

  const handleFileChange = (file: File | null) => {
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB.')
        return
      }
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        setError('Format file harus JPG, PNG, atau PDF.')
        return
      }
      setKtpFile(file)
      setKtpPreviewName(file.name)
      setError('')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFileChange(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName) {
      setError('Masukkan nama lengkap Anda.')
      return
    }
    if (!email) {
      setError('Masukkan email Anda.')
      return
    }
    if (!password || password.length < 8) {
      setError('Password minimal 8 karakter.')
      return
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.')
      return
    }
    if (!ktpFile) {
      setError('Foto KTP wajib diunggah untuk verifikasi akun Anda.')
      return
    }
    if (!agreed) {
      setError('Anda harus menyetujui Syarat & Ketentuan.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const sb = getSupabase()

      // Step 1: Register using email and password
      const { error: signUpError } = await sb.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            phone: phone || null,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      // Step 2: Store registration data in localStorage temporarily
      // so we can complete profile setup after email confirmation
      const registrationData = {
        full_name: fullName,
        phone: phone || null,
        ktp_file_name: ktpFile.name,
        ktp_file_type: ktpFile.type,
      }
      localStorage.setItem('halo_jurnal_registration', JSON.stringify(registrationData))

      // Step 3: Store KTP file as base64 in localStorage temporarily
      // (will be uploaded to Supabase Storage after email confirmation)
      const reader = new FileReader()
      reader.onload = () => {
        localStorage.setItem('halo_jurnal_ktp_base64', reader.result as string)
      }
      reader.readAsDataURL(ktpFile)

      // Show success
      setRegistrationComplete(true)
      setSuccessMsg('Cek email Anda untuk konfirmasi akun.')
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    }
    setLoading(false)
  }

  // If registration is complete, show the "check email" confirmation
  if (registrationComplete) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen pt-[64px] md:pt-[80px] flex flex-col lg:flex-row">
          {/* Left Side: Branding — hidden on mobile */}
          <section className="hidden lg:flex relative w-1/2 min-h-[400px] bg-[#8b1e2c] overflow-hidden items-center justify-center p-12">
            <div className="relative z-10 text-center max-w-lg">
              <div className="mb-8 flex justify-center">
                <span className="material-symbols-outlined text-[#ff9da0] !text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  assured_workload
                </span>
              </div>
              <h1 className="font-['Libre_Franklin'] text-[48px] leading-[56px] tracking-[-0.02em] font-bold text-white mb-6 leading-tight">
                Membangun Kepercayaan Lewat Transparansi
              </h1>
              <p className="font-['Public_Sans'] text-[18px] leading-[28px] text-white/80">
                Portal resmi aspirasi dan pengaduan warga untuk mewujudkan tata kelola lingkungan yang akuntabel dan responsif.
              </p>
            </div>
          </section>

          {/* Right Side: Confirmation */}
          <section className="w-full lg:w-1/2 bg-[#fcf9f4] flex items-center justify-center p-6 sm:p-8 md:p-20">
            <div className="w-full max-w-md text-center">
              <div className="w-20 h-20 rounded-full bg-[#ffdad9] flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-[#6b0218] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  mark_email_read
                </span>
              </div>
              <h2 className="font-['Libre_Franklin'] text-[24px] sm:text-[32px] leading-[32px] sm:leading-[40px] font-bold text-[#6b0218] mb-4">
                Cek Email Anda
              </h2>
              <p className="font-['Public_Sans'] text-[14px] sm:text-[16px] leading-[22px] sm:leading-[24px] text-[#574141] mb-6">
                Kami telah mengirim link konfirmasi ke <strong className="text-[#1c1c19]">{email}</strong>.
                Klik link tersebut untuk menyelesaikan pendaftaran dan langsung masuk ke akun Anda.
              </p>
              <div className="bg-[#f6f3ee] border-l-4 border-[#ffe08e] p-4 text-left mb-8">
                <p className="font-['Public_Sans'] text-[13px] sm:text-[14px] text-[#574141]">
                  <strong>Tips:</strong> Jika tidak menemukan email, periksa folder <strong>Spam</strong> atau <strong>Promosi</strong>.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setRegistrationComplete(false); setSuccessMsg(''); setError('') }}
                  className="text-[#6b0218] font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold hover:underline"
                >
                  Kembali ke form pendaftaran
                </button>
                <Link href="/login" className="text-[#574141] font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold hover:underline">
                  Sudah punya akun? Masuk di sini
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen pt-[64px] md:pt-[80px] flex flex-col lg:flex-row">
        {/* Left Side: Branding/Illustration — hidden on mobile/tablet */}
        <section className="hidden lg:flex relative w-1/2 min-h-[400px] bg-[#8b1e2c] overflow-hidden items-center justify-center p-12">
          <div className="relative z-10 text-center max-w-lg">
            <div className="mb-8 flex justify-center">
              <span className="material-symbols-outlined text-[#ff9da0] !text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                assured_workload
              </span>
            </div>
            <h1 className="font-['Libre_Franklin'] text-[48px] leading-[56px] tracking-[-0.02em] font-bold text-white mb-6 leading-tight">
              Membangun Kepercayaan Lewat Transparansi
            </h1>
            <p className="font-['Public_Sans'] text-[18px] leading-[28px] text-white/80">
              Portal resmi aspirasi dan pengaduan warga untuk mewujudkan tata kelola lingkungan yang akuntabel dan responsif.
            </p>
            <div className="mt-12 grid grid-cols-3 gap-4">
              <div className="bg-white/10 p-4 rounded-[0.5rem] backdrop-blur-sm border border-white/20">
                <span className="block text-[#ffe08e] font-['Libre_Franklin'] text-[24px] leading-[32px] font-semibold mb-1">24/7</span>
                <span className="text-white/70 font-['Public_Sans'] text-[12px] leading-[16px] tracking-[0.04em] font-bold">Monitoring</span>
              </div>
              <div className="bg-white/10 p-4 rounded-[0.5rem] backdrop-blur-sm border border-white/20">
                <span className="block text-[#ffe08e] font-['Libre_Franklin'] text-[24px] leading-[32px] font-semibold mb-1">100%</span>
                <span className="text-white/70 font-['Public_Sans'] text-[12px] leading-[16px] tracking-[0.04em] font-bold">Privasi</span>
              </div>
              <div className="bg-white/10 p-4 rounded-[0.5rem] backdrop-blur-sm border border-white/20">
                <span className="block text-[#ffe08e] font-['Libre_Franklin'] text-[24px] leading-[32px] font-semibold mb-1">Realtime</span>
                <span className="text-white/70 font-['Public_Sans'] text-[12px] leading-[16px] tracking-[0.04em] font-bold">Update</span>
              </div>
            </div>
          </div>
          {/* Visual Texture Decoration */}
          <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10">
            <div
              className="w-full h-full bg-contain bg-no-repeat"
              style={{
                backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB6XJq9pV2g1YVNAIMnhfoTDWXMkWbe20Phq7Q_7BzcovN652KHHZKLbZ-F_3ME72WHEkadxC2VL_iixg7HUXI1er2q-iZ1E3Ha1OBoyHCuS2RWdeMFcvr41lcpUViT6k8F0p6Y61CDwqDyoap_QilO8e6CNsoeq3gdNm2KcCQZmY6Rb7pIi1fKkdCZ7GLX_9lkkZaE4Vqu2Ja6JZaqJqWHT_-N6kuqHQlEl1ZA3q-4797UNc6azrHVL6FkRegcB6Box43HqWru0xoj')",
              }}
            ></div>
          </div>
        </section>

        {/* Right Side: Registration Form */}
        <section className="w-full lg:w-1/2 bg-[#fcf9f4] flex items-start lg:items-center justify-center p-6 sm:p-8 md:p-12 lg:p-20 overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="mb-8 md:mb-10">
              <h2 className="font-['Libre_Franklin'] text-[24px] sm:text-[32px] leading-[32px] sm:leading-[40px] font-bold text-[#6b0218] mb-2">
                Daftar Akun Baru
              </h2>
              <p className="font-['Public_Sans'] text-[14px] sm:text-[16px] leading-[22px] sm:leading-[24px] text-[#574141]">
                Lengkapi data diri Anda untuk mulai berkontribusi.
              </p>
            </div>

            <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
              {/* Error/Success messages */}
              {error && (
                <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a] rounded-[0.25rem] text-[#93000a] font-['Public_Sans'] text-[14px]">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-[0.25rem] text-green-800 font-['Public_Sans'] text-[14px]">
                  {successMsg}
                </div>
              )}

              {/* Nama Lengkap */}
              <div>
                <label className="block font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-bold mb-2 text-[#1c1c19]">
                  Nama Lengkap
                </label>
                <input
                  className="w-full px-4 py-3 bg-white border border-[#debfbf] rounded-[0.25rem] focus:ring-2 focus:ring-[#6b0218] focus:border-[#6b0218] outline-none transition-all font-['Public_Sans'] text-[16px] leading-[24px]"
                  placeholder="Masukkan nama lengkap sesuai KTP"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-bold mb-2 text-[#1c1c19]">
                  Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8b7171]">
                    mail
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-white border border-[#debfbf] rounded-[0.25rem] focus:ring-2 focus:ring-[#6b0218] focus:border-[#6b0218] outline-none transition-all font-['Public_Sans'] text-[16px] leading-[24px]"
                    placeholder="Masukkan email aktif"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-bold mb-2 text-[#1c1c19]">
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8b7171]">
                    lock
                  </span>
                  <input
                    className="w-full pl-12 pr-12 py-3 bg-white border border-[#debfbf] rounded-[0.25rem] focus:ring-2 focus:ring-[#6b0218] focus:border-[#6b0218] outline-none transition-all font-['Public_Sans'] text-[16px] leading-[24px]"
                    placeholder="Minimal 8 karakter"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b7171] hover:text-[#6b0218]"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password */}
              <div>
                <label className="block font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-bold mb-2 text-[#1c1c19]">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#8b7171]">
                    lock
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-3 bg-white border border-[#debfbf] rounded-[0.25rem] focus:ring-2 focus:ring-[#6b0218] focus:border-[#6b0218] outline-none transition-all font-['Public_Sans'] text-[16px] leading-[24px]"
                    placeholder="Ulangi password Anda"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Phone field (contact only, not for auth) */}
              <div>
                <label className="block font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-bold mb-2 text-[#1c1c19]">
                  Nomor Telepon (opsional)
                </label>
                <input
                  className="w-full px-4 py-3 bg-white border border-[#debfbf] rounded-[0.25rem] focus:ring-2 focus:ring-[#6b0218] focus:border-[#6b0218] outline-none transition-all font-['Public_Sans'] text-[16px] leading-[24px]"
                  placeholder="e.g. 08123456789"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* KTP Upload */}
              <div
                className={`p-5 sm:p-6 bg-[#f0ede9] border border-[#debfbf] border-dashed rounded-[0.5rem] text-center ${dragOver ? 'bg-[#6b0218]/5' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <label className="block font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-bold mb-3 sm:mb-4 text-[#1c1c19]">
                  Unggah Foto KTP <span className="text-red-500">* (Wajib)</span>
                </label>
                <div
                  className="flex flex-col items-center gap-3 sm:gap-4 cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#6b0218]/10 flex items-center justify-center group-hover:bg-[#6b0218]/20 transition-colors">
                    <span className="material-symbols-outlined text-[#6b0218] text-2xl sm:text-3xl">upload_file</span>
                  </div>
                  <div className="text-[#574141]">
                    {ktpPreviewName ? (
                      <p className="font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-bold text-[#6b0218] break-all">
                        {ktpPreviewName}
                      </p>
                    ) : (
                      <>
                        <p className="font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-bold text-[#6b0218]">
                          Klik untuk memilih file
                        </p>
                        <p className="text-[10px] uppercase tracking-wider mt-1 font-['Public_Sans']">
                          Format: JPG, PNG, PDF (Max 5MB)
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    className="hidden"
                    id="ktp-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              {/* Privacy Notice Box */}
              <div className="bg-[#f6f3ee] border-l-4 border-[#ffe08e] p-3 sm:p-4 flex gap-3">
                <span className="material-symbols-outlined text-[#755b00] text-lg shrink-0">verified_user</span>
                <p className="font-['Public_Sans'] text-[11px] sm:text-[12px] leading-[16px] tracking-[0.04em] font-bold text-[#574141] italic leading-relaxed">
                  Data KTP Anda hanya digunakan untuk verifikasi internal oleh petugas dan tidak akan pernah dipublikasikan atau dibagikan kepada pihak lain.
                </p>
              </div>

              {/* Agreement */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  className="mt-1 w-4 h-4 rounded text-[#6b0218] focus:ring-[#6b0218] border-[#8b7171] shrink-0"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span className="font-['Public_Sans'] text-[12px] leading-[16px] tracking-[0.04em] font-bold text-[#574141] leading-snug">
                  Saya menyetujui{' '}
                  <Link className="text-[#6b0218] font-bold hover:underline" href="/syarat-ketentuan">Syarat &amp; Ketentuan</Link>
                  {' '}serta{' '}
                  <Link className="text-[#6b0218] font-bold hover:underline" href="/kebijakan-privasi">Kebijakan Privasi</Link>
                  {' '}yang berlaku.
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#fed255] text-[#735a00] py-4 rounded-[0.5rem] font-['Libre_Franklin'] text-[18px] sm:text-[24px] leading-[28px] sm:leading-[32px] font-semibold shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 min-h-[52px]"
              >
                {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>

              <p className="text-center font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold text-[#574141]">
                Sudah punya akun?{' '}
                <Link href="/login" className="text-[#6b0218] font-bold hover:underline">
                  Masuk di sini
                </Link>
              </p>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </>
  )
}
