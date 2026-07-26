'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface CategoryCardsProps {
  isLoggedIn?: boolean
}

export default function CategoryCards({ isLoggedIn: initialIsLoggedIn }: CategoryCardsProps) {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(initialIsLoggedIn ?? null)

  useEffect(() => {
    if (initialIsLoggedIn !== undefined) return

    const checkUser = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      setIsLoggedIn(!!data?.user)
    }
    checkUser()
  }, [initialIsLoggedIn])

  const handleCategoryClick = (type: 'pengaduan' | 'aspirasi' | 'informasi', e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isLoggedIn !== true) {
      alert('Silakan login terlebih dahulu untuk membuat laporan.')
      return
    }

    router.push(`/lapor?type=${type}`)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-[24px]">
      {/* Card 1: Pengaduan */}
      <div
        onClick={(e) => handleCategoryClick('pengaduan', e)}
        className="bg-white border border-[#debfbf] p-6 md:p-8 rounded-[0.5rem] shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer block select-none"
      >
        <div className="w-12 md:w-14 h-12 md:h-14 rounded-[0.75rem] bg-[#ffdad9] flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-[#6b0218] text-2xl md:text-3xl fill-icon">report</span>
        </div>
        <h3 className="font-['Libre_Franklin'] text-[20px] md:text-[24px] leading-[28px] md:leading-[32px] font-semibold mb-2">Pengaduan</h3>
        <p className="text-[#574141] mb-4 md:mb-6 font-['Public_Sans'] text-[14px] md:text-[16px] leading-[22px] md:leading-[24px]">
          Laporkan masalah pelayanan publik, infrastruktur rusak, atau pelanggaran peraturan daerah.
        </p>
        <span className="text-[#6b0218] font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold flex items-center gap-2">
          Buat Laporan <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </span>
      </div>

      {/* Card 2: Aspirasi */}
      <div
        onClick={(e) => handleCategoryClick('aspirasi', e)}
        className="bg-white border border-[#debfbf] p-6 md:p-8 rounded-[0.5rem] shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer block select-none"
      >
        <div className="w-12 md:w-14 h-12 md:h-14 rounded-[0.75rem] bg-[#ffe08e] flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-[#755b00] text-2xl md:text-3xl fill-icon">lightbulb</span>
        </div>
        <h3 className="font-['Libre_Franklin'] text-[20px] md:text-[24px] leading-[28px] md:leading-[32px] font-semibold mb-2">Aspirasi</h3>
        <p className="text-[#574141] mb-4 md:mb-6 font-['Public_Sans'] text-[14px] md:text-[16px] leading-[22px] md:leading-[24px]">
          Sampaikan ide, saran, atau harapan Anda untuk pembangunan kota dan kemajuan bersama.
        </p>
        <span className="text-[#755b00] font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold flex items-center gap-2">
          Kirim Aspirasi <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </span>
      </div>

      {/* Card 3: Informasi */}
      <div
        onClick={(e) => handleCategoryClick('informasi', e)}
        className="bg-white border border-[#debfbf] p-6 md:p-8 rounded-[0.5rem] shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer block select-none"
      >
        <div className="w-12 md:w-14 h-12 md:h-14 rounded-[0.75rem] bg-[#dde4e6] flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-[#2d3436] text-2xl md:text-3xl fill-icon">info</span>
        </div>
        <h3 className="font-['Libre_Franklin'] text-[20px] md:text-[24px] leading-[28px] md:leading-[32px] font-semibold mb-2">Informasi</h3>
        <p className="text-[#574141] mb-4 md:mb-6 font-['Public_Sans'] text-[14px] md:text-[16px] leading-[22px] md:leading-[24px]">
          Ajukan permohonan informasi publik terkait kebijakan atau data pemerintah daerah.
        </p>
        <span className="text-[#2d3436] font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold flex items-center gap-2">
          Minta Informasi <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </span>
      </div>
    </div>
  )
}
