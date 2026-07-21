'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function ResetPasswordPage() {
  return (
    <>
      <Navbar showLoginButton={false} />
      <main className="min-h-screen pt-[80px] flex items-center justify-center bg-[#fcf9f4]">
        <div className="w-full max-w-md p-8 bg-white border border-[#debfbf] rounded-[0.5rem] shadow-sm text-center">
          <span className="material-symbols-outlined text-5xl text-[#6b0218] mb-4">
            lock_reset
          </span>
          <h1 className="font-['Libre_Franklin'] text-[24px] font-bold text-[#6b0218] mb-4">
            Reset Password
          </h1>
          <p className="font-['Public_Sans'] text-[16px] text-[#574141] mb-8">
            Fitur reset password sedang dalam tahap pengembangan. Silakan hubungi admin atau kembali ke halaman login.
          </p>
          <Link
            href="/login"
            className="inline-block w-full bg-[#6b0218] text-white py-3 rounded-[0.25rem] font-semibold hover:bg-[#8b1e2c] transition-colors"
          >
            Kembali ke Login
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
