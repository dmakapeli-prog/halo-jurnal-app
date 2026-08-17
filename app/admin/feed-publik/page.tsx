'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AdminFeedPublikPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<any[]>([])

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJenis, setSelectedJenis] = useState('Semua Jenis')
  const [selectedStatus, setSelectedStatus] = useState('Semua Status')

  useEffect(() => {
    fetchAdminFeed()
  }, [searchQuery, selectedJenis, selectedStatus])

  const fetchAdminFeed = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('laporan')
        .select(`
          *,
          profiles:user_id(full_name, phone, role, ktp_photo_url, ktp_verified),
          chat_messages(count)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (selectedJenis !== 'Semua Jenis') {
        query = query.eq('jenis', selectedJenis.toLowerCase())
      }

      if (selectedStatus !== 'Semua Status') {
        query = query.eq('status', selectedStatus.toLowerCase())
      }

      if (searchQuery.trim()) {
        query = query.or(`judul.ilike.%${searchQuery}%,lokasi.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query
      if (data && data.length > 0) {
        setReports(data)
      } else {
        const demoAdminFeed = [
          { id: '1', ticket_number: 'JS-20260728-5266', judul: 'data anggaran kebersihan 2025', jenis: 'informasi', kategori: 'Anggaran', lokasi: 'Kota Sukabumi', created_at: '2026-07-28T10:00:00Z', status: 'ditindaklanjuti', is_public: true, profiles: { full_name: 'Eman Sulaeman', phone: '08123456789', role: 'citizen', ktp_verified: true } },
          { id: '2', ticket_number: 'JS-20260725-5868', judul: 'jalan rusak testing saja', jenis: 'pengaduan', kategori: 'Infrastruktur', lokasi: 'Cikole, Sukabumi', created_at: '2026-07-25T14:30:00Z', status: 'diterima', is_public: true, profiles: { full_name: 'Ujang Herlan', phone: '08571234567', role: 'citizen', ktp_verified: true } },
          { id: '3', ticket_number: 'JS-20260723-1879', judul: 'Gotong Royong Bersihkan Sungai RW 05', jenis: 'inspirasi', kategori: 'Gotong Royong', lokasi: 'Baros, Sukabumi', created_at: '2026-07-23T11:00:00Z', status: 'selesai', is_public: true, profiles: { full_name: 'Nofa Apekariasnya', phone: '08134455667', role: 'citizen', ktp_verified: true } }
        ]
        setReports(demoAdminFeed)
      }
    } catch (err) {
      console.error('Error fetching admin feed:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'selesai':
        return (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit border border-green-300">
            <span className="material-symbols-outlined text-sm">check_circle</span> Selesai / Tayang
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
    <div className="space-y-6 font-['Public_Sans']">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-6 rounded-2xl border border-[#debfbf] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 bg-[#6b0218] text-white rounded-full text-xs font-bold tracking-widest uppercase">
              Admin Feed View
            </span>
            <span className="text-xs text-[#574141] font-semibold">Feed Publik Terbuka dengan Identitas Pelapor</span>
          </div>
          <h1 className="font-['Libre_Franklin'] text-2xl sm:text-3xl font-bold text-[#1c1c19]">
            Feed Publik Mode Admin
          </h1>
        </div>
        <button
          onClick={fetchAdminFeed}
          className="bg-[#f6f3ee] text-[#6b0218] border border-[#debfbf] px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#6b0218] hover:text-white transition-all flex items-center gap-2 cursor-pointer w-fit"
        >
          <span className="material-symbols-outlined text-sm">refresh</span> Refresh Data
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#debfbf] shadow-sm mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex items-center bg-[#fcf9f4] border border-[#debfbf] rounded-xl px-3 py-2 flex-1 min-w-[240px]">
          <span className="material-symbols-outlined text-[#574141] mr-2">search</span>
          <input
            type="text"
            placeholder="Cari judul, lokasi, atau pelapor di Feed Publik..."
            className="bg-transparent border-none outline-none text-sm text-[#1c1c19] w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
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
        </div>
      </div>

      {/* Table Data for Admin */}
      <div className="bg-white rounded-2xl border border-[#debfbf] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f6f3ee] border-b border-[#debfbf] text-[#574141] text-xs uppercase font-bold tracking-wider">
                <th className="py-4 px-6">Laporan Publik</th>
                <th className="py-4 px-6">Identitas Asli Pelapor</th>
                <th className="py-4 px-6">Jenis & Kategori</th>
                <th className="py-4 px-6">Lokasi</th>
                <th className="py-4 px-6">Tanggal</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#debfbf]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#574141]">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6b0218] mb-2"></div>
                    <p className="text-sm">Memuat data feed publik admin...</p>
                  </td>
                </tr>
              ) : reports.length > 0 ? (
                reports.map((r) => {
                  const reporterName = r.profiles?.full_name || 'Pelapor Terdaftar'
                  const reporterPhone = r.profiles?.phone || '-'

                  return (
                    <tr key={r.id} className="hover:bg-[#fcf9f4] transition-colors group">
                      <td className="py-4 px-6 max-w-xs">
                        <Link href={`/admin/laporan/${r.id}`} className="font-bold text-[#1c1c19] group-hover:text-[#6b0218] transition-colors line-clamp-2 text-sm block">
                          {r.judul}
                        </Link>
                        <span className="text-xs text-[#6b0218] font-bold">#{r.ticket_number || r.id.substring(0, 8)}</span>
                      </td>

                      <td className="py-4 px-6">
                        <p className="font-bold text-sm text-[#1c1c19]">{reporterName}</p>
                        <p className="text-xs text-[#6b0218] font-semibold">Telp: {reporterPhone}</p>
                        {r.profiles?.ktp_verified && (
                          <span className="inline-block mt-0.5 text-[9px] bg-green-100 text-green-800 border border-green-300 font-bold px-1.5 py-0.5 rounded">
                            ✓ KTP Valid
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <span className="text-xs font-bold px-2 py-0.5 bg-[#6b0218]/10 text-[#6b0218] rounded uppercase block w-fit mb-1">
                          {r.jenis}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 bg-[#f6f3ee] rounded border border-[#debfbf] text-[#1c1c19] inline-block">
                          {r.kategori}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-xs text-[#574141] max-w-[150px] truncate">
                        {r.lokasi || '-'}
                      </td>

                      <td className="py-4 px-6 text-xs text-[#574141] whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>

                      <td className="py-4 px-6">
                        {getStatusBadge(r.status)}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <Link
                          href={`/admin/laporan/${r.id}`}
                          className="bg-[#6b0218] text-white px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-[#8b1e2c] transition-colors inline-flex items-center gap-1 shadow-sm"
                        >
                          Kelola / Detail <span className="material-symbols-outlined text-xs">arrow_forward</span>
                        </Link>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#574141]">
                    <span className="material-symbols-outlined text-4xl text-[#debfbf] mb-2">search_off</span>
                    <p className="font-semibold text-sm text-[#1c1c19]">Tidak ada laporan publik ditemukan</p>
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
