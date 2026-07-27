import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Tentang - Halo Jurnal',
  description: 'Tentang platform aspirasi dan pengaduan publik Halo Jurnal.',
}

export default async function TentangPage() {
  const supabase = await createClient()

  const { count: ditindaklanjutiCount } = await supabase
    .from('laporan')
    .select('*', { count: 'exact', head: true })
    .in('status', ['ditindaklanjuti', 'selesai'])

  const { count: totalLaporanCount } = await supabase
    .from('laporan')
    .select('*', { count: 'exact', head: true })

  return (
    <>
      <Navbar showLoginButton={true} />

      <main className="min-h-screen pt-[64px] md:pt-[80px] bg-[#FAF7F2]">
        {/* ==================== HERO SECTION ==================== */}
        <section className="relative min-h-[420px] md:min-h-[620px] flex items-center bg-[#8b1e2c] text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none"></div>
          <div className="relative max-w-[1280px] mx-auto px-6 md:px-10 lg:px-[60px] grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center w-full py-16 md:py-20">
            <div className="flex flex-col gap-5">
              <span className="inline-block px-4 py-1.5 bg-[#755b00] text-white rounded-full w-fit font-['Public_Sans'] text-[11px] md:text-[12px] font-bold uppercase tracking-[0.15em]">
                Digital Governance
              </span>
              <h1 className="font-['Libre_Franklin'] text-[32px] sm:text-[40px] md:text-[48px] leading-[1.15] font-bold tracking-[-0.02em]">
                Tentang Halo Jurnal
              </h1>
              <p className="font-['Public_Sans'] text-[15px] md:text-[17px] leading-[1.65] text-white/85 max-w-[520px]">
                Sebuah platform aspirasi dan pengaduan warga yang dikelola secara independen oleh tim Jurnal Sukabumi (PT Media Jurnal Sukabumi). Kami menerima, menindaklanjuti, dan menjalin komunikasi aktif dengan pihak berwenang terkait demi transparansi dan akuntabilitas publik.
              </p>
              <div className="pt-2">
                <button className="bg-[#fed255] text-[#735a00] px-7 md:px-8 py-3 md:py-3.5 rounded-lg font-['Public_Sans'] text-[14px] font-semibold tracking-[0.01em] hover:scale-105 transition-transform min-h-[48px] shadow-lg">
                  Pelajari Visi Kami
                </button>
              </div>
            </div>
            <div className="hidden md:block relative h-[440px]">
              <div className="absolute inset-0 bg-[#755b00]/20 rounded-xl transform rotate-3 translate-x-4"></div>
              <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 shadow-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-full h-full object-cover" alt="Government building" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0NxRGWMRGlcGKuj76lq4BPkQ2zMcjy4N8QUJF7V9wkxp-s8VGMMY_r-cXLWcr8KNAnldnNkFi_sRzg-cUjw6O25bhl1JhLW4vTRmHx8lMrgc57yqrMUogGUL8ndy0NSwDsXulDMOZodFw6m6pGd_qsjqpDmjXOu24gsxLjHXqm54DLm1xJm4GIj-vdxdLh3f2pkz6TtoVrUp-slbY_WLMSQUOepv7Lo7aIWKXQk09Bl5YqK8DtsQuODm5Z24gj84EcIfLtmvclviI" />
              </div>
            </div>
          </div>
        </section>

        {/* ==================== HOW IT WORKS ==================== */}
        <section className="py-16 md:py-24 bg-[#f6f3ee]">
          <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-[60px]">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="font-['Libre_Franklin'] text-[26px] md:text-[32px] font-bold text-[#6b0218] mb-3">
                Bagaimana Cara Kerjanya?
              </h2>
              <p className="text-[#574141] max-w-2xl mx-auto font-['Public_Sans'] text-[14px] md:text-[16px] leading-relaxed">
                Alur pelaporan yang sistematis untuk memastikan setiap aspirasi Anda terdengar dan tertangani dengan baik.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8 relative">
              <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-[#debfbf]"></div>
              
              {[
                { icon: 'how_to_reg', step: '1', title: 'Daftar & Verifikasi', desc: 'Pastikan identitas Anda valid untuk menjaga integritas data.' },
                { icon: 'edit_note', step: '2', title: 'Sampaikan Laporan', desc: 'Tulis aspirasi atau keluhan Anda secara detail dan lampirkan bukti.' },
                { icon: 'forum', step: '3', title: 'Diskusi Langsung', desc: 'Berinteraksi langsung dengan Admin Jurnal Sukabumi untuk proses klarifikasi data.' },
                { icon: 'task_alt', step: '4', title: 'Pantau & Selesai', desc: 'Ikuti perkembangan status hingga laporan dinyatakan selesai.' },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center group">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-white border-2 border-[#6b0218] rounded-full flex items-center justify-center mb-4 md:mb-6 relative z-10 group-hover:bg-[#6b0218] group-hover:text-white transition-all duration-300 text-[#6b0218]">
                    <span className="material-symbols-outlined text-3xl md:text-4xl group-hover:text-white transition-colors" style={{ fontVariationSettings: "'FILL' 0" }}>{item.icon}</span>
                  </div>
                  <h3 className="font-['Public_Sans'] text-[13px] md:text-[14px] font-semibold mb-1.5 text-[#1c1c19] leading-snug">
                    {item.step}. {item.title}
                  </h3>
                  <p className="font-['Public_Sans'] text-[11px] md:text-[12px] text-[#574141] leading-relaxed max-w-[200px]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== COMMITMENT SECTION ==================== */}
        <section className="py-16 md:py-24 bg-[#fcf9f4]">
          <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-[60px]">
            <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start">
              <div className="w-full md:w-1/2">
                <h2 className="font-['Libre_Franklin'] text-[26px] md:text-[32px] font-bold text-[#6b0218] mb-6 md:mb-8 leading-tight">
                  Komitmen Kami terhadap Masyarakat
                </h2>
                <div className="space-y-4 md:space-y-5">
                  {[
                    { icon: 'shield_person', title: 'Kerahasiaan Data', desc: 'KTP hanya digunakan untuk verifikasi internal dan tidak akan pernah dipublikasikan kepada publik demi keamanan pelapor.' },
                    { icon: 'visibility', title: 'Transparansi Publik', desc: 'Setiap laporan yang ditindaklanjuti dapat dipantau publik secara anonim untuk memastikan akuntabilitas proses.' },
                    { icon: 'speed', title: 'Respon Cepat', desc: 'Setiap laporan ditangani dan direspons secara profesional oleh admin berwenang dalam waktu yang terukur.' },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4 md:gap-5 p-5 md:p-6 bg-white border border-[#debfbf] rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="bg-[#6b0218]/10 p-2.5 md:p-3 rounded-lg h-fit shrink-0">
                        <span className="material-symbols-outlined text-[#6b0218] text-[20px] md:text-[24px]" style={{ fontVariationSettings: "'FILL' 0" }}>{item.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-['Libre_Franklin'] text-[16px] md:text-[18px] font-semibold text-[#1c1c19] mb-1.5">
                          {item.title}
                        </h4>
                        <p className="font-['Public_Sans'] text-[13px] md:text-[15px] text-[#574141] leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="w-full md:w-1/2">
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="col-span-2 rounded-xl overflow-hidden h-48 md:h-64 border border-[#debfbf]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="w-full h-full object-cover" alt="Trust" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9hjv5QFnQYsJ1g_7ob8XZ_5B_bdN9-ejarDfyvKP7qOuzUOQw8D7GqH_SajF-oZRTJftUpKAoUuIvFHB09yEqwa77XITg2qhggZy7Utt2LD0E2dYYeqlUQV7SHq-aYgkPlBkgY8rkT0gCz1iO7QRi98Ou4xPFBN-GdVlqt6od-GPuOAP3TwUC8h23QkEbH_jYrOJ_rxW9qujfz9OzneX874J7TVsKhpGCT4AqTO0L9GOyR586kvFfhNp5oq8dmRie4ZvzRaRswc7g" />
                  </div>
                  <div className="rounded-xl overflow-hidden h-36 md:h-48 border border-[#debfbf]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="w-full h-full object-cover" alt="Dashboard" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMub2F1OxdGvNbAjsYEeLwXtLXmlDvFX5nCFJSrmEw_dvvOEMt1pE-Y0wrAoeFRpHey8FDoGzOIsCXP11uEXkOc4SP8MgE2OvZyWMwJRehEE2g-OHwo5lnPdMLAGXRnUyJ-4kavp9eRKjz4bdP2_ismljOLr0uqKd0hnF4fu8d-YHb2g3xdnVRp-WW0A3IQ_kJGBrOBzrgh4DSVcqrAtzSFaFjOTP8XLfVlRVDyBDTqAkP_uLBK7Jp7aSFoiWLXb0Ia1IyMRLEsqCU" />
                  </div>
                  <div className="rounded-xl overflow-hidden h-36 md:h-48 border border-[#debfbf]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="w-full h-full object-cover" alt="Meeting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBx4OhrLUxLryVolr4LOicZzI9RepBjkuXko0sVZmGcfQAOGTi3Ct496jcbWYLy-tUNx_lOQrzBU1M0wezYmpVAp3HnEgkXXAFpoxWyUZyBc-nsWgvAA3Fcz2nszpFBNLn_GhQqogScUdV4Pgwjc7RMZjpiJ6suSnsxWu-qtYhCdhLLBmS3GfhbRwvyvqWX-sizqBYaQham7cd_SoHBeu9ShJ9q0XTeDECqs-w7DrgqlFfhcvx0NcRkeGweV_PA6QPHAdtsobdPSe5h" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== STATS SECTION ==================== */}
        <section className="py-14 md:py-16 bg-[#6b0218]">
          <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-[60px]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-12">
              <div className="text-center text-white">
                <div className="font-['Libre_Franklin'] text-[36px] sm:text-[40px] md:text-[48px] leading-[1.1] font-bold mb-2 tracking-[-0.02em]">
                  {ditindaklanjutiCount || 0}
                </div>
                <p className="font-['Public_Sans'] text-[12px] md:text-[13px] font-semibold opacity-80 uppercase tracking-[0.12em]">
                  Laporan Ditindaklanjuti & Selesai
                </p>
              </div>
              <div className="text-center text-white">
                <div className="font-['Libre_Franklin'] text-[36px] sm:text-[40px] md:text-[48px] leading-[1.1] font-bold mb-2 tracking-[-0.02em]">
                  {totalLaporanCount || 0}
                </div>
                <p className="font-['Public_Sans'] text-[12px] md:text-[13px] font-semibold opacity-80 uppercase tracking-[0.12em]">
                  Total Laporan Masuk
                </p>
              </div>
              <div className="text-center text-white">
                <div className="font-['Libre_Franklin'] text-[36px] sm:text-[40px] md:text-[48px] leading-[1.1] font-bold mb-2 tracking-[-0.02em]">
                  24/7
                </div>
                <p className="font-['Public_Sans'] text-[12px] md:text-[13px] font-semibold opacity-80 uppercase tracking-[0.12em]">
                  Layanan Aspirasi Digital
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== CONTACT / CTA SECTION ==================== */}
        <section className="py-16 md:py-24 bg-[#e5e2dd]">
          <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-[60px]">
            <div className="bg-white p-6 sm:p-8 md:p-12 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12 border border-[#debfbf]">
              <div className="max-w-lg">
                <h2 className="font-['Libre_Franklin'] text-[24px] md:text-[32px] font-bold text-[#6b0218] mb-3 md:mb-4 leading-tight">
                  Punya pertanyaan atau butuh bantuan?
                </h2>
                <p className="text-[#574141] font-['Public_Sans'] text-[14px] md:text-[16px] mb-5 md:mb-6 leading-relaxed">
                  Tim dukungan kami siap membantu Anda memahami lebih lanjut tentang cara kerja platform atau menangani kendala teknis yang Anda hadapi.
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-[#1c1c19]">
                    <span className="material-symbols-outlined text-[#6b0218] text-[20px]">mail</span>
                    <span className="font-['Public_Sans'] text-[13px] md:text-[14px] font-semibold">kontak@halojurnal.id</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#1c1c19]">
                    <span className="material-symbols-outlined text-[#6b0218] text-[20px]">location_on</span>
                    <span className="font-['Public_Sans'] text-[13px] md:text-[14px] font-semibold">Jl. Pahlawan No. 12, Sukabumi</span>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-auto">
                <button className="w-full md:w-auto bg-[#755b00] text-white px-8 md:px-12 py-3.5 md:py-4 rounded-lg font-['Libre_Franklin'] text-[16px] md:text-[20px] font-semibold hover:scale-105 active:scale-95 transition-all shadow-lg min-h-[52px]">
                  Hubungi Kami
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
