import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full py-10 md:py-12 px-5 md:px-[40px] flex flex-col items-center gap-4 bg-[#e5e2dd] border-t border-[#debfbf]">
      <div className="w-full max-w-[1280px] flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 mb-6 md:mb-8 border-b border-[#debfbf] pb-6 md:pb-8">
        <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left">
          <span className="font-['Libre_Franklin'] text-[20px] md:text-[24px] leading-[28px] md:leading-[32px] font-semibold text-[#6b0218]">
            Halo Jurnal
          </span>
          <p className="text-[#574141] max-w-sm font-['Public_Sans'] text-[14px] md:text-[16px] leading-[22px] md:leading-[24px]">
            Wadah aspirasi digital untuk mewujudkan tata kelola kota yang lebih baik, transparan, dan akuntabel.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          <Link
            href="/kebijakan-privasi"
            className="text-[#574141] hover:text-[#6b0218] transition-colors font-['Public_Sans'] text-[13px] md:text-[14px] leading-[20px] tracking-[0.01em] font-semibold"
          >
            Kebijakan Privasi
          </Link>
          <Link
            href="/syarat-ketentuan"
            className="text-[#574141] hover:text-[#6b0218] transition-colors font-['Public_Sans'] text-[13px] md:text-[14px] leading-[20px] tracking-[0.01em] font-semibold"
          >
            Syarat &amp; Ketentuan
          </Link>
          <Link
            href="/hubungi-kami"
            className="text-[#574141] hover:text-[#6b0218] transition-colors font-['Public_Sans'] text-[13px] md:text-[14px] leading-[20px] tracking-[0.01em] font-semibold"
          >
            Hubungi Kami
          </Link>
        </div>
      </div>
      <div className="text-center flex flex-col items-center gap-2">
        <p className="font-['Public_Sans'] text-[13px] md:text-[14px] leading-[20px] text-[#574141]">
          Halo Jurnal adalah inisiatif dari{' '}
          <a href="https://jurnal-vibes-app.vercel.app/" target="_blank" rel="noreferrer" className="font-bold text-[#6b0218] hover:underline">
            Jurnal Vibes
          </a>
        </p>
        <p className="font-['Public_Sans'] text-[11px] md:text-[12px] leading-[16px] text-[#8b7171]">
          © {new Date().getFullYear()} Halo Jurnal. Portal Aspirasi Masyarakat.
        </p>
      </div>
    </footer>
  )
}
