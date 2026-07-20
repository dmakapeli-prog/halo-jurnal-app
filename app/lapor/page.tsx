'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Footer from '@/components/Footer'

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
      {/* TopNavBar */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-[40px] h-[80px] bg-[#6b0218] shadow-md">
        <div className="flex items-center gap-8">
          <Link href="/beranda">
            <span className="font-['Libre_Franklin'] text-[32px] font-bold text-white">Halo Jurnal</span>
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href="/beranda" className="font-['Public_Sans'] text-[14px] font-semibold text-white/80 hover:text-[#ffe08e] transition-colors">Beranda</Link>
            <Link href="/feed-publik" className="font-['Public_Sans'] text-[14px] font-semibold text-white/80 hover:text-[#ffe08e] transition-colors">Feed Publik</Link>
            <Link href="/lapor" className="font-['Public_Sans'] text-[14px] font-semibold text-white border-b-2 border-[#ffe08e] transition-colors">Lapor</Link>
            <Link href="/laporan-saya" className="font-['Public_Sans'] text-[14px] font-semibold text-white/80 hover:text-[#ffe08e] transition-colors">Laporan Saya</Link>
            <Link href="#" className="font-['Public_Sans'] text-[14px] font-semibold text-white/80 hover:text-[#ffe08e] transition-colors">Tentang</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/beranda" className="bg-[#ffe08e] text-[#241a00] px-6 py-2 font-['Public_Sans'] text-[14px] font-semibold rounded-lg hover:opacity-90 transition-opacity">
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Content Canvas */}
      <main className="pt-[110px] pb-20 px-[40px] max-w-[1280px] mx-auto bg-[#fcf9f4] min-h-screen">
        {/* Header Section */}
        <header className="mb-12">
          <h1 className="font-['Libre_Franklin'] text-[48px] font-bold text-[#6b0218] mb-2">Sampaikan Aspirasi Anda</h1>
          <p className="font-['Public_Sans'] text-[18px] text-[#574141] max-w-2xl">Formulir resmi pelaporan masyarakat. Pastikan data yang Anda masukkan valid untuk mempercepat proses peninjauan.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] items-start">
          {/* Left Side: Form Fields */}
          <div className="lg:col-span-8 bg-white border border-[#debfbf] p-8 rounded-xl shadow-sm">
            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Jenis Laporan (Hidden visually but shown as read-only or just info) */}
              <div className="bg-[#f0ede9] p-4 rounded-lg border border-[#debfbf]">
                <p className="font-['Public_Sans'] text-[14px] text-[#574141] mb-1">Jenis Laporan (otomatis)</p>
                <p className="font-['Libre_Franklin'] text-[18px] font-semibold text-[#1c1c19] capitalize">{reportType}</p>
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block font-['Public_Sans'] text-[14px] font-bold mb-2 text-[#1c1c19]">Kategori Laporan</label>
                <select 
                  className="w-full bg-[#fcf9f4] border-[1.5px] border-[#8b7171] rounded-lg p-3 font-['Public_Sans'] focus:ring-2 focus:ring-[#ffdad9] focus:border-[#6b0218] outline-none transition-all appearance-none cursor-pointer"
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
                    placeholder="Masukkan alamat lengkap atau titik koordinat"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <span className="material-symbols-outlined absolute left-3 top-3.5 text-[#574141]">location_on</span>
                </div>
              </div>

              {/* Photo/Video Attachment */}
              <div 
                className={`p-6 border-2 border-dashed ${dragOver ? 'border-[#6b0218] bg-[#ffdad9]/20' : 'border-[#debfbf] bg-[#f6f3ee]'} rounded-xl text-center transition-colors`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <span className="material-symbols-outlined text-4xl text-[#6b0218] mb-4">cloud_upload</span>
                <p className="font-['Public_Sans'] text-[14px] font-bold text-[#574141] mb-4">Seret & lepas foto atau video bukti di sini</p>
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                />
                <button 
                  type="button" 
                  className="border-[1.5px] border-[#6b0218] text-[#6b0218] px-6 py-2 font-['Public_Sans'] text-[14px] font-bold rounded-lg hover:bg-[#ffdad9] transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Pilih File
                </button>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {file && (
                    <span className="bg-[#ffe08e] text-[#241a00] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">attach_file</span> {file.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#fed255] text-[#735a00] py-4 font-['Public_Sans'] text-[18px] rounded-lg shadow-sm hover:opacity-90 transition-all flex justify-center items-center gap-2 font-bold disabled:opacity-50"
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

          {/* Right Side: Sticky Summary Card */}
          <aside className="lg:col-span-4 lg:sticky lg:top-28">
            <div className="bg-[#ebe8e3] border border-[#debfbf] rounded-xl p-6 shadow-sm">
              <h3 className="font-['Libre_Franklin'] text-[24px] font-semibold text-[#6b0218] mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined">visibility</span>
                Preview Laporan
              </h3>
              <div className="space-y-6">
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

                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-[#574141] uppercase tracking-wider">Kategori</span>
                    <p className="font-['Public_Sans'] text-[#1c1c19]">{category || "Belum dipilih"}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#574141] uppercase tracking-wider">Judul</span>
                    <p className="font-['Libre_Franklin'] text-[18px] font-semibold text-[#1c1c19] leading-tight">{title || "Belum ada judul"}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#574141] uppercase tracking-wider">Lokasi</span>
                    <p className="font-['Public_Sans'] text-[#1c1c19] flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">place</span>
                      <span>{location || "Lokasi tidak ditentukan"}</span>
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#debfbf]">
                    <span className="text-xs font-bold text-[#574141] uppercase tracking-wider">Deskripsi</span>
                    <p className="font-['Public_Sans'] text-[#574141] line-clamp-4 italic">{description || "Isi laporan akan muncul di sini..."}</p>
                  </div>
                </div>

                <div className="bg-[#ffdad9]/30 p-4 rounded-lg flex gap-3">
                  <span className="material-symbols-outlined text-[#6b0218]">info</span>
                  <p className="text-xs text-[#881c2a] leading-relaxed">
                    Pastikan semua informasi benar. Laporan yang sudah dikirim akan diverifikasi oleh petugas dalam waktu maksimal 2x24 jam.
                  </p>
                </div>
              </div>
            </div>
          </aside>
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
