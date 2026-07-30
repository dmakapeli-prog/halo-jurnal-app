'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function ProfilPage() {
  const supabase = createClient()
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Form State
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  // KTP Signed URL & Zoom Modal State
  const [signedKtpUrl, setSignedKtpUrl] = useState<string | null>(null)
  const [showKtpModal, setShowKtpModal] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const getSignedUrl = async (bucketName: string, rawUrlOrPath: string | null) => {
    if (!rawUrlOrPath) return null
    if (rawUrlOrPath.includes('token=') || rawUrlOrPath.startsWith('blob:')) {
      return rawUrlOrPath
    }

    let filePath = rawUrlOrPath
    if (rawUrlOrPath.includes(`/storage/v1/object/public/${bucketName}/`)) {
      filePath = rawUrlOrPath.split(`/storage/v1/object/public/${bucketName}/`)[1]
    } else if (rawUrlOrPath.includes(`/${bucketName}/`)) {
      filePath = rawUrlOrPath.split(`/${bucketName}/`)[1]
    }
    filePath = filePath.split('?')[0]

    try {
      const { data } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 3600)

      if (data?.signedUrl) {
        return data.signedUrl
      }
    } catch (err) {
      console.error('Error generating signed URL:', err)
    }
    return rawUrlOrPath
  }

  const fetchProfile = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (prof) {
        setProfile(prof)
        setFullName(prof.full_name || '')
        setPhone(prof.phone || '')

        // Fetch Signed URL for KTP Photo if present
        if (prof.ktp_photo_url) {
          const ktpSigned = await getSignedUrl('ktp-photos', prof.ktp_photo_url)
          setSignedKtpUrl(ktpSigned)
        }
      }
    }
    setLoading(false)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return

    const selectedFile = e.target.files[0]
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('Ukuran foto profil maksimal 5MB.')
      return
    }

    setUploadingAvatar(true)
    try {
      const fileExt = selectedFile.name.split('.').pop()
      const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`

      // Upload to storage bucket
      const { error: uploadErr } = await supabase.storage
        .from('laporan-lampiran')
        .upload(filePath, selectedFile, { upsert: true })

      if (uploadErr) throw uploadErr

      const { data: urlData } = supabase.storage
        .from('laporan-lampiran')
        .getPublicUrl(filePath)

      const avatarUrl = urlData.publicUrl

      // Update profiles table
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id)

      if (updateErr) throw updateErr

      setProfile((prev: any) => ({ ...prev, avatar_url: avatarUrl }))
      alert('Foto profil berhasil diperbarui!')
    } catch (err: any) {
      console.error(err)
      alert(`Gagal mengunggah foto profil: ${err.message || 'Terjadi kesalahan'}`)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
        })
        .eq('id', user.id)

      if (error) throw error

      alert('Profil berhasil diperbarui!')
      setEditing(false)
      fetchProfile()
    } catch (err: any) {
      alert(`Gagal memperbarui profil: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf9f4] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#6b0218]"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fcf9f4] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-3">Silakan Login Terlebih Dahulu</h1>
        <p className="text-gray-600 mb-6">Anda perlu login untuk mengakses halaman profil.</p>
        <Link href="/login" className="bg-[#6b0218] text-white px-6 py-2.5 rounded-lg font-bold">
          Masuk / Login
        </Link>
      </div>
    )
  }

  const displayAvatar = profile?.avatar_url || null

  return (
    <div className="font-['Public_Sans'] bg-[#fcf9f4] text-[#1c1c19] min-h-screen flex flex-col">
      <Navbar showLoginButton={false} />

      <main className="flex-grow pt-24 md:pt-32 pb-16 px-5 md:px-[40px] max-w-4xl mx-auto w-full">
        {/* Profile Card Main Container */}
        <div className="bg-white border border-[#debfbf] rounded-2xl shadow-sm overflow-hidden">
          
          {/* Header Banner & Avatar Section */}
          <div className="bg-gradient-to-r from-[#6b0218] to-[#8b1e2c] p-6 md:p-8 text-white relative">
            <div className="flex flex-col md:flex-row items-center gap-6">
              
              {/* Avatar Image with Hover Upload Button */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-[#ffdad9] border-4 border-white flex items-center justify-center overflow-hidden shadow-md">
                  {displayAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-[#6b0218] text-5xl">person</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold gap-1"
                >
                  <span className="material-symbols-outlined text-lg">photo_camera</span>
                  {uploadingAvatar ? 'Proses...' : 'Ubah Foto'}
                </button>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>

              {/* User Identity Info */}
              <div className="text-center md:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                  <h1 className="font-['Libre_Franklin'] text-2xl md:text-3xl font-bold text-white">
                    {profile?.full_name || 'Pelapor Halo Jurnal'}
                  </h1>
                  {profile?.ktp_photo_url ? (
                    <span className="bg-green-500/20 border border-green-300 text-green-200 text-xs font-bold px-3 py-0.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">verified</span> KTP Terverifikasi
                    </span>
                  ) : (
                    <span className="bg-amber-500/20 border border-amber-300 text-amber-200 text-xs font-bold px-3 py-0.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">warning</span> Belum Verifikasi KTP
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-white/80 mb-3">{user?.email}</p>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="bg-white/20 hover:bg-white/30 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">upload</span>
                    {uploadingAvatar ? 'Mengunggah Foto...' : 'Ubah Foto Profil'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Form / Detail Body */}
          <div className="p-6 md:p-8 space-y-8">
            {/* Account Details Section */}
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#debfbf]">
                <h2 className="font-['Libre_Franklin'] text-lg font-bold text-[#1c1c19] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#6b0218]">account_circle</span> Detail Informasi Akun
                </h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-[#f6f3ee] text-[#6b0218] border border-[#debfbf] hover:bg-[#6b0218] hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span> Edit Informasi
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSave} className="space-y-4 max-w-lg bg-[#fcf9f4] p-5 rounded-xl border border-[#debfbf]">
                  <div>
                    <label className="block text-xs font-bold text-[#574141] uppercase tracking-wider mb-2">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white border border-[#debfbf] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#6b0218] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#574141] uppercase tracking-wider mb-2">Nomor Telepon / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="Contoh: 08123456789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-[#debfbf] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#6b0218] outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-[#6b0218] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[#8b1e2c] transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-300 transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#fcf9f4] border border-[#debfbf] p-5 rounded-xl text-sm">
                  <div>
                    <span className="text-xs text-[#574141] font-bold uppercase tracking-wider block mb-1">Nama Lengkap</span>
                    <p className="font-bold text-base text-[#1c1c19]">{profile?.full_name || '-'}</p>
                  </div>

                  <div>
                    <span className="text-xs text-[#574141] font-bold uppercase tracking-wider block mb-1">Alamat Email</span>
                    <p className="font-semibold text-base text-[#1c1c19]">{user?.email || '-'}</p>
                  </div>

                  <div>
                    <span className="text-xs text-[#574141] font-bold uppercase tracking-wider block mb-1">Nomor Telepon</span>
                    <p className="font-semibold text-base text-[#1c1c19]">{profile?.phone || '-'}</p>
                  </div>

                  <div>
                    <span className="text-xs text-[#574141] font-bold uppercase tracking-wider block mb-1">Hak Akses</span>
                    <span className="px-2.5 py-0.5 bg-gray-200 border border-gray-300 rounded text-xs font-bold capitalize inline-block mt-0.5">
                      {profile?.role || 'Citizen'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* REVISI 6: KTP Document Preview & Zoom Section */}
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#debfbf]">
                <h2 className="font-['Libre_Franklin'] text-lg font-bold text-[#1c1c19] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#6b0218]">badge</span> Dokumen KTP Verifikasi
                </h2>
              </div>

              {profile?.ktp_photo_url ? (
                <div className="bg-[#fcf9f4] border border-[#debfbf] p-5 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="md:col-span-1">
                    <div className="relative rounded-xl overflow-hidden border border-[#debfbf] group h-44 bg-gray-200 shadow-sm">
                      {signedKtpUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={signedKtpUrl}
                          alt="Foto KTP User"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                          <span className="material-symbols-outlined text-3xl animate-spin">sync</span>
                          <span className="text-xs mt-1">Memuat KTP...</span>
                        </div>
                      )}
                      
                      {signedKtpUrl && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                          <button
                            type="button"
                            onClick={() => setShowKtpModal(true)}
                            className="bg-white text-[#1c1c19] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">zoom_in</span> Zoom KTP
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                      <span className="material-symbols-outlined">check_circle</span>
                      Dokumen KTP Berhasil Diunggah
                    </div>
                    <p className="text-xs text-[#574141] leading-relaxed">
                      Dokumen KTP Anda tersimpan secara aman dalam sistem terenkripsi. Foto KTP ini digunakan oleh tim verifikasi untuk memastikan validitas pengaduan warga.
                    </p>
                    {signedKtpUrl && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setShowKtpModal(true)}
                          className="bg-[#6b0218] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#8b1e2c] transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span> Lihat & Zoom KTP Saya
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#fcf9f4] border border-dashed border-[#debfbf] p-6 rounded-xl text-center text-[#574141]">
                  <span className="material-symbols-outlined text-4xl text-[#8b7171] mb-2">no_sim</span>
                  <p className="font-bold text-sm text-[#1c1c19]">Belum ada dokumen KTP</p>
                  <p className="text-xs text-[#574141] mt-1">Anda belum mengunggah foto KTP verifikasi.</p>
                </div>
              )}
            </div>

            {/* Logout Action */}
            <div className="pt-6 border-t border-[#debfbf] flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-[#574141]">Sesi Akun</p>
                <p className="text-xs text-[#574141]">Keluar dari sesi login akun Anda di perangkat ini</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">logout</span> Logout / Keluar
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* KTP Modal Zoom */}
      {showKtpModal && signedKtpUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowKtpModal(false)}>
          <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#debfbf]">
              <h3 className="font-bold text-base text-[#1c1c19]">Foto KTP Verifikasi Saya - {profile?.full_name}</h3>
              <button onClick={() => setShowKtpModal(false)} className="text-gray-500 hover:text-black">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="max-h-[80vh] overflow-auto flex items-center justify-center bg-[#f6f3ee] rounded-xl p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={signedKtpUrl} alt="KTP Zoom" className="max-w-full h-auto object-contain rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
