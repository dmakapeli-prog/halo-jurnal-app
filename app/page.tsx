import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const supabase = await createClient()

  // Fetch recent public reports
  const { data: recentReports } = await supabase
    .from('laporan')
    .select('*, laporan_lampiran(file_url)')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(3)

  const { count: totalLaporan } = await supabase
    .from('laporan')
    .select('*', { count: 'exact', head: true })

  const { count: tuntasLaporan } = await supabase
    .from('laporan')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'selesai')

  const { count: prosesLaporan } = await supabase
    .from('laporan')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'diproses')

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
            <form action="/feed-publik" method="GET" className="bg-white rounded-lg md:rounded-lg shadow-xl flex items-center p-2 w-full max-w-2xl mx-auto mt-8 border border-gray-300 relative z-30">
              <span className="material-symbols-outlined text-gray-400 ml-3">search</span>
              <input
                name="search"
                className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-gray-700 placeholder-gray-400 font-['Public_Sans'] focus:ring-0"
                placeholder="Cari laporan publik berdasarkan kata kunci atau lokasi..."
                type="text"
              />
              <button type="submit" className="bg-[#6b0218] text-white px-6 py-3 rounded-md font-semibold hover:bg-[#8b1e2c] transition-all whitespace-nowrap">
                Cari Laporan
              </button>
            </form>
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
              <Link href="/feed-publik" className="w-full md:w-auto text-center border-[1.5px] border-[#6b0218] text-[#6b0218] px-6 py-2 rounded-[0.25rem] font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold hover:bg-[#6b0218] hover:text-white transition-all cursor-pointer inline-block">
                Lihat semua laporan publik
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
              {recentReports && recentReports.length > 0 ? (
                recentReports.map((report) => (
                  <div key={report.id} className="bg-white border border-[#debfbf] rounded-[0.5rem] overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                    <div className="p-6 flex-grow">
                      <div className="flex justify-between items-start mb-4">
                        {report.status === 'selesai' && (
                          <span className="px-3 py-1 rounded-[0.75rem] bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider">
                            Selesai
                          </span>
                        )}
                        {report.status === 'diproses' && (
                          <span className="px-3 py-1 rounded-[0.75rem] bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase tracking-wider">
                            Diproses
                          </span>
                        )}
                        {report.status === 'diterima' && (
                          <span className="px-3 py-1 rounded-[0.75rem] bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
                            Diterima
                          </span>
                        )}
                        {report.status === 'ditindaklanjuti' && (
                          <span className="px-3 py-1 rounded-[0.75rem] bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider">
                            Ditindaklanjuti
                          </span>
                        )}
                        <span className="font-['Public_Sans'] text-[12px] leading-[16px] tracking-[0.04em] font-bold text-[#574141] flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">calendar_today</span> 
                          {new Date(report.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <h4 className="font-['Libre_Franklin'] text-[18px] font-semibold mb-3 line-clamp-2">
                        {report.judul}
                      </h4>
                      <p className="font-['Public_Sans'] text-[16px] leading-[24px] text-[#574141] mb-4 line-clamp-3">
                        {report.deskripsi}
                      </p>
                      <div className="flex items-center gap-2 font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold text-[#6b0218]">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {report.lokasi}
                      </div>
                    </div>
                    {report.laporan_lampiran && report.laporan_lampiran.length > 0 && report.laporan_lampiran[0].file_url && (
                      <div className="h-48 relative overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          alt={report.judul}
                          src={report.laporan_lampiran[0].file_url}
                        />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12 text-[#574141]">
                  Belum ada laporan publik saat ini. Jadilah yang pertama melapor!
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-[#6b0218] text-white">
          <div className="max-w-[1280px] mx-auto px-[40px] grid grid-cols-2 md:grid-cols-4 gap-[24px] text-center">
            <div>
              <span className="block font-['Libre_Franklin'] text-4xl md:text-5xl font-bold mb-2">{totalLaporan || 0}</span>
              <span className="font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold opacity-80 uppercase tracking-widest">
                Laporan Masuk
              </span>
            </div>
            <div>
              <span className="block font-['Libre_Franklin'] text-4xl md:text-5xl font-bold mb-2">{tuntasLaporan || 0}</span>
              <span className="font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold opacity-80 uppercase tracking-widest">
                Tuntas Ditangani
              </span>
            </div>
            <div>
              <span className="block font-['Libre_Franklin'] text-4xl md:text-5xl font-bold mb-2">{prosesLaporan || 0}</span>
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
