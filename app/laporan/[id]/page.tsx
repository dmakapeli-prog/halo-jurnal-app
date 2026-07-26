'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

export default function LaporanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  
  // Chat states
  const [messages, setMessages] = useState<any[]>([])
  const [chatMessage, setChatMessage] = useState('')
  const [isSendingChat, setIsSendingChat] = useState(false)
  const [chatFile, setChatFile] = useState<File | null>(null)
  const [hasLiked, setHasLiked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
      }
    })
  }, [])

  useEffect(() => {
    if (id) {
      fetchReportDetail()
      fetchChatMessages()
    }
  }, [id, user])

  const fetchChatMessages = async () => {
    try {
      const { data: chatData, error } = await supabase
        .from('chat_messages')
        .select(`*, profiles:sender_id(full_name, role)`)
        .eq('laporan_id', id)
        .order('created_at', { ascending: true })

      if (!error && chatData) {
        setMessages(chatData)
      }
    } catch (err) {
      console.error('Chat fetch error:', err)
    }
  }

  const fetchReportDetail = async () => {
    setLoading(true)
    
    // Fetch report with relations
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

      // Check if user has liked
      if (user) {
        const { data: likeData } = await supabase
          .from('dukungan')
          .select('id')
          .eq('laporan_id', id)
          .eq('user_id', user.id)
          .single()
          
        if (likeData) {
          setHasLiked(true)
        }
      }
    } else {
      console.error(error)
    }
    setLoading(false)
  }

  const handleLike = async () => {
    if (!user) {
      alert("Silakan login untuk memberikan dukungan.")
      return
    }
    if (isLiking || hasLiked) return

    setIsLiking(true)
    try {
      const { error } = await supabase
        .from('dukungan')
        .insert({
          laporan_id: id,
          user_id: user.id
        })

      if (error) throw error

      const newCount = (report.dukungan_count || 0) + 1
      await supabase
        .from('laporan')
        .update({ dukungan_count: newCount })
        .eq('id', id)

      setReport({ ...report, dukungan_count: newCount })
      setHasLiked(true)
    } catch (err) {
      console.error(err)
      alert("Gagal memberikan dukungan.")
    } finally {
      setIsLiking(false)
    }
  }

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert("Silakan login terlebih dahulu untuk menggunakan fitur chat privat.")
      return
    }
    if (!chatMessage.trim() && !chatFile) return

    setIsSendingChat(true)
    try {
      let attachmentUrl: string | null = null

      if (chatFile) {
        const fileExt = chatFile.name.split('.').pop()
        const fileName = `chat-${id}-${Date.now()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

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
          sender_id: user.id,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'selesai':
        return (
          <span className="bg-[#e7f5ed] text-[#1a7f47] px-4 py-1.5 rounded-full font-['Public_Sans'] font-semibold text-[14px] flex items-center gap-2 border border-[#b7e4c7]">
            <span className="material-symbols-outlined text-[16px]">check_circle</span> Selesai
          </span>
        )
      case 'diproses':
        return (
          <span className="bg-[#fff9e6] text-[#b38600] px-4 py-1.5 rounded-full font-['Public_Sans'] font-semibold text-[14px] flex items-center gap-2 border border-[#ffe08e]">
            <span className="w-2 h-2 bg-[#b38600] rounded-full animate-pulse"></span> Sedang Diproses
          </span>
        )
      case 'diterima':
        return (
          <span className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full font-['Public_Sans'] font-semibold text-[14px] flex items-center gap-2 border border-gray-300">
            <span className="material-symbols-outlined text-[16px]">inbox</span> Diterima
          </span>
        )
      default:
        return (
          <span className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full font-['Public_Sans'] font-semibold text-[14px] flex items-center gap-2 border border-gray-300 capitalize">
            {status}
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcf9f4] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6b0218]"></div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#fcf9f4] flex items-center justify-center">
        <p className="text-xl">Laporan tidak ditemukan.</p>
      </div>
    )
  }

  const isOwner = user && user.id === report.user_id
  // Privacy rule: hide identity if it's public and viewer is not the owner
  // In our simplified setup, we'll just not display the reporter's full name directly on the report details anyway.

  return (
    <div className="font-['Public_Sans'] bg-[#fcf9f4] text-[#1c1c19] min-h-screen">
      <Navbar showLoginButton={false} actionButton={
        user ? (
          <Link href="/beranda" className="bg-[#ffe08e] text-[#241a00] px-6 py-2 rounded-lg text-[14px] font-semibold hover:opacity-90 transition-opacity">
            Dashboard
          </Link>
        ) : (
          <Link href="/login" className="bg-[#ffe08e] text-[#241a00] px-6 py-2 rounded-lg text-[14px] font-semibold hover:opacity-90 transition-opacity">
            Login
          </Link>
        )
      } />

      <main className="pt-16 md:pt-20 min-h-screen">
        <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-80px)] h-auto">
          {/* Left Column: Report Details */}
          <section className="flex-grow overflow-y-auto p-4 sm:p-5 md:p-[40px] max-w-4xl lg:border-r border-[#debfbf] bg-[#fcf9f4] custom-scrollbar">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 mb-8 text-[#574141]">
              <Link href={isOwner ? "/laporan-saya" : "/feed-publik"} className="text-[14px] hover:underline">
                {isOwner ? "Laporan Saya" : "Feed Publik"}
              </Link>
              <span className="material-symbols-outlined text-sm">chevron_right</span>
              <span className="text-[14px] text-[#6b0218] font-bold">ID #{report.ticket_number || report.id}</span>
            </nav>

            {/* Header Info */}
            <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
              <div className="flex-1">
                <span className="px-3 py-1 bg-[#6b0218]/10 text-[#6b0218] rounded-full text-[12px] font-bold uppercase tracking-wider mb-2 inline-block">
                  {report.kategori}
                </span>
                <h1 className="font-['Libre_Franklin'] text-[22px] sm:text-[28px] md:text-[32px] font-bold text-[#1c1c19] mt-2">
                  {report.judul}
                </h1>
                <p className="text-[#574141] mt-2 flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-[13px] sm:text-[14px]">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    Dilaporkan pada {new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1 text-[#6b0218]">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {report.lokasi}
                  </span>
                </p>
                {!isOwner && report.is_public && (
                   <p className="text-[#574141] mt-2 flex items-center gap-1 text-sm italic">
                     <span className="material-symbols-outlined text-sm">person_off</span> Pelapor Anonim (Terenkripsi)
                   </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                {getStatusBadge(report.status)}
                
                {/* Support Button (for public viewing) */}
                {!isOwner && report.is_public && (
                  <button 
                    onClick={handleLike}
                    disabled={isLiking || hasLiked}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold text-sm transition-all ${
                      hasLiked 
                        ? 'bg-[#ffe08e] border-[#ffe08e] text-[#241a00]' 
                        : 'border-[#6b0218] text-[#6b0218] hover:bg-[#6b0218]/10'
                    }`}
                  >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: hasLiked ? "'FILL' 1" : "'FILL' 0" }}>
                      thumb_up
                    </span>
                    {hasLiked ? 'Didukung' : 'Dukung Laporan'} ({report.dukungan_count || 0})
                  </button>
                )}
                {isOwner && (
                  <span className="text-sm font-semibold text-[#574141] flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">thumb_up</span> {report.dukungan_count || 0} Dukungan
                  </span>
                )}
              </div>
            </div>

            {/* Description Section */}
            <div className="mb-12">
              <h2 className="font-['Libre_Franklin'] text-[20px] md:text-[24px] font-semibold border-b border-[#debfbf] pb-3 mb-4 text-[#1c1c19]">Deskripsi Laporan</h2>
              <p className="text-[16px] text-[#1c1c19] leading-relaxed whitespace-pre-line">
                {report.deskripsi}
              </p>
            </div>

            {/* Attachments Section */}
            {report.laporan_lampiran && report.laporan_lampiran.length > 0 && (
              <div className="mb-12">
                <h2 className="font-['Libre_Franklin'] text-[20px] md:text-[24px] font-semibold border-b border-[#debfbf] pb-3 mb-4 text-[#1c1c19]">Lampiran Bukti</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {report.laporan_lampiran.map((lampiran: any) => (
                    <a key={lampiran.id} href={lampiran.file_url} target="_blank" rel="noreferrer" className="relative group aspect-square rounded-lg overflow-hidden border border-[#debfbf] cursor-zoom-in block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={lampiran.file_url} 
                        alt="Lampiran Bukti" 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Status Timeline */}
            <div className="mb-12">
              <h2 className="font-['Libre_Franklin'] text-[20px] md:text-[24px] font-semibold border-b border-[#debfbf] pb-3 mb-4 text-[#1c1c19]">Riwayat Status</h2>
              <div className="relative ml-4 space-y-8 py-4">
                {/* Connecting line */}
                <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-[#e5e2dd] z-0"></div>
                
                {report.status_log && report.status_log.length > 0 ? (
                  report.status_log.map((log: any, index: number) => {
                    const isLatest = index === 0;
                    return (
                      <div key={log.id} className={`relative z-10 flex gap-6 ${!isLatest ? 'opacity-60' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-[#fcf9f4] shadow-sm shrink-0 ${isLatest ? 'bg-[#ffe08e]' : 'bg-[#8b7171]'}`}>
                          <span className={`material-symbols-outlined text-[16px] ${isLatest ? 'text-[#241a00]' : 'text-white'}`} style={{ fontVariationSettings: isLatest ? "'FILL' 1" : "'FILL' 0" }}>
                            {log.status === 'selesai' ? 'check' : (log.status === 'diproses' ? 'sync' : 'send')}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-[14px] text-[#1c1c19] capitalize">Laporan {log.status}</h4>
                          <p className="text-[12px] text-[#574141] mt-1">
                            {new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                          {log.catatan && (
                            <p className="text-sm mt-2 p-3 bg-[#f6f3ee] rounded border border-[#debfbf] text-[#1c1c19]">
                              {log.catatan}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-[#574141] relative z-10">Belum ada riwayat status.</p>
                )}
              </div>
            </div>
          </section>

          {/* Right Column: Private Chat Panel */}
          <section id="chat-admin" className="w-full lg:w-[450px] flex flex-col bg-[#f5f2ed] border-t lg:border-t-0 lg:border-l border-[#debfbf] min-h-[450px] lg:min-h-[500px] lg:h-full overflow-hidden relative">
            {/* Panel Header */}
            <div className="p-4 bg-white border-b border-[#debfbf] flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#6b0218]/10 flex items-center justify-center text-[#6b0218]">
                  <span className="material-symbols-outlined text-[20px]">forum</span>
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-[#1c1c19] leading-tight">Chat Privat dengan Admin</h3>
                  <p className="text-[11px] text-[#574141]">Kanal komunikasi langsung & rahasia</p>
                </div>
              </div>
              <span className="bg-[#ffe08e] text-[#241a00] text-xs font-bold px-2.5 py-1 rounded-full">
                {messages.length} pesan
              </span>
            </div>

            {/* Chat Thread List */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages && messages.length > 0 ? (
                messages.map((msg: any) => {
                  const isMyMessage = user && user.id === msg.sender_id
                  const isAdmin = msg.profiles?.role === 'admin' || msg.profiles?.role === 'petugas' || (!isMyMessage && msg.sender_id !== report.user_id)

                  return (
                    <div key={msg.id} className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[12px] font-bold text-[#574141] flex items-center gap-1">
                          {isMyMessage ? (
                            'Anda'
                          ) : isAdmin ? (
                            <span className="flex items-center gap-1 text-[#6b0218]">
                              <span className="material-symbols-outlined text-xs">verified</span> Petugas Instansi
                            </span>
                          ) : (
                            'Pelapor'
                          )}
                        </span>
                        <span className="text-[10px] text-[#8b7171]">
                          {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className={`p-3.5 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${
                        isMyMessage
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
                              className={`text-xs flex items-center gap-1 font-bold underline ${isMyMessage ? 'text-[#ffe08e]' : 'text-[#6b0218]'}`}
                            >
                              <span className="material-symbols-outlined text-sm">attach_file</span> Lihat Lampiran Pesan
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-[#574141] opacity-70 p-6 text-center">
                  <span className="material-symbols-outlined text-5xl mb-3 text-[#6b0218]">chat</span>
                  <h4 className="font-bold text-sm text-[#1c1c19] mb-1">Belum Ada Percakapan</h4>
                  <p className="text-xs text-[#574141] max-w-xs">
                    Gunakan panel ini untuk berkomunikasi secara privat dengan petugas instansi mengenai laporan Anda.
                  </p>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-[#debfbf]">
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

                <div className="flex items-end gap-2 bg-[#fcf9f4] border border-[#debfbf] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#6b0218] focus-within:border-transparent transition-all">
                  <textarea
                    className="flex-grow bg-transparent border-none focus:ring-0 text-sm py-1.5 resize-none outline-none min-h-[40px] max-h-[100px]"
                    placeholder={user ? "Tulis pesan ke petugas..." : "Login untuk mengirim pesan..."}
                    rows={2}
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    disabled={!user || isSendingChat}
                  ></textarea>

                  <button
                    type="submit"
                    disabled={!user || isSendingChat || (!chatMessage.trim() && !chatFile)}
                    className="bg-[#6b0218] text-white w-10 h-10 rounded-lg flex items-center justify-center shadow-md hover:bg-[#8b1e2c] transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
                  >
                    {isSendingChat ? (
                      <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                    ) : (
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-center text-[#8b7171]">
                  Pesan bersifat rahasia dan hanya dapat dilihat oleh pelapor dan petugas instansi.
                </p>
              </form>
            </div>
          </section>
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #debfbf;
            border-radius: 10px;
        }
      `}} />
    </div>
  )
}
