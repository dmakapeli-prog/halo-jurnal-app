'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

// TODO: [OTP_MODE] Set to true when custom SMTP (e.g. Resend) is configured
// to switch from magic link to 6-digit OTP code flow
const USE_OTP_CODE = false

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const getSupabase = () => createClient()

  const [email, setEmail] = useState('')
  const [linkSent, setLinkSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(searchParams.get('error') === 'auth' ? 'Terjadi kesalahan saat verifikasi. Silakan coba lagi.' : '')
  const [successMsg, setSuccessMsg] = useState('')

  // --- OTP CODE STATE (hidden for now, will be re-enabled with custom SMTP) ---
  // const [otp, setOtp] = useState('')
  // const [otpSent, setOtpSent] = useState(false)

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError('Masukkan email Anda terlebih dahulu.')
      return
    }
    setLoading(true)
    setError('')
    setSuccessMsg('')

    const { error: otpError } = await getSupabase().auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (otpError) {
      setError(otpError.message === 'Signups not allowed for otp'
        ? 'Akun tidak ditemukan. Silakan daftar terlebih dahulu.'
        : otpError.message)
    } else {
      setLinkSent(true)
      setSuccessMsg('Link login telah dikirim ke email Anda. Silakan cek inbox (dan folder spam) lalu klik link tersebut untuk masuk.')
    }
    setLoading(false)
  }

  // --- OTP CODE VERIFY HANDLER (hidden for now, will be re-enabled with custom SMTP) ---
  // const handleVerifyOtp = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   if (!otp) {
  //     setError('Masukkan kode OTP.')
  //     return
  //   }
  //   setLoading(true)
  //   setError('')
  //
  //   const { error: verifyError } = await getSupabase().auth.verifyOtp({
  //     email,
  //     token: otp,
  //     type: 'email',
  //   })
  //
  //   if (verifyError) {
  //     setError(verifyError.message)
  //   } else {
  //     router.push('/beranda')
  //     router.refresh()
  //   }
  //   setLoading(false)
  // }

  return (
    <>
      {/* TopNavBar */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-[40px] h-[80px] bg-[#6b0218] shadow-md">
        <div className="flex items-center gap-8">
          <Link href="/">
            <span className="font-['Libre_Franklin'] text-[32px] leading-[40px] font-bold text-white">Halo Jurnal</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold text-white/80 hover:text-[#ffe08e] transition-colors">Beranda</Link>
            <Link href="#" className="font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold text-white/80 hover:text-[#ffe08e] transition-colors">Feed Publik</Link>
            <Link href="#" className="font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold text-white/80 hover:text-[#ffe08e] transition-colors">Lapor</Link>
            <Link href="#" className="font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold text-white/80 hover:text-[#ffe08e] transition-colors">Laporan Saya</Link>
            <Link href="#" className="font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold text-white/80 hover:text-[#ffe08e] transition-colors">Tentang</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold text-white border border-white/30 px-6 py-2 rounded-[0.25rem] hover:bg-white/10 transition-all">
            Login
          </button>
        </div>
      </nav>

      {/* Main Content: Split Screen Layout */}
      <main className="min-h-screen flex pt-[80px]">
        {/* Left Side: Branding/Illustration (Sticky) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-[#8b1e2c] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div
              className="w-full h-full bg-cover bg-center opacity-40 mix-blend-overlay"
              style={{
                backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCIYq5haBfbaEBOxtURRJ3ZvdALKSRDU7blMYR9t6tdrMx2rv4sNeh9sW1wTZrFSovfipp8whDu7PjF41rSbaiXGZtKMgDgAtJg-PnFs9Mz6Oib4KItBpQ_XH8DkCtuIxK_zinGd6CVRAZyJtyLUDFJWvH2MnIpEGk6utDrmAwPeIxNOkteNwYxfdLfyEWGVsym6s1SEG0bpjWsM9bGzrBknVzaLz-NGjK2e2ETYS6mQwJ_PNrNh8MSY6p7EJqiIE6bGOmDelZPSsse')",
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
                  Setiap jurnal aspirasi dipantau oleh instansi terkait secara real-time.
                </p>
              </div>
            </div>
          </div>
          {/* Footer-like element in Brand Side */}
          <div className="absolute bottom-10 left-20 z-10 flex gap-6">
            <span className="text-white/60 font-['Public_Sans'] text-[12px] leading-[16px] tracking-[0.04em] font-bold">
              © 2024 Halo Jurnal. Portal Aspirasi Masyarakat.
            </span>
          </div>
        </div>

        {/* Right Side: Interaction Forms */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20 bg-[#fcf9f4]">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-10 text-center lg:text-left">
              <h2 className="font-['Libre_Franklin'] text-[32px] leading-[40px] font-bold text-[#6b0218] mb-2">
                Selamat Datang Kembali
              </h2>
              <p className="font-['Public_Sans'] text-[16px] leading-[24px] text-[#574141]">
                Masuk untuk melihat status laporan Anda.
              </p>
            </div>

            {/* Login Form */}
            <form className="space-y-6" onSubmit={handleSendMagicLink}>
              {/* Error/Success messages */}
              {error && (
                <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a] rounded-[0.25rem] text-[#93000a] font-['Public_Sans'] text-[14px]">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-[0.25rem] text-green-800 font-['Public_Sans'] text-[14px]">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-600 text-xl mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
                    <div>
                      <p className="font-semibold mb-1">Link Login Terkirim!</p>
                      <p>{successMsg}</p>
                    </div>
                  </div>
                </div>
              )}

              {!linkSent ? (
                <>
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

                  {/* --- OTP CODE INPUT (hidden for now, will be re-enabled with custom SMTP) --- */}
                  {/* {USE_OTP_CODE && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold block text-[#574141]">
                          Kode OTP
                        </label>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={loading}
                          className="text-[#6b0218] font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold hover:underline disabled:opacity-50"
                        >
                          {loading && !otpSent ? 'Mengirim...' : 'Kirim Kode'}
                        </button>
                      </div>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#574141]/50">
                          lock
                        </span>
                        <input
                          className="w-full pl-10 pr-4 py-3 bg-white border-[1.5px] border-[#debfbf] rounded-[0.25rem] focus:ring-2 focus:ring-[#6b0218] focus:border-[#6b0218] transition-all font-['Public_Sans'] text-[16px] leading-[24px]"
                          placeholder="6 Digit Kode"
                          type="text"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                        />
                      </div>
                      <p className="text-[12px] text-[#574141]/60 mt-1 italic font-['Public_Sans']">
                        Kode OTP akan dikirimkan ke media yang Anda pilih.
                      </p>
                    </div>
                  )} */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#6b0218] text-white py-4 rounded-[0.25rem] font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold text-lg hover:bg-[#8b1e2c] transition-all shadow-sm active:scale-95 duration-100 disabled:opacity-50"
                  >
                    {loading ? 'Mengirim link...' : 'Masuk Sekarang'}
                  </button>
                </>
              ) : (
                /* Post-submit state: show check email instruction */
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#ffdad9] flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-[#6b0218] text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      forward_to_inbox
                    </span>
                  </div>
                  <p className="font-['Public_Sans'] text-[16px] leading-[24px] text-[#574141]">
                    Kami telah mengirim link login ke <strong className="text-[#1c1c19]">{email}</strong>. Buka email Anda dan klik link tersebut untuk langsung masuk.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setLinkSent(false); setSuccessMsg(''); setError('') }}
                    className="text-[#6b0218] font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold hover:underline"
                  >
                    Gunakan email lain
                  </button>
                </div>
              )}

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#debfbf]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-[#fcf9f4] px-2 text-[#574141] font-['Public_Sans']">Atau masuk dengan</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 bg-white border border-[#debfbf] py-3 rounded-[0.25rem] hover:bg-[#f6f3ee] transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Google Logo"
                  className="w-5 h-5"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKt2z6a7zZLulZ8ixbqvAX3OnmuHnGAerS6FpYfLRl8gSrP64IpXsPOUaT083moGWOY8J50kR-YqQoie6xRDFsdUu1r-NIuJEROiu1Mmjlnx8TNOh-oUFZf0Xs8ZrTV5ByV6swc7o1X57kky7Y6-BApxNJ3YrHuWiAgwHtcwMiZt_-ZW-d-7HMAqKCrDmLL9mIPK4Ba6sm0SxGKvDERYvEOCWr5dlZQGW6IHb8cs_kzoLYAvn1VhX02lpDPmFwQ0Nn2npNJ_9c88NI"
                />
                <span className="font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold text-[#1c1c19]">
                  Lanjutkan dengan Google
                </span>
              </button>
            </form>

            <p className="mt-8 text-center text-[#574141] font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold">
              Belum punya akun?{' '}
              <Link href="/daftar" className="text-[#6b0218] font-bold hover:underline">
                Daftar Akun Baru
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-[40px] flex flex-col items-center gap-4 bg-[#e5e2dd] border-t border-[#debfbf]">
        <span className="font-['Libre_Franklin'] text-[24px] leading-[32px] font-semibold text-[#6b0218]">Halo Jurnal</span>
        <div className="flex flex-wrap justify-center gap-8">
          <Link href="#" className="text-[#574141] hover:text-[#6b0218] transition-colors font-['Public_Sans'] text-[12px] leading-[16px] tracking-[0.04em] font-bold">Kebijakan Privasi</Link>
          <Link href="#" className="text-[#574141] hover:text-[#6b0218] transition-colors font-['Public_Sans'] text-[12px] leading-[16px] tracking-[0.04em] font-bold">Syarat &amp; Ketentuan</Link>
          <Link href="#" className="text-[#574141] hover:text-[#6b0218] transition-colors font-['Public_Sans'] text-[12px] leading-[16px] tracking-[0.04em] font-bold">Hubungi Kami</Link>
        </div>
        <p className="text-[#574141] font-['Public_Sans'] text-sm mt-4 opacity-75">© 2024 Halo Jurnal. Portal Aspirasi Masyarakat.</p>
      </footer>
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
