'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function AdminLaporanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<any>(null)
  const [reporterProfile, setReporterProfile] = useState<any>(null)
  const [adminUser, setAdminUser] = useState<any>(null)

  // Status Change State
  const [newStatus, setNewStatus] = useState('')
  const [statusCatatan, setStatusCatatan] = useState('')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Public Toggle State
  const [isPublic, setIsPublic] = useState(true)
  const [isTogglingPublic, setIsTogglingPublic] = useState(false)

  // Chat State
  const [messages, setMessages] = useState<any[]>([])
  const [chatMessage, setChatMessage] = useState('')
  const [isSendingChat, setIsSendingChat] = useState(false)
  const [chatFile, setChatFile] = useState<File | null>(null)

  // KTP Modal State
  const [showKtpModal, setShowKtpModal] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setAdminUser(data.user)
      }
    }
    checkAdmin()
  }, [])

  useEffect(() => {
    if (id) {
      fetchReportDetail()
      fetchChatMessages()
    }
  }, [id])

  const fetchReportDetail = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('laporan')
        .select(`
          *,
          laporan_lampiran(*),
          status_log(*)
        `)
        .eq('id', id)
        .single()

      if (data) {
        if (data.status_log) {
          data.status_log.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        }
        setReport(data)
        setNewStatus(data.status)
        setIsPublic(data.is_public ?? true)

        // Fetch real reporter profile
        if (data.user_id) {
          const { data: profData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user_id)
            .single()

          if (profData) setReporterProfile(profData)
        }
      } else {
        console.error(error)
      }
    } catch (err) {
      console.error('Fetch detail error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchChatMessages = async () => {
    try {
      const { data: chatData } = await supabase
        .from('chat_messages')
        .select(`*, profiles:sender_id(full_name, role)`)
        .eq('laporan_id', id)
        .order('created_at', { ascending: true })

      if (chatData) {
        setMessages(chatData)
      }
    } catch (err) {
      console.error('Chat fetch error:', err)
    }
  }

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminUser) return
    if (!newStatus) return

    setIsUpdatingStatus(true)
    try {
      // 1. Update status on laporan table
      const { error: updateErr } = await supabase
        .from('laporan')
        .update({ status: newStatus })
        .eq('id', id)

      if (updateErr) throw updateErr

      // 2. Insert into status_log table
      const { error: logErr } = await supabase
        .from('status_log')
        .insert({
          laporan_id: id,
          status: newStatus,
          catatan: statusCatatan.trim() || `Status diubah menjadi ${newStatus} oleh petugas admin.`,
          changed_by: adminUser.id
        })

      if (logErr) console.warn('Status log insert warning:', logErr)

      alert('Status laporan berhasil diperbarui!')
      setStatusCatatan('')
      fetchReportDetail()
    } catch (err: any) {
      console.error(err)
      alert(`Gagal memperbarui status: ${err.message || 'Terjadi kesalahan'}`)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleTogglePublic = async () => {
    setIsTogglingPublic(true)
    try {
      const targetPublic = !isPublic
      const { error } = await supabase
        .from('laporan')
        .update({ is_public: targetPublic })
        .eq('id', id)

      if (error) throw error

      setIsPublic(targetPublic)
      setReport((prev: any) => ({ ...prev, is_public: targetPublic }))
      alert(`Status visibilitas berhasil diubah menjadi ${targetPublic ? 'PUBLIK' : 'PRIVAT'}`)
    } catch (err: any) {
      console.error(err)
      alert(`Gagal mengubah visibilitas: ${err.message || 'Terjadi kesalahan'}`)
    } finally {
      setIsTogglingPublic(false)
    }
  }

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminUser) return
    if (!chatMessage.trim() && !chatFile) return

    setIsSendingChat(true)
    try {
      let attachmentUrl: string | null = null

      if (chatFile) {
        const fileExt = chatFile.name.split('.').pop()
        const fileName = `admin-chat-${id}-${Date.now()}.${fileExt}`
        const filePath = `admin/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('laporan-lampiran')
          .upload(filePath, chatFile)

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('laporan-lampiran')
            .getPublicUrl(filePath)
          attachmentUrl = publicUrlData.publicUrl
        }
      }

      const { data: newMsg, error } = await supabase
        .from('chat_messages')
        .insert({
          laporan_id: id,
          sender_id: adminUser.id,
          message: chatMessage,
          attachment_url: attachmentUrl
        })
        .select(`*, profiles:sender_id(full_name, role)`)
        .single()

      if (error) throw error

      if (newMsg) {
        setMessages((prev) => [...prev, newMsg])
        setChatMessage('')
        setChatFile(null)
      }
    } catch (err: any) {
      console.error(err)
      alert(`Gagal mengirim pesan: ${err.message || 'Terjadi kesalahan'}`)
    } finally {
      setIsSendingChat(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6b0218]"></div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-[#debfbf] text-center">
          <p className="text-xl font-bold text-[#1c1c19] mb-4">Laporan tidak ditemukan.</p>
          <Link href="/admin" className="bg-[#6b0218] text-white px-6 py-2 rounded-lg font-semibold">
            Kembali ke Dashboard Admin
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="font-['Public_Sans'] bg-[#FAF7F2] text-[#1c1c19] min-h-screen">
      <Navbar />

      <main className="pt-20 md:pt-24 pb-20 px-4 sm:px-6 md:px-[40px] max-w-[1400px] mx-auto">
        {/* Top Breadcrumb & Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-[#574141]">
            <Link href="/admin" className="hover:underline font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span> Dashboard Admin
            </Link>
            <span>/</span>
            <span className="text-[#6b0218] font-bold">Kelola Laporan #{report.ticket_number || report.id}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle Public Button */}
            <button
              onClick={handleTogglePublic}
              disabled={isTogglingPublic}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                isPublic
                  ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200'
                  : 'bg-gray-200 border-gray-400 text-gray-800 hover:bg-gray-300'
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {isPublic ? 'visibility' : 'visibility_off'}
              </span>
              Visibilitas: {isPublic ? 'PUBLIK (Tampil di Feed)' : 'PRIVAT (Tersembunyi)'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Detail & Controls */}
          <div className="lg:col-span-2 space-y-8">
            {/* Main Report Details */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#debfbf] shadow-sm">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div>
                  <span className="px-3 py-1 bg-[#6b0218]/10 text-[#6b0218] rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                    {report.kategori}
                  </span>
                  <h1 className="font-['Libre_Franklin'] text-2xl md:text-3xl font-bold text-[#1c1c19] mt-1">
                    {report.judul}
                  </h1>
                  <p className="text-xs text-[#574141] mt-2 flex flex-wrap gap-4">
                    <span>📅 Dilaporkan pada {new Date(report.created_at).toLocaleString('id-ID')}</span>
                    <span>📍 Lokasi: {report.lokasi}</span>
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#574141] mb-2 border-b border-[#debfbf] pb-1">Deskripsi Laporan</h3>
                <p className="text-base text-[#1c1c19] leading-relaxed whitespace-pre-line bg-[#fcf9f4] p-4 rounded-xl border border-[#debfbf]">
                  {report.deskripsi}
                </p>
              </div>

              {/* Evidence Photos */}
              {report.laporan_lampiran && report.laporan_lampiran.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#574141] mb-3 border-b border-[#debfbf] pb-1">Lampiran Bukti Laporan</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {report.laporan_lampiran.map((lampiran: any) => (
                      <a key={lampiran.id} href={lampiran.file_url} target="_blank" rel="noreferrer" className="aspect-square rounded-xl overflow-hidden border border-[#debfbf] relative group block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={lampiran.file_url} alt="Evidence" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-white">open_in_new</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reporter Verification Card (Admin Only) */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#debfbf] shadow-sm">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#debfbf]">
                <div className="w-10 h-10 rounded-full bg-[#6b0218]/10 text-[#6b0218] flex items-center justify-center">
                  <span className="material-symbols-outlined">badge</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#1c1c19] font-['Libre_Franklin']">Identitas & Verifikasi Pelapor</h3>
                  <p className="text-xs text-[#574141]">Data sensitif pelapor (Hanya dapat diakses oleh Admin)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs text-[#574141] font-bold uppercase tracking-wider block">Nama Lengkap</span>
                    <p className="font-bold text-base text-[#1c1c19]">{reporterProfile?.full_name || 'Tidak ada data nama'}</p>
                  </div>

                  <div>
                    <span className="text-xs text-[#574141] font-bold uppercase tracking-wider block">Email Terdaftar</span>
                    <p className="font-semibold text-[#1c1c19]">{reporterProfile?.email || 'Tidak ada email'}</p>
                  </div>

                  <div>
                    <span className="text-xs text-[#574141] font-bold uppercase tracking-wider block">Role Akun</span>
                    <span className="px-2.5 py-0.5 bg-[#f6f3ee] border border-[#debfbf] rounded text-xs font-bold capitalize inline-block mt-0.5">
                      {reporterProfile?.role || 'citizen'}
                    </span>
                  </div>
                </div>

                {/* KTP Photo Section */}
                <div>
                  <span className="text-xs text-[#574141] font-bold uppercase tracking-wider block mb-2">Foto KTP Verifikasi</span>
                  {reporterProfile?.ktp_photo_url ? (
                    <div className="relative rounded-xl overflow-hidden border border-[#debfbf] group h-40 bg-[#f6f3ee]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={reporterProfile.ktp_photo_url}
                        alt="KTP Pelapor"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                        <button
                          onClick={() => setShowKtpModal(true)}
                          className="bg-white text-[#1c1c19] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">zoom_in</span> Zoom KTP
                        </button>
                        <a
                          href={reporterProfile.ktp_photo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-[#6b0218] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md"
                        >
                          <span className="material-symbols-outlined text-sm">open_in_new</span> Tab Baru
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="h-40 rounded-xl border border-dashed border-[#debfbf] bg-[#f6f3ee] flex flex-col items-center justify-center text-[#574141] p-4 text-center">
                      <span className="material-symbols-outlined text-3xl mb-1 text-[#8b7171]">no_sim</span>
                      <p className="text-xs font-semibold">Foto KTP belum diunggah oleh pelapor</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status Change Control Box */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#debfbf] shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#debfbf]">
                <div className="w-10 h-10 rounded-full bg-[#ffe08e] text-[#735a00] flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined">published_with_changes</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#1c1c19] font-['Libre_Franklin']">Kelola & Perbarui Status Laporan</h3>
                  <p className="text-xs text-[#574141]">Ubah status untuk mengabarkan progres kepada pelapor</p>
                </div>
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-[#574141] uppercase tracking-wider mb-3">Pilih Status Baru</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { key: 'diterima', label: 'Diterima', icon: 'inbox', color: 'border-blue-500 bg-blue-50 text-blue-900' },
                      { key: 'diproses', label: 'Diproses', icon: 'pending', color: 'border-yellow-500 bg-yellow-50 text-yellow-900' },
                      { key: 'ditindaklanjuti', label: 'Ditindaklanjuti', icon: 'gavel', color: 'border-purple-500 bg-purple-50 text-purple-900' },
                      { key: 'selesai', label: 'Selesai', icon: 'check_circle', color: 'border-green-500 bg-green-50 text-green-900' },
                    ].map((st) => (
                      <label
                        key={st.key}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer flex flex-col items-center text-center transition-all ${
                          newStatus === st.key
                            ? `${st.color} font-bold shadow-sm scale-105`
                            : 'border-[#debfbf] bg-white text-[#574141] hover:border-[#6b0218]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="statusChoice"
                          value={st.key}
                          checked={newStatus === st.key}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="sr-only"
                        />
                        <span className="material-symbols-outlined mb-1">{st.icon}</span>
                        <span className="text-xs font-semibold">{st.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#574141] uppercase tracking-wider mb-2">Catatan Tambahan untuk Pelapor / Log</label>
                  <textarea
                    rows={3}
                    className="w-full bg-[#fcf9f4] border border-[#debfbf] rounded-xl p-3 text-sm text-[#1c1c19] outline-none focus:ring-2 focus:ring-[#6b0218]"
                    placeholder="Contoh: Laporan telah diteruskan ke Dinas Pekerjaan Umum untuk perbaikan..."
                    value={statusCatatan}
                    onChange={(e) => setStatusCatatan(e.target.value)}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingStatus}
                  className="bg-[#6b0218] text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#8b1e2c] transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingStatus ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">sync</span> Memperbarui...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">save</span> Simpan Perubahan Status
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Status History Timeline */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#debfbf] shadow-sm">
              <h3 className="font-bold text-lg text-[#1c1c19] font-['Libre_Franklin'] mb-4 pb-2 border-b border-[#debfbf]">Riwayat Catatan Status</h3>
              <div className="space-y-4">
                {report.status_log && report.status_log.length > 0 ? (
                  report.status_log.map((log: any, idx: number) => (
                    <div key={log.id} className="p-4 bg-[#fcf9f4] border border-[#debfbf] rounded-xl flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#6b0218]/10 text-[#6b0218] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-sm">history</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#1c1c19] capitalize">Status: {log.status}</span>
                          <span className="text-xs text-[#574141]">• {new Date(log.created_at).toLocaleString('id-ID')}</span>
                        </div>
                        <p className="text-xs text-[#574141] mt-1">{log.catatan || 'Tidak ada catatan'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#574141]">Belum ada riwayat status tercatat.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Admin Chat Panel with Reporter */}
          <div className="lg:col-span-1">
            <div className="bg-[#f5f2ed] border border-[#debfbf] rounded-2xl overflow-hidden shadow-sm flex flex-col h-[650px] sticky top-24">
              {/* Chat Header */}
              <div className="p-4 bg-white border-b border-[#debfbf] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#6b0218] text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-lg">support_agent</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#1c1c19]">Chat dengan Pelapor</h4>
                    <p className="text-[11px] text-[#574141] truncate max-w-[180px]">
                      {reporterProfile?.full_name || 'Pelapor'}
                    </p>
                  </div>
                </div>
                <span className="bg-[#ffe08e] text-[#241a00] text-xs font-bold px-2.5 py-1 rounded-full">
                  {messages.length} pesan
                </span>
              </div>

              {/* Chat Messages List */}
              <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages && messages.length > 0 ? (
                  messages.map((msg: any) => {
                    const isMyAdminMessage = adminUser && adminUser.id === msg.sender_id

                    return (
                      <div key={msg.id} className={`flex flex-col ${isMyAdminMessage ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[11px] font-bold text-[#574141] flex items-center gap-1">
                            {isMyAdminMessage ? (
                              <span className="text-[#6b0218] flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">verified</span> Petugas Instansi (Anda)
                              </span>
                            ) : (
                              reporterProfile?.full_name || 'Pelapor'
                            )}
                          </span>
                          <span className="text-[10px] text-[#8b7171]">
                            {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className={`p-3.5 rounded-2xl max-w-[88%] text-xs leading-relaxed shadow-sm ${
                          isMyAdminMessage
                            ? 'bg-[#6b0218] text-white rounded-tr-none'
                            : 'bg-white text-[#1c1c19] border border-[#debfbf] rounded-tl-none'
                        }`}>
                          {msg.message}

                          {msg.attachment_url && (
                            <div className="mt-2 pt-2 border-t border-white/20">
                              <a
                                href={msg.attachment_url}
                                target="_blank"
                                rel="noreferrer"
                                className={`text-[11px] flex items-center gap-1 font-bold underline ${
                                  isMyAdminMessage ? 'text-[#ffe08e]' : 'text-[#6b0218]'
                                }`}
                              >
                                <span className="material-symbols-outlined text-xs">attach_file</span> Lampiran Pesan
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-[#574141] p-6 text-center">
                    <span className="material-symbols-outlined text-4xl mb-2 text-[#6b0218]">forum</span>
                    <p className="font-bold text-xs text-[#1c1c19] mb-1">Belum Ada Pesan Chat</p>
                    <p className="text-[11px] text-[#574141]">Balas atau kirim pesan pertama ke pelapor laporan ini.</p>
                  </div>
                )}
              </div>

              {/* Chat Form */}
              <div className="p-3 bg-white border-t border-[#debfbf]">
                <form onSubmit={handleSendChat} className="space-y-2">
                  {chatFile && (
                    <div className="flex items-center justify-between bg-[#ffe08e]/30 border border-[#ffe08e] p-2 rounded-lg text-xs font-semibold text-[#241a00]">
                      <span className="truncate flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">attach_file</span> {chatFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setChatFile(null)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  )}

                  <div className="flex items-end gap-2 bg-[#fcf9f4] border border-[#debfbf] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#6b0218]">
                    <textarea
                      rows={2}
                      className="flex-grow bg-transparent border-none outline-none text-xs resize-none py-1"
                      placeholder="Balas pesan pelapor sebagai petugas admin..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      disabled={isSendingChat}
                    ></textarea>

                    <button
                      type="submit"
                      disabled={isSendingChat || (!chatMessage.trim() && !chatFile)}
                      className="bg-[#6b0218] text-white w-9 h-9 rounded-lg flex items-center justify-center shadow-md hover:bg-[#8b1e2c] transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
                    >
                      {isSendingChat ? (
                        <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                      ) : (
                        <span className="material-symbols-outlined text-sm">send</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* KTP Modal Zoom */}
      {showKtpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowKtpModal(false)}>
          <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#debfbf]">
              <h3 className="font-bold text-base text-[#1c1c19]">Foto KTP Verifikasi - {reporterProfile?.full_name}</h3>
              <button onClick={() => setShowKtpModal(false)} className="text-gray-500 hover:text-black">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="max-h-[80vh] overflow-auto flex items-center justify-center bg-[#f6f3ee] rounded-xl p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={reporterProfile?.ktp_photo_url} alt="KTP Zoom" className="max-w-full h-auto object-contain rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
