'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function HubungiKamiPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call for form submission
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setName('')
      setEmail('')
      setMessage('')
    }, 1500)
  }

  return (
    <div className="font-['Public_Sans'] bg-[#fcf9f4] text-[#1c1c19] min-h-screen flex flex-col">
      <Navbar showLoginButton={true} />

      <main className="flex-grow pt-24 md:pt-32 pb-16 md:pb-20 px-5 md:px-[40px] max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="font-['Libre_Franklin'] text-[32px] md:text-[48px] font-bold text-[#6b0218] leading-tight mb-4">
            Hubungi Kami
          </h1>
          <p className="text-[#574141] text-[16px] md:text-[18px] leading-[24px] max-w-2xl mx-auto">
            Punya pertanyaan, kendala teknis, atau saran seputar penggunaan platform Halo Jurnal? Tim dukungan kami siap membantu Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-start">
          
          {/* Contact Information */}
          <section className="bg-[#6b0218] text-white rounded-xl p-6 md:p-8 shadow-md">
            <h2 className="font-['Libre_Franklin'] text-[24px] font-bold mb-6">Informasi Kontak</h2>
            <p className="text-white/80 mb-8 leading-relaxed text-sm">
              Formulir dan kontak di halaman ini dikhususkan untuk <strong>dukungan teknis dan pertanyaan seputar operasional aplikasi Halo Jurnal</strong>. Untuk keperluan redaksi berita, silakan kunjungi website utama Jurnal Sukabumi.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-[#ffe08e] text-2xl">mail</span>
                <div>
                  <p className="font-bold mb-1">Email Dukungan</p>
                  <p className="text-white/80 text-sm">support@halojurnal.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-[#ffe08e] text-2xl">call</span>
                <div>
                  <p className="font-bold mb-1">Nomor Kontak (WhatsApp)</p>
                  <p className="text-white/80 text-sm">+62 812-3456-7890</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-[#ffe08e] text-2xl">location_on</span>
                <div>
                  <p className="font-bold mb-1">Kantor Jurnal Sukabumi</p>
                  <p className="text-white/80 text-sm leading-relaxed">
                    Jl. Contoh Alamat No. 123,<br/>
                    Sukabumi, Jawa Barat,<br/>
                    Indonesia
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-white/20">
              <p className="text-sm text-white/70">
                Halo Jurnal adalah inisiatif dari{' '}
                <a href="https://jurnalsukabumi.com" target="_blank" rel="noreferrer" className="text-[#ffe08e] hover:underline font-bold">
                  PT. Media Jurnal Sukabumi
                </a>
              </p>
            </div>
          </section>

          {/* Contact Form */}
          <section className="bg-white border border-[#debfbf] rounded-xl p-6 md:p-8 shadow-sm">
            <h2 className="font-['Libre_Franklin'] text-[24px] font-bold text-[#1c1c19] mb-6">Kirim Pesan</h2>
            
            {success ? (
              <div className="bg-[#e7f5ed] border border-[#b7e4c7] rounded-lg p-6 text-center">
                <div className="w-16 h-16 bg-[#b7e4c7] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[#1a7f47] text-3xl">check</span>
                </div>
                <h3 className="text-[#1a7f47] font-bold text-lg mb-2">Pesan Terkirim!</h3>
                <p className="text-[#574141] text-sm">Terima kasih telah menghubungi kami. Tim dukungan Halo Jurnal akan membalas pesan Anda sesegera mungkin.</p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="mt-6 text-[#6b0218] font-bold text-sm hover:underline"
                >
                  Kirim pesan lainnya
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[14px] font-bold mb-2 text-[#1c1c19]">Nama Lengkap</label>
                  <input 
                    required
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Anda"
                    className="w-full bg-[#fcf9f4] border-[1.5px] border-[#debfbf] rounded-lg p-3 font-['Public_Sans'] focus:ring-2 focus:ring-[#ffdad9] focus:border-[#6b0218] outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-bold mb-2 text-[#1c1c19]">Alamat Email</label>
                  <input 
                    required
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Alamat email aktif"
                    className="w-full bg-[#fcf9f4] border-[1.5px] border-[#debfbf] rounded-lg p-3 font-['Public_Sans'] focus:ring-2 focus:ring-[#ffdad9] focus:border-[#6b0218] outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-bold mb-2 text-[#1c1c19]">Pesan atau Kendala</label>
                  <textarea 
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Jelaskan pertanyaan atau kendala yang Anda alami..."
                    rows={5}
                    className="w-full bg-[#fcf9f4] border-[1.5px] border-[#debfbf] rounded-lg p-3 font-['Public_Sans'] focus:ring-2 focus:ring-[#ffdad9] focus:border-[#6b0218] outline-none transition-all text-sm resize-none"
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#6b0218] text-white py-3.5 rounded-lg font-bold text-sm hover:bg-[#8b1e2c] transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2 min-h-[48px]"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                      Mengirim...
                    </>
                  ) : (
                    <>
                      Kirim Pesan
                      <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
