'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function FeedPublikContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedLocation, setSelectedLocation] = useState<string>('Seluruh Indonesia')
  const [customLocation, setCustomLocation] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [selectedCategories, selectedStatus, selectedLocation, customLocation, searchQuery])

  const fetchReports = async () => {
    setLoading(true)
    let query = supabase
      .from('laporan')
      .select('*, laporan_lampiran(file_url), chat_messages(count)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    if (selectedCategories.length > 0) {
      query = query.in('kategori', selectedCategories)
    }

    if (selectedStatus && selectedStatus !== 'Semua Laporan') {
      const statusMap: Record<string, string> = {
        'Diterima': 'diterima',
        'Diproses': 'diproses',
        'Selesai': 'selesai'
      }
      query = query.eq('status', statusMap[selectedStatus])
    }

    const activeLoc = selectedLocation === 'Lainnya' ? customLocation : selectedLocation
    if (activeLoc && activeLoc !== 'Seluruh Indonesia' && activeLoc.trim()) {
      query = query.ilike('lokasi', `%${activeLoc.trim()}%`)
    }

    if (searchQuery) {
      query = query.or(`judul.ilike.%${searchQuery}%,deskripsi.ilike.%${searchQuery}%`)
    }

    const { data, error } = await query
    
    if (data) setReports(data)
    setLoading(false)
  }

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diff < 60) return 'Baru saja'
    if (diff < 3600) return `${Math.floor(diff/60)} menit yang lalu`
    if (diff < 86400) return `${Math.floor(diff/3600)} jam yang lalu`
    return `${Math.floor(diff/86400)} hari yang lalu`
  }

  return (
    <>
      <Navbar />
      
      <main className="pt-[64px] md:pt-[80px] min-h-screen flex bg-[#fcf9f4]">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:flex flex-col w-[280px] fixed left-0 top-[64px] md:top-[80px] h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] bg-[#fcf9f4] border-r border-[#debfbf] p-4 md:p-[40px] overflow-y-auto">
          <div className="mb-8">
            <h2 className="font-['Libre_Franklin'] text-[24px] font-semibold text-[#6b0218] mb-6">Filter Laporan</h2>
            
            {/* Category Filter */}
            <div className="mb-8">
              <label className="block font-['Public_Sans'] text-[14px] font-bold text-[#574141] mb-3 uppercase tracking-wider">Kategori</label>
              <div className="space-y-2">
                {['Infrastruktur', 'Pelayanan Publik', 'Kesehatan', 'Keamanan'].map(cat => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="rounded-sm border-[#debfbf] text-[#6b0218] focus:ring-[#6b0218] h-4 w-4"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                    />
                    <span className="font-['Public_Sans'] text-[16px] text-[#1c1c19] hover:text-[#6b0218] transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="mb-8">
              <label className="block font-['Public_Sans'] text-[14px] font-bold text-[#574141] mb-3 uppercase tracking-wider">Status</label>
              <div className="space-y-2">
                {['Semua Laporan', 'Diterima', 'Diproses', 'Selesai'].map(status => (
                  <label key={status} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="status"
                      className="border-[#debfbf] text-[#6b0218] focus:ring-[#6b0218] h-4 w-4"
                      checked={selectedStatus === status || (!selectedStatus && status === 'Semua Laporan')}
                      onChange={() => setSelectedStatus(status)}
                    />
                    <span className="font-['Public_Sans'] text-[16px] text-[#1c1c19] hover:text-[#6b0218] transition-colors">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div className="mb-8">
              <label className="block font-['Public_Sans'] text-[14px] font-bold text-[#574141] mb-3 uppercase tracking-wider">Wilayah</label>
              <select 
                className="w-full bg-[#f6f3ee] border-[1.5px] border-[#debfbf] rounded-lg p-2 font-['Public_Sans'] focus:border-[#6b0218] focus:ring-1 focus:ring-[#6b0218] outline-none transition-all"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option>Seluruh Indonesia</option>
                <option>Jakarta Pusat</option>
                <option>Bandung</option>
                <option>Surabaya</option>
                <option>Medan</option>
                <option>Lainnya</option>
              </select>
              {selectedLocation === 'Lainnya' && (
                <input
                  type="text"
                  placeholder="Ketik wilayah manual..."
                  className="mt-2.5 w-full bg-white border-[1.5px] border-[#debfbf] rounded-lg p-2 font-['Public_Sans'] text-sm focus:border-[#6b0218] outline-none"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                />
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-[60] bg-black/50 lg:hidden flex justify-end" onClick={() => setIsFilterOpen(false)}>
            <div 
              className="w-[85%] max-w-sm h-full bg-[#fcf9f4] p-6 overflow-y-auto shadow-2xl animate-in slide-in-from-right"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-['Libre_Franklin'] text-[24px] font-semibold text-[#6b0218]">Filter Laporan</h2>
                <button onClick={() => setIsFilterOpen(false)} className="text-[#574141] hover:text-[#6b0218]">
                  <span className="material-symbols-outlined text-3xl">close</span>
                </button>
              </div>
              
              {/* Category Filter */}
              <div className="mb-8">
                <label className="block font-['Public_Sans'] text-[14px] font-bold text-[#574141] mb-3 uppercase tracking-wider">Kategori</label>
                <div className="space-y-3">
                  {['Infrastruktur', 'Pelayanan Publik', 'Kesehatan', 'Keamanan'].map(cat => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="rounded-sm border-[#debfbf] text-[#6b0218] focus:ring-[#6b0218] h-5 w-5"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                      />
                      <span className="font-['Public_Sans'] text-[16px] text-[#1c1c19]">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div className="mb-8">
                <label className="block font-['Public_Sans'] text-[14px] font-bold text-[#574141] mb-3 uppercase tracking-wider">Status</label>
                <div className="space-y-3">
                  {['Semua Laporan', 'Diterima', 'Diproses', 'Selesai'].map(status => (
                    <label key={status} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="mobile_status"
                        className="border-[#debfbf] text-[#6b0218] focus:ring-[#6b0218] h-5 w-5"
                        checked={selectedStatus === status || (!selectedStatus && status === 'Semua Laporan')}
                        onChange={() => setSelectedStatus(status)}
                      />
                      <span className="font-['Public_Sans'] text-[16px] text-[#1c1c19]">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div className="mb-8">
                <label className="block font-['Public_Sans'] text-[14px] font-bold text-[#574141] mb-3 uppercase tracking-wider">Wilayah</label>
                <select 
                  className="w-full bg-[#f6f3ee] border-[1.5px] border-[#debfbf] rounded-lg p-3 font-['Public_Sans'] focus:border-[#6b0218] focus:ring-1 focus:ring-[#6b0218] outline-none transition-all"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option>Seluruh Indonesia</option>
                  <option>Jakarta Pusat</option>
                  <option>Bandung</option>
                  <option>Surabaya</option>
                  <option>Medan</option>
                  <option>Lainnya</option>
                </select>
                {selectedLocation === 'Lainnya' && (
                  <input
                    type="text"
                    placeholder="Ketik wilayah manual..."
                    className="mt-2.5 w-full bg-white border-[1.5px] border-[#debfbf] rounded-lg p-3 font-['Public_Sans'] text-sm focus:border-[#6b0218] outline-none"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                  />
                )}
              </div>

              <button 
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-[#6b0218] text-white py-3 rounded-lg font-['Public_Sans'] font-semibold"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        )}

        {/* Feed Canvas */}
        <section className="flex-1 lg:ml-[280px] p-4 sm:p-5 md:p-[40px] bg-[#fcf9f4]">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-12">
              <div>
                <h1 className="font-['Libre_Franklin'] text-2xl sm:text-3xl md:text-[48px] md:leading-[56px] font-bold text-[#1c1c19] mb-2">Feed Publik</h1>
                <p className="font-['Public_Sans'] text-[14px] md:text-[18px] text-[#574141] max-w-xl">Melihat transparansi dalam setiap aduan. Seluruh identitas pelapor telah disamarkan demi keamanan.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button 
                  onClick={() => setIsFilterOpen(true)}
                  className="lg:hidden flex items-center justify-center gap-2 bg-white border border-[#debfbf] text-[#1c1c19] px-4 py-3 rounded-lg shadow-sm"
                >
                  <span className="material-symbols-outlined">filter_list</span>
                  <span className="font-semibold text-sm">Filter</span>
                </button>
                <div className="flex items-center bg-[#f0ede9] rounded-full px-4 py-3 sm:py-2 border border-[#debfbf]">
                  <span className="material-symbols-outlined text-[#574141] mr-2">search</span>
                  <input 
                    type="text" 
                    placeholder="Cari aduan..." 
                    className="bg-transparent border-none focus:ring-0 font-['Public_Sans'] text-[16px] text-[#1c1c19] w-full sm:w-48 outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Reports Grid */}
            <div className="space-y-[24px]">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6b0218] mx-auto"></div>
                  <p className="mt-4 text-[#574141] font-['Public_Sans']">Memuat laporan...</p>
                </div>
              ) : reports.length > 0 ? (
                reports.map(report => (
                  <article key={report.id} className="bg-white border border-[#debfbf] rounded-xl p-6 transition-all hover:shadow-md hover:-translate-y-1">
                    <div className="flex flex-wrap gap-2 justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#ffdad9] flex items-center justify-center text-[#6b0218]">
                          <span className="material-symbols-outlined">person_off</span>
                        </div>
                        <div>
                          <p className="font-['Public_Sans'] text-[14px] font-semibold text-[#1c1c19]">Pelapor Terenkripsi</p>
                          <p className="font-['Public_Sans'] text-[12px] text-[#574141]">{timeAgo(report.created_at)} • {report.lokasi}</p>
                        </div>
                      </div>
                      
                      {report.status === 'selesai' && (
                        <span className="bg-green-100 text-green-800 px-4 py-1 rounded-full text-[12px] font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          Selesai
                        </span>
                      )}
                      {report.status === 'diproses' && (
                        <span className="bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full text-[12px] font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>pending</span>
                          Diproses
                        </span>
                      )}
                      {report.status === 'diterima' && (
                        <span className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-[12px] font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>inbox</span>
                          Diterima
                        </span>
                      )}
                      {report.status === 'ditindaklanjuti' && (
                        <span className="bg-purple-100 text-purple-800 px-4 py-1 rounded-full text-[12px] font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>gavel</span>
                          Ditindaklanjuti
                        </span>
                      )}
                    </div>

                    <h3 className="font-['Libre_Franklin'] text-xl md:text-[24px] font-semibold text-[#6b0218] mb-3">{report.judul}</h3>
                    
                    <div className="flex flex-col-reverse md:flex-row gap-6 mb-6">
                      <p className={`font-['Public_Sans'] text-[16px] text-[#574141] line-clamp-3 ${report.laporan_lampiran?.length > 0 ? 'md:w-2/3' : 'w-full'}`}>
                        {report.deskripsi}
                      </p>
                      
                      {report.laporan_lampiran && report.laporan_lampiran.length > 0 && report.laporan_lampiran[0].file_url && (
                        <div className="md:w-1/3 h-32 md:h-auto rounded-lg overflow-hidden flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={report.laporan_lampiran[0].file_url} 
                            alt={report.judul}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#debfbf] pt-4">
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1 text-[#574141]">
                          <span className="material-symbols-outlined">thumb_up</span>
                          <span className="font-['Public_Sans'] text-[14px] font-semibold">{report.dukungan_count || 0} Dukungan</span>
                        </div>
                      </div>
                      <Link href={`/laporan/${report.id}`} className="text-[#6b0218] font-['Public_Sans'] text-[14px] font-semibold flex items-center gap-1 hover:underline">
                        Lihat Detail & Chat Admin
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </Link>
                    </div>
                  </article>
                ))
              ) : (
                <div className="bg-white border border-[#debfbf] rounded-xl p-12 text-center">
                  <span className="material-symbols-outlined text-6xl text-[#debfbf] mb-4">search_off</span>
                  <h3 className="font-['Libre_Franklin'] text-[20px] font-semibold text-[#1c1c19] mb-2">Laporan tidak ditemukan</h3>
                  <p className="font-['Public_Sans'] text-[#574141]">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

export default function FeedPublikPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fcf9f4] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6b0218]"></div>
      </div>
    }>
      <FeedPublikContent />
    </Suspense>
  )
}
