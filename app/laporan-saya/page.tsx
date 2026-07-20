'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

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
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
        fetchProfile(data.user.id)
      }
    })
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
      .select('*, komentar(count)')
      .eq('user_id', user.id)

    if (statusFilter !== 'Semua Status') {
      const statusMap: Record<string, string> = {
        'Diterima': 'diterima',
        'Diproses': 'diproses',
        'Selesai': 'selesai',
        'Ditolak': 'ditolak'
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
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold bg-green-100 text-green-700">Selesai</span>
      case 'diproses':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold bg-yellow-100 text-yellow-700">Diproses</span>
      case 'diterima':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold bg-gray-100 text-gray-700">Diterima</span>
      case 'ditolak':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold bg-red-100 text-red-700">Ditolak</span>
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold bg-gray-100 text-gray-700 capitalize">{status}</span>
    }
  }

  // Calculate counts for stats
  const totalReports = reports.length
  const processingCount = reports.filter(r => r.status === 'diproses').length
  const completedCount = reports.filter(r => r.status === 'selesai').length
  // Example unread comment logic (simplification)
  const unreadCount = reports.reduce((acc, curr) => acc + (curr.komentar[0]?.count || 0), 0)

  return (
    <div className="bg-[#fcf9f4] text-[#1c1c19] font-['Public_Sans'] overflow-x-hidden min-h-screen">
      <Navbar showLoginButton={false} actionButton={
        <Link href="/beranda" className="bg-[#ffe08e] text-[#241a00] px-6 py-2 rounded-lg font-['Public_Sans'] text-[14px] font-semibold hover:opacity-90 transition-opacity">
          Dashboard
        </Link>
      } />

      <div className="flex pt-20 min-h-screen">
        {/* SideNavBar */}
        <aside className="fixed left-0 top-20 h-[calc(100vh-80px)] w-[280px] hidden md:flex flex-col p-[8px] bg-[#fcf9f4] border-r border-[#debfbf]">
          <div className="p-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#6b0218] bg-[#ffdad9] flex items-center justify-center text-[#6b0218]">
                {profile?.ktp_photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.ktp_photo_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined">person</span>
                )}
              </div>
              <div>
                <p className="font-['Public_Sans'] text-[14px] font-bold text-[#1c1c19]">{profile?.full_name || 'Warga'}</p>
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

        {/* Main Content */}
        <main className="md:ml-[280px] flex-1 overflow-y-auto p-4 md:p-[40px] pb-24">
          <div className="max-w-6xl mx-auto">
            {/* Header & Stats */}
            <div className="mb-6 md:mb-10 mt-4 md:mt-0">
              <h1 className="font-['Libre_Franklin'] text-[32px] font-bold text-[#1c1c19] mb-2">Laporan Saya</h1>
              <p className="text-[#574141] font-['Public_Sans'] text-[16px]">Pantau status aspirasi dan keluhan Anda secara real-time.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-[24px] mb-8 md:mb-10">
              <div className="bg-[#fcf9f4] p-4 md:p-6 rounded-xl border border-[#debfbf] shadow-sm flex items-center gap-3 md:gap-4">
                <div className="w-12 h-12 bg-[#8b1e2c]/10 rounded-full flex items-center justify-center text-[#6b0218]">
                  <span className="material-symbols-outlined">assignment</span>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#574141] uppercase tracking-wider">Total</p>
                  <p className="text-2xl font-bold">{totalReports}</p>
                </div>
              </div>
              <div className="bg-[#fcf9f4] p-6 rounded-xl border border-[#debfbf] shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-[#fed255]/20 rounded-full flex items-center justify-center text-[#755b00]">
                  <span className="material-symbols-outlined">pending</span>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#574141] uppercase tracking-wider">Proses</p>
                  <p className="text-2xl font-bold">{processingCount}</p>
                </div>
              </div>
              <div className="bg-[#fcf9f4] p-6 rounded-xl border border-[#debfbf] shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#574141] uppercase tracking-wider">Selesai</p>
                  <p className="text-2xl font-bold">{completedCount}</p>
                </div>
              </div>
              <div className="bg-[#fcf9f4] p-6 rounded-xl border border-[#debfbf] shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-[#ffdad6]/30 rounded-full flex items-center justify-center text-[#ba1a1a]">
                  <span className="material-symbols-outlined">chat</span>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#574141] uppercase tracking-wider">Komentar</p>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                </div>
              </div>
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
                  <option>Ditolak</option>
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
            <div className="hidden md:block bg-[#fcf9f4] border border-[#debfbf] rounded-xl overflow-x-auto shadow-sm">
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
                            <Link href={`/laporan/${report.id}#komentar`} className="relative text-[#574141] hover:text-[#6b0218]">
                              <span className="material-symbols-outlined text-[20px]">forum</span>
                              {(report.komentar[0]?.count || 0) > 0 && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ba1a1a] rounded-full"></span>
                              )}
                            </Link>
                            <Link href={`/laporan/${report.id}`} className="material-symbols-outlined text-[20px] text-[#574141] hover:text-[#6b0218]">
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
            <div className="md:hidden flex flex-col gap-4">
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
                        <Link href={`/laporan/${report.id}#komentar`} className="relative text-[#574141] hover:text-[#6b0218]">
                          <span className="material-symbols-outlined text-[20px]">forum</span>
                          {(report.komentar[0]?.count || 0) > 0 && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ba1a1a] rounded-full"></span>
                          )}
                        </Link>
                        <Link href={`/laporan/${report.id}`} className="material-symbols-outlined text-[20px] text-[#574141] hover:text-[#6b0218]">
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
      </div>

      <Footer />
    </div>
  )
}
