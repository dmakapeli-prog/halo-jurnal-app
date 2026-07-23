'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

function LaporForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  
  // Form state
  const reportType = searchParams.get('type') || 'pengaduan'
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user)
    })
  }, [])

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
    if (!category || !title || !description || !location) {
      alert('Mohon lengkapi semua field yang wajib.')
      return
    }

    setLoading(true)
    try {
      // Generate ticket number: JS-YYYYMMDD-XXXX
      const date = new Date()
      const yyyy = date.getFullYear()
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const dd = String(date.getDate()).padStart(2, '0')
      const random4 = Math.floor(1000 + Math.random() * 9000)
      const ticketNumber = `JS-${yyyy}${mm}${dd}-${random4}`

      // 1. Insert Laporan
      const { data: laporan, error: laporanError } = await supabase
        .from('laporan')
        .insert({
          ticket_number: ticketNumber,
          user_id: user.id,
          jenis: reportType,
          kategori: category,
          judul: title,
          deskripsi: description,
          lokasi: location,
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
        <header className="mb-6 md:mb-12">
          <h1 className="font-['Libre_Franklin'] text-2xl sm:text-3xl md:text-[48px] font-bold text-[#6b0218] mb-2">Sampaikan Aspirasi Anda</h1>
          <p className="font-['Public_Sans'] text-[14px] md:text-[18px] text-[#574141] max-w-2xl">Formulir resmi pelaporan masyarakat. Pastikan data yang Anda masukkan valid untuk mempercepat proses peninjauan.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-[24px] items-start">
          {/* Left Side: Form Fields */}
          <div className="lg:col-span-8 bg-white border border-[#debfbf] p-5 md:p-8 rounded-xl shadow-sm">
            <form className="space-y-6 md:space-y-8" onSubmit={handleSubmit}>
              {/* Jenis Laporan */}
              <div className="bg-[#f0ede9] p-3 md:p-4 rounded-lg border border-[#debfbf]">
                <p className="font-['Public_Sans'] text-[13px] md:text-[14px] text-[#574141] mb-1">Jenis Laporan (otomatis)</p>
                <p className="font-['Libre_Franklin'] text-[16px] md:text-[18px] font-semibold text-[#1c1c19] capitalize">{reportType}</p>
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block font-['Public_Sans'] text-[14px] font-bold mb-2 text-[#1c1c19]">Kategori Laporan</label>
                <select 
                  className="w-full bg-[#fcf9f4] border-[1.5px] border-[#8b7171] rounded-lg p-3 font-['Public_Sans'] focus:ring-2 focus:ring-[#ffdad9] focus:border-[#6b0218] outline-none transition-all appearance-none cursor-pointer min-h-[48px]"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Infrastruktur">Infrastruktur</option>
                  <option value="Kebersihan">Kebersihan Lingkungan</option>
                  <option value="Keamanan">Keamanan & Ketertiban</option>
                  <option value="Pelayanan Publik">Pelayanan Publik</option>
                  <option value="Kesehatan">Kesehatan</option>
                </select>
              </div>

              {/* Title Input */}
              <div>
                <label className="block font-['Public_Sans'] text-[14px] font-bold mb-2 text-[#1c1c19]">Judul Laporan</label>
                <input 
                  type="text" 
                  className="w-full bg-[#fcf9f4] border-[1.5px] border-[#8b7171] rounded-lg p-3 font-['Public_Sans'] focus:ring-2 focus:ring-[#ffdad9] focus:border-[#6b0218] outline-none transition-all"
                  placeholder="Contoh: Lampu Jalan Padam di Jl. Merdeka"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Description Textarea */}
              <div>
                <label className="block font-['Public_Sans'] text-[14px] font-bold mb-2 text-[#1c1c19]">Isi Laporan</label>
                <textarea 
                  className="w-full bg-[#fcf9f4] border-[1.5px] border-[#8b7171] rounded-lg p-3 font-['Public_Sans'] focus:ring-2 focus:ring-[#ffdad9] focus:border-[#6b0218] outline-none transition-all"
                  placeholder="Jelaskan secara detail mengenai aspirasi atau keluhan Anda..." 
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              {/* Location Input */}
              <div>
                <label className="block font-['Public_Sans'] text-[14px] font-bold mb-2 text-[#1c1c19]">Lokasi Kejadian</label>
                <div className="relative">
                  <input 
                    type="text" 
                    className="w-full bg-[#fcf9f4] border-[1.5px] border-[#8b7171] rounded-lg p-3 pl-10 font-['Public_Sans'] focus:ring-2 focus:ring-[#ffdad9] focus:border-[#6b0218] outline-none transition-all"
                    placeholder="Masukkan alamat lengkap"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <span className="material-symbols-outlined absolute left-3 top-3.5 text-[#574141]">location_on</span>
                </div>
              </div>

              {/* Photo/Video Attachment */}
              <div 
                className={`p-5 sm:p-6 border-2 border-dashed ${dragOver ? 'border-[#6b0218] bg-[#ffdad9]/20' : 'border-[#debfbf] bg-[#f6f3ee]'} rounded-xl text-center transition-colors`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <span className="material-symbols-outlined text-3xl sm:text-4xl text-[#6b0218] mb-3 sm:mb-4">cloud_upload</span>
                <p className="font-['Public_Sans'] text-[13px] sm:text-[14px] font-bold text-[#574141] mb-3 sm:mb-4">Seret & lepas foto atau video bukti di sini</p>
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                />
                <button 
                  type="button" 
                  className="border-[1.5px] border-[#6b0218] text-[#6b0218] px-5 sm:px-6 py-2.5 font-['Public_Sans'] text-[14px] font-bold rounded-lg hover:bg-[#ffdad9] transition-colors min-h-[44px]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Pilih File
                </button>
                <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 justify-center">
                  {file && (
                    <span className="bg-[#ffe08e] text-[#241a00] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 max-w-full truncate">
                      <span className="material-symbols-outlined text-sm shrink-0">attach_file</span> <span className="truncate">{file.name}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 md:pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#fed255] text-[#735a00] py-4 font-['Public_Sans'] text-[16px] md:text-[18px] rounded-lg shadow-sm hover:opacity-90 transition-all flex justify-center items-center gap-2 font-bold disabled:opacity-50 min-h-[52px]"
                >
                  {loading ? (
                    <><span className="material-symbols-outlined animate-spin">sync</span> Mengirim...</>
                  ) : (
                    <>Kirim Aspirasi <span className="material-symbols-outlined">send</span></>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Side: Tips / Verification */}
          <div className="lg:col-span-4 flex flex-col gap-5 md:gap-6">
            {/* Lampiran Upload */}
            <div className="bg-white border border-[#debfbf] p-5 md:p-8 rounded-xl shadow-sm">
              <h3 className="font-['Libre_Franklin'] text-[20px] md:text-[24px] font-semibold text-[#6b0218] mb-4 md:mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined">visibility</span>
                Preview Laporan
              </h3>
              <div className="space-y-5 md:space-y-6">
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

                <div className="space-y-3 md:space-y-4">
                  <div>
                    <span className="text-xs font-bold text-[#574141] uppercase tracking-wider">Kategori</span>
                    <p className="font-['Public_Sans'] text-[#1c1c19]">{category || "Belum dipilih"}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#574141] uppercase tracking-wider">Judul</span>
                    <p className="font-['Libre_Franklin'] text-[16px] md:text-[18px] font-semibold text-[#1c1c19] leading-tight">{title || "Belum ada judul"}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#574141] uppercase tracking-wider">Lokasi</span>
                    <p className="font-['Public_Sans'] text-[#1c1c19] flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm shrink-0">place</span>
                      <span className="truncate">{location || "Lokasi tidak ditentukan"}</span>
                    </p>
                  </div>
                  <div className="pt-3 md:pt-4 border-t border-[#debfbf]">
                    <span className="text-xs font-bold text-[#574141] uppercase tracking-wider">Deskripsi</span>
                    <p className="font-['Public_Sans'] text-[#574141] line-clamp-4 italic">{description || "Isi laporan akan muncul di sini..."}</p>
                  </div>
                </div>

                <div className="bg-[#ffdad9]/30 p-3 md:p-4 rounded-lg flex gap-3">
                  <span className="material-symbols-outlined text-[#6b0218] shrink-0">info</span>
                  <p className="text-xs text-[#881c2a] leading-relaxed">
                    Pastikan semua informasi benar. Laporan yang sudah dikirim akan diverifikasi oleh petugas dalam waktu maksimal 2x24 jam.
                  </p>
                </div>
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
    <Suspense fallback={<div className="pt-[110px] pb-20 text-center">Loading...</div>}>
      <LaporForm />
    </Suspense>
  )
}
