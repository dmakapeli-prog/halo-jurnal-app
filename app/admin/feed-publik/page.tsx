'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AdminFeedPublikPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<any[]>([])
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedJenis, setSelectedJenis] = useState('Semua Jenis')
  const [selectedVisibility, setSelectedVisibility] = useState('Semua Visibilitas')

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    publicCount: 0,
    hiddenCount: 0,
  })

  // Public Preview Modal State
  const [previewReport, setPreviewReport] = useState<any | null>(null)

  useEffect(() => {
    fetchAdminFeed()
  }, [searchQuery, selectedJenis, selectedVisibility])

  const fetchAdminFeed = async () => {
    setLoading(true)
    try {
      // Fetch ALL reports regardless of is_public so admin can moderate any report
      let query = supabase
        .from('laporan')
        .select(`
          *,
          profiles:user_id(full_name, phone, role),
          dukungan_laporan(count)
        `)
        .order('created_at', { ascending: false })

      if (selectedJenis !== 'Semua Jenis') {
        query = query.eq('jenis', selectedJenis.toLowerCase())
      }

      if (selectedVisibility === 'Hanya Tayang di Publik') {
        query = query.eq('is_public', true)
      } else if (selectedVisibility === 'Hanya Tersembunyi (Privat)') {
        query = query.eq('is_public', false)
      }

      if (searchQuery.trim()) {
        query = query.or(`judul.ilike.%${searchQuery}%,lokasi.ilike.%${searchQuery}%`)
      }

      let { data, error } = await query

      // Fallback query if relation fails
      if (error) {
        console.warn('Primary moderation query failed, falling back...', error)
        let fallbackQuery = supabase.from('laporan').select('*').order('created_at', { ascending: false })
        if (selectedJenis !== 'Semua Jenis') fallbackQuery = fallbackQuery.eq('jenis', selectedJenis.toLowerCase())
        if (selectedVisibility === 'Hanya Tayang di Publik') fallbackQuery = fallbackQuery.eq('is_public', true)
        if (selectedVisibility === 'Hanya Tersembunyi (Privat)') fallbackQuery = fallbackQuery.eq('is_public', false)
        if (searchQuery.trim()) fallbackQuery = fallbackQuery.or(`judul.ilike.%${searchQuery}%,lokasi.ilike.%${searchQuery}%`)
        
        const fallbackRes = await fallbackQuery
        if (fallbackRes.data) data = fallbackRes.data
      }

      if (data && data.length > 0) {
        setReports(data)
        const total = data.length
        const publicCount = data.filter((r: any) => r.is_public === true).length
        const hiddenCount = data.filter((r: any) => r.is_public === false).length
        setStats({ total, publicCount, hiddenCount })
      } else {
        const demoAdminFeed = [
          {
            id: 'demo-1',
            ticket_number: 'JS-20260728-5266',
            judul: 'data anggaran kebersihan 2025',
            jenis: 'informasi',
            kategori: 'Anggaran',
            lokasi: 'Kota Sukabumi',
            deskripsi: 'Permohonan rincian data dokumen anggaran kebersihan Pemda Kota Sukabumi Tahun Anggaran 2025 untuk transparansi publik.',
            created_at: '2026-07-28T10:00:00Z',
            status: 'ditindaklanjuti',
            is_public: true,
            dukungan_count: 12,
            profiles: { full_name: 'Eman Sulaeman', role: 'citizen' }
          },
          {
            id: 'demo-2',
            ticket_number: 'JS-20260725-5868',
            judul: 'jalan rusak parah di perempatan cikole',
            jenis: 'pengaduan',
            kategori: 'Infrastruktur',
            lokasi: 'Cikole, Sukabumi',
            deskripsi: 'Kerusakan lubang jalan diameter 1 meter membahayakan pengendara motor di malam hari.',
            created_at: '2026-07-25T14:30:00Z',
            status: 'diterima',
            is_public: false,
            dukungan_count: 4,
            profiles: { full_name: 'Ujang Herlan', role: 'citizen' }
          },
          {
            id: 'demo-3',
            ticket_number: 'JS-20260723-1879',
            judul: 'Gotong Royong Bersihkan Sungai RW 05',
            jenis: 'inspirasi',
            kategori: 'Gotong Royong',
            lokasi: 'Baros, Sukabumi',
            deskripsi: 'Aksi kolaborasi pemuda RW 05 membersihkan sampah plastik di bantaran sungai.',
            created_at: '2026-07-23T11:00:00Z',
            status: 'selesai',
            is_public: true,
            dukungan_count: 28,
            profiles: { full_name: 'Nofa Apekariasnya', role: 'citizen' }
          }
        ]
        setReports(demoAdminFeed)
        setStats({ total: 3, publicCount: 2, hiddenCount: 1 })
      }
    } catch (err) {
      console.error('Error fetching admin feed moderation:', err)
    } finally {
      setLoading(false)
    }
  }

  // Toggle Moderation Action: Tayangkan / Sembunyikan
  const handleToggleVisibility = async (reportId: string, currentIsPublic: boolean) => {
    setUpdatingId(reportId)
    const targetStatus = !currentIsPublic

    try {
      if (!reportId.startsWith('demo')) {
        const { error } = await supabase
          .from('laporan')
          .update({ is_public: targetStatus })
          .eq('id', reportId)

        if (error) throw error
      }

      // Local state update for instant UI feedback
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, is_public: targetStatus } : r))
      )

      setStats((prev) => ({
        ...prev,
        publicCount: targetStatus ? prev.publicCount + 1 : prev.publicCount - 1,
        hiddenCount: targetStatus ? prev.hiddenCount - 1 : prev.hiddenCount + 1,
      }))
    } catch (err: any) {
      console.error('Error updating public visibility:', err)
      alert(`Gagal mengubah status visibilitas: ${err.message || 'Terjadi kesalahan'}`)
    } finally {
      setUpdatingId(null)
    }
  }

  // Helper function to mask reporter's name to demonstrate public perspective
  const formatPublicName = (fullName?: string) => {
    if (!fullName) return 'Pelapor Anonim (Warga)'
    const parts = fullName.trim().split(' ')
    if (parts.length === 1) {
      const name = parts[0]
      return `${name.charAt(0)}*** ${name.slice(-1)}`
    }
    return `${parts[0].charAt(0)}*** ${parts[parts.length - 1].charAt(0)}.`
  }

  return (
    <div className="space-y-6 font-['Public_Sans']">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#debfbf] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 bg-[#6b0218] text-white rounded-full text-[11px] font-bold tracking-widest uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">gavel</span> Moderasi & Sensor Publik
            </span>
            <span className="text-xs text-[#574141] font-semibold">Tampilan Perspektif Publik Warga</span>
          </div>
          <h1 className="font-['Libre_Franklin'] text-2xl sm:text-3xl font-bold text-[#1c1c19]">
            Portal Moderasi Feed Publik
          </h1>
          <p className="text-xs sm:text-sm text-[#574141] mt-1 max-w-3xl">
            Area ini khusus digunakan untuk memoderasi kelayakan tayang aspirasi warga. Nama pelapor secara otomatis disamarkan (*masked identity*) sesuai tampilan publik.
          </p>
        </div>

        <button
          onClick={fetchAdminFeed}
          className="bg-[#f6f3ee] text-[#6b0218] border border-[#debfbf] px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#6b0218] hover:text-white transition-all flex items-center gap-2 cursor-pointer w-fit shrink-0 shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">refresh</span> Segarkan Data Moderasi
        </button>
      </div>

      {/* Moderation Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#debfbf] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#574141]">Total Laporan Masuk</p>
            <p className="text-2xl font-bold font-['Libre_Franklin'] text-[#1c1c19] mt-1">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#6b0218]/10 text-[#6b0218] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined">dataset</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-green-200 bg-green-50/40 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-green-800">Tayang di Feed Publik</p>
            <p className="text-2xl font-bold font-['Libre_Franklin'] text-green-900 mt-1">{stats.publicCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-100 text-green-800 flex items-center justify-center font-bold border border-green-300">
            <span className="material-symbols-outlined">public</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Tersembunyi / Privat</p>
            <p className="text-2xl font-bold font-['Libre_Franklin'] text-amber-900 mt-1">{stats.hiddenCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold border border-amber-300">
            <span className="material-symbols-outlined">visibility_off</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white p-5 rounded-2xl border border-[#debfbf] shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex items-center bg-[#fcf9f4] border border-[#debfbf] rounded-xl px-3.5 py-2.5 flex-1 min-w-[240px]">
          <span className="material-symbols-outlined text-[#574141] mr-2 text-xl">search</span>
          <input
            type="text"
            placeholder="Cari kata kunci judul laporan atau lokasi..."
            className="bg-transparent border-none outline-none text-sm text-[#1c1c19] w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#574141] uppercase tracking-wider block">Filter Visibilitas</span>
            <select
              className="bg-[#f6f3ee] border border-[#debfbf] rounded-xl px-3 py-2 text-xs font-bold text-[#1c1c19] outline-none cursor-pointer"
              value={selectedVisibility}
              onChange={(e) => setSelectedVisibility(e.target.value)}
            >
              <option>Semua Visibilitas</option>
              <option>Hanya Tayang di Publik</option>
              <option>Hanya Tersembunyi (Privat)</option>
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#574141] uppercase tracking-wider block">Filter Jenis</span>
            <select
              className="bg-[#f6f3ee] border border-[#debfbf] rounded-xl px-3 py-2 text-xs font-bold text-[#1c1c19] outline-none cursor-pointer"
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
      </div>

      {/* Moderation Table */}
      <div className="bg-white rounded-2xl border border-[#debfbf] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f6f3ee] border-b border-[#debfbf] text-[#574141] text-xs uppercase font-bold tracking-wider">
                <th className="py-4 px-6">Konten Laporan Warga</th>
                <th className="py-4 px-6">Identitas Pelapor (Perspektif Publik)</th>
                <th className="py-4 px-6">Kategori & Jenis</th>
                <th className="py-4 px-6">Dukungan Warga</th>
                <th className="py-4 px-6">Status Tayang Saat Ini</th>
                <th className="py-4 px-6 text-center">Aksi Moderasi Langsung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#debfbf]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#574141]">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6b0218] mb-2"></div>
                    <p className="text-sm font-semibold">Memuat data portal moderasi feed...</p>
                  </td>
                </tr>
              ) : reports.length > 0 ? (
                reports.map((r) => {
                  const rawName = r.profiles?.full_name || 'Pelapor Halo Jurnal'
                  const publicMaskedName = formatPublicName(rawName)
                  const isPublic = r.is_public === true
                  const upvoteCount = r.dukungan_count || (r.dukungan_laporan ? r.dukungan_laporan.length : 0)

                  return (
                    <tr key={r.id} className="hover:bg-[#fcf9f4] transition-colors group">
                      {/* Report Content */}
                      <td className="py-4 px-6 max-w-sm">
                        <span className="text-xs text-[#6b0218] font-bold block mb-0.5">
                          #{r.ticket_number || r.id.substring(0, 8)}
                        </span>
                        <h4 className="font-bold text-[#1c1c19] text-sm group-hover:text-[#6b0218] transition-colors line-clamp-1">
                          {r.judul}
                        </h4>
                        <p className="text-xs text-[#574141] line-clamp-2 mt-1">
                          {r.deskripsi}
                        </p>
                        <p className="text-[11px] text-[#574141]/70 mt-1">
                          📍 {r.lokasi || 'Kota Sukabumi'} • {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </td>

                      {/* Anonymized Reporter Name (Public View Perspective) */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="font-bold text-sm text-[#1c1c19] flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base text-[#6b0218]">account_circle</span>
                            {publicMaskedName}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300 font-semibold">
                            <span className="material-symbols-outlined text-[12px]">lock</span> Identitas Disamarkan untuk Publik
                          </span>
                        </div>
                      </td>

                      {/* Category & Type */}
                      <td className="py-4 px-6">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 bg-[#6b0218]/10 text-[#6b0218] rounded uppercase block w-fit mb-1">
                          {r.jenis || 'Pengaduan'}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 bg-[#f6f3ee] rounded border border-[#debfbf] text-[#1c1c19] inline-block">
                          {r.kategori}
                        </span>
                      </td>

                      {/* Upvotes / Support count */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-[#ffe08e]/30 text-[#735a00] border border-[#ffe08e]">
                          <span className="material-symbols-outlined text-sm">thumb_up</span> {upvoteCount} Dukungan
                        </span>
                      </td>

                      {/* Publication Status Badge */}
                      <td className="py-4 px-6">
                        {isPublic ? (
                          <span className="bg-green-100 text-green-900 border border-green-300 px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span>
                            🌐 TAYANG DI PUBLIK
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-sm">
                            <span className="material-symbols-outlined text-xs">visibility_off</span>
                            🔒 TERSEMBUNYI (PRIVAT)
                          </span>
                        )}
                      </td>

                      {/* Moderation Actions (Tayangkan / Sembunyikan) */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                          {isPublic ? (
                            <button
                              type="button"
                              disabled={updatingId === r.id}
                              onClick={() => handleToggleVisibility(r.id, true)}
                              className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 min-w-[130px]"
                              title="Tarik dari Feed Utama Publik"
                            >
                              {updatingId === r.id ? (
                                <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-sm">visibility_off</span>
                                  <span>Sembunyikan</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={updatingId === r.id}
                              onClick={() => handleToggleVisibility(r.id, false)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50 min-w-[130px] shadow-sm"
                              title="Setujui dan Tayangkan ke Publik"
                            >
                              {updatingId === r.id ? (
                                <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-sm">public</span>
                                  <span>Tayangkan</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Preview Public Card Button */}
                          <button
                            type="button"
                            onClick={() => setPreviewReport(r)}
                            className="bg-[#f6f3ee] hover:bg-[#6b0218] hover:text-white text-[#1c1c19] border border-[#debfbf] p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            title="Pratinjau Kartu Warga"
                          >
                            <span className="material-symbols-outlined text-base">preview</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#574141]">
                    <span className="material-symbols-outlined text-4xl text-[#debfbf] mb-2">find_in_page</span>
                    <p className="font-semibold text-sm text-[#1c1c19]">Tidak ada laporan ditemukan</p>
                    <p className="text-xs text-[#574141] mt-1">Sesuaikan kata kunci pencarian atau opsi filter visibilitas.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pratinjau Publik (Preview how citizen sees the report card) */}
      {previewReport && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#fcf9f4] border border-[#debfbf] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 relative space-y-4">
            <div className="flex items-center justify-between border-b border-[#debfbf] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#6b0218]">preview</span>
                <h3 className="font-bold text-base text-[#1c1c19] font-['Libre_Franklin']">Pratinjau Kartu Warga Publik</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewReport(null)}
                className="text-[#574141] hover:text-[#6b0218] p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Simulated Public Card Component */}
            <div className="bg-white p-5 rounded-2xl border border-[#debfbf] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-[#6b0218]/10 text-[#6b0218] rounded-full text-xs font-bold uppercase">
                  {previewReport.jenis || 'Pengaduan'} • {previewReport.kategori}
                </span>
                <span className="text-xs text-[#6b0218] font-bold">#{previewReport.ticket_number || previewReport.id.substring(0, 8)}</span>
              </div>

              <h4 className="font-bold text-lg text-[#1c1c19] leading-snug">{previewReport.judul}</h4>
              <p className="text-sm text-[#574141] leading-relaxed line-clamp-3">{previewReport.deskripsi}</p>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-[#574141]">
                <div className="flex items-center gap-1.5 font-semibold">
                  <span className="material-symbols-outlined text-base text-[#6b0218]">account_circle</span>
                  <span>{formatPublicName(previewReport.profiles?.full_name)}</span>
                </div>
                <span>📍 {previewReport.lokasi || 'Sukabumi'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewReport(null)}
                className="bg-[#6b0218] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#8b1e2c]"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
