'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LogoutButton from '@/app/beranda/LogoutButton'
import UserAvatar from '@/components/UserAvatar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false)
      return
    }

    const checkAdminAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.replace('/admin/login')
          return
        }

        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!prof || (prof.role !== 'admin' && prof.role !== 'superadmin')) {
          router.replace('/admin/login?error=unauthorized')
          return
        }

        setProfile(prof)
      } catch (err) {
        console.error('Error verifying admin layout auth:', err)
        router.replace('/admin/login')
      } finally {
        setLoading(false)
      }
    }

    checkAdminAuth()
  }, [pathname, router, isLoginPage])

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [pathname])

  // If viewing the admin login page, bypass the admin sidebar layout completely
  if (isLoginPage) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1c1c19] flex flex-col items-center justify-center text-white font-['Public_Sans']">
        <div className="w-12 h-12 rounded-2xl bg-[#6b0218] border border-[#ffe08e]/30 flex items-center justify-center text-[#ffe08e] mb-4 shadow-lg animate-pulse">
          <span className="material-symbols-outlined text-2xl">shield</span>
        </div>
        <p className="text-sm font-semibold text-white/80">Memverifikasi Hak Akses Admin...</p>
      </div>
    )
  }


  const navItems = [
    { href: '/admin', label: 'Dashboard Admin', icon: 'dashboard' },
    { href: '/admin/chat', label: 'Pesan Chat Warga', icon: 'forum' },
    { href: '/admin/feed-publik', label: 'Feed Publik (Admin)', icon: 'public' },
    { href: '/tentang', label: 'Tentang Platform', icon: 'info' },
  ]

  return (
    <div className="min-h-screen bg-[#f4f1ec] text-[#1c1c19] flex font-['Public_Sans']">

      {/* Backdrop overlay for mobile drawer */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation — Responsive Drawer */}
      <aside
        className={`w-[260px] bg-[#1c1c19] text-white flex flex-col fixed left-0 top-0 bottom-0 z-50 border-r border-[#333] transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 bg-[#6b0218] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#ffe08e] text-[#735a00] flex items-center justify-center font-bold shrink-0">
              <span className="material-symbols-outlined text-[20px]">shield</span>
            </div>
            <div>
              <h1 className="font-['Libre_Franklin'] font-bold text-lg leading-tight text-white">Halo Jurnal</h1>
              <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Control Panel Admin</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden text-white/70 hover:text-white p-1"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-3 mb-2">Navigasi Utama</div>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#6b0218] text-white font-bold shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}

          <div className="pt-6 text-[10px] font-bold text-white/40 uppercase tracking-widest px-3 mb-2">Manajemen Portal</div>
          <div className="px-3.5 py-2.5 bg-white/5 rounded-xl text-xs text-white/60 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400"></span> PT Media Jurnal Sukabumi
          </div>
        </nav>

        {/* Footer Admin Profile */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <UserAvatar name={profile?.full_name || 'Admin'} size="sm" bgColor="gold" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{profile?.full_name || 'Admin Jurnal Sukabumi'}</p>
              <span className="text-[10px] bg-[#ffe08e]/20 text-[#ffe08e] px-2 py-0.5 rounded font-bold uppercase tracking-wider inline-block">
                Administrator
              </span>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen">
        {/* Top Control Bar */}
        <header className="h-16 bg-white border-b border-[#debfbf] px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#1c1c19] hover:bg-[#f4f1ec] transition-colors"
              title="Buka Navigasi Admin"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>

            <span className="text-xs bg-[#6b0218]/10 text-[#6b0218] font-bold px-3 py-1 rounded-full uppercase tracking-wider hidden sm:inline-block">
              Internal Portal
            </span>
            <span className="text-xs sm:text-sm font-semibold text-[#574141] truncate max-w-[200px] sm:max-w-none">
              PT Media Jurnal Sukabumi — Panel Admin
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-[#574141]">
            <span className="flex items-center gap-1.5 bg-[#f6f3ee] border border-[#debfbf] px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Mode Admin
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}
