'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import LogoutButton from '@/app/beranda/LogoutButton'
import UserAvatar from '@/components/UserAvatar'

interface NavbarProps {
  showLoginButton?: boolean
  actionButton?: React.ReactNode
}

export default function Navbar({ showLoginButton = true, actionButton }: NavbarProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [fullName, setFullName] = useState<string | null>(null)
  const [checkedAuth, setCheckedAuth] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
        const { data: prof } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', data.user.id)
          .single()
        if (prof) {
          if (prof.role) setRole(prof.role)
          if (prof.full_name) setFullName(prof.full_name)
        }
      }
      setCheckedAuth(true)
    }
    checkUser()
  }, [])

  const isAdmin = role === 'admin' || role === 'superadmin'

  const navLinks = isAdmin ? [
    { href: '/admin', label: 'Dashboard Admin' },
    { href: '/admin/feed-publik', label: 'Feed Publik (Admin)' },
    { href: '/tentang', label: 'Tentang' },
  ] : [
    { href: user ? '/beranda' : '/', label: 'Beranda' },
    { href: '/feed-publik', label: 'Feed Publik' },
    { href: '/lapor', label: 'Lapor' },
    { href: '/laporan-saya', label: 'Laporan Saya' },
    { href: '/tentang', label: 'Tentang' },
    ...(user ? [{ href: '/profil', label: 'Profil Saya' }] : [])
  ]

  const renderAuthButtons = (isMobile = false) => {
    if (actionButton) {
      return actionButton
    }

    if (user) {
      return (
        <div className={`flex items-center gap-2 ${isMobile ? 'flex-col w-full' : ''}`}>
          {isAdmin && (
            <span className="px-3 py-1 bg-[#ffe08e] text-[#735a00] rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">shield</span> ADMIN
            </span>
          )}
          <Link href="/profil" title="Profil Saya" className="shrink-0 hover:scale-105 transition-transform">
            <UserAvatar name={fullName || user?.user_metadata?.full_name} size="sm" bgColor="gold" />
          </Link>
          <Link href={isAdmin ? "/admin" : "/beranda"} className={isMobile ? 'w-full' : ''}>
            <button className="bg-[#ffe08e] text-[#241a00] font-['Public_Sans'] text-[14px] font-semibold px-4 md:px-5 py-2 rounded-[0.25rem] hover:opacity-90 transition-all w-full min-h-[38px]">
              {isAdmin ? "Panel Admin" : "Dashboard"}
            </button>
          </Link>
          <LogoutButton />
        </div>
      )
    }

    if (showLoginButton) {
      return (
        <Link href="/login" className={isMobile ? 'w-full' : ''}>
          <button className="text-[#735a00] font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold px-4 md:px-6 py-2 rounded-[0.25rem] hover:opacity-90 transition-all active:scale-95 bg-[#fed255] w-full min-h-[38px]">
            Login
          </button>
        </Link>
      )
    }

    return null
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-[40px] h-[64px] md:h-[80px] shadow-md bg-[#8b1e2c]">
      <div className="flex items-center gap-4 md:gap-8 min-w-0">
        <Link href="/" className="shrink-0">
          <h1 className="font-['Libre_Franklin'] text-lg md:text-[32px] leading-tight md:leading-[40px] font-bold text-white whitespace-nowrap">
            Halo Jurnal
          </h1>
        </Link>
        <div className="hidden md:flex gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold transition-colors whitespace-nowrap ${
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
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <div className="hidden sm:flex items-center gap-2">
          {checkedAuth ? renderAuthButtons(false) : null}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-[28px]">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-[64px] md:top-[80px] left-0 w-full bg-[#8b1e2c] shadow-lg md:hidden flex flex-col py-4 px-5 gap-1 z-50 border-t border-white/10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`font-['Public_Sans'] text-[15px] leading-[20px] tracking-[0.01em] font-semibold py-3 px-3 rounded-lg transition-colors ${
                pathname === link.href
                  ? 'text-white bg-white/10'
                  : 'text-white/80 hover:text-[#ffe08e] hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 pt-3 border-t border-white/10">
            <div onClick={() => setMobileMenuOpen(false)}>
              {renderAuthButtons(true)}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
