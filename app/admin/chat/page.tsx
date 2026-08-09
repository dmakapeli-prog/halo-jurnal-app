'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import UserAvatar from '@/components/UserAvatar'

export default function AdminChatInboxPage() {
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [adminUser, setAdminUser] = useState<any>(null)
  const [adminProfile, setAdminProfile] = useState<any>(null)
  const [reportsWithChats, setReportsWithChats] = useState<any[]>([])
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Active Chat State
  const [messages, setMessages] = useState<any[]>([])
  const [chatMessage, setChatMessage] = useState('')
  const [isSendingChat, setIsSendingChat] = useState(false)
  const [chatFile, setChatFile] = useState<File | null>(null)
  const [isFixingRole, setIsFixingRole] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatFileRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    fetchAdminAndData()
  }, [])

  useEffect(() => {
    if (selectedReportId) {
      fetchMessagesForReport(selectedReportId)
    }
  }, [selectedReportId])

  // Realtime subscription for selected report chat in admin inbox
  useEffect(() => {
    if (!selectedReportId) return

    const channel = supabase
      .channel(`admin_inbox_chat:${selectedReportId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `laporan_id=eq.${selectedReportId}`,
        },
        async (payload: any) => {
          const newMsg = payload.new
          if (!newMsg) return

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

          fetchAllConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedReportId, adminUser, supabase])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchAdminAndData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setAdminUser(user)

        // Fetch admin profile
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (prof) setAdminProfile(prof)
      }

      await fetchAllConversations()
    } catch (err) {
      console.error('Error fetching admin chat data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllConversations = async () => {
    try {
      const { data: reportData } = await supabase
        .from('laporan')
        .select(`
          id, judul, ticket_number, kategori, user_id, created_at, status, is_public,
          profiles:user_id(full_name, phone, role, ktp_verified),
          chat_messages(*, profiles:sender_id(full_name, role))
        `)
        .order('created_at', { ascending: false })

      if (reportData) {
        // Sort reports: those with unread messages first, then total chats, then recent
        const sorted = [...reportData].sort((a, b) => {
          const aUnread = a.chat_messages ? a.chat_messages.filter((m: any) => !m.read_at && m.sender_id === a.user_id).length : 0
          const bUnread = b.chat_messages ? b.chat_messages.filter((m: any) => !m.read_at && m.sender_id === b.user_id).length : 0
          if (bUnread !== aUnread) return bUnread - aUnread
          const aCount = a.chat_messages ? a.chat_messages.length : 0
          const bCount = b.chat_messages ? b.chat_messages.length : 0
          return bCount - aCount
        })

        setReportsWithChats(sorted)

        if (sorted.length > 0 && !selectedReportId) {
          // Select first report by default
          setSelectedReportId(sorted[0].id)
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err)
    }
  }

  const fetchMessagesForReport = async (reportId: string) => {
    try {
      const { data: chatData } = await supabase
        .from('chat_messages')
        .select(`*, profiles:sender_id(full_name, role)`)
        .eq('laporan_id', reportId)
        .order('created_at', { ascending: true })

      if (chatData) {
        setMessages(chatData)

        // Auto mark unread messages from pelapor as read
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (currentUser) {
          const unreadIds = chatData
            .filter((m: any) => m.sender_id !== currentUser.id && !m.read_at)
            .map((m: any) => m.id)

          if (unreadIds.length > 0) {
            await supabase
              .from('chat_messages')
              .update({ read_at: new Date().toISOString() })
              .in('id', unreadIds)

            // Update local state count
            setReportsWithChats((prev) =>
              prev.map((r) => {
                if (r.id === reportId && r.chat_messages) {
                  const updatedMsgs = r.chat_messages.map((m: any) =>
                    unreadIds.includes(m.id) ? { ...m, read_at: new Date().toISOString() } : m
                  )
                  return { ...r, chat_messages: updatedMsgs }
                }
                return r
              })
            )
          }
        }
      }
    } catch (err) {
      console.error('Error fetching messages for report:', err)
    }
  }

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminUser || !selectedReportId) {
      alert('Sesi login admin tidak ditemukan. Silakan login ulang.')
      return
    }
    if (!chatMessage.trim() && !chatFile) return

    setIsSendingChat(true)
    try {
      let attachmentUrl: string | null = null

      if (chatFile) {
        const fileExt = chatFile.name.split('.').pop()
        const fileName = `admin-inbox-${selectedReportId}-${Date.now()}.${fileExt}`
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

      const { data: insertedMsg, error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          laporan_id: selectedReportId,
          sender_id: adminUser.id,
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
        fetchAllConversations()
      }
    } catch (err: any) {
      console.error('Error sending admin inbox message:', err)
      alert(`Gagal mengirim pesan: ${err.message || 'Terjadi kesalahan pada server/RLS Supabase.'}`)
    } finally {
      setIsSendingChat(false)
    }
  }

  const handleMakeMeAdmin = async () => {
    if (!adminUser) return
    setIsFixingRole(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', adminUser.id)

      if (error) throw error

      alert('Role akun berhasil diperbarui menjadi Admin!')
      fetchAdminAndData()
    } catch (err: any) {
      alert(`Gagal memperbarui role: ${err.message}`)
    } finally {
      setIsFixingRole(false)
    }
  }

  const selectedReport = reportsWithChats.find((r) => r.id === selectedReportId)

  const filteredReports = reportsWithChats.filter((r) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const title = r.judul?.toLowerCase() || ''
    const name = r.profiles?.full_name?.toLowerCase() || ''
    const ticket = r.ticket_number?.toLowerCase() || ''
    return title.includes(q) || name.includes(q) || ticket.includes(q)
  })

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6b0218]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-['Public_Sans']">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#debfbf] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 bg-[#8b1e2c] text-white rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">forum</span> Kotak Masuk Chat Warga
            </span>
            <span className="text-xs text-[#574141] font-semibold">Pusat Komunikasi Admin & Pelapor</span>
          </div>
          <h1 className="font-['Libre_Franklin'] text-2xl sm:text-3xl font-bold text-[#1c1c19]">
            Pesan Chat & Diskusi Laporan
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAdminAndData}
            className="bg-[#f6f3ee] text-[#6b0218] border border-[#debfbf] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#6b0218] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">refresh</span> Refresh Pesan
          </button>
        </div>
      </div>

      {/* Warning banner if Admin role not active */}
      {adminProfile && adminProfile.role !== 'admin' && adminProfile.role !== 'superadmin' && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-600 text-2xl">warning</span>
            <div>
              <p className="font-bold text-sm text-amber-900">Perhatian: Role Akun Belum Terdaftar Sebagai Admin</p>
              <p className="text-xs text-amber-800">
                Akun Anda saat ini bertipe <span className="font-bold capitalize">{adminProfile.role || 'citizen'}</span>. Aktifkan role Admin agar dapat mengakses semua laporan dan chat privat.
              </p>
            </div>
          </div>
          <button
            onClick={handleMakeMeAdmin}
            disabled={isFixingRole}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isFixingRole ? 'Memproses...' : 'Aktifkan Role Admin'}
          </button>
        </div>
      )}

      {/* Main Chat Workspace Grid (Left Conversations List, Right Chat Screen) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
        {/* Left Column (4 cols): Conversations List */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white border border-[#debfbf] rounded-2xl overflow-hidden flex flex-col shadow-sm">
          {/* Search Bar */}
          <div className="p-3.5 bg-[#f6f3ee] border-b border-[#debfbf]">
            <div className="flex items-center bg-white border border-[#debfbf] rounded-xl px-3 py-2 text-xs">
              <span className="material-symbols-outlined text-[#574141] text-sm mr-2">search</span>
              <input
                type="text"
                placeholder="Cari nama pelapor atau judul laporan..."
                className="bg-transparent border-none outline-none text-xs text-[#1c1c19] w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Report Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#debfbf]/60 custom-scrollbar">
            {filteredReports && filteredReports.length > 0 ? (
              filteredReports.map((report) => {
                const isSelected = report.id === selectedReportId
                const unreadCount = report.chat_messages
                  ? report.chat_messages.filter((m: any) => !m.read_at && m.sender_id === report.user_id).length
                  : 0
                const totalMsg = report.chat_messages ? report.chat_messages.length : 0
                const lastMsg = report.chat_messages && report.chat_messages.length > 0
                  ? report.chat_messages[report.chat_messages.length - 1]
                  : null

                return (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReportId(report.id)}
                    className={`p-4 cursor-pointer transition-colors flex items-start gap-3 relative ${
                      isSelected ? 'bg-[#6b0218]/10 border-l-4 border-[#6b0218]' : 'hover:bg-[#fcf9f4]'
                    }`}
                  >
                    <UserAvatar name={report.profiles?.full_name || 'Pelapor'} size="md" bgColor="maroon" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="font-bold text-xs text-[#1c1c19] truncate">
                          {report.profiles?.full_name || 'Pelapor Halo Jurnal'}
                        </h4>
                        <span className="text-[10px] text-[#8b7171] shrink-0 font-semibold">
                          #{report.ticket_number || report.id.substring(0, 6)}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-[#6b0218] truncate mb-1">
                        {report.judul}
                      </p>

                      <p className="text-[11px] text-[#574141] truncate">
                        {lastMsg ? lastMsg.message : 'Belum ada percakapan'}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {unreadCount > 0 ? (
                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                          {unreadCount} Baru
                        </span>
                      ) : totalMsg > 0 ? (
                        <span className="bg-[#ffe08e] text-[#241a00] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#debfbf]">
                          {totalMsg}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-semibold">Kosong</span>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-8 text-center text-[#574141]">
                <span className="material-symbols-outlined text-3xl text-gray-400 mb-1">forum</span>
                <p className="text-xs font-bold">Tidak ada percakapan ditemukan</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7-8 cols): Active Chat Box Panel */}
        <div className="lg:col-span-7 xl:col-span-8 bg-[#ece5dd] border border-[#debfbf] rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
          {selectedReport ? (
            <>
              {/* Active Chat Header */}
              <div className="px-5 py-3.5 bg-[#6b0218] text-white flex items-center justify-between shadow-md z-10">
                <div className="flex items-center gap-3">
                  <UserAvatar name={selectedReport.profiles?.full_name} size="md" bgColor="gold" />
                  <div>
                    <h3 className="font-bold text-sm leading-tight text-white flex items-center gap-2">
                      {selectedReport.profiles?.full_name || 'Pelapor'}
                      {selectedReport.profiles?.ktp_verified && (
                        <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">KTP Valid</span>
                      )}
                    </h3>
                    <p className="text-[11px] text-white/80 truncate max-w-[280px]">
                      Laporan: {selectedReport.judul} (#{selectedReport.ticket_number || selectedReport.id})
                    </p>
                  </div>
                </div>

                <Link
                  href={`/admin/laporan/${selectedReport.id}`}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">visibility</span> Detail Laporan
                </Link>
              </div>

              {/* Chat Thread Area */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='p' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M0 30 L15 15 L30 30 L15 45Z' fill='%23d4cfc4' opacity='0.08'/%3E%3Cpath d='M30 0 L45 15 L30 30 L15 15Z' fill='%23d4cfc4' opacity='0.05'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='60' height='60' fill='%23ece5dd'/%3E%3Crect width='60' height='60' fill='url(%23p)'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat',
                }}
              >
                {messages && messages.length > 0 ? (
                  messages.map((msg: any) => {
                    const isMyAdminMessage = adminUser && adminUser.id === msg.sender_id

                    return (
                      <div key={msg.id} className={`flex flex-col ${isMyAdminMessage ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`relative max-w-[80%] px-4 py-2.5 rounded-2xl shadow-sm ${
                            isMyAdminMessage
                              ? 'bg-[#dcf8c6] text-[#1c1c19] rounded-br-sm'
                              : 'bg-white text-[#1c1c19] rounded-bl-sm border border-[#debfbf]/50'
                          }`}
                        >
                          {!isMyAdminMessage && (
                            <p className="text-[11px] font-bold text-[#6b0218] mb-0.5">
                              {selectedReport.profiles?.full_name || 'Pelapor'}
                            </p>
                          )}

                          <p className="text-[13.5px] leading-relaxed font-['Public_Sans'] whitespace-pre-wrap break-words">
                            {msg.message}
                          </p>

                          {msg.attachment_url && (
                            <div className="mt-2 pt-2 border-t border-black/10">
                              <a
                                href={msg.attachment_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs flex items-center gap-1 font-bold text-[#6b0218] hover:underline"
                              >
                                <span className="material-symbols-outlined text-xs">attach_file</span> Lampiran Pesan
                              </a>
                            </div>
                          )}

                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-[10px] text-[#8b7171]">
                              {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMyAdminMessage && (
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
                    )
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-[#574141] p-8 text-center">
                    <span className="material-symbols-outlined text-4xl mb-2 text-[#6b0218]">forum</span>
                    <p className="font-bold text-sm text-[#1c1c19] mb-1">Belum Ada Pesan Percakapan</p>
                    <p className="text-xs text-[#574141]">Kirim pesan pertama ke pelapor laporan ini.</p>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Form */}
              <div className="p-3 bg-[#f0ebe3] border-t border-[#debfbf]/60">
                {chatFile && (
                  <div className="flex items-center justify-between bg-white border border-[#debfbf] px-3 py-2 rounded-xl mb-2 text-xs font-semibold text-[#1c1c19]">
                    <span className="truncate flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[#6b0218]">attach_file</span> {chatFile.name}
                    </span>
                    <button type="button" onClick={() => setChatFile(null)} className="text-red-600 hover:text-red-800">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendChat} className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => chatFileRef.current?.click()}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[#574141] hover:bg-[#debfbf]/40 transition-colors shrink-0 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[20px]">attach_file</span>
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

                  <div className="flex-1 bg-white rounded-3xl px-4 py-2.5 border border-[#debfbf]/60 shadow-sm focus-within:border-[#6b0218]/40">
                    <textarea
                      rows={1}
                      className="w-full bg-transparent border-none outline-none text-xs resize-none py-0.5 text-[#1c1c19] placeholder:text-[#8b7171]"
                      placeholder="Tulis balasan pesan untuk pelapor..."
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

                  <button
                    type="submit"
                    disabled={isSendingChat || (!chatMessage.trim() && !chatFile)}
                    className="bg-[#6b0218] text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:bg-[#8b1e2c] transition-colors disabled:opacity-40 shrink-0 cursor-pointer"
                  >
                    {isSendingChat ? (
                      <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                    ) : (
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        send
                      </span>
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-[#574141] p-8 text-center">
              <span className="material-symbols-outlined text-5xl mb-3 text-[#6b0218]">chat</span>
              <h3 className="font-bold text-base text-[#1c1c19] mb-1">Pilih Percakapan di Sebelah Kiri</h3>
              <p className="text-xs text-[#574141]">Klik salah satu laporan warga untuk membuka percakapan chat privat.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
