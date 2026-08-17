'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import UserAvatar from '@/components/UserAvatar'

export default function LaporanSayaPage() {
  const supabase = createClient()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  // Filter & Sort
  const [statusFilter, setStatusFilter] = useState('Semua Status')
  const [sortOrder, setSortOrder] = useState('Terbaru')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
        fetchProfile(data.user.id)
      }
    }
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchReports()
    }
  }, [user, statusFilter, sortOrder, searchQuery])

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data)
  }

  const fetchReports = async () => {
    setLoading(true)
    let query = supabase
      .from('laporan')
      .select('*, chat_messages(count)')
      .eq('user_id', user.id)

    if (statusFilter !== 'Semua Status') {
      const statusMap: Record<string, string> = {
        'Diterima': 'diterima',
        'Diproses': 'diproses',
        'Selesai': 'selesai',
        'Ditindaklanjuti': 'ditindaklanjuti'
      }
      query = query.eq('status', statusMap[statusFilter] || statusFilter.toLowerCase())
    }

    if (searchQuery) {
      query = query.or(`judul.ilike.%${searchQuery}%,deskripsi.ilike.%${searchQuery}%`)
    }

    if (sortOrder === 'Terbaru') {
      query = query.order('created_at', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: true })
    }

    const { data, error } = await query
    
    if (data) setReports(data)
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'selesai':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold bg-green-100 text-green-700 whitespace-nowrap">Selesai</span>
      case 'diproses':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold bg-yellow-100 text-yellow-700 whitespace-nowrap">Diproses</span>
      case 'diterima':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold bg-gray-100 text-gray-700 whitespace-nowrap">Diterima</span>
      case 'ditindaklanjuti':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold bg-purple-100 text-purple-700 whitespace-nowrap">Ditindaklanjuti</span>
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold bg-gray-100 text-gray-700 capitalize whitespace-nowrap">{status}</span>
    }
  }

  // Calculate counts for stats
  const allReportsUnfiltered = reports // reports is already filtered by query, we need raw counts
  const totalReports = reports.length
  const diterimaCount = reports.filter(r => r.status === 'diterima').length
  const processingCount = reports.filter(r => r.status === 'diproses').length
  const ditindaklanjutiCount = reports.filter(r => r.status === 'ditindaklanjuti').length
  const completedCount = reports.filter(r => r.status === 'selesai').length

  const statusCards = [
    { key: 'Semua Status', label: 'Total', count: totalReports, icon: 'assignment', bgIcon: 'bg-[#8b1e2c]/10', textIcon: 'text-[#6b0218]', activeBg: 'bg-[#6b0218]', activeText: 'text-white' },
    { key: 'Diterima', label: 'Diterima', count: diterimaCount, icon: 'inbox', bgIcon: 'bg-blue-100', textIcon: 'text-blue-700', activeBg: 'bg-blue-600', activeText: 'text-white' },
    { key: 'Diproses', label: 'Diproses', count: processingCount, icon: 'pending', bgIcon: 'bg-yellow-100', textIcon: 'text-yellow-700', activeBg: 'bg-yellow-500', activeText: 'text-white' },
    { key: 'Ditindaklanjuti', label: 'Ditindaklanjuti', count: ditindaklanjutiCount, icon: 'gavel', bgIcon: 'bg-purple-100', textIcon: 'text-purple-700', activeBg: 'bg-purple-600', activeText: 'text-white' },
    { key: 'Selesai', label: 'Selesai', count: completedCount, icon: 'check_circle', bgIcon: 'bg-green-100', textIcon: 'text-green-700', activeBg: 'bg-green-600', activeText: 'text-white' },
  ]

  return (
    <div className="bg-[#fcf9f4] text-[#1c1c19] font-['Public_Sans'] overflow-x-hidden min-h-screen">
      <Navbar showLoginButton={false} actionButton={
        <Link href="/beranda" className="bg-[#ffe08e] text-[#241a00] px-6 py-2 rounded-lg font-['Public_Sans'] text-[14px] font-semibold hover:opacity-90 transition-opacity">
          Dashboard
        </Link>
      } />

      <div className="flex pt-16 md:pt-20 min-h-screen">
        {/* SideNavBar */}
        <aside className="fixed left-0 top-16 md:top-20 h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] w-[280px] hidden lg:flex flex-col p-[8px] bg-[#fcf9f4] border-r border-[#debfbf]">
          <div className="p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <UserAvatar name={profile?.full_name || user?.user_metadata?.full_name} size="md" bgColor="gold" />
              <div>
                <p className="font-['Public_Sans'] text-[14px] font-bold text-[#1c1c19]">{profile?.full_name || user?.user_metadata?.full_name || 'Warga'}</p>
                <p className="text-[12px] text-[#574141]">Portal Aspirasi Warga</p>
              </div>
            </div>
            <Link href="/lapor" className="w-full mt-4 bg-[#fed255] text-[#735a00] py-3 rounded-lg font-['Public_Sans'] text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-[#ffe08e] transition-all">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
              Kirim Aspirasi
            </Link>
          </div>
          <nav className="flex-1 space-y-1 px-2">
            <Link href="/beranda" className="flex items-center gap-3 p-3 text-[#574141] hover:bg-[#ebe8e3] rounded-lg transition-all">
              <span className="material-symbols-outlined">dashboard</span>
              <span className="font-['Public_Sans'] text-[14px] font-semibold">Dashboard</span>
            </Link>
            <Link href="/laporan-saya" className="flex items-center gap-3 p-3 bg-[#fed255] text-[#735a00] font-bold rounded-lg transition-all">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
              <span className="font-['Public_Sans'] text-[14px]">Laporan Saya</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content & Footer Wrapper */}
        <div className="lg:ml-[280px] flex-1 flex flex-col min-h-[calc(100vh-80px)] min-w-0">
          <main className="flex-1 p-4 sm:p-5 md:p-[40px] pb-12">
            <div className="max-w-6xl mx-auto">
              {/* Header & Stats */}
            <div className="mb-6 md:mb-10 mt-4 md:mt-0">
              <h1 className="font-['Libre_Franklin'] text-[24px] sm:text-[32px] font-bold text-[#1c1c19] mb-2">Laporan Saya</h1>
              <p className="text-[#574141] font-['Public_Sans'] text-[16px]">Pantau status aspirasi dan keluhan Anda secara real-time.</p>
            </div>

            {/* Stats — 5 Clickable Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 md:gap-4 mb-8 md:mb-10">
              {statusCards.map(card => {
                const isActive = statusFilter === card.key
                return (
                  <button
                    key={card.key}
                    onClick={() => setStatusFilter(card.key)}
                    className={`p-3 sm:p-3.5 md:p-4 rounded-xl border shadow-sm flex flex-col justify-between transition-all cursor-pointer text-left min-w-0 ${
                      isActive
                        ? `${card.activeBg} ${card.activeText} border-transparent shadow-md scale-[1.02]`
                        : 'bg-[#fcf9f4] border-[#debfbf] hover:border-[#6b0218] hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 w-full mb-2">
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-white/20' : card.bgIcon
                      }`}>
                        <span className={`material-symbols-outlined text-base sm:text-lg ${isActive ? 'text-white' : card.textIcon}`}>{card.icon}</span>
                      </div>
                      <span className="text-xl sm:text-2xl font-bold">{card.count}</span>
                    </div>
                    <div className="w-full">
                      <p className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-tight leading-tight whitespace-nowrap overflow-hidden text-ellipsis ${isActive ? 'text-white/90' : 'text-[#574141]'}`} title={card.label}>
                        {card.label}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Filter Bar */}
            <div className="bg-[#fcf9f4] p-4 rounded-xl border border-[#debfbf] shadow-sm mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex flex-col md:flex-row flex-wrap items-stretch md:items-center gap-4 flex-1">
                <div className="relative flex-1 min-w-[200px] md:max-w-xs">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#574141] text-sm">search</span>
                  <input 
                    className="w-full pl-10 pr-4 py-2 border-[1.5px] border-[#8b7171] rounded-lg focus:ring-2 focus:ring-[#6b0218] focus:border-[#6b0218] text-sm bg-[#fcf9f4] outline-none" 
                    placeholder="Cari laporan..." 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select 
                  className="border-[1.5px] border-[#8b7171] rounded-lg px-4 py-2 text-sm bg-[#fcf9f4] focus:ring-2 focus:ring-[#6b0218] focus:border-[#6b0218] outline-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>Semua Status</option>
                  <option>Diterima</option>
                  <option>Diproses</option>
                  <option>Selesai</option>
                  <option>Ditindaklanjuti</option>
                </select>
                <select 
                  className="border-[1.5px] border-[#8b7171] rounded-lg px-4 py-2 text-sm bg-[#fcf9f4] focus:ring-2 focus:ring-[#6b0218] focus:border-[#6b0218] outline-none"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option>Terbaru</option>
                  <option>Terlama</option>
                </select>
              </div>
            </div>

            {/* Reports Table/List */}
            <div className="hidden lg:block bg-[#fcf9f4] border border-[#debfbf] rounded-xl overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-[#f6f3ee] border-b border-[#debfbf]">
                    <th className="px-6 py-4 font-['Public_Sans'] text-[12px] font-bold text-[#574141] uppercase tracking-wider">Laporan</th>
                    <th className="px-6 py-4 font-['Public_Sans'] text-[12px] font-bold text-[#574141] uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-4 font-['Public_Sans'] text-[12px] font-bold text-[#574141] uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-4 font-['Public_Sans'] text-[12px] font-bold text-[#574141] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-['Public_Sans'] text-[12px] font-bold text-[#574141] uppercase tracking-wider text-center">Interaksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#debfbf]">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-[#574141]">Memuat...</td>
                    </tr>
                  ) : reports.length > 0 ? (
                    reports.map(report => (
                      <tr key={report.id} className="hover:bg-white transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <Link href={`/laporan/${report.id}`} className="font-bold text-[#1c1c19] group-hover:text-[#6b0218] transition-colors line-clamp-1">
                              {report.judul}
                            </Link>
                            <span className="text-[12px] text-[#574141]">ID: {report.ticket_number || report.id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm px-2 py-1 bg-[#ebe8e3] rounded text-[#574141] whitespace-nowrap">
                            {report.kategori}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm text-[#574141] whitespace-nowrap">
                          {new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          {getStatusBadge(report.status)}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex items-center justify-center gap-4">
                            <Link href={`/laporan/${report.id}`} title="Chat Admin" className="relative text-[#574141] hover:text-[#6b0218]">
                              <span className="material-symbols-outlined text-[20px]">forum</span>
                              {(report.chat_messages?.[0]?.count || 0) > 0 && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#6b0218] rounded-full"></span>
                              )}
                            </Link>
                            <Link href={`/laporan/${report.id}`} title="Detail Laporan" className="material-symbols-outlined text-[20px] text-[#574141] hover:text-[#6b0218]">
                              visibility
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-[#574141]">Tidak ada laporan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden flex flex-col gap-4">
              {loading ? (
                <div className="text-center py-8 text-[#574141]">Memuat...</div>
              ) : reports.length > 0 ? (
                reports.map(report => (
                  <div key={report.id} className="bg-white border border-[#debfbf] rounded-xl p-4 shadow-sm flex flex-col gap-3 relative">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <Link href={`/laporan/${report.id}`} className="font-bold text-[16px] text-[#1c1c19] hover:text-[#6b0218] transition-colors line-clamp-2">
                          {report.judul}
                        </Link>
                        <span className="text-[12px] text-[#574141] mt-1">{new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-[#ebe8e3] rounded text-[#574141] truncate max-w-[120px]">
                        {report.kategori}
                      </span>
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="mt-2 pt-3 border-t border-[#debfbf] flex items-center justify-between">
                      <span className="text-[12px] text-[#574141]">ID: {report.ticket_number || report.id}</span>
                      <div className="flex items-center gap-4">
                        <Link href={`/laporan/${report.id}`} title="Chat Admin" className="relative text-[#574141] hover:text-[#6b0218]">
                          <span className="material-symbols-outlined text-[20px]">forum</span>
                          {(report.chat_messages?.[0]?.count || 0) > 0 && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#6b0218] rounded-full"></span>
                          )}
                        </Link>
                        <Link href={`/laporan/${report.id}`} title="Detail Laporan" className="material-symbols-outlined text-[20px] text-[#574141] hover:text-[#6b0218]">
                          visibility
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-[#574141]">Tidak ada laporan.</div>
              )}
            </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  )
}
