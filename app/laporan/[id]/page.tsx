'use client'

import { useState, useEffect, useRef } from 'react'
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

  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatFileRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

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
    if (id) {
      fetchReportDetail()
      fetchChatMessages()
    }
  }, [id, user])

  // Realtime subscription for new chat messages
  useEffect(() => {
    if (!id) return

    const channel = supabase
      .channel(`chat_messages:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `laporan_id=eq.${id}`,
        },
        async (payload: any) => {
          const newMsg = payload.new
          if (!newMsg) return

          // Fetch sender profile so role and full_name are populated
          const { data: fullMsg } = await supabase
            .from('chat_messages')
            .select(`*, profiles:sender_id(full_name, role)`)
            .eq('id', newMsg.id)
            .single()

          const msgToAdd = fullMsg || newMsg

          setMessages((prev) => {
            if (prev.some((m) => m.id === msgToAdd.id)) {
              return prev
            }
            return [...prev, msgToAdd]
          })

          if (user && msgToAdd.sender_id !== user.id) {
            markMessagesAsRead([msgToAdd])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [id, user, supabase])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchChatMessages = async () => {
    try {
      const { data: chatData, error } = await supabase
        .from('chat_messages')
        .select(`*, profiles:sender_id(full_name, role)`)
        .eq('laporan_id', id)
        .order('created_at', { ascending: true })

      if (!error && chatData) {
        setMessages(chatData)
        // Mark messages from other party as read
        if (user) {
          markMessagesAsRead(chatData)
        }
      }
    } catch (err) {
      console.error('Chat fetch error:', err)
    }
  }

  const markMessagesAsRead = async (msgs: any[]) => {
    if (!user) return
    const unreadIds = msgs
      .filter((m: any) => m.sender_id !== user.id && !m.read_at)
      .map((m: any) => m.id)
    if (unreadIds.length === 0) return
    try {
      await supabase
        .from('chat_messages')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadIds)
    } catch (err) {
      console.error('Mark as read error:', err)
    }
  }

  const fetchReportDetail = async () => {
    setLoading(true)

    if (id === 'demo-1' || id.startsWith('demo')) {
      const demoDetail = {
        id: 'demo-1',
        ticket_number: 'JS-20260728-5266',
        judul: 'data anggaran kebersihan 2025',
        kategori: 'Anggaran',
        jenis: 'informasi',
        deskripsi: 'Permohonan rincian data dokumen anggaran kebersihan Pemda Kota Sukabumi Tahun Anggaran 2025 untuk transparansi publik.',
        lokasi: 'Kota Sukabumi',
        status: 'ditindaklanjuti',
        is_public: true,
        dukungan_count: 5,
        user_id: 'demo-user-id',
        created_at: '2026-07-28T10:00:00Z',
        status_log: [
          { id: 'l1', status: 'ditindaklanjuti', catatan: 'Tim telah berkoordinasi dengan DLH untuk penerbitan berkas.', created_at: '2026-07-29T09:00:00Z' },
          { id: 'l2', status: 'diterima', catatan: 'Laporan baru diterima oleh sistem.', created_at: '2026-07-28T10:00:00Z' }
        ]
      }
      setReport(demoDetail)
      setMessages([
        { id: 'm1', message: 'Selamat siang min, permohonan data rincian anggaran kebersihan 2025 sudah sampai mana ya?', created_at: '2026-07-28T10:15:00Z', sender_id: 'demo-user-id', read_at: '2026-07-28T10:20:00Z' },
        { id: 'm2', message: 'Halo Pak, tim kami sedang menyiapkan dokumen RKA Dinas Lingkungan Hidup.', created_at: '2026-07-28T10:25:00Z', sender_id: 'admin-id', read_at: '2026-07-28T10:30:00Z', profiles: { role: 'admin' } }
      ])
      setUser({ id: 'demo-user-id' })
      setLoading(false)
      return
    }

    try {
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
        const demoDetail = {
          id: 'demo-1',
          ticket_number: 'JS-20260728-5266',
          judul: 'data anggaran kebersihan 2025',
          kategori: 'Anggaran',
          jenis: 'informasi',
          deskripsi: 'Permohonan rincian data dokumen anggaran kebersihan Pemda Kota Sukabumi Tahun Anggaran 2025 untuk transparansi publik.',
          lokasi: 'Kota Sukabumi',
          status: 'ditindaklanjuti',
          is_public: true,
          dukungan_count: 5,
          user_id: user?.id || 'demo-user-id',
          created_at: '2026-07-28T10:00:00Z',
          status_log: [
            { id: 'l1', status: 'ditindaklanjuti', catatan: 'Tim telah berkoordinasi dengan DLH untuk penerbitan berkas.', created_at: '2026-07-29T09:00:00Z' },
            { id: 'l2', status: 'diterima', catatan: 'Laporan baru diterima oleh sistem.', created_at: '2026-07-28T10:00:00Z' }
          ]
        }
        setReport(demoDetail)
        setMessages([
          { id: 'm1', message: 'Selamat siang min, permohonan data rincian anggaran kebersihan 2025 sudah sampai mana ya?', created_at: '2026-07-28T10:15:00Z', sender_id: user?.id || 'demo-user-id', read_at: '2026-07-28T10:20:00Z' },
          { id: 'm2', message: 'Halo Pak, tim kami sedang menyiapkan dokumen RKA Dinas Lingkungan Hidup.', created_at: '2026-07-28T10:25:00Z', sender_id: 'admin-id', read_at: '2026-07-28T10:30:00Z', profiles: { role: 'admin' } }
        ])
      }
    } catch (err) {
      console.error('Error fetching detail:', err)
    } finally {
      setLoading(false)
    }
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

      if (error) {
        if (error.code === '23505' || error.message?.includes('duplicate')) {
          setHasLiked(true)
        } else {
          throw error
        }
      } else {
        const newCount = (report?.dukungan_count || 0) + 1
        setHasLiked(true)
        setReport((prev: any) => prev ? { ...prev, dukungan_count: newCount } : prev)
      }
    } catch (err: any) {
      console.error('Error giving support:', err)
      alert(`Gagal memberikan dukungan: ${err.message || 'Terjadi kesalahan'}`)
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

      const { data: insertedMsg, error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          laporan_id: id,
          sender_id: user.id,
          message: chatMessage.trim(),
          attachment_url: attachmentUrl
        })
        .select()
        .single()

      if (insertError) throw insertError

      if (insertedMsg) {
        const { data: fullMsg } = await supabase
          .from('chat_messages')
          .select(`*, profiles:sender_id(full_name, role)`)
          .eq('id', insertedMsg.id)
          .single()

        const newMsg = fullMsg || insertedMsg

        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev
          return [...prev, newMsg]
        })
        setChatMessage('')
        setChatFile(null)
      }
    } catch (err: any) {
      console.error('Error sending chat message:', err)
      alert(`Gagal mengirim pesan: ${err.message || 'Terjadi kesalahan'}`)
    } finally {
      setIsSendingChat(false)
    }
  }

  const formatChatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const formatChatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Hari Ini'
    if (date.toDateString() === yesterday.toDateString()) return 'Kemarin'
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'selesai':
        return (
          <span className="bg-[#e7f5ed] text-[#1a7f47] px-4 py-1.5 rounded-full font-['Public_Sans'] font-semibold text-[14px] flex items-center gap-2 border border-[#b7e4c7]">
            <span className="material-symbols-outlined text-[16px]">{report?.jenis === 'inspirasi' ? 'public' : 'check_circle'}</span> {report?.jenis === 'inspirasi' ? 'Tayang' : 'Selesai'}
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

  // Group messages by date for date separators
  const getMessageGroups = () => {
    const groups: { date: string; messages: any[] }[] = []
    let currentDate = ''

    messages.forEach((msg) => {
      const dateStr = formatChatDate(msg.created_at)
      if (dateStr !== currentDate) {
        currentDate = dateStr
        groups.push({ date: dateStr, messages: [msg] })
      } else {
        groups[groups.length - 1].messages.push(msg)
      }
    })

    return groups
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
  const messageGroups = getMessageGroups()

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
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] h-auto">
          {/* Left Column: Report Details */}
          <section className="flex-grow p-4 sm:p-5 md:p-[40px] max-w-4xl lg:border-r border-[#debfbf] bg-[#fcf9f4]">
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
                <h1 className="font-['Libre_Franklin'] text-[22px] sm:text-[28px] md:text-[32px] leading-snug md:leading-[1.3] font-bold text-[#1c1c19] mt-2 break-words">
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
                
                {/* Support Button (available for all authenticated users) */}
                <button 
                  onClick={handleLike}
                  disabled={isLiking || hasLiked}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold text-sm transition-all cursor-pointer disabled:cursor-default ${
                    hasLiked 
                      ? 'bg-[#ffe08e] border-[#ffe08e] text-[#241a00] shadow-sm font-bold' 
                      : 'border-[#6b0218] text-[#6b0218] hover:bg-[#6b0218]/10'
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: hasLiked ? "'FILL' 1" : "'FILL' 0" }}>
                    thumb_up
                  </span>
                  {hasLiked ? 'Didukung' : 'Dukung Laporan'} ({report.dukungan_count || 0})
                </button>
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

          {/* ================================================================== */}
          {/* Right Column: REDESIGNED Chat Panel (WhatsApp / Telegram Style) */}
          {/* ================================================================== */}
          {isOwner ? (
            <section id="chat-admin" className="w-full lg:w-[450px] flex flex-col bg-[#ece5dd] border-t lg:border-t-0 lg:border-l border-[#debfbf] min-h-[450px] lg:min-h-[500px] lg:h-full overflow-hidden relative">
              {/* Chat Header — Premium Bar */}
              <div className="px-4 py-3 bg-[#6b0218] flex items-center gap-3 shadow-md z-10">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-white border-2 border-white/30">
                    <span className="material-symbols-outlined text-[22px]">support_agent</span>
                  </div>
                  {/* Online indicator */}
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#25d366] rounded-full border-2 border-[#6b0218]"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[15px] text-white leading-tight font-['Public_Sans'] truncate">
                    Admin Jurnal Sukabumi
                  </h3>
                  <p className="text-[11px] text-white/70 font-['Public_Sans']">
                    Kanal komunikasi privat & rahasia
                  </p>
                </div>
                <div className="bg-white/15 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20">
                  {messages.length} pesan
                </div>
              </div>

              {/* Chat Thread — WhatsApp-style background */}
              <div 
                className="flex-grow overflow-y-auto px-3 py-4 custom-scrollbar"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='p' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 30 L15 15 L30 30 L15 45Z' fill='%23d4cfc4' opacity='0.08'/%3E%3Cpath d='M30 0 L45 15 L30 30 L15 15Z' fill='%23d4cfc4' opacity='0.05'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='60' height='60' fill='%23ece5dd'/%3E%3Crect width='60' height='60' fill='url(%23p)'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat'
                }}
              >
                {messages && messages.length > 0 ? (
                  <>
                    {messageGroups.map((group, gIdx) => (
                      <div key={gIdx}>
                        {/* Date Separator */}
                        <div className="flex justify-center my-4">
                          <span className="bg-white/90 backdrop-blur-sm text-[#574141] text-[11px] font-semibold px-4 py-1.5 rounded-lg shadow-sm border border-[#debfbf]/50">
                            {group.date}
                          </span>
                        </div>

                        {/* Messages in this date group */}
                        {group.messages.map((msg: any, mIdx: number) => {
                          const isMyMessage = user && user.id === msg.sender_id
                          const isAdmin = msg.profiles?.role === 'admin' || msg.profiles?.role === 'superadmin' || (!isMyMessage && msg.sender_id !== report.user_id)

                          // Check if next message is from same sender for grouping
                          const nextMsg = mIdx < group.messages.length - 1 ? group.messages[mIdx + 1] : null
                          const isLastInGroup = !nextMsg || (nextMsg.sender_id !== msg.sender_id)

                          return (
                            <div key={msg.id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-1 ${isLastInGroup ? 'mb-3' : ''}`}>
                              {/* Admin Avatar (left side) */}
                              {!isMyMessage && isLastInGroup && (
                                <div className="w-7 h-7 rounded-full bg-[#6b0218] flex items-center justify-center text-white shrink-0 mr-1.5 mt-auto mb-0.5 shadow-sm">
                                  <span className="material-symbols-outlined text-[14px]">verified</span>
                                </div>
                              )}
                              {!isMyMessage && !isLastInGroup && (
                                <div className="w-7 mr-1.5 shrink-0"></div>
                              )}

                              {/* Message Bubble */}
                              <div className={`relative max-w-[78%] ${isMyMessage ? 'order-1' : ''}`}>
                                {/* Sender label (only show on first message in a group) */}
                                {!isMyMessage && isAdmin && (mIdx === 0 || group.messages[mIdx - 1]?.sender_id !== msg.sender_id) && (
                                  <p className="text-[11px] font-bold text-[#6b0218] mb-0.5 ml-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">verified</span>
                                    Admin Jurnal Sukabumi
                                  </p>
                                )}

                                <div className={`px-3 py-2 shadow-sm ${
                                  isMyMessage
                                    ? `bg-[#dcf8c6] text-[#1c1c19] ${isLastInGroup ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl'}`
                                    : `bg-white text-[#1c1c19] ${isLastInGroup ? 'rounded-2xl rounded-bl-sm' : 'rounded-2xl'}`
                                }`}>
                                  {/* Message text */}
                                  <p className="text-[13.5px] leading-[1.45] font-['Public_Sans'] whitespace-pre-wrap break-words">
                                    {msg.message}
                                  </p>

                                  {/* Attachment */}
                                  {msg.attachment_url && (
                                    <a
                                      href={msg.attachment_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="mt-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#6b0218] hover:underline"
                                    >
                                      <span className="material-symbols-outlined text-[14px]">attach_file</span>
                                      Lihat Lampiran
                                    </a>
                                  )}

                                  {/* Timestamp — inside bubble, bottom right */}
                                  <div className={`flex items-center gap-1 mt-1 ${isMyMessage ? 'justify-end' : 'justify-end'}`}>
                                    <span className="text-[10px] text-[#8b7171] font-['Public_Sans']">
                                      {formatChatTime(msg.created_at)}
                                    </span>
                                    {isMyMessage && (
                                      msg.read_at ? (
                                        <span className="material-symbols-outlined text-[14px] text-[#53bdeb]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                          done_all
                                        </span>
                                      ) : (
                                        <span className="material-symbols-outlined text-[14px] text-[#8b7171]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                          done
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </>
                ) : (
                  <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-[#574141] p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center text-[#6b0218] mb-4 shadow-sm">
                      <span className="material-symbols-outlined text-[32px]">forum</span>
                    </div>
                    <h4 className="font-bold text-[15px] text-[#1c1c19] mb-1.5 font-['Libre_Franklin']">Belum Ada Percakapan</h4>
                    <p className="text-[12px] text-[#574141] max-w-[260px] leading-relaxed font-['Public_Sans']">
                      Kirim pesan untuk memulai diskusi privat dengan Admin Jurnal Sukabumi terkait laporan ini.
                    </p>
                  </div>
                )}
              </div>

              {/* Chat Input — Modern input bar */}
              <div className="px-3 py-2.5 bg-[#f0ebe3] border-t border-[#debfbf]/60">
                {/* Attachment Preview */}
                {chatFile && (
                  <div className="flex items-center justify-between bg-white border border-[#debfbf] px-3 py-2 rounded-xl mb-2 text-xs font-semibold text-[#1c1c19]">
                    <span className="truncate flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#6b0218]">attach_file</span> 
                      {chatFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setChatFile(null)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendChat} className="flex items-end gap-2">
                  {/* Attach Button */}
                  <button
                    type="button"
                    onClick={() => chatFileRef.current?.click()}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[#574141] hover:bg-[#debfbf]/40 transition-colors shrink-0 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[22px]">attach_file</span>
                  </button>
                  <input
                    ref={chatFileRef}
                    type="file"
                    className="hidden"
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setChatFile(e.target.files[0])
                      }
                    }}
                  />

                  {/* Text Input */}
                  <div className="flex-1 bg-white rounded-3xl px-4 py-2.5 border border-[#debfbf]/60 shadow-sm focus-within:border-[#6b0218]/40 focus-within:shadow-md transition-all">
                    <textarea
                      className="w-full bg-transparent border-none focus:ring-0 text-[14px] py-0 resize-none outline-none min-h-[22px] max-h-[100px] font-['Public_Sans'] text-[#1c1c19] placeholder:text-[#8b7171]"
                      placeholder="Tulis pesan..."
                      rows={1}
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendChat(e)
                        }
                      }}
                      disabled={isSendingChat}
                    ></textarea>
                  </div>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={isSendingChat || (!chatMessage.trim() && !chatFile)}
                    className="w-10 h-10 rounded-full bg-[#6b0218] text-white flex items-center justify-center shadow-lg hover:bg-[#8b1e2c] transition-all disabled:opacity-40 disabled:shadow-none shrink-0 cursor-pointer"
                  >
                    {isSendingChat ? (
                      <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                    )}
                  </button>
                </form>

                <p className="text-[10px] text-center text-[#8b7171] mt-2 font-['Public_Sans']">
                  <span className="material-symbols-outlined text-[11px] align-middle mr-0.5">lock</span>
                  Pesan bersifat rahasia — hanya Anda dan Admin Jurnal Sukabumi.
                </p>
              </div>
            </section>
          ) : (
            <section className="w-full lg:w-[400px] flex flex-col justify-start p-6 bg-[#f5f2ed] border-t lg:border-t-0 lg:border-l border-[#debfbf]">
              <div className="bg-white border border-[#debfbf] p-6 rounded-2xl shadow-sm text-center">
                <div className="w-12 h-12 rounded-full bg-[#6b0218]/10 text-[#6b0218] flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-2xl">lock</span>
                </div>
                <h4 className="font-bold text-base text-[#1c1c19] mb-2 font-['Libre_Franklin']">Chat Admin Terbatas</h4>
                <p className="text-sm text-[#574141] leading-relaxed font-['Public_Sans'] mb-4">
                  Ini adalah laporan publik. Chat dengan admin hanya tersedia untuk pelapor yang bersangkutan.
                </p>
                <div className="p-3 bg-[#f6f3ee] rounded-lg border border-[#debfbf] text-xs text-[#574141] flex items-center gap-2 justify-center">
                  <span className="material-symbols-outlined text-sm text-[#6b0218]">shield</span>
                  Kerahasiaan komunikasi pelapor terjamin
                </div>
              </div>
            </section>
          )}
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
