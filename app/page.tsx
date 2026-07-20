import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[80px]">
        {/* Hero Section */}
        <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[#6b0218]/40 mix-blend-multiply z-10"></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="w-full h-full object-cover"
              alt="A grand architectural view of a modern government building with clean lines and large glass facades, captured during a golden hour sunset."
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBP1CNHWZGy7QLWsmshV7RosCgpACf3cjk1Z9XdfMJWMwCky6Z3PWCUDmw3Uw7qyT9CEoZgyiPOa3YdpyIl2jWtVeP0XDxcHK4qDHNpmZb9zgAaskVNKzzcuLur63mI4FfABgRY0JIk3y29DO7gcmIy3znNZGkgGVpwRxkWyq0mV0iMBwXBgvcTwacyygcNnw_pvDuzvmTqmNKufLzNOuok7LQcLrlxKOtlihXG6BnAx2apKgMo2CTIrbI6V0jTQUE05fLLRho3s9hF"
            />
          </div>
          <div className="relative z-20 text-center px-4 max-w-[56rem]">
            <h2 className="font-['Libre_Franklin'] text-3xl md:text-[48px] md:leading-[56px] tracking-[-0.02em] font-bold text-white mb-4 drop-shadow-lg">
              Suara Anda, Wadah Kami
            </h2>
            <p className="font-['Public_Sans'] text-[18px] leading-[28px] text-white/90 mb-12 drop-shadow-md">
              Sampaikan aspirasi dan laporan pengaduan Anda secara langsung kepada instansi pemerintah yang berwenang.
            </p>
            {/* Search Bar */}
            <div className="max-w-[42rem] mx-auto relative group flex flex-col sm:block gap-2">
              <div className="absolute inset-y-0 left-4 hidden sm:flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#8b7171]">search</span>
              </div>
              <input
                className="w-full pl-4 sm:pl-12 sm:pr-32 py-4 sm:py-5 rounded-[0.5rem] border-none shadow-xl focus:ring-2 focus:ring-[#6b0218] text-[16px] leading-[24px] font-['Public_Sans'] placeholder:text-[#574141]/60"
                placeholder="Cari laporan publik..."
                type="text"
              />
              <button className="sm:absolute sm:right-2 sm:top-2 sm:bottom-2 bg-[#6b0218] text-white px-6 py-3 sm:py-0 rounded-[0.25rem] font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold hover:bg-[#8b1e2c] transition-all w-full sm:w-auto mt-2 sm:mt-0">
                Cari Laporan
              </button>
            </div>
          </div>
        </section>

        {/* Category Cards */}
        <section className="max-w-[1280px] mx-auto px-4 md:px-[40px] -mt-16 md:-mt-24 relative z-30 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
            {/* Card 1: Pengaduan */}
            <div className="bg-white border border-[#debfbf] p-8 rounded-[0.5rem] shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer">
              <div className="w-14 h-14 rounded-[0.75rem] bg-[#ffdad9] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[#6b0218] text-3xl fill-icon">report</span>
              </div>
              <h3 className="font-['Libre_Franklin'] text-[24px] leading-[32px] font-semibold mb-2">Pengaduan</h3>
              <p className="text-[#574141] mb-6 font-['Public_Sans'] text-[16px] leading-[24px]">
                Laporkan masalah pelayanan publik, infrastruktur rusak, atau pelanggaran peraturan daerah.
              </p>
              <span className="text-[#6b0218] font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold flex items-center gap-2">
                Buat Laporan <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </div>
            {/* Card 2: Aspirasi */}
            <div className="bg-white border border-[#debfbf] p-8 rounded-[0.5rem] shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer">
              <div className="w-14 h-14 rounded-[0.75rem] bg-[#ffe08e] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[#755b00] text-3xl fill-icon">lightbulb</span>
              </div>
              <h3 className="font-['Libre_Franklin'] text-[24px] leading-[32px] font-semibold mb-2">Aspirasi</h3>
              <p className="text-[#574141] mb-6 font-['Public_Sans'] text-[16px] leading-[24px]">
                Sampaikan ide, saran, atau harapan Anda untuk pembangunan kota dan kemajuan bersama.
              </p>
              <span className="text-[#755b00] font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold flex items-center gap-2">
                Kirim Aspirasi <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </div>
            {/* Card 3: Informasi */}
            <div className="bg-white border border-[#debfbf] p-8 rounded-[0.5rem] shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer">
              <div className="w-14 h-14 rounded-[0.75rem] bg-[#dde4e6] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[#2d3436] text-3xl fill-icon">info</span>
              </div>
              <h3 className="font-['Libre_Franklin'] text-[24px] leading-[32px] font-semibold mb-2">Informasi</h3>
              <p className="text-[#574141] mb-6 font-['Public_Sans'] text-[16px] leading-[24px]">
                Ajukan permohonan informasi publik terkait kebijakan atau data pemerintah daerah.
              </p>
              <span className="text-[#2d3436] font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold flex items-center gap-2">
                Minta Informasi <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </span>
            </div>
          </div>
        </section>

        {/* Recent Reports Grid */}
        <section className="bg-[#f6f3ee] py-20 px-4 md:px-[40px]">
          <div className="max-w-[1280px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
              <div>
                <h2 className="font-['Libre_Franklin'] text-2xl md:text-[32px] md:leading-[40px] font-bold text-[#1c1c19] mb-2">
                  Laporan Publik Terkini
                </h2>
                <p className="text-[#574141] font-['Public_Sans'] text-[16px] leading-[24px]">
                  Transparansi dalam penanganan pengaduan masyarakat secara real-time.
                </p>
              </div>
              <button className="border border-[#6b0218] text-[#6b0218] px-6 py-2 rounded-[0.25rem] font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold hover:bg-[#6b0218] hover:text-white transition-all">
                Lihat semua laporan publik
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
              {/* Report Item 1 */}
              <div className="bg-white border border-[#debfbf] rounded-[0.5rem] overflow-hidden hover:shadow-md transition-shadow group">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 rounded-[0.75rem] bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider">
                      Selesai
                    </span>
                    <span className="font-['Public_Sans'] text-[12px] leading-[16px] tracking-[0.04em] font-bold text-[#574141] flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">calendar_today</span> 2 Jam Lalu
                    </span>
                  </div>
                  <h4 className="font-['Libre_Franklin'] text-[18px] font-semibold mb-3 line-clamp-2">
                    Perbaikan Lampu Jalan di Area Pemukiman RW 04
                  </h4>
                  <p className="font-['Public_Sans'] text-[16px] leading-[24px] text-[#574141] mb-4 line-clamp-3">
                    Lampu jalan sudah mati selama 3 hari berturut-turut, membuat warga khawatir akan keamanan saat malam hari...
                  </p>
                  <div className="flex items-center gap-2 font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold text-[#6b0218]">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    Kec. Menteng, Jakarta Pusat
                  </div>
                </div>
                <div className="h-48 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt="A newly installed modern LED street light at dusk"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWTm_BJDDTdYzd8zJghk2v_R537oI2Gk-P_9PHFRxe10UZTYONJmIwnCLjFQfY9I8kgOcYbMsIa1yMRPt9BEL9zZ8YO60MIQmq05cqCE4mb2TqyxdYAV0CoAq4mCyV1NViHQmNBB-bT9tSFxIxip41sqzJoVDx9-Szwkorglxx1IKdsL0VDw11QtyUvCEjexVMGx55s2xyzjhLMgMv3uRCz_z8iqhJOJ0-WdO9xgxOsS3QXl9LGeLeZNCDLUDy1PNuvi0B-P3Ms1PV"
                  />
                </div>
              </div>
              {/* Report Item 2 */}
              <div className="bg-white border border-[#debfbf] rounded-[0.5rem] overflow-hidden hover:shadow-md transition-shadow group">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 rounded-[0.75rem] bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase tracking-wider">
                      Diproses
                    </span>
                    <span className="font-['Public_Sans'] text-[12px] leading-[16px] tracking-[0.04em] font-bold text-[#574141] flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">calendar_today</span> 5 Jam Lalu
                    </span>
                  </div>
                  <h4 className="font-['Libre_Franklin'] text-[18px] font-semibold mb-3 line-clamp-2">
                    Tumpukan Sampah Liar di Pinggir Sungai
                  </h4>
                  <p className="font-['Public_Sans'] text-[16px] leading-[24px] text-[#574141] mb-4 line-clamp-3">
                    Warga melaporkan adanya tumpukan sampah yang cukup banyak di bantaran sungai, dikhawatirkan menyumbat aliran air...
                  </p>
                  <div className="flex items-center gap-2 font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold text-[#6b0218]">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    Kec. Gambir, Jakarta Pusat
                  </div>
                </div>
                <div className="h-48 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt="A riverbank cleanup operation in progress"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB12R_Up3klO6i3RVNK6BesMlHBVYiAEZ0VEk4yVucvGuqiCbYZ2m8f1WB2fMpLEzHO6tHMHkBg5fVV2hmmkLJwas84OvBJ2xTBCEpPECSwhLHB4pf-Z04PPinyyHmidt8v0o6uRcSbA0h8QBU0VU6AIT4SZq8l_eKpx-yYFQ9vnMva7_qB9H9jx8ZXSLzbuGr09pLned6s-TZbcNInhTLvKlIaFuYh3wjZ95mm8JVVuQMYT6PrAFRprRM3aBmi0U4V7GwS5Q0V_qA7"
                  />
                </div>
              </div>
              {/* Report Item 3 */}
              <div className="bg-white border border-[#debfbf] rounded-[0.5rem] overflow-hidden hover:shadow-md transition-shadow group">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 rounded-[0.75rem] bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
                      Terverifikasi
                    </span>
                    <span className="font-['Public_Sans'] text-[12px] leading-[16px] tracking-[0.04em] font-bold text-[#574141] flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">calendar_today</span> 8 Jam Lalu
                    </span>
                  </div>
                  <h4 className="font-['Libre_Franklin'] text-[18px] font-semibold mb-3 line-clamp-2">
                    Lubang Jalan di Persimpangan Utama
                  </h4>
                  <p className="font-['Public_Sans'] text-[16px] leading-[24px] text-[#574141] mb-4 line-clamp-3">
                    Terdapat lubang yang cukup dalam di tengah jalan raya yang membahayakan pengendara roda dua terutama saat hujan...
                  </p>
                  <div className="flex items-center gap-2 font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold text-[#6b0218]">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    Kec. Setiabudi, Jakarta Selatan
                  </div>
                </div>
                <div className="h-48 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt="An urban street with repair markings"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8dP76q7oKjW75NmX0e7y5a-z3yHMAoqksaGqdXqSyiaacHvn4lyl1oLjWpmGM6Ump05brqDZgivItrV7lTYxN-m-PECYH5w5ykjswbFvWTk6_ib1mF9VKii8A_DzTSEuO9mpNF3msGFIvGTBdx_2BukjwcUj8qWpBsQ38JwuCbU90Gmrlckufj-6RDkWkMg9Fup3m0ySpeF-c75azr0XDec7p-SHkIA41dHhyRE-oW325qTMZ69XoK2709LaZxDoaPc5JBeBoSrg4"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-[#6b0218] text-white">
          <div className="max-w-[1280px] mx-auto px-[40px] grid grid-cols-2 md:grid-cols-4 gap-[24px] text-center">
            <div>
              <span className="block font-['Libre_Franklin'] text-4xl md:text-5xl font-bold mb-2">12.842</span>
              <span className="font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold opacity-80 uppercase tracking-widest">
                Laporan Masuk
              </span>
            </div>
            <div>
              <span className="block font-['Libre_Franklin'] text-4xl md:text-5xl font-bold mb-2">9.431</span>
              <span className="font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold opacity-80 uppercase tracking-widest">
                Tuntas Ditangani
              </span>
            </div>
            <div>
              <span className="block font-['Libre_Franklin'] text-4xl md:text-5xl font-bold mb-2">2.105</span>
              <span className="font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold opacity-80 uppercase tracking-widest">
                Sedang Diproses
              </span>
            </div>
            <div>
              <span className="block font-['Libre_Franklin'] text-4xl md:text-5xl font-bold mb-2">100%</span>
              <span className="font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold opacity-80 uppercase tracking-widest">
                Transparansi
              </span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
