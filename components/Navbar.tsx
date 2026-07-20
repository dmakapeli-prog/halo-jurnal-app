'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface NavbarProps {
  showLoginButton?: boolean
  actionButton?: React.ReactNode
}

export default function Navbar({ showLoginButton = true, actionButton }: NavbarProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/feed-publik', label: 'Feed Publik' },
    { href: '/lapor', label: 'Lapor' },
    { href: '/laporan-saya', label: 'Laporan Saya' },
    { href: '/tentang', label: 'Tentang' },
  ]

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-[40px] h-[80px] shadow-md bg-[#8b1e2c]">
      <div className="flex items-center gap-4 md:gap-8">
        <Link href="/">
          <h1 className="font-['Libre_Franklin'] text-[32px] leading-[40px] font-bold text-white">
            Halo Jurnal
          </h1>
        </Link>
        <div className="hidden md:flex gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold transition-colors ${
                pathname === link.href
                  ? 'text-white border-b-2 border-[#ffe08e]'
                  : 'text-white/80 hover:text-[#ffe08e]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        {actionButton ? (
          actionButton
        ) : showLoginButton ? (
          <Link href="/login">
            <button className="text-[#735a00] font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold px-6 py-2 rounded-[0.25rem] hover:opacity-90 transition-all active:scale-95 bg-[#fed255]">
              Login
            </button>
          </Link>
        ) : null}
        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="material-symbols-outlined text-[28px]">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-[80px] left-0 w-full bg-[#8b1e2c] shadow-lg md:hidden flex flex-col py-4 px-4 gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold py-2 transition-colors ${
                pathname === link.href
                  ? 'text-white border-b-2 border-[#ffe08e]'
                  : 'text-white/80 hover:text-[#ffe08e]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
