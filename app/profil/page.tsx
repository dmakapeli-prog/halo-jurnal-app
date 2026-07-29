'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function ProfilPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

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
      }
    }
    setLoading(false)
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

  return (
    <div className="font-['Public_Sans'] bg-[#fcf9f4] text-[#1c1c19] min-h-screen flex flex-col">
      <Navbar showLoginButton={false} />

      <main className="flex-grow pt-24 md:pt-32 pb-16 px-5 md:px-[40px] max-w-4xl mx-auto w-full">
        <div className="bg-white border border-[#debfbf] rounded-2xl p-6 md:p-10 shadow-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-[#debfbf]">
            <div className="w-24 h-24 rounded-full bg-[#ffdad9] border-4 border-[#6b0218] flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
              {profile?.ktp_photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.ktp_photo_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[#6b0218] text-5xl">person</span>
              )}
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="font-['Libre_Franklin'] text-2xl md:text-3xl font-bold text-[#1c1c19]">
                  {profile?.full_name || 'Pelapor'}
                </h1>
                {profile?.ktp_photo_url ? (
                  <span className="bg-green-100 text-green-800 border border-green-300 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">verified</span> KTP Terverifikasi
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">warning</span> Belum Verifikasi KTP
                  </span>
                )}
              </div>
              <p className="text-sm text-[#574141] mb-3">{user?.email}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="text-xs font-semibold px-3 py-1 bg-[#f6f3ee] border border-[#debfbf] rounded-md text-[#574141] uppercase tracking-wider">
                  Role: {profile?.role || 'Citizen'}
                </span>
              </div>
            </div>
          </div>

          {/* Details / Edit Form */}
          <div className="pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Libre_Franklin'] text-xl font-bold text-[#1c1c19]">Detail Akun Saya</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-[#f6f3ee] text-[#6b0218] border border-[#debfbf] hover:bg-[#6b0218] hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">edit</span> Edit Profil
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSave} className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-xs font-bold text-[#574141] uppercase tracking-wider mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#fcf9f4] border border-[#debfbf] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#6b0218] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#574141] uppercase tracking-wider mb-2">Nomor Telepon / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="Contoh: 08123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#fcf9f4] border border-[#debfbf] rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#6b0218] outline-none"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#fcf9f4] border border-[#debfbf] p-6 rounded-xl">
                <div>
                  <span className="text-xs text-[#574141] font-bold uppercase tracking-wider block mb-1">Nama Lengkap</span>
                  <p className="font-semibold text-base text-[#1c1c19]">{profile?.full_name || '-'}</p>
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
                  <span className="text-xs text-[#574141] font-bold uppercase tracking-wider block mb-1">Status KTP</span>
                  <p className="font-semibold text-base text-[#1c1c19]">
                    {profile?.ktp_photo_url ? 'Sudah Diunggah' : 'Belum Diunggah'}
                  </p>
                </div>
              </div>
            )}

            {/* Logout Action */}
            <div className="mt-10 pt-6 border-t border-[#debfbf] flex justify-between items-center">
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

      <Footer />
    </div>
  )
}
