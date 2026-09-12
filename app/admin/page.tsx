'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [allReports, setAllReports] = useState<any[]>([])

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori')
  const [selectedStatus, setSelectedStatus] = useState('Semua Status')
  const [selectedJenis, setSelectedJenis] = useState('Semua Jenis')
  const [dateSortOrder, setDateSortOrder] = useState<'desc' | 'asc'>('desc')

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    diterima: 0,
    diproses: 0,
    ditindaklanjuti: 0,
    selesai: 0,
  })

  const [currentProfile, setCurrentProfile] = useState<any>(null)
  const [isFixingRole, setIsFixingRole] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    fetchAdminReports()
  }, [])

  const handleMakeMeAdmin = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return
    setIsFixingRole(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id)

      if (error) throw error

      alert('Role akun Anda telah diaktifkan menjadi Admin! Data laporan akan dimuat.')
      fetchAdminReports()
    } catch (err: any) {
      alert(`Gagal memperbarui role: ${err.message}`)
    } finally {
      setIsFixingRole(false)
    }
  }

  const fetchAdminReports = async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (prof) setCurrentProfile(prof)
      }

      const { data, error } = await supabase
        .from('laporan')
        .select(`
          *,
          profiles:user_id(full_name, phone, role, ktp_photo_url, ktp_verified),
          chat_messages(id, sender_id, created_at)
        `)
        .order('created_at', { ascending: false })

      let resolvedData = data

      // Fallback jika kueri relasi bertingkat gagal
      if (error && error.message) {
        console.warn('Primary query failed, attempting simplified query fallback...', error)
        const fallbackRes = await supabase
          .from('laporan')
          .select('*')
          .order('created_at', { ascending: false })

        if (fallbackRes.data) {
          resolvedData = fallbackRes.data
        } else {
          setFetchError(error.message)
        }
      }

      if (resolvedData) {
        setAllReports(resolvedData)

        // Hitung statistik keseluruhan
        const total = resolvedData.length
        const diterima = resolvedData.filter((r: any) => (r.status || '').toLowerCase() === 'diterima').length
        const diproses = resolvedData.filter((r: any) => (r.status || '').toLowerCase() === 'diproses').length
        const ditindaklanjuti = resolvedData.filter(
          (r: any) => (r.status || '').toLowerCase() === 'ditindaklanjuti'
        ).length
        const selesai = resolvedData.filter((r: any) => (r.status || '').toLowerCase() === 'selesai').length

        setStats({ total, diterima, diproses, ditindaklanjuti, selesai })
      }
    } catch (err: any) {
      console.error('Error fetching admin reports:', err)
      setFetchError(err.message || 'Terjadi kesalahan saat memuat data laporan.')
    } finally {
      setLoading(false)
    }
  }

  // Real-time instant filtering & sorting
  const filteredAndSortedReports = useMemo(() => {
    let result = [...allReports]

    // 1. Filter Kategori
    if (selectedCategory !== 'Semua Kategori') {
      result = result.filter((r) => r.kategori === selectedCategory)
    }

    // 2. Filter Status
    if (selectedStatus !== 'Semua Status') {
      result = result.filter((r) => (r.status || '').toLowerCase() === selectedStatus.toLowerCase())
    }

    // 3. Filter Jenis
    if (selectedJenis !== 'Semua Jenis') {
      result = result.filter((r) => (r.jenis || '').toLowerCase() === selectedJenis.toLowerCase())
    }

    // 4. Pencarian Real-time (Judul, Lokasi, Deskripsi, No Tiket, Nama Pelapor, Telepon, Instansi)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((r) => {
        const judul = (r.judul || '').toLowerCase()
        const lokasi = (r.lokasi || '').toLowerCase()
        const deskripsi = (r.deskripsi || '').toLowerCase()
        const ticket = (r.ticket_number || r.id || '').toLowerCase()
        const namaPelapor = (r.profiles?.full_name || '').toLowerCase()
        const telpPelapor = (r.profiles?.phone || '').toLowerCase()
        const instansi = (r.instansi_tujuan || r.tujuan || '').toLowerCase()
        return (
          judul.includes(q) ||
          lokasi.includes(q) ||
          deskripsi.includes(q) ||
          ticket.includes(q) ||
          namaPelapor.includes(q) ||
          telpPelapor.includes(q) ||
          instansi.includes(q)
        )
      })
    }

    // 5. Sortir Tanggal (Terbaru / Terlama)
    result.sort((a, b) => {
      const timeA = new Date(a.created_at).getTime() || 0
      const timeB = new Date(b.created_at).getTime() || 0
      return dateSortOrder === 'desc' ? timeB - timeA : timeA - timeB
    })

    return result
  }, [allReports, searchQuery, selectedCategory, selectedStatus, selectedJenis, dateSortOrder])

  const isFilterActive =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'Semua Kategori' ||
    selectedStatus !== 'Semua Status' ||
    selectedJenis !== 'Semua Jenis' ||
    dateSortOrder !== 'desc'

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCategory('Semua Kategori')
    setSelectedStatus('Semua Status')
    setSelectedJenis('Semua Jenis')
    setDateSortOrder('desc')
  }

  const toggleDateSort = () => {
    setDateSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
  }

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase()
    switch (s) {
      case 'selesai':
        return (
          <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border border-emerald-300/80 shadow-xs">
            <span
              className="material-symbols-outlined text-sm text-emerald-600"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <span>Selesai</span>
          </span>
        )
      case 'ditindaklanjuti':
        return (
          <span className="bg-purple-50 text-purple-800 px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border border-purple-300/80 shadow-xs">
            <span className="material-symbols-outlined text-sm text-purple-600">gavel</span>
            <span>Ditindaklanjuti</span>
          </span>
        )
      case 'diproses':
        return (
          <span className="bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border border-amber-300/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Diproses</span>
          </span>
        )
      case 'diterima':
      default:
        return (
          <span className="bg-blue-50 text-blue-800 px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border border-blue-300/80 shadow-xs">
            <span className="material-symbols-outlined text-sm text-blue-600">inbox</span>
            <span>Diterima</span>
          </span>
        )
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#debfbf] shadow-sm">
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
      </div>

      {/* Error banner if query fails */}
      {fetchError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-600 text-2xl">error</span>
            <div>
              <p className="font-bold text-sm text-red-900">Gagal Memuat Data Supabase</p>
              <p className="text-xs text-red-800">{fetchError}</p>
            </div>
          </div>
          <button
            onClick={fetchAdminReports}
            className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors shrink-0 cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Warning banner if Admin role not active */}
      {(!currentProfile || (currentProfile.role !== 'admin' && currentProfile.role !== 'superadmin')) && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-600 text-2xl">warning</span>
            <div>
              <p className="font-bold text-sm text-amber-900">Perhatian: Role Akun Belum Terdaftar Sebagai Admin / RLS Aktif</p>
              <p className="text-xs text-amber-800">
                Sistem Supabase RLS menyembunyikan data laporan privat jika role akun di tabel profiles bukan Admin. Aktifkan role Admin agar seluruh data laporan dan chat muncul.
              </p>
            </div>
          </div>
          <button
            onClick={handleMakeMeAdmin}
            disabled={isFixingRole}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isFixingRole ? 'Memproses...' : 'Aktifkan Role Admin Akun Ini'}
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#debfbf] shadow-sm min-w-0">
          <div className="flex justify-between items-start mb-2 gap-2">
            <span className="text-[10px] sm:text-xs font-bold text-[#574141] uppercase tracking-wider truncate min-w-0" title="Total Laporan">
              Total Laporan
            </span>
            <div className="w-8 h-8 rounded-full bg-[#6b0218]/10 text-[#6b0218] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base">assignment</span>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-['Libre_Franklin'] text-[#1c1c19]">{stats.total}</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#debfbf] shadow-sm min-w-0">
          <div className="flex justify-between items-start mb-2 gap-2">
            <span className="text-[10px] sm:text-xs font-bold text-blue-700 uppercase tracking-wider truncate min-w-0" title="Diterima">
              Diterima
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base">inbox</span>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-['Libre_Franklin'] text-[#1c1c19]">{stats.diterima}</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#debfbf] shadow-sm min-w-0">
          <div className="flex justify-between items-start mb-2 gap-2">
            <span className="text-[10px] sm:text-xs font-bold text-amber-700 uppercase tracking-wider truncate min-w-0" title="Diproses">
              Diproses
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base">pending</span>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-['Libre_Franklin'] text-[#1c1c19]">{stats.diproses}</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#debfbf] shadow-sm min-w-0">
          <div className="flex justify-between items-start mb-2 gap-2">
            <span className="text-[10px] sm:text-xs font-bold text-purple-700 uppercase tracking-wider truncate min-w-0" title="Ditindaklanjuti">
              Ditindaklanjuti
            </span>
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base">gavel</span>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-['Libre_Franklin'] text-[#1c1c19]">{stats.ditindaklanjuti}</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#debfbf] shadow-sm col-span-2 sm:col-span-1 min-w-0">
          <div className="flex justify-between items-start mb-2 gap-2">
            <span className="text-[10px] sm:text-xs font-bold text-emerald-700 uppercase tracking-wider truncate min-w-0" title="Selesai">
              Selesai
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-base">check_circle</span>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-['Libre_Franklin'] text-[#1c1c19]">{stats.selesai}</p>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white p-5 rounded-2xl border border-[#debfbf] shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Real-time Search Input */}
          <div className="flex items-center bg-[#fcf9f4] border border-[#debfbf] rounded-xl px-3.5 py-2 flex-1 min-w-[260px] focus-within:border-[#6b0218] transition-colors">
            <span className="material-symbols-outlined text-[#574141] text-lg mr-2 shrink-0">search</span>
            <input
              type="text"
              placeholder="Cari judul laporan, lokasi, no tiket, atau nama pelapor..."
              className="bg-transparent border-none outline-none text-sm text-[#1c1c19] w-full placeholder:text-[#574141]/60"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[#574141] hover:text-[#1c1c19] p-0.5 rounded-full hover:bg-[#eae4dc] transition-colors shrink-0 cursor-pointer"
                title="Hapus pencarian"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <select
                className="bg-[#f6f3ee] border border-[#debfbf] rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#1c1c19] outline-none cursor-pointer hover:border-[#6b0218]/50 transition-colors pr-8 appearance-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option>Semua Kategori</option>
                <option>Infrastruktur</option>
                <option>Pelayanan Publik</option>
                <option>Kesehatan</option>
                <option>Keamanan</option>
              </select>
              <span className="material-symbols-outlined text-sm text-[#574141] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>

            <div className="relative">
              <select
                className="bg-[#f6f3ee] border border-[#debfbf] rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#1c1c19] outline-none cursor-pointer hover:border-[#6b0218]/50 transition-colors pr-8 appearance-none"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option>Semua Status</option>
                <option>Diterima</option>
                <option>Diproses</option>
                <option>Ditindaklanjuti</option>
                <option>Selesai</option>
              </select>
              <span className="material-symbols-outlined text-sm text-[#574141] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>

            <div className="relative">
              <select
                className="bg-[#f6f3ee] border border-[#debfbf] rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#1c1c19] outline-none cursor-pointer hover:border-[#6b0218]/50 transition-colors pr-8 appearance-none"
                value={selectedJenis}
                onChange={(e) => setSelectedJenis(e.target.value)}
              >
                <option>Semua Jenis</option>
                <option>Pengaduan</option>
                <option>Aspirasi</option>
                <option>Informasi</option>
                <option>Inspirasi</option>
              </select>
              <span className="material-symbols-outlined text-sm text-[#574141] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Feedback UX & Search Results Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#574141] bg-[#f8f5ee] border border-[#debfbf] px-4 py-2.5 rounded-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="material-symbols-outlined text-base text-[#6b0218]">table_rows</span>
            <span>
              Menampilkan <strong className="text-[#1c1c19]">{filteredAndSortedReports.length}</strong> dari{' '}
              <strong className="text-[#1c1c19]">{allReports.length}</strong> laporan
            </span>
            {isFilterActive && (
              <span className="inline-flex items-center gap-1 bg-[#6b0218]/10 text-[#6b0218] px-2 py-0.5 rounded-full font-bold text-[11px]">
                Filter Aktif
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-[#debfbf] text-[#574141] hover:text-[#6b0218] hover:border-[#6b0218]/50 font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                Reset Filter
              </button>
            )}
            <button
              type="button"
              onClick={fetchAdminReports}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-[#debfbf] text-[#574141] hover:text-[#1c1c19] font-bold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
              title="Muat ulang data dari Supabase"
            >
              <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>refresh</span>
              Segarkan
            </button>
          </div>
        </div>
      </div>

      {/* Reports Data Table */}
      <div className="bg-white rounded-2xl border border-[#debfbf] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f6f3ee] border-b border-[#debfbf] text-[#574141] text-xs uppercase font-bold tracking-wider">
                <th className="py-3.5 px-4 sm:px-5 min-w-[220px]">Laporan & Ticket ID</th>
                <th className="py-3.5 px-4 min-w-[160px]">Pelapor (Identitas Asli)</th>
                <th className="py-3.5 px-4 min-w-[130px]">Kategori & Jenis</th>
                <th className="py-3.5 px-4 min-w-[140px]">Instansi Tujuan</th>
                <th className="py-3.5 px-4 min-w-[130px]">
                  {/* Sortable Tanggal Header */}
                  <button
                    type="button"
                    onClick={toggleDateSort}
                    className="inline-flex items-center gap-1 text-xs uppercase font-bold tracking-wider text-[#574141] hover:text-[#1c1c19] transition-colors cursor-pointer group select-none"
                    title={`Urutkan berdasarkan tanggal (${dateSortOrder === 'desc' ? 'Terbaru ke Terlama' : 'Terlama ke Terbaru'})`}
                  >
                    <span>Tanggal</span>
                    <span
                      className={`material-symbols-outlined text-base transition-transform text-[#6b0218] ${
                        dateSortOrder === 'asc' ? 'rotate-180' : ''
                      }`}
                    >
                      south
                    </span>
                    <span className="text-[10px] font-normal lowercase opacity-75 text-[#574141]">
                      ({dateSortOrder === 'desc' ? 'terbaru' : 'terlama'})
                    </span>
                  </button>
                </th>
                <th className="py-3.5 px-4 min-w-[130px]">Status</th>
                <th className="py-3.5 px-4 min-w-[120px] text-center">Chat</th>
                <th className="py-3.5 px-4 min-w-[110px] text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#debfbf]/80">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#574141]">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6b0218] mb-2"></div>
                    <p className="text-sm">Memuat data laporan...</p>
                  </td>
                </tr>
              ) : filteredAndSortedReports.length > 0 ? (
                filteredAndSortedReports.map((r) => {
                  const totalChat = r.chat_messages ? r.chat_messages.length : 0
                  const unreadChat = r.chat_messages
                    ? r.chat_messages.filter((m: any) => m.read_at !== undefined && !m.read_at && m.sender_id === r.user_id).length
                    : 0
                  const reporterName = r.profiles?.full_name || 'Pelapor Terdaftar'
                  const reporterPhone = r.profiles?.phone ? `Telp: ${r.profiles.phone}` : r.profiles?.role || 'Citizen'
                  const targetInstansi = r.instansi_tujuan || r.tujuan || 'PT Media Jurnal Sukabumi'

                  return (
                    <tr key={r.id} className="hover:bg-[#fcf9f4] transition-colors group">
                      {/* 1. Laporan & Ticket */}
                      <td className="py-3.5 px-4 sm:px-5 max-w-xs">
                        <Link
                          href={`/admin/laporan/${r.id}`}
                          className="font-bold text-[#1c1c19] group-hover:text-[#6b0218] transition-colors line-clamp-1 text-sm block"
                          title={r.judul}
                        >
                          {r.judul}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs text-[#6b0218] font-bold">
                            #{r.ticket_number || r.id.substring(0, 8)}
                          </span>
                          {r.is_public ? (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                              Publik
                            </span>
                          ) : (
                            <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded font-bold">
                              Privat
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 2. Pelapor */}
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-sm text-[#1c1c19] line-clamp-1">{reporterName}</p>
                        <p className="text-xs text-[#574141] truncate max-w-[150px]">{reporterPhone}</p>
                        {r.profiles?.ktp_verified && (
                          <span className="inline-block mt-0.5 text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-1.5 py-0.5 rounded">
                            ✓ KTP Valid
                          </span>
                        )}
                      </td>

                      {/* 3. Kategori & Jenis */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-semibold px-2.5 py-1 bg-[#f6f3ee] rounded-lg border border-[#debfbf] text-[#1c1c19] inline-block">
                          {r.kategori}
                        </span>
                        {r.jenis && (
                          <span className="block mt-1 text-[10px] font-semibold text-[#574141] capitalize">
                            Jenis: {r.jenis}
                          </span>
                        )}
                      </td>

                      {/* 4. Instansi Tujuan */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs text-[#574141] font-semibold bg-stone-100 border border-stone-200/60 px-2 py-1 rounded-lg inline-block line-clamp-1" title={targetInstansi}>
                          {targetInstansi}
                        </span>
                      </td>

                      {/* 5. Tanggal */}
                      <td className="py-3.5 px-4 text-xs text-[#574141] whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* 6. Status */}
                      <td className="py-3.5 px-4">{getStatusBadge(r.status)}</td>

                      {/* 7. Chat (Standardized Badge) */}
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/admin/laporan/${r.id}#chat-panel`}
                          title="Buka Chat dengan Pelapor"
                          className="inline-block transition-transform hover:scale-105 cursor-pointer"
                        >
                          {unreadChat > 0 ? (
                            <span
                              className="h-8 min-w-[105px] px-3 rounded-full inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-rose-600 text-white shadow-xs ring-1 ring-rose-500/50 hover:bg-rose-700 transition-colors animate-pulse"
                              title={`${unreadChat} pesan baru belum dibaca`}
                            >
                              <span
                                className="material-symbols-outlined text-[15px]"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                mark_chat_unread
                              </span>
                              <span>{unreadChat} Baru</span>
                            </span>
                          ) : totalChat > 0 ? (
                            <span
                              className="h-8 min-w-[105px] px-3 rounded-full inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-[#fff2d1] text-[#735a00] border border-[#f0c868] hover:bg-[#ffe6a4] transition-colors shadow-xs"
                              title={`${totalChat} total pesan diskusi`}
                            >
                              <span className="material-symbols-outlined text-[15px]">forum</span>
                              <span>{totalChat} Pesan</span>
                            </span>
                          ) : (
                            <span
                              className="h-8 min-w-[105px] px-3 rounded-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold bg-stone-100 text-[#574141] hover:bg-stone-200 border border-stone-200/80 transition-colors"
                              title="Belum ada pesan, klik untuk balas"
                            >
                              <span className="material-symbols-outlined text-[15px]">chat_bubble_outline</span>
                              <span>Balas</span>
                            </span>
                          )}
                        </Link>
                      </td>

                      {/* 8. Aksi (Modern Kelola Button) */}
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/admin/laporan/${r.id}`}
                          className="h-8 px-3.5 rounded-xl text-xs font-semibold bg-[#701524] text-white hover:bg-[#881d2e] active:scale-95 transition-all inline-flex items-center justify-center gap-1.5 shadow-xs border border-white/10 shrink-0"
                          title="Kelola Laporan"
                        >
                          <span>Kelola</span>
                          <span className="material-symbols-outlined text-xs">arrow_forward</span>
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
                    {isFilterActive && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#6b0218] text-white text-xs font-semibold hover:bg-[#8b1e2c] transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xs">restart_alt</span>
                        Reset Semua Filter
                      </button>
                    )}
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
