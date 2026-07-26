'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import LocationPicker from '@/components/LocationPicker'

type ReportType = 'pengaduan' | 'aspirasi' | 'informasi'

interface FormConfig {
  headerTitle: string
  headerDesc: string
  titleLabel: string
  titlePlaceholder: string
  descLabel: string
  descPlaceholder: string
  locationLabel: string
  categories: string[]
  submitText: string
  sidebarInfo: string
}

const formConfigs: Record<ReportType, FormConfig> = {
  pengaduan: {
    headerTitle: 'Formulir Pengaduan Warga',
    headerDesc: 'Formulir resmi pelaporan masalah atau keluhan pelayanan publik. Pastikan data yang Anda masukkan valid untuk mempercepat proses penanganan.',
    titleLabel: 'Judul Pengaduan',
    titlePlaceholder: 'Contoh: Jalan rusak di depan RT 05',
    descLabel: 'Detail Pengaduan / Keluhan',
    descPlaceholder: 'Jelaskan masalah yang Anda alami secara detail...',
    locationLabel: 'Lokasi Kejadian',
    categories: ['Infrastruktur', 'Kebersihan Lingkungan', 'Keamanan & Ketertiban', 'Pelayanan Publik', 'Kesehatan', 'Lainnya'],
    submitText: 'Kirim Pengaduan',
    sidebarInfo: 'Laporan pengaduan Anda akan ditindaklanjuti oleh instansi terkait dalam waktu 2x24 jam.'
  },
  aspirasi: {
    headerTitle: 'Formulir Aspirasi & Usulan',
    headerDesc: 'Formulir penyampaian ide, gagasan, atau harapan warga untuk kemajuan bersama.',
    titleLabel: 'Judul Aspirasi / Usulan',
    titlePlaceholder: 'Contoh: Usulan taman bermain di RW 03',
    descLabel: 'Rincian Ide / Usulan',
    descPlaceholder: 'Jelaskan ide atau harapan Anda untuk kemajuan bersama...',
    locationLabel: 'Lokasi Target / Scope Usulan',
    categories: ['Pembangunan Daerah', 'Program Kemasyarakatan', 'Inovasi Pelayanan', 'Fasilitas Umum', 'Lainnya'],
    submitText: 'Kirim Aspirasi',
    sidebarInfo: 'Aspirasi Anda akan didokumentasikan dan menjadi pertimbangan dalam perencanaan pembangunan.'
  },
  informasi: {
    headerTitle: 'Permohonan Informasi Publik',
    headerDesc: 'Ajukan permintaan data atau kebijakan resmi kepada instansi pemerintah maupun non-pemerintah melalui sistem transparansi digital kami.',
    titleLabel: 'Judul Permohonan',
    titlePlaceholder: 'Contoh: Permintaan Data Anggaran Kebersihan 2024',
    descLabel: 'Rincian Permohonan',
    descPlaceholder: 'Jelaskan informasi apa yang Anda butuhkan dan untuk keperluan apa secara mendetail agar memudahkan petugas dalam verifikasi data.',
    locationLabel: 'Wilayah / Scope Informasi',
    categories: ['Kebijakan', 'Data Statistik', 'Anggaran', 'Laporan Kegiatan', 'Lainnya'],
    submitText: 'Ajukan Permohonan',
    sidebarInfo: 'Permohonan akan diproses maksimal 10 hari kerja sesuai UU Keterbukaan Informasi Publik.'
  }
}

const instansiList = [
  'Dinas Pekerjaan Umum',
  'Dinas Kesehatan',
  'Dinas Lingkungan Hidup',
  'Satpol PP',
  'Dinas Pendidikan',
  'Dinas Perhubungan',
  'Dinas Sosial',
  'Lainnya'
]

const jenisInformasiList = [
  'Kebijakan',
  'Data Statistik',
  'Anggaran',
  'Laporan Kegiatan',
  'Lainnya'
]

function LaporForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [supabase] = useState(() => createClient())

  const rawType = searchParams.get('type') || 'pengaduan'
  const reportType: ReportType = ['pengaduan', 'aspirasi', 'informasi'].includes(rawType) 
    ? (rawType as ReportType) 
    : 'pengaduan'

  const config = formConfigs[reportType]

  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Form State
  const [category, setCategory] = useState('')
  const [instansi, setInstansi] = useState('')
  const [jenisInformasi, setJenisInformasi] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [locationData, setLocationData] = useState<{ address: string; lat: number | null; lng: number | null }>({
    address: '',
    lat: null,
    lng: null
  })
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
      } else {
        // If unauthenticated user lands on /lapor directly, alert and redirect to login
        alert('Silakan login terlebih dahulu untuk membuat laporan.')
        router.push('/login')
      }
    })
  }, [supabase, router])

  const handleTabChange = (newType: ReportType) => {
    router.push(`/lapor?type=${newType}`)
    setCategory('')
    setInstansi('')
    setJenisInformasi('')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)

      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => setPreviewUrl(e.target?.result as string)
        reader.readAsDataURL(selectedFile)
      } else {
        setPreviewUrl(null)
      }
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0]
      setFile(selectedFile)
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => setPreviewUrl(e.target?.result as string)
        reader.readAsDataURL(selectedFile)
      } else {
        setPreviewUrl(null)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Validation
    if (reportType === 'informasi') {
      if (!instansi || !jenisInformasi || !title || !description || !locationData.address) {
        alert('Mohon lengkapi semua field yang wajib (Instansi, Jenis Informasi, Judul, Rincian, dan Lokasi).')
        return
      }
    } else {
      if (!category || !title || !description || !locationData.address) {
        alert('Mohon lengkapi semua field yang wajib (Kategori, Judul, Isi Laporan, dan Lokasi).')
        return
      }
    }

    setLoading(true)
    try {
      // 0. Ensure user has profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        alert('Profil Anda belum lengkap. Silakan lengkapi profil terlebih dahulu sebelum membuat laporan.')
        setLoading(false)
        return
      }

      // Generate ticket number: JS-YYYYMMDD-XXXX
      const date = new Date()
      const yyyy = date.getFullYear()
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const dd = String(date.getDate()).padStart(2, '0')
      const random4 = Math.floor(1000 + Math.random() * 9000)
      const ticketNumber = `JS-${yyyy}${mm}${dd}-${random4}`

      const finalKategori = reportType === 'informasi' ? jenisInformasi : category

      // 1. Insert Laporan
      const { data: laporan, error: laporanError } = await supabase
        .from('laporan')
        .insert({
          ticket_number: ticketNumber,
          user_id: user.id,
          jenis: reportType,
          kategori: finalKategori,
          judul: title,
          deskripsi: description,
          lokasi: locationData.address,
          latitude: locationData.lat,
          longitude: locationData.lng,
          instansi_tujuan: reportType === 'informasi' ? instansi : null,
          jenis_informasi: reportType === 'informasi' ? jenisInformasi : null,
          status: 'diterima',
          is_public: true,
          dukungan_count: 0
        })
        .select()
        .single()

      if (laporanError) throw laporanError

      // 2. Upload Lampiran if exists
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${laporan.id}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('laporan-lampiran')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('laporan-lampiran')
          .getPublicUrl(filePath)

        const { error: lampiranError } = await supabase
          .from('laporan_lampiran')
          .insert({
            laporan_id: laporan.id,
            file_url: publicUrlData.publicUrl,
            file_type: file.type
          })

        if (lampiranError) throw lampiranError
      }

      // 3. Insert Status Log
      const { error: logError } = await supabase
        .from('status_log')
        .insert({
          laporan_id: laporan.id,
          status: 'diterima',
          catatan: 'Laporan baru diterima',
          changed_by: user.id
        })

      if (logError) throw logError

      alert(`Laporan berhasil dikirim! Nomor Tiket Anda: ${ticketNumber}`)
      router.push('/laporan-saya')

    } catch (error: any) {
      console.error(error)
      alert(`Terjadi kesalahan: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar showLoginButton={false} actionButton={
        <Link href="/beranda" className="bg-[#ffe08e] text-[#241a00] px-4 md:px-6 py-2 font-['Public_Sans'] text-[14px] font-semibold rounded-[0.25rem] hover:opacity-90 transition-opacity">
          Dashboard
        </Link>
      } />

      {/* Content Canvas */}
      <main className="pt-[84px] md:pt-[110px] pb-16 md:pb-20 px-5 md:px-[40px] max-w-[1280px] mx-auto bg-[#fcf9f4] min-h-screen">
        {/* Header Section */}
        <header className="mb-6 md:mb-10">
          <h1 className="font-['Libre_Franklin'] text-2xl sm:text-3xl md:text-[40px] font-bold text-[#6b0218] mb-2">
            {config.headerTitle}
          </h1>
          <p className="font-['Public_Sans'] text-[14px] md:text-[16px] text-[#574141] max-w-2xl leading-relaxed">
            {config.headerDesc}
          </p>
        </header>

        {/* Tab Selector */}
        <div className="mb-6 md:mb-8 bg-[#f0ede9] p-1.5 rounded-xl border border-[#debfbf] flex flex-col sm:flex-row gap-1.5 max-w-2xl">
          <button
            type="button"
            onClick={() => handleTabChange('pengaduan')}
            className={`flex-1 py-3 px-4 rounded-lg font-['Public_Sans'] text-[14px] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              reportType === 'pengaduan'
                ? 'bg-[#6b0218] text-white shadow-md'
                : 'text-[#574141] hover:bg-[#e5e2dd] hover:text-[#1c1c19]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">report_problem</span>
            Pengaduan
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('aspirasi')}
            className={`flex-1 py-3 px-4 rounded-lg font-['Public_Sans'] text-[14px] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              reportType === 'aspirasi'
                ? 'bg-[#6b0218] text-white shadow-md'
                : 'text-[#574141] hover:bg-[#e5e2dd] hover:text-[#1c1c19]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">lightbulb</span>
            Aspirasi
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('informasi')}
            className={`flex-1 py-3 px-4 rounded-lg font-['Public_Sans'] text-[14px] font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              reportType === 'informasi'
                ? 'bg-[#6b0218] text-white shadow-md'
                : 'text-[#574141] hover:bg-[#e5e2dd] hover:text-[#1c1c19]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">description</span>
            Informasi Publik
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-[24px] items-start">
          {/* Left Side: Form Fields */}
          <div className="lg:col-span-8 bg-white border border-[#debfbf] p-5 md:p-8 rounded-xl shadow-sm">
            <form className="space-y-6" onSubmit={handleSubmit}>
              
              {/* Specialized Fields for Permohonan Informasi Publik */}
              {reportType === 'informasi' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Instansi Tujuan */}
                  <div>
                    <label className="block font-['Public_Sans'] text-[14px] font-bold mb-2 text-[#1c1c19]">
                      Instansi Tujuan <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full bg-[#fcf9f4] border-[1.5px] border-[#8b7171] rounded-lg p-3 font-['Public_Sans'] text-sm focus:ring-2 focus:ring-[#ffdad9] focus:border-[#6b0218] outline-none transition-all appearance-none cursor-pointer min-h-[48px]"
                      value={instansi}
                      onChange={(e) => setInstansi(e.target.value)}
                    >
                      <option value="">Pilih Instansi</option>
                      {instansiList.map((inst) => (
                        <option key={inst} value={inst}>{inst}</option>
                      ))}
                    </select>
                  </div>

                  {/* Jenis Informasi */}
                  <div>
                    <label className="block font-['Public_Sans'] text-[14px] font-bold mb-2 text-[#1c1c19]">
                      Jenis Informasi <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full bg-[#fcf9f4] border-[1.5px] border-[#8b7171] rounded-lg p-3 font-['Public_Sans'] text-sm focus:ring-2 focus:ring-[#ffdad9] focus:border-[#6b0218] outline-none transition-all appearance-none cursor-pointer min-h-[48px]"
                      value={jenisInformasi}
                      onChange={(e) => setJenisInformasi(e.target.value)}
                    >
                      <option value="">Pilih Jenis Informasi</option>
                      {jenisInformasiList.map((jenis) => (
                        <option key={jenis} value={jenis}>{jenis}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                /* Category Dropdown for Pengaduan & Aspirasi */
                <div>
                  <label className="block font-['Public_Sans'] text-[14px] font-bold mb-2 text-[#1c1c19]">
                    Kategori Laporan <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full bg-[#fcf9f4] border-[1.5px] border-[#8b7171] rounded-lg p-3 font-['Public_Sans'] text-sm focus:ring-2 focus:ring-[#ffdad9] focus:border-[#6b0218] outline-none transition-all appearance-none cursor-pointer min-h-[48px]"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Pilih Kategori</option>
                    {config.categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="block font-['Public_Sans'] text-[14px] font-bold mb-2 text-[#1c1c19]">
                  {config.titleLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full bg-[#fcf9f4] border-[1.5px] border-[#8b7171] rounded-lg p-3 font-['Public_Sans'] text-sm focus:ring-2 focus:ring-[#ffdad9] focus:border-[#6b0218] outline-none transition-all"
                  placeholder={config.titlePlaceholder}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Description Textarea */}
              <div>
                <label className="block font-['Public_Sans'] text-[14px] font-bold mb-2 text-[#1c1c19]">
                  {config.descLabel} <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full bg-[#fcf9f4] border-[1.5px] border-[#8b7171] rounded-lg p-3 font-['Public_Sans'] text-sm focus:ring-2 focus:ring-[#ffdad9] focus:border-[#6b0218] outline-none transition-all"
                  placeholder={config.descPlaceholder}
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              {/* Interactive Location Picker with Leaflet OpenStreetMap */}
              <LocationPicker
                value={locationData}
                onChange={setLocationData}
              />

              {/* Attachment Upload */}
              <div>
                <label className="block font-['Public_Sans'] text-[14px] font-bold mb-2 text-[#1c1c19]">
                  {reportType === 'informasi' ? 'Lampiran Pendukung (Opsional)' : 'Bukti Foto / Video (Opsional)'}
                </label>
                <div
                  className={`p-5 sm:p-6 border-2 border-dashed ${dragOver ? 'border-[#6b0218] bg-[#ffdad9]/20' : 'border-[#debfbf] bg-[#f6f3ee]'} rounded-xl text-center transition-colors`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <span className="material-symbols-outlined text-3xl sm:text-4xl text-[#6b0218] mb-3">upload_file</span>
                  <p className="font-['Public_Sans'] text-[13px] sm:text-[14px] font-bold text-[#574141] mb-3">
                    Seret & lepas file bukti di sini
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,video/*,.pdf"
                  />
                  <button
                    type="button"
                    className="border-[1.5px] border-[#6b0218] text-[#6b0218] px-5 sm:px-6 py-2 font-['Public_Sans'] text-[14px] font-bold rounded-lg hover:bg-[#ffdad9] transition-colors min-h-[42px] cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Pilih File
                  </button>
                  <div className="mt-3 flex flex-wrap gap-2 justify-center">
                    {file && (
                      <span className="bg-[#ffe08e] text-[#241a00] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 max-w-full truncate">
                        <span className="material-symbols-outlined text-sm shrink-0">attach_file</span> <span className="truncate">{file.name}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 md:pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#fed255] text-[#735a00] py-4 font-['Public_Sans'] text-[16px] md:text-[18px] rounded-lg shadow-sm hover:opacity-90 transition-all flex justify-center items-center gap-2 font-bold disabled:opacity-50 min-h-[52px] cursor-pointer"
                >
                  {loading ? (
                    <><span className="material-symbols-outlined animate-spin">sync</span> Mengirim...</>
                  ) : (
                    <>{config.submitText} <span className="material-symbols-outlined">send</span></>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Side: Information & Preview Card */}
          <div className="lg:col-span-4 flex flex-col gap-5 md:gap-6">
            
            {/* Informational Banner for Informasi Publik */}
            {reportType === 'informasi' && (
              <div className="bg-[#6b0218] text-white p-6 rounded-xl shadow-md border-l-4 border-[#fed255]">
                <div className="flex items-start gap-3 mb-3">
                  <span className="material-symbols-outlined text-[#fed255] text-3xl shrink-0">info</span>
                  <h3 className="font-['Libre_Franklin'] text-[20px] font-bold leading-tight">Informasi Proses</h3>
                </div>
                <p className="font-['Public_Sans'] text-[14px] text-white/90 mb-4 leading-relaxed">
                  Permohonan akan diproses maksimal <span className="font-bold text-[#fed255]">10 hari kerja</span> sesuai UU Keterbukaan Informasi Publik.
                </p>
                <div className="bg-[#8b1e2c] p-3 rounded-lg flex gap-2.5 border border-white/10 items-center">
                  <span className="material-symbols-outlined text-[#fed255] text-xl shrink-0">verified_user</span>
                  <p className="font-['Public_Sans'] text-xs text-white/90 leading-relaxed">
                    Identitas Anda telah terverifikasi melalui akun ini.
                  </p>
                </div>
              </div>
            )}

            {/* Live Preview Card */}
            <div className="bg-white border border-[#debfbf] p-5 md:p-6 rounded-xl shadow-sm space-y-4">
              <h3 className="font-['Libre_Franklin'] text-[18px] md:text-[20px] font-semibold text-[#6b0218] flex items-center gap-2 border-b border-[#debfbf] pb-3">
                <span className="material-symbols-outlined">visibility</span>
                Preview Laporan
              </h3>

              <div className="w-full aspect-video bg-[#e5e2dd] rounded-lg flex items-center justify-center overflow-hidden border border-[#debfbf]">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <span className="material-symbols-outlined text-4xl text-[#574141]/30">image</span>
                    <p className="text-xs text-[#574141] mt-2">Pratinjau Media</p>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-[11px] font-bold text-[#574141] uppercase tracking-wider block">Jenis & Context</span>
                  <span className="inline-block px-2.5 py-0.5 mt-0.5 bg-[#6b0218]/10 text-[#6b0218] font-bold rounded text-xs capitalize">
                    {reportType}
                  </span>
                </div>

                {reportType === 'informasi' ? (
                  <>
                    <div>
                      <span className="text-[11px] font-bold text-[#574141] uppercase tracking-wider block">Instansi Tujuan</span>
                      <p className="font-['Public_Sans'] text-[#1c1c19]">{instansi || 'Belum dipilih'}</p>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-[#574141] uppercase tracking-wider block">Jenis Informasi</span>
                      <p className="font-['Public_Sans'] text-[#1c1c19]">{jenisInformasi || 'Belum dipilih'}</p>
                    </div>
                  </>
                ) : (
                  <div>
                    <span className="text-[11px] font-bold text-[#574141] uppercase tracking-wider block">Kategori</span>
                    <p className="font-['Public_Sans'] text-[#1c1c19]">{category || 'Belum dipilih'}</p>
                  </div>
                )}

                <div>
                  <span className="text-[11px] font-bold text-[#574141] uppercase tracking-wider block">Judul</span>
                  <p className="font-['Libre_Franklin'] font-semibold text-[#1c1c19] leading-tight">
                    {title || 'Belum ada judul'}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#574141] uppercase tracking-wider block">Lokasi (Alamat & Koordinat)</span>
                  <p className="font-['Public_Sans'] text-[#1c1c19] flex items-start gap-1 text-xs">
                    <span className="material-symbols-outlined text-sm shrink-0 text-[#6b0218] mt-0.5">place</span>
                    <span className="break-words">{locationData.address || 'Lokasi belum ditentukan pada peta'}</span>
                  </p>
                  {locationData.lat && locationData.lng && (
                    <span className="text-[10px] font-mono text-[#8b7171] ml-5 block mt-0.5">
                      Lat: {locationData.lat.toFixed(5)}, Lng: {locationData.lng.toFixed(5)}
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t border-[#debfbf]">
                  <span className="text-[11px] font-bold text-[#574141] uppercase tracking-wider block">Deskripsi / Detail</span>
                  <p className="font-['Public_Sans'] text-[#574141] text-xs line-clamp-4 italic">
                    {description || 'Isi laporan akan muncul di sini...'}
                  </p>
                </div>
              </div>

              <div className="bg-[#ffdad9]/30 p-3 rounded-lg flex gap-2.5 border border-[#debfbf]">
                <span className="material-symbols-outlined text-[#6b0218] shrink-0 text-lg">info</span>
                <p className="text-[11px] text-[#881c2a] leading-relaxed">
                  {config.sidebarInfo}
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

export default function LaporPage() {
  return (
    <Suspense fallback={<div className="pt-[110px] pb-20 text-center font-['Public_Sans']">Memuat Formulir Lapor...</div>}>
      <LaporForm />
    </Suspense>
  )
}
