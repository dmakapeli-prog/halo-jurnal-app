import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Halo Jurnal - Portal Aspirasi Warga',
  description: 'Sampaikan aspirasi dan laporan pengaduan Anda secara langsung kepada instansi pemerintah yang berwenang. Portal resmi aspirasi dan pengaduan masyarakat Jurnal Sukabumi.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400;600;700;800&family=Public+Sans:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-['Public_Sans'] text-[16px] leading-[24px] text-[#1c1c19]">
        {children}
      </body>
    </html>
  )
}
