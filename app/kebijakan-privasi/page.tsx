import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function KebijakanPrivasiPage() {
  return (
    <div className="font-['Public_Sans'] bg-[#fcf9f4] text-[#1c1c19] min-h-screen flex flex-col">
      <Navbar showLoginButton={true} />

      <main className="flex-grow pt-24 md:pt-32 pb-16 md:pb-20 px-5 md:px-[40px] max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="font-['Libre_Franklin'] text-[28px] sm:text-[32px] md:text-[48px] font-bold text-[#6b0218] leading-tight mb-3 md:mb-4">
            Kebijakan Privasi
          </h1>
          <p className="text-[#574141] text-[16px] leading-[24px]">
            Terakhir diperbarui: 20 Juli 2026
          </p>
        </div>

        <div className="bg-white border border-[#debfbf] rounded-xl p-6 md:p-10 shadow-sm space-y-8">
          
          <section>
            <p className="leading-relaxed mb-4">
              Selamat datang di <strong>Halo Jurnal</strong>. Kami menghargai privasi Anda dan berkomitmen penuh untuk melindungi data pribadi yang Anda bagikan saat menggunakan platform portal aspirasi masyarakat kami.
            </p>
            <div className="bg-[#f6f3ee] border-l-4 border-[#6b0218] p-4 mb-4 text-[#574141] italic">
              Halo Jurnal adalah inisiatif digital dari <strong>Jurnal Sukabumi (PT. Media Jurnal Sukabumi)</strong> untuk mewujudkan transparansi dan tata kelola lingkungan yang akuntabel.
            </div>
          </section>

          <section>
            <h2 className="font-['Libre_Franklin'] text-[24px] font-bold text-[#1c1c19] mb-4">1. Data yang Kami Kumpulkan</h2>
            <p className="leading-relaxed mb-4">
              Untuk memberikan layanan yang responsif dan dapat dipertanggungjawabkan, Halo Jurnal mengumpulkan beberapa informasi pribadi Anda, termasuk namun tidak terbatas pada:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#1c1c19]">
              <li><strong>Informasi Kontak:</strong> Nama lengkap dan alamat Email aktif.</li>
              <li><strong>Verifikasi Identitas:</strong> Salinan identitas diri berupa Foto KTP (Kartu Tanda Penduduk).</li>
              <li><strong>Data Laporan:</strong> Isi/deskripsi laporan atau aspirasi yang Anda tulis, titik lokasi kejadian, serta lampiran bukti berupa foto atau video.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-['Libre_Franklin'] text-[24px] font-bold text-[#1c1c19] mb-4">2. Tujuan Penggunaan Data</h2>
            <p className="leading-relaxed mb-4">
              Semua informasi yang Anda berikan melalui platform Halo Jurnal hanya akan digunakan untuk tujuan yang jelas dan spesifik, yaitu:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#1c1c19]">
              <li><strong>Verifikasi Identitas Pelapor:</strong> Memastikan bahwa setiap laporan yang masuk berasal dari warga yang nyata (sah) guna menghindari spam, laporan palsu (hoax), atau penyalahgunaan platform.</li>
              <li><strong>Penanganan Laporan oleh Tim Admin:</strong> Memproses substansi laporan dan lokasi kejadian oleh tim Jurnal Sukabumi serta menjalin komunikasi dengan pihak berwenang terkait demi transparansi publik.</li>
              <li><strong>Komunikasi:</strong> Menghubungi Anda terkait pembaruan status laporan (melalui notifikasi email) atau meminta informasi tambahan jika diperlukan.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-['Libre_Franklin'] text-[24px] font-bold text-[#1c1c19] mb-4">3. Keamanan & Kerahasiaan KTP</h2>
            <div className="bg-[#ffdad9]/30 p-4 rounded-lg flex gap-3 border border-[#debfbf]">
              <span className="material-symbols-outlined text-[#6b0218]">privacy_tip</span>
              <p className="leading-relaxed text-[#881c2a]">
                <strong>PENTING:</strong> Kami menegaskan bahwa <strong>Foto KTP Anda TIDAK AKAN PERNAH dipublikasikan</strong> di platform umum (Feed Publik) ataupun disebarluaskan ke pihak yang tidak berkepentingan. Foto KTP murni dan secara eksklusif hanya digunakan untuk keperluan <strong>verifikasi internal tim administrator kami</strong>.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-['Libre_Franklin'] text-[24px] font-bold text-[#1c1c19] mb-4">4. Anonimitas di Ranah Publik</h2>
            <p className="leading-relaxed mb-4">
              Ketika laporan Anda masuk ke dalam <strong>Feed Publik</strong> (agar dapat dilihat, dikomentari, dan didukung oleh masyarakat luas), sistem kami akan secara otomatis <strong>menyembunyikan identitas Anda</strong>. Laporan yang bersifat publik akan ditampilkan secara anonim (misalnya dengan nama "Warga" atau "Pelapor Anonim (Terenkripsi)"), sehingga Anda tidak perlu khawatir terkait keamanan profil pribadi Anda di ruang publik.
            </p>
          </section>

          <section>
            <h2 className="font-['Libre_Franklin'] text-[24px] font-bold text-[#1c1c19] mb-4">5. Perubahan Kebijakan</h2>
            <p className="leading-relaxed mb-4">
              PT. Media Jurnal Sukabumi berhak untuk memperbarui atau mengubah Kebijakan Privasi ini dari waktu ke waktu agar selalu sejalan dengan standar keamanan dan hukum yang berlaku. Kami akan mencantumkan tanggal "Terakhir diperbarui" di bagian atas halaman ini untuk setiap perubahan yang terjadi.
            </p>
          </section>
          
          <div className="pt-6 border-t border-[#debfbf]">
            <p className="text-center text-[#574141]">
              Memiliki pertanyaan terkait privasi data Anda?{' '}
              <Link href="/hubungi-kami" className="text-[#6b0218] font-bold hover:underline">
                Hubungi Kami di sini
              </Link>.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
