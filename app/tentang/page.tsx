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
        {/* Hero Section */}
        <section className="relative min-h-[500px] md:min-h-[716px] flex items-center bg-[#8b1e2c] text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none"></div>
          <div className="relative max-w-[1280px] mx-auto px-5 md:px-[40px] grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center w-full py-12 md:py-0">
            <div className="flex flex-col gap-6">
              <span className="inline-block px-4 py-1 bg-[#755b00] text-white rounded-full w-fit font-['Public_Sans'] text-[12px] font-bold uppercase tracking-widest">
                Digital Governance
              </span>
              <h1 className="font-['Libre_Franklin'] text-[28px] sm:text-[36px] md:text-[48px] leading-[36px] sm:leading-[44px] md:leading-[56px] font-bold tracking-[-0.02em]">
                Tentang Halo Jurnal
              </h1>
              <p className="font-['Public_Sans'] text-[15px] md:text-[18px] leading-[24px] md:leading-[28px] text-white/90 max-w-lg">
                Sebuah platform aspirasi dan pengaduan warga yang dikelola secara independen oleh tim Jurnal Sukabumi (PT Media Jurnal Sukabumi). Kami menerima, menindaklanjuti, dan menjalin komunikasi aktif dengan pihak berwenang terkait demi transparansi dan akuntabilitas publik.
              </p>
              <div className="flex gap-4 pt-4">
                <button className="bg-[#fed255] text-[#735a00] px-6 md:px-8 py-3 md:py-4 rounded-lg font-['Public_Sans'] text-[14px] font-semibold tracking-[0.01em] hover:scale-105 transition-transform min-h-[48px]">
                  Pelajari Visi Kami
                </button>
              </div>
            </div>
            <div className="hidden md:block relative h-[500px]">
              <div className="absolute inset-0 bg-[#755b00]/20 rounded-xl transform rotate-3 translate-x-4"></div>
              <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 shadow-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-full h-full object-cover" alt="Government building" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB0NxRGWMRGlcGKuj76lq4BPkQ2zMcjy4N8QUJF7V9wkxp-s8VGMMY_r-cXLWcr8KNAnldnNkFi_sRzg-cUjw6O25bhl1JhLW4vTRmHx8lMrgc57yqrMUogGUL8ndy0NSwDsXulDMOZodFw6m6pGd_qsjqpDmjXOu24gsxLjHXqm54DLm1xJm4GIj-vdxdLh3f2pkz6TtoVrUp-slbY_WLMSQUOepv7Lo7aIWKXQk09Bl5YqK8DtsQuODm5Z24gj84EcIfLtmvclviI" />
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-[#f6f3ee]">
          <div className="max-w-[1280px] mx-auto px-5 md:px-[40px]">
            <div className="text-center mb-16">
              <h2 className="font-['Libre_Franklin'] text-[32px] font-bold text-[#6b0218] mb-4">
                Bagaimana Cara Kerjanya?
              </h2>
              <p className="text-[#574141] max-w-2xl mx-auto font-['Public_Sans'] text-[16px]">
                Alur pelaporan yang sistematis untuk memastikan setiap aspirasi Anda terdengar dan tertangani dengan baik.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 relative">
              <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-[#debfbf]"></div>
              
              <div className="flex flex-col items-center text-center group">
                <div className="w-24 h-24 bg-white border-2 border-[#6b0218] rounded-full flex items-center justify-center mb-6 relative z-10 group-hover:bg-[#6b0218] group-hover:text-white transition-all duration-300 text-[#6b0218]">
                  <span className="material-symbols-outlined text-4xl group-hover:text-white transition-colors" style={{ fontVariationSettings: "'FILL' 0" }}>how_to_reg</span>
                </div>
                <h3 className="font-['Public_Sans'] text-[14px] font-semibold mb-2 text-[#1c1c19]">1. Daftar & Verifikasi</h3>
                <p className="font-['Public_Sans'] text-[12px] text-[#574141]">Pastikan identitas Anda valid untuk menjaga integritas data.</p>
              </div>

              <div className="flex flex-col items-center text-center group">
                <div className="w-24 h-24 bg-white border-2 border-[#6b0218] rounded-full flex items-center justify-center mb-6 relative z-10 group-hover:bg-[#6b0218] group-hover:text-white transition-all duration-300 text-[#6b0218]">
                  <span className="material-symbols-outlined text-4xl group-hover:text-white transition-colors" style={{ fontVariationSettings: "'FILL' 0" }}>edit_note</span>
                </div>
                <h3 className="font-['Public_Sans'] text-[14px] font-semibold mb-2 text-[#1c1c19]">2. Sampaikan Laporan</h3>
                <p className="font-['Public_Sans'] text-[12px] text-[#574141]">Tulis aspirasi atau keluhan Anda secara detail dan lampirkan bukti.</p>
              </div>

              <div className="flex flex-col items-center text-center group">
                <div className="w-24 h-24 bg-white border-2 border-[#6b0218] rounded-full flex items-center justify-center mb-6 relative z-10 group-hover:bg-[#6b0218] group-hover:text-white transition-all duration-300 text-[#6b0218]">
                  <span className="material-symbols-outlined text-4xl group-hover:text-white transition-colors" style={{ fontVariationSettings: "'FILL' 0" }}>forum</span>
                </div>
                <h3 className="font-['Public_Sans'] text-[14px] font-semibold mb-2 text-[#1c1c19]">3. Diskusi Langsung</h3>
                <p className="font-['Public_Sans'] text-[12px] text-[#574141]">Berinteraksi langsung dengan Admin Jurnal Sukabumi untuk proses klarifikasi data.</p>
              </div>

              <div className="flex flex-col items-center text-center group">
                <div className="w-24 h-24 bg-white border-2 border-[#6b0218] rounded-full flex items-center justify-center mb-6 relative z-10 group-hover:bg-[#6b0218] group-hover:text-white transition-all duration-300 text-[#6b0218]">
                  <span className="material-symbols-outlined text-4xl group-hover:text-white transition-colors" style={{ fontVariationSettings: "'FILL' 0" }}>task_alt</span>
                </div>
                <h3 className="font-['Public_Sans'] text-[14px] font-semibold mb-2 text-[#1c1c19]">4. Pantau & Selesai</h3>
                <p className="font-['Public_Sans'] text-[12px] text-[#574141]">Ikuti perkembangan status hingga laporan dinyatakan selesai.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Commitment Section */}
        <section className="py-24 bg-[#fcf9f4]">
          <div className="max-w-[1280px] mx-auto px-5 md:px-[40px]">
            <div className="flex flex-col md:flex-row gap-16 items-center">
              <div className="w-full md:w-1/2">
                <h2 className="font-['Libre_Franklin'] text-[32px] font-bold text-[#6b0218] mb-8">
                  Komitmen Kami terhadap Masyarakat
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-6 p-6 bg-white border border-[#debfbf] rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-[#6b0218]/10 p-3 rounded-lg h-fit">
                      <span className="material-symbols-outlined text-[#6b0218]" style={{ fontVariationSettings: "'FILL' 0" }}>shield_person</span>
                    </div>
                    <div>
                      <h4 className="font-['Libre_Franklin'] text-[18px] md:text-[24px] font-semibold text-[#1c1c19] mb-2">Kerahasiaan Data</h4>
                      <p className="font-['Public_Sans'] text-[16px] text-[#574141]">
                        KTP hanya digunakan untuk verifikasi internal dan tidak akan pernah dipublikasikan kepada publik demi keamanan pelapor.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-6 p-6 bg-white border border-[#debfbf] rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-[#6b0218]/10 p-3 rounded-lg h-fit">
                      <span className="material-symbols-outlined text-[#6b0218]" style={{ fontVariationSettings: "'FILL' 0" }}>visibility</span>
                    </div>
                    <div>
                      <h4 className="font-['Libre_Franklin'] text-[18px] md:text-[24px] font-semibold text-[#1c1c19] mb-2">Transparansi Publik</h4>
                      <p className="font-['Public_Sans'] text-[16px] text-[#574141]">
                        Setiap laporan yang ditindaklanjuti dapat dipantau publik secara anonim untuk memastikan akuntabilitas proses.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-6 p-6 bg-white border border-[#debfbf] rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-[#6b0218]/10 p-3 rounded-lg h-fit">
                      <span className="material-symbols-outlined text-[#6b0218]" style={{ fontVariationSettings: "'FILL' 0" }}>speed</span>
                    </div>
                    <div>
                      <h4 className="font-['Libre_Franklin'] text-[18px] md:text-[24px] font-semibold text-[#1c1c19] mb-2">Respon Cepat</h4>
                      <p className="font-['Public_Sans'] text-[16px] text-[#574141]">
                        Setiap laporan ditangani dan direspons secara profesional oleh admin berwenang dalam waktu yang terukur.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-1/2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 rounded-xl overflow-hidden h-64 border border-[#debfbf]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="w-full h-full object-cover" alt="Trust" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9hjv5QFnQYsJ1g_7ob8XZ_5B_bdN9-ejarDfyvKP7qOuzUOQw8D7GqH_SajF-oZRTJftUpKAoUuIvFHB09yEqwa77XITg2qhggZy7Utt2LD0E2dYYeqlUQV7SHq-aYgkPlBkgY8rkT0gCz1iO7QRi98Ou4xPFBN-GdVlqt6od-GPuOAP3TwUC8h23QkEbH_jYrOJ_rxW9qujfz9OzneX874J7TVsKhpGCT4AqTO0L9GOyR586kvFfhNp5oq8dmRie4ZvzRaRswc7g" />
                  </div>
                  <div className="rounded-xl overflow-hidden h-48 border border-[#debfbf]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="w-full h-full object-cover" alt="Dashboard" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMub2F1OxdGvNbAjsYEeLwXtLXmlDvFX5nCFJSrmEw_dvvOEMt1pE-Y0wrAoeFRpHey8FDoGzOIsCXP11uEXkOc4SP8MgE2OvZyWMwJRehEE2g-OHwo5lnPdMLAGXRnUyJ-4kavp9eRKjz4bdP2_ismljOLr0uqKd0hnF4fu8d-YHb2g3xdnVRp-WW0A3IQ_kJGBrOBzrgh4DSVcqrAtzSFaFjOTP8XLfVlRVDyBDTqAkP_uLBK7Jp7aSFoiWLXb0Ia1IyMRLEsqCU" />
                  </div>
                  <div className="rounded-xl overflow-hidden h-48 border border-[#debfbf]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="w-full h-full object-cover" alt="Meeting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBx4OhrLUxLryVolr4LOicZzI9RepBjkuXko0sVZmGcfQAOGTi3Ct496jcbWYLy-tUNx_lOQrzBU1M0wezYmpVAp3HnEgkXXAFpoxWyUZyBc-nsWgvAA3Fcz2nszpFBNLn_GhQqogScUdV4Pgwjc7RMZjpiJ6suSnsxWu-qtYhCdhLLBmS3GfhbRwvyvqWX-sizqBYaQham7cd_SoHBeu9ShJ9q0XTeDECqs-w7DrgqlFfhcvx0NcRkeGweV_PA6QPHAdtsobdPSe5h" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-[#6b0218]">
          <div className="max-w-[1280px] mx-auto px-5 md:px-[40px]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12">
              <div className="text-center text-white">
                <div className="font-['Libre_Franklin'] text-[32px] sm:text-[40px] md:text-[48px] leading-[40px] md:leading-[56px] font-bold mb-2 tracking-[-0.02em]">{ditindaklanjutiCount || 0}</div>
                <p className="font-['Public_Sans'] text-[14px] font-semibold opacity-80 uppercase tracking-widest">Laporan Ditindaklanjuti & Selesai</p>
              </div>
              <div className="text-center text-white">
                <div className="font-['Libre_Franklin'] text-[32px] sm:text-[40px] md:text-[48px] leading-[40px] md:leading-[56px] font-bold mb-2 tracking-[-0.02em]">{totalLaporanCount || 0}</div>
                <p className="font-['Public_Sans'] text-[14px] font-semibold opacity-80 uppercase tracking-widest">Total Laporan Masuk</p>
              </div>
              <div className="text-center text-white">
                <div className="font-['Libre_Franklin'] text-[32px] sm:text-[40px] md:text-[48px] leading-[40px] md:leading-[56px] font-bold mb-2 tracking-[-0.02em]">24/7</div>
                <p className="font-['Public_Sans'] text-[14px] font-semibold opacity-80 uppercase tracking-widest">Layanan Aspirasi Digital</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact/CTA Section */}
        <section className="py-24 bg-[#e5e2dd]">
          <div className="max-w-[1280px] mx-auto px-5 md:px-[40px]">
            <div className="bg-white p-6 sm:p-8 md:p-12 rounded-2xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12 border border-[#debfbf]">
              <div className="max-w-lg">
                <h2 className="font-['Libre_Franklin'] text-[32px] font-bold text-[#6b0218] mb-4">Punya pertanyaan atau butuh bantuan?</h2>
                <p className="text-[#574141] font-['Public_Sans'] text-[16px] mb-6">Tim dukungan kami siap membantu Anda memahami lebih lanjut tentang cara kerja platform atau menangani kendala teknis yang Anda hadapi.</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[#1c1c19]">
                    <span className="material-symbols-outlined text-[#6b0218]">mail</span>
                    <span className="font-['Public_Sans'] text-[14px] font-semibold">kontak@halojurnal.id</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#1c1c19]">
                    <span className="material-symbols-outlined text-[#6b0218]">location_on</span>
                    <span className="font-['Public_Sans'] text-[14px] font-semibold">Jl. Pahlawan No. 12, Sukabumi</span>
                  </div>
                </div>
              </div>
              <div>
                <button className="w-full md:w-auto bg-[#755b00] text-white px-8 md:px-12 py-4 md:py-5 rounded-lg font-['Libre_Franklin'] text-[18px] md:text-[24px] font-semibold hover:scale-105 active:scale-95 transition-all shadow-lg min-h-[52px]">
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
