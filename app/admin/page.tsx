'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<any[]>([])
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori')
  const [selectedStatus, setSelectedStatus] = useState('Semua Status')
  const [selectedJenis, setSelectedJenis] = useState('Semua Jenis')

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    diterima: 0,
    diproses: 0,
    ditindaklanjuti: 0,
    selesai: 0
  })

  useEffect(() => {
    fetchAdminReports()
  }, [searchQuery, selectedCategory, selectedStatus, selectedJenis])

  const fetchAdminReports = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('laporan')
        .select(`
          *,
          profiles:user_id(full_name, email, role),
          chat_messages(id, read_at, sender_id)
        `)
        .order('created_at', { ascending: false })

      if (selectedCategory !== 'Semua Kategori') {
        query = query.eq('kategori', selectedCategory)
      }

      if (selectedStatus !== 'Semua Status') {
        query = query.eq('status', selectedStatus.toLowerCase())
      }

      if (selectedJenis !== 'Semua Jenis') {
        query = query.eq('jenis', selectedJenis.toLowerCase())
      }

      if (searchQuery.trim()) {
        query = query.or(`judul.ilike.%${searchQuery}%,lokasi.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query

      if (data) {
        setReports(data)

        // Calculate stats
        const total = data.length
        const diterima = data.filter((r: any) => r.status === 'diterima').length
        const diproses = data.filter((r: any) => r.status === 'diproses').length
        const ditindaklanjuti = data.filter((r: any) => r.status === 'ditindaklanjuti').length
        const selesai = data.filter((r: any) => r.status === 'selesai').length

        setStats({ total, diterima, diproses, ditindaklanjuti, selesai })
      }
    } catch (err) {
      console.error('Error fetching admin reports:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'selesai':
        return (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit border border-green-300">
            <span className="material-symbols-outlined text-sm">check_circle</span> Selesai
          </span>
        )
      case 'ditindaklanjuti':
        return (
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit border border-purple-300">
            <span className="material-symbols-outlined text-sm">gavel</span> Ditindaklanjuti
          </span>
        )
      case 'diproses':
        return (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit border border-yellow-300">
            <span className="w-2 h-2 rounded-full bg-yellow-600 animate-pulse"></span> Diproses
          </span>
        )
      case 'diterima':
      default:
        return (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit border border-blue-300">
            <span className="material-symbols-outlined text-sm">inbox</span> Diterima
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-[#debfbf] shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 bg-[#8b1e2c] text-white rounded-full text-xs font-bold tracking-widest uppercase">
                Control Panel Admin
              </span>
              <span className="text-xs text-[#574141] font-semibold">Portal Kelola Aspirasi & Pengaduan</span>
            </div>
            <h1 className="font-['Libre_Franklin'] text-2xl sm:text-3xl font-bold text-[#1c1c19]">
              Dashboard Pengelolaan Laporan
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdminReports}
              className="bg-[#f6f3ee] text-[#6b0218] border border-[#debfbf] px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#6b0218] hover:text-white transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">refresh</span> Refresh Data
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-[#debfbf] shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-[#574141] uppercase tracking-wider">Total Laporan</span>
              <div className="w-8 h-8 rounded-full bg-[#6b0218]/10 text-[#6b0218] flex items-center justify-center">
                <span className="material-symbols-outlined text-base">assignment</span>
              </div>
            </div>
            <p className="text-3xl font-bold font-['Libre_Franklin'] text-[#1c1c19]">{stats.total}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#debfbf] shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Diterima</span>
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-base">inbox</span>
              </div>
            </div>
            <p className="text-3xl font-bold font-['Libre_Franklin'] text-[#1c1c19]">{stats.diterima}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#debfbf] shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-yellow-700 uppercase tracking-wider">Diproses</span>
              <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-base">pending</span>
              </div>
            </div>
            <p className="text-3xl font-bold font-['Libre_Franklin'] text-[#1c1c19]">{stats.diproses}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#debfbf] shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Ditindaklanjuti</span>
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-base">gavel</span>
              </div>
            </div>
            <p className="text-3xl font-bold font-['Libre_Franklin'] text-[#1c1c19]">{stats.ditindaklanjuti}</p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#debfbf] shadow-sm col-span-2 sm:col-span-1">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Selesai</span>
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-base">check_circle</span>
              </div>
            </div>
            <p className="text-3xl font-bold font-['Libre_Franklin'] text-[#1c1c19]">{stats.selesai}</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-5 rounded-2xl border border-[#debfbf] shadow-sm mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex items-center bg-[#fcf9f4] border border-[#debfbf] rounded-xl px-3 py-2 flex-1 min-w-[240px]">
            <span className="material-symbols-outlined text-[#574141] mr-2">search</span>
            <input
              type="text"
              placeholder="Cari judul laporan, lokasi, atau nama pelapor..."
              className="bg-transparent border-none outline-none text-sm text-[#1c1c19] w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              className="bg-[#f6f3ee] border border-[#debfbf] rounded-xl px-3 py-2 text-sm font-semibold text-[#1c1c19] outline-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option>Semua Kategori</option>
              <option>Infrastruktur</option>
              <option>Pelayanan Publik</option>
              <option>Kesehatan</option>
              <option>Keamanan</option>
            </select>

            <select
              className="bg-[#f6f3ee] border border-[#debfbf] rounded-xl px-3 py-2 text-sm font-semibold text-[#1c1c19] outline-none"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option>Semua Status</option>
              <option>Diterima</option>
              <option>Diproses</option>
              <option>Ditindaklanjuti</option>
              <option>Selesai</option>
            </select>

            <select
              className="bg-[#f6f3ee] border border-[#debfbf] rounded-xl px-3 py-2 text-sm font-semibold text-[#1c1c19] outline-none"
              value={selectedJenis}
              onChange={(e) => setSelectedJenis(e.target.value)}
            >
              <option>Semua Jenis</option>
              <option>Pengaduan</option>
              <option>Aspirasi</option>
              <option>Informasi</option>
              <option>Inspirasi</option>
            </select>
          </div>
        </div>

        {/* Reports Data Table */}
        <div className="bg-white rounded-2xl border border-[#debfbf] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f6f3ee] border-b border-[#debfbf] text-[#574141] text-xs uppercase font-bold tracking-wider">
                  <th className="py-4 px-6">Laporan & Ticket ID</th>
                  <th className="py-4 px-6">Pelapor (Identitas Asli)</th>
                  <th className="py-4 px-6">Kategori</th>
                  <th className="py-4 px-6">Instansi Tujuan (Konteks)</th>
                  <th className="py-4 px-6">Tanggal</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Chat</th>
                  <th className="py-4 px-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#debfbf]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#574141]">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6b0218] mb-2"></div>
                      <p className="text-sm">Memuat data laporan...</p>
                    </td>
                  </tr>
                ) : reports.length > 0 ? (
                  reports.map((r) => {
                    const totalChat = r.chat_messages ? r.chat_messages.length : 0
                    const unreadChat = r.chat_messages
                      ? r.chat_messages.filter((m: any) => !m.read_at && m.sender_id === r.user_id).length
                      : 0
                    const reporterName = r.profiles?.full_name || 'Pelapor Terdaftar'
                    const reporterEmail = r.profiles?.email || '-'
                    const targetInstansi = r.instansi_tujuan || r.tujuan || 'PT Media Jurnal Sukabumi'

                    return (
                      <tr key={r.id} className="hover:bg-[#fcf9f4] transition-colors group">
                        <td className="py-4 px-6 max-w-xs">
                          <Link href={`/admin/laporan/${r.id}`} className="font-bold text-[#1c1c19] group-hover:text-[#6b0218] transition-colors line-clamp-1 text-sm block">
                            {r.judul}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-[#6b0218] font-bold">#{r.ticket_number || r.id.substring(0, 8)}</span>
                            {r.is_public ? (
                              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">Publik</span>
                            ) : (
                              <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-bold">Privat</span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <p className="font-semibold text-sm text-[#1c1c19]">{reporterName}</p>
                          <p className="text-xs text-[#574141]">{reporterEmail}</p>
                        </td>

                        <td className="py-4 px-6">
                          <span className="text-xs font-semibold px-2.5 py-1 bg-[#f6f3ee] rounded border border-[#debfbf] text-[#1c1c19] inline-block">
                            {r.kategori}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <span className="text-xs text-[#574141] font-semibold bg-gray-100 px-2 py-1 rounded">
                            {targetInstansi}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-xs text-[#574141] whitespace-nowrap">
                          {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>

                        <td className="py-4 px-6">
                          {getStatusBadge(r.status)}
                        </td>

                        <td className="py-4 px-6 text-center">
                          <Link
                            href={`/admin/laporan/${r.id}#chat-panel`}
                            title="Buka Chat dengan Pelapor"
                            className="inline-block transition-transform hover:scale-105 cursor-pointer"
                          >
                            {unreadChat > 0 ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition-colors animate-pulse">
                                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>mark_chat_unread</span>
                                {unreadChat} Baru
                              </span>
                            ) : totalChat > 0 ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-[#ffe08e] text-[#241a00] hover:bg-[#fed255] transition-colors border border-[#debfbf] shadow-sm">
                                <span className="material-symbols-outlined text-sm">forum</span>
                                {totalChat} Pesan
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors border border-gray-200">
                                <span className="material-symbols-outlined text-sm">chat_bubble_outline</span>
                                Balas
                              </span>
                            )}
                          </Link>
                        </td>

                        <td className="py-4 px-6 text-center">
                          <Link
                            href={`/admin/laporan/${r.id}`}
                            className="bg-[#6b0218] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#8b1e2c] transition-colors inline-flex items-center gap-1 shadow-sm"
                          >
                            Kelola <span className="material-symbols-outlined text-xs">arrow_forward</span>
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#574141]">
                      <span className="material-symbols-outlined text-4xl text-[#debfbf] mb-2">search_off</span>
                      <p className="font-semibold text-sm text-[#1c1c19]">Tidak ada laporan ditemukan</p>
                      <p className="text-xs text-[#574141] mt-1">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  )
}
