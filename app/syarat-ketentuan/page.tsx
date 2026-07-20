import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function SyaratKetentuanPage() {
  return (
    <div className="font-['Public_Sans'] bg-[#fcf9f4] text-[#1c1c19] min-h-screen flex flex-col">
      <Navbar showLoginButton={true} />

      <main className="flex-grow pt-32 pb-20 px-4 md:px-[40px] max-w-4xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="font-['Libre_Franklin'] text-[32px] md:text-[48px] font-bold text-[#6b0218] leading-tight mb-4">
            Syarat & Ketentuan
          </h1>
          <p className="text-[#574141] text-[16px] leading-[24px]">
            Terakhir diperbarui: 20 Juli 2026
          </p>
        </div>

        <div className="bg-white border border-[#debfbf] rounded-xl p-6 md:p-10 shadow-sm space-y-8">
          
          <section>
            <p className="leading-relaxed mb-4">
              Selamat datang di <strong>Halo Jurnal</strong>. Syarat dan Ketentuan berikut mengatur penggunaan platform portal aspirasi masyarakat yang disediakan oleh Jurnal Sukabumi.
            </p>
            <div className="bg-[#f6f3ee] border-l-4 border-[#6b0218] p-4 mb-4 text-[#574141] italic">
              Dengan mengakses dan menggunakan layanan Halo Jurnal, Anda menyetujui seluruh Syarat dan Ketentuan yang berlaku.
            </div>
          </section>

          <section>
            <h2 className="font-['Libre_Franklin'] text-[24px] font-bold text-[#1c1c19] mb-4">1. Penggunaan Platform</h2>
            <p className="leading-relaxed mb-4">
              Pengguna setuju untuk menggunakan platform Halo Jurnal hanya untuk tujuan yang sah dan sesuai dengan hukum yang berlaku. Pengguna dilarang untuk:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#1c1c19]">
              <li>Mengirimkan laporan palsu, fitnah, atau ujaran kebencian.</li>
              <li>Menggunakan bahasa yang kasar, provokatif, atau melanggar norma kesusilaan.</li>
              <li>Mencoba meretas, merusak, atau mengganggu sistem keamanan Halo Jurnal.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-['Libre_Franklin'] text-[24px] font-bold text-[#1c1c19] mb-4">2. Tanggung Jawab Konten</h2>
            <p className="leading-relaxed mb-4">
              Setiap laporan, komentar, atau materi yang diunggah oleh pengguna sepenuhnya menjadi tanggung jawab pengguna yang bersangkutan. Jurnal Sukabumi berhak (namun tidak berkewajiban) untuk meninjau, mengubah, atau menghapus konten yang dianggap melanggar Syarat dan Ketentuan ini.
            </p>
          </section>

          <section>
            <h2 className="font-['Libre_Franklin'] text-[24px] font-bold text-[#1c1c19] mb-4">3. Keterbatasan Tanggung Jawab</h2>
            <p className="leading-relaxed mb-4">
              Halo Jurnal berfungsi sebagai jembatan informasi antara warga dan pihak terkait. Kami tidak menjamin bahwa setiap laporan akan langsung diselesaikan oleh instansi terkait. Kami hanya memastikan bahwa laporan yang valid akan diteruskan melalui saluran yang tepat.
            </p>
          </section>
          
          <div className="pt-6 border-t border-[#debfbf]">
            <p className="text-center text-[#574141]">
              Dengan mendaftar dan menggunakan Halo Jurnal, Anda menyatakan tunduk pada{' '}
              <Link href="/kebijakan-privasi" className="text-[#6b0218] font-bold hover:underline">
                Kebijakan Privasi
              </Link>
              {' '}kami.
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
