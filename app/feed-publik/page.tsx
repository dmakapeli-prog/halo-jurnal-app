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
  const [user, setUser] = useState<any>(null)
  const [likedReports, setLikedReports] = useState<Set<string>>(new Set())
  const [likingReports, setLikingReports] = useState<Set<string>>(new Set())
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedJenis, setSelectedJenis] = useState<string>('')
  const [selectedLocation, setSelectedLocation] = useState<string>('Semua Wilayah Sukabumi')
  const [customLocation, setCustomLocation] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)
      }
    }
    checkUser()
  }, [])

  useEffect(() => {
    fetchReports()
  }, [selectedCategories, selectedStatus, selectedJenis, selectedLocation, customLocation, searchQuery])

  // Fetch which reports the current user has liked
  useEffect(() => {
    if (user && reports.length > 0) {
      fetchUserLikes()
    }
  }, [user, reports])

  const fetchUserLikes = async () => {
    if (!user) return
    const reportIds = reports.map(r => r.id)
    const { data } = await supabase
      .from('dukungan')
      .select('laporan_id')
      .eq('user_id', user.id)
      .in('laporan_id', reportIds)
    
    if (data) {
      setLikedReports(new Set(data.map((d: { laporan_id: string }) => d.laporan_id)))
    }
  }

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

    // REVISI 5: Filter by Jenis
    if (selectedJenis && selectedJenis !== 'Semua Jenis') {
      const jenisMap: Record<string, string> = {
        'Pengaduan': 'pengaduan',
        'Aspirasi': 'aspirasi',
        'Informasi': 'informasi',
        'Inspirasi': 'inspirasi'
      }
      query = query.eq('jenis', jenisMap[selectedJenis])
    }

    // REVISI 6: Location filter — Sukabumi only
    if (selectedLocation && selectedLocation !== 'Semua Wilayah Sukabumi' && selectedLocation.trim()) {
      query = query.ilike('lokasi', `%${selectedLocation.trim()}%`)
    }

    if (searchQuery) {
      query = query.or(`judul.ilike.%${searchQuery}%,deskripsi.ilike.%${searchQuery}%`)
    }

    const { data, error } = await query
    
    if (data) setReports(data)
    setLoading(false)
  }

  // REVISI 4: Handle like directly from feed card
  const handleLikeFromFeed = async (reportId: string) => {
    if (!user) {
      alert("Silakan login untuk memberikan dukungan.")
      return
    }
    if (likingReports.has(reportId) || likedReports.has(reportId)) return

    setLikingReports(prev => new Set(prev).add(reportId))

    try {
      const { error } = await supabase
        .from('dukungan')
        .insert({
          laporan_id: reportId,
          user_id: user.id
        })

      if (error) {
        if (error.code === '23505' || error.message?.includes('duplicate')) {
          setLikedReports(prev => new Set(prev).add(reportId))
        } else {
          throw error
        }
      } else {
        setLikedReports(prev => new Set(prev).add(reportId))
        // Update dukungan_count in local state for real-time effect
        setReports(prev => prev.map(r => 
          r.id === reportId 
            ? { ...r, dukungan_count: (r.dukungan_count || 0) + 1 }
            : r
        ))
      }
    } catch (err: any) {
      console.error('Like error:', err)
      alert(`Gagal memberikan dukungan: ${err.message || 'Terjadi kesalahan'}`)
    } finally {
      setLikingReports(prev => {
        const next = new Set(prev)
        next.delete(reportId)
        return next
      })
    }
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

  const getJenisBadge = (jenis: string) => {
    switch (jenis) {
      case 'pengaduan':
        return (
          <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">report_problem</span>
            Pengaduan
          </span>
        )
      case 'aspirasi':
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">lightbulb</span>
            Aspirasi
          </span>
        )
      case 'informasi':
        return (
          <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">description</span>
            Informasi
          </span>
        )
      case 'inspirasi':
        return (
          <span className="bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
            Inspirasi
          </span>
        )
      default:
        return null
    }
  }

  // Filter sidebar content (shared between desktop and mobile)
  const FilterContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* REVISI 5: Jenis Filter */}
      <div className="mb-8">
        <label className="block font-['Public_Sans'] text-[14px] font-bold text-[#574141] mb-3 uppercase tracking-wider">Jenis Laporan</label>
        <div className={`space-y-${isMobile ? '3' : '2'}`}>
          {['Semua Jenis', 'Pengaduan', 'Aspirasi', 'Informasi', 'Inspirasi'].map(jenis => (
            <label key={jenis} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name={isMobile ? 'mobile_jenis' : 'jenis'}
                className={`border-[#debfbf] text-[#6b0218] focus:ring-[#6b0218] ${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`}
                checked={selectedJenis === jenis || (!selectedJenis && jenis === 'Semua Jenis')}
                onChange={() => setSelectedJenis(jenis)}
              />
              <span className="font-['Public_Sans'] text-[16px] text-[#1c1c19] hover:text-[#6b0218] transition-colors">{jenis}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <label className="block font-['Public_Sans'] text-[14px] font-bold text-[#574141] mb-3 uppercase tracking-wider">Kategori</label>
        <div className={`space-y-${isMobile ? '3' : '2'}`}>
          {['Infrastruktur', 'Pelayanan Publik', 'Kesehatan', 'Keamanan', 'Kebersihan Lingkungan', 'Keamanan & Ketertiban'].map(cat => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className={`rounded-sm border-[#debfbf] text-[#6b0218] focus:ring-[#6b0218] ${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`}
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
        <div className={`space-y-${isMobile ? '3' : '2'}`}>
          {['Semua Laporan', 'Diterima', 'Diproses', 'Selesai'].map(status => (
            <label key={status} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                name={isMobile ? 'mobile_status' : 'status'}
                className={`border-[#debfbf] text-[#6b0218] focus:ring-[#6b0218] ${isMobile ? 'h-5 w-5' : 'h-4 w-4'}`}
                checked={selectedStatus === status || (!selectedStatus && status === 'Semua Laporan')}
                onChange={() => setSelectedStatus(status)}
              />
              <span className="font-['Public_Sans'] text-[16px] text-[#1c1c19] hover:text-[#6b0218] transition-colors">{status}</span>
            </label>
          ))}
        </div>
      </div>

      {/* REVISI 6: Location Filter with working "Lainnya" manual text input */}
      <div className="mb-8">
        <label className="block font-['Public_Sans'] text-[14px] font-bold text-[#574141] mb-3 uppercase tracking-wider">Wilayah</label>
        <select 
          className={`w-full bg-[#f6f3ee] border-[1.5px] border-[#debfbf] rounded-lg ${isMobile ? 'p-3' : 'p-2'} font-['Public_Sans'] focus:border-[#6b0218] focus:ring-1 focus:ring-[#6b0218] outline-none transition-all`}
          value={selectedLocation}
          onChange={(e) => {
            setSelectedLocation(e.target.value)
            // Reset custom location when switching away from "Lainnya"
            if (e.target.value !== 'Lainnya') {
              setCustomLocation('')
            }
          }}
        >
          <option>Semua Wilayah Sukabumi</option>
          <optgroup label="Kota Sukabumi">
            <option>Baros</option>
            <option>Citamiang</option>
            <option>Cikole</option>
            <option>Gunungpuyuh</option>
            <option>Lembursitu</option>
            <option>Warudoyong</option>
            <option>Cibeureum</option>
          </optgroup>
          <optgroup label="Kabupaten Sukabumi">
            <option>Cibadak</option>
            <option>Cicurug</option>
            <option>Cisaat</option>
            <option>Parungkuda</option>
            <option>Palabuhanratu</option>
            <option>Jampangkulon</option>
            <option>Jampangtengah</option>
            <option>Sukaraja</option>
            <option>Surade</option>
            <option>Kabandungan</option>
            <option>Kadudampit</option>
            <option>Nyalindung</option>
            <option>Cisolok</option>
            <option>Cikembar</option>
            <option>Nagrak</option>
            <option>Gegerbitung</option>
            <option>Sagaranten</option>
            <option>Cidahu</option>
            <option>Caringin</option>
            <option>Lengkong</option>
            <option>Pabuaran</option>
            <option>Kalibunder</option>
            <option>Tegalbuleud</option>
            <option>Cidolog</option>
            <option>Ciemas</option>
            <option>Warungkiara</option>
            <option>Bantargadung</option>
            <option>Cimanggu</option>
            <option>Curugkembar</option>
            <option>Ciracap</option>
            <option>Purabaya</option>
            <option>Simpenan</option>
            <option>Waluran</option>
            <option>Cireunghas</option>
            <option>Sukalarang</option>
            <option>Sukabumi</option>
            <option>Kebonpedes</option>
            <option>Gunungguruh</option>
            <option>Cicantayan</option>
            <option>Ciambar</option>
            <option>Bojongmanik</option>
            <option>Cipeuteuy</option>
            <option>Cidadap</option>
            <option>Takokak</option>
            <option>Cikidang</option>
            <option>Bojonggenteng</option>
          </optgroup>
        </select>
      </div>
    </>
  )

  return (
    <>
      <Navbar />
      
      <main className="pt-[64px] md:pt-[80px] min-h-screen flex bg-[#fcf9f4]">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:flex flex-col w-[280px] fixed left-0 top-[64px] md:top-[80px] h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] bg-[#fcf9f4] border-r border-[#debfbf] p-4 md:p-[40px] overflow-y-auto">
          <div className="mb-8">
            <h2 className="font-['Libre_Franklin'] text-[24px] font-semibold text-[#6b0218] mb-6">Filter Laporan</h2>
            <FilterContent />
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
              
              <FilterContent isMobile />

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

            {/* REVISI 5: Quick Jenis Tabs above the feed */}
            <div className="mb-6 flex flex-wrap gap-2">
              {['Semua Jenis', 'Pengaduan', 'Aspirasi', 'Informasi', 'Inspirasi'].map(jenis => {
                const isActive = selectedJenis === jenis || (!selectedJenis && jenis === 'Semua Jenis')
                const icons: Record<string, string> = { 'Semua Jenis': 'apps', 'Pengaduan': 'report_problem', 'Aspirasi': 'lightbulb', 'Informasi': 'description', 'Inspirasi': 'auto_awesome' }
                return (
                  <button
                    key={jenis}
                    onClick={() => setSelectedJenis(jenis)}
                    className={`px-4 py-2 rounded-full font-['Public_Sans'] text-[13px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-[#6b0218] text-white border-[#6b0218] shadow-sm'
                        : 'bg-white text-[#574141] border-[#debfbf] hover:border-[#6b0218] hover:text-[#6b0218]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{icons[jenis]}</span>
                    {jenis}
                  </button>
                )
              })}
            </div>

            {/* Reports Grid */}
            <div className="space-y-[24px]">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6b0218] mx-auto"></div>
                  <p className="mt-4 text-[#574141] font-['Public_Sans']">Memuat laporan...</p>
                </div>
              ) : reports.length > 0 ? (
                reports.map(report => {
                  const isLiked = likedReports.has(report.id)
                  const isLiking = likingReports.has(report.id)
                  
                  return (
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
                        
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Jenis Badge */}
                          {getJenisBadge(report.jenis)}

                          {/* Status Badge */}
                          {report.status === 'selesai' && (
                            <span className="bg-green-100 text-green-800 px-4 py-1 rounded-full text-[12px] font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>{report.jenis === 'inspirasi' ? 'public' : 'check_circle'}</span>
                              {report.jenis === 'inspirasi' ? 'Tayang' : 'Selesai'}
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
                      </div>

                      <h3 className="font-['Libre_Franklin'] text-xl md:text-[24px] leading-snug md:leading-[1.3] font-semibold text-[#6b0218] mb-3 break-words">{report.judul}</h3>
                      
                      <div className={`flex ${report.jenis === 'inspirasi' ? 'flex-col' : 'flex-col-reverse md:flex-row'} gap-6 mb-6`}>
                        {/* Inspirasi: Show image first, full width, larger */}
                        {report.jenis === 'inspirasi' && report.laporan_lampiran && report.laporan_lampiran.length > 0 && report.laporan_lampiran[0].file_url && (
                          <div className="w-full aspect-video rounded-lg overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={report.laporan_lampiran[0].file_url} 
                              alt={report.judul}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <p className={`font-['Public_Sans'] text-[16px] text-[#574141] line-clamp-3 ${
                          report.jenis !== 'inspirasi' && report.laporan_lampiran?.length > 0 ? 'md:w-2/3' : 'w-full'
                        }`}>
                          {report.deskripsi}
                        </p>
                        
                        {/* Non-Inspirasi: regular side thumbnail */}
                        {report.jenis !== 'inspirasi' && report.laporan_lampiran && report.laporan_lampiran.length > 0 && report.laporan_lampiran[0].file_url && (
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
                          {/* REVISI 4: Clickable Dukungan button directly from Feed */}
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleLikeFromFeed(report.id)
                            }}
                            disabled={isLiking || isLiked}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[14px] font-semibold transition-all cursor-pointer disabled:cursor-default ${
                              isLiked
                                ? 'bg-[#ffe08e] border-[#ffe08e] text-[#241a00] shadow-sm'
                                : 'border-[#debfbf] text-[#574141] hover:border-[#6b0218] hover:text-[#6b0218] hover:bg-[#6b0218]/5'
                            }`}
                          >
                            <span 
                              className="material-symbols-outlined text-[18px]" 
                              style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
                            >
                              thumb_up
                            </span>
                            <span className="font-['Public_Sans']">
                              {isLiked ? 'Didukung' : 'Dukung'} ({report.dukungan_count || 0})
                            </span>
                            {isLiking && (
                              <span className="material-symbols-outlined animate-spin text-[14px]">sync</span>
                            )}
                          </button>
                        </div>
                        <Link href={`/laporan/${report.id}`} className="text-[#6b0218] font-['Public_Sans'] text-[14px] font-semibold flex items-center gap-1 hover:underline">
                          Lihat Detail & Chat Admin
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </Link>
                      </div>
                    </article>
                  )
                })
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
