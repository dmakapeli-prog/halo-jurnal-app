'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export interface VibesPost {
  id: string
  title: string
  type: 'news' | 'reels' | 'citizen'
  category: string
  content: string
  source: string
  media_url: string
  status: 'published' | 'draft' | 'scheduled'
  is_pinned: boolean
  is_public: boolean
  views_count: number
  likes_count: number
  created_at: string
}

export default function AdminVibesPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<VibesPost[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Filters & Search
  const [activeTab, setActiveTab] = useState<'all' | 'news' | 'reels' | 'citizen'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('Semua Status')

  // Modal Form State (Create & Edit)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<VibesPost | null>(null)

  // Form Fields
  const [formType, setFormType] = useState<'news' | 'reels'>('news')
  const [formTitle, setFormTitle] = useState('')
  const [formCategory, setFormCategory] = useState('Sukabumi Today')
  const [formSource, setFormSource] = useState('Redaksi Jurnal Sukabumi')
  const [formContent, setFormContent] = useState('')
  const [formMediaUrl, setFormMediaUrl] = useState('')
  const [formStatus, setFormStatus] = useState<'published' | 'draft' | 'scheduled'>('published')
  const [formIsPinned, setFormIsPinned] = useState(false)

  // File Uploading State
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)

  // Delete Confirmation Modal State
  const [deleteConfirmPost, setDeleteConfirmPost] = useState<VibesPost | null>(null)

  // Initial Demo Seed Data for instant admin preview & fallback
  const initialDemoPosts: VibesPost[] = [
    {
      id: 'vibes-1',
      title: 'Pembangunan Jembatan Cikereteg Rampung, Lalu Lintas Sukabumi-Bogor Kembali Lancar',
      type: 'news',
      category: 'Infrastruktur',
      content: 'Proses perbaikan dan pelebaran Jembatan Cikereteg resmi diselesaikan oleh Dinas PUPR. Pengendara kini dapat melintas dengan aman tanpa kemacetan panjang.',
      source: 'Redaksi Jurnal Sukabumi',
      media_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=800&auto=format&fit=crop&q=80',
      status: 'published',
      is_pinned: true,
      is_public: true,
      views_count: 1420,
      likes_count: 98,
      created_at: '2026-09-12T09:30:00Z',
    },
    {
      id: 'vibes-2',
      title: 'Keindahan Sunset di Jembatan Gantung Situ Gunung Sukabumi 🌅✨',
      type: 'reels',
      category: 'Wisata & Alam',
      content: 'Intip momen magis matahari terbenam dari atas Suspension Bridge Situ Gunung. Tempat favorit warga lokal untuk santai di akhir pekan!',
      source: 'Tim Media Vibes',
      media_url: 'https://assets.mixkit.co/videos/preview/mixkit-sunset-over-a-mountain-lake-4096-large.mp4',
      status: 'published',
      is_pinned: false,
      is_public: true,
      views_count: 3500,
      likes_count: 420,
      created_at: '2026-09-11T14:15:00Z',
    },
    {
      id: 'vibes-3',
      title: 'Gotong Royong Bersihkan Sampah Plastik di Bantaran Sungai Cikole',
      type: 'citizen',
      category: 'Lingkungan Hidup',
      content: 'Aksi pemuda dan warga Cikole membersihkan area sungai demi mencegah banjir musim hujan.',
      source: 'Aspirasi Warga RW 04',
      media_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=80',
      status: 'published',
      is_pinned: false,
      is_public: true,
      views_count: 850,
      likes_count: 64,
      created_at: '2026-09-10T11:00:00Z',
    },
    {
      id: 'vibes-4',
      title: 'Jadwal Layanan SIM Keliling Polres Sukabumi Kota Minggu Ini',
      type: 'news',
      category: 'Pelayanan Publik',
      content: 'Simak daftar lokasi dan persyaratan perpanjangan SIM A & C bagi warga Kota dan Kabupaten Sukabumi.',
      source: 'Humas Polres Sukabumi',
      media_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&auto=format&fit=crop&q=80',
      status: 'draft',
      is_pinned: false,
      is_public: false,
      views_count: 0,
      likes_count: 0,
      created_at: '2026-09-09T08:00:00Z',
    },
  ]

  useEffect(() => {
    fetchVibesPosts()
  }, [])

  const fetchVibesPosts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('vibes_posts')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        setPosts(data as VibesPost[])
      } else {
        // Use demo posts fallback if table does not exist or has no rows
        setPosts(initialDemoPosts)
      }
    } catch (err) {
      console.warn('Using demo posts fallback:', err)
      setPosts(initialDemoPosts)
    } finally {
      setLoading(false)
    }
  }

  // Open modal for Create New Post
  const handleOpenCreateModal = () => {
    setEditingPost(null)
    setFormType('news')
    setFormTitle('')
    setFormCategory('Sukabumi Today')
    setFormSource('Redaksi Jurnal Sukabumi')
    setFormContent('')
    setFormMediaUrl('')
    setFormStatus('published')
    setFormIsPinned(false)
    setIsFormOpen(true)
  }

  // Open modal for Edit Existing Post
  const handleOpenEditModal = (post: VibesPost) => {
    setEditingPost(post)
    setFormType(post.type === 'reels' ? 'reels' : 'news')
    setFormTitle(post.title)
    setFormCategory(post.category)
    setFormSource(post.source)
    setFormContent(post.content)
    setFormMediaUrl(post.media_url)
    setFormStatus(post.status)
    setFormIsPinned(post.is_pinned)
    setIsFormOpen(true)
  }

  // Handle File Upload to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setUploadingFile(true)
    setUploadProgress(`Mengunggah ${file.name}...`)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `vibes_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `vibes_media/${fileName}`

      // Attempt upload to 'vibes' or 'laporan_lampiran' bucket
      const { data, error } = await supabase.storage
        .from('laporan_lampiran')
        .upload(filePath, file)

      if (error) {
        // Fallback: create object URL locally for preview if bucket restricted
        const objectUrl = URL.createObjectURL(file)
        setFormMediaUrl(objectUrl)
        setUploadProgress('File siap digunakan (Pratinjau Lokal).')
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('laporan_lampiran')
          .getPublicUrl(filePath)

        setFormMediaUrl(publicUrlData.publicUrl)
        setUploadProgress('Upload berhasil 100%!')
      }
    } catch (err: any) {
      console.error('File upload error:', err)
      const objectUrl = URL.createObjectURL(file)
      setFormMediaUrl(objectUrl)
    } finally {
      setUploadingFile(false)
    }
  }

  // Save / Update Form Submission
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formTitle.trim()) {
      alert('Harap masukkan judul berita / vibes.')
      return
    }

    setActionLoading('saving')

    const newPostData = {
      title: formTitle.trim(),
      type: formType,
      category: formCategory,
      source: formSource.trim() || 'Redaksi Jurnal Sukabumi',
      content: formContent.trim(),
      media_url: formMediaUrl.trim() || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80',
      status: formStatus,
      is_pinned: formIsPinned,
      is_public: formStatus === 'published',
    }

    try {
      if (editingPost) {
        // Edit Mode
        if (!editingPost.id.startsWith('vibes-')) {
          await supabase
            .from('vibes_posts')
            .update(newPostData)
            .eq('id', editingPost.id)
        }

        setPosts((prev) =>
          prev.map((p) =>
            p.id === editingPost.id
              ? { ...p, ...newPostData }
              : p
          )
        )
      } else {
        // Create Mode
        const newId = `vibes-${Date.now()}`
        const fullNewPost: VibesPost = {
          id: newId,
          ...newPostData,
          views_count: 0,
          likes_count: 0,
          created_at: new Date().toISOString(),
        }

        // Try inserting into Supabase
        const { data, error } = await supabase
          .from('vibes_posts')
          .insert([newPostData])
          .select()

        if (!error && data && data[0]) {
          setPosts((prev) => [data[0] as VibesPost, ...prev])
        } else {
          setPosts((prev) => [fullNewPost, ...prev])
        }
      }

      setIsFormOpen(false)
    } catch (err: any) {
      console.error('Error saving vibes post:', err)
      alert(`Gagal menyimpan konten: ${err.message || 'Terjadi kesalahan'}`)
    } finally {
      setActionLoading(null)
    }
  }

  // Toggle Highlight / Pin to Top
  const handleTogglePin = async (postId: string, currentPinStatus: boolean) => {
    setActionLoading(postId)
    const targetStatus = !currentPinStatus

    try {
      if (!postId.startsWith('vibes-')) {
        await supabase
          .from('vibes_posts')
          .update({ is_pinned: targetStatus })
          .eq('id', postId)
      }

      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, is_pinned: targetStatus } : p))
      )
    } catch (err) {
      console.error('Error toggling pin:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // Toggle Hide / Publish
  const handleToggleVisibility = async (postId: string, currentIsPublic: boolean) => {
    setActionLoading(postId)
    const targetIsPublic = !currentIsPublic
    const targetStatus = targetIsPublic ? 'published' : 'draft'

    try {
      if (!postId.startsWith('vibes-')) {
        await supabase
          .from('vibes_posts')
          .update({ is_public: targetIsPublic, status: targetStatus })
          .eq('id', postId)
      }

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, is_public: targetIsPublic, status: targetStatus }
            : p
        )
      )
    } catch (err) {
      console.error('Error toggling visibility:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // Delete Post
  const handleDeletePost = async () => {
    if (!deleteConfirmPost) return
    const postId = deleteConfirmPost.id

    setActionLoading(postId)
    try {
      if (!postId.startsWith('vibes-')) {
        await supabase.from('vibes_posts').delete().eq('id', postId)
      }

      setPosts((prev) => prev.filter((p) => p.id !== postId))
      setDeleteConfirmPost(null)
    } catch (err) {
      console.error('Error deleting post:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // Filtered Posts
  const filteredPosts = posts.filter((p) => {
    // Tab filter
    if (activeTab === 'news' && p.type !== 'news') return false
    if (activeTab === 'reels' && p.type !== 'reels') return false
    if (activeTab === 'citizen' && p.type !== 'citizen') return false

    // Status filter
    if (selectedStatus === 'Published' && !p.is_public) return false
    if (selectedStatus === 'Draft / Privat' && p.is_public) return false
    if (selectedStatus === 'Highlight / Pinned' && !p.is_pinned) return false

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchTitle = p.title.toLowerCase().includes(q)
      const matchCategory = p.category.toLowerCase().includes(q)
      const matchSource = p.source.toLowerCase().includes(q)
      if (!matchTitle && !matchCategory && !matchSource) return false
    }

    return true
  })

  // Counters
  const totalCount = posts.length
  const newsCount = posts.filter((p) => p.type === 'news').length
  const reelsCount = posts.filter((p) => p.type === 'reels').length
  const pinnedCount = posts.filter((p) => p.is_pinned).length

  return (
    <div className="space-y-6 font-['Public_Sans'] text-slate-900">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 bg-red-800 text-white rounded-full text-[11px] font-bold tracking-wider uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">auto_awesome</span> Jurnal Vibes & Reels
            </span>
            <span className="text-xs text-slate-500 font-semibold">Portal Redaksi & Moderasi Konten</span>
          </div>
          <h1 className="font-['Libre_Franklin'] text-2xl sm:text-3xl font-bold text-slate-900">
            Pengelolaan Konten Jurnal Vibes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl">
            Kelola publikasi berita redaksi, video reels pendek, serta moderasi kiriman jurnal aspirasi warga Sukabumi dalam satu portal terpadu.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-red-800 hover:bg-red-900 text-white px-5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-md hover:shadow-lg hover:shadow-red-900/20 active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          <span>+ Buat Konten Redaksi Baru</span>
        </button>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Konten Vibes</p>
            <p className="text-2xl font-bold font-['Libre_Franklin'] text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 border border-red-100 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-xl">dataset</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Berita & Artikel</p>
            <p className="text-2xl font-bold font-['Libre_Franklin'] text-blue-900 mt-1">{newsCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-xl">newspaper</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Video Reels Pendek</p>
            <p className="text-2xl font-bold font-['Libre_Franklin'] text-purple-900 mt-1">{reelsCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-xl">video_camera_front</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sorotan / Headline</p>
            <p className="text-2xl font-bold font-['Libre_Franklin'] text-amber-900 mt-1">{pinnedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-xl">push_pin</span>
          </div>
        </div>
      </div>

      {/* Tabs Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Quick Tab Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'all', label: 'Semua Konten', icon: 'apps' },
              { key: 'news', label: 'Berita Vibes', icon: 'newspaper' },
              { key: 'reels', label: 'Video Reels', icon: 'movie' },
              { key: 'citizen', label: 'Kiriman Warga', icon: 'groups' },
            ].map((tab) => {
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-red-800 text-white border-red-800 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Search & Status Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 flex-1 min-w-[220px]">
              <span className="material-symbols-outlined text-slate-400 mr-2 text-lg">search</span>
              <input
                type="text"
                placeholder="Cari judul berita atau penulis..."
                className="bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 w-full placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option>Semua Status</option>
              <option>Published</option>
              <option>Draft / Privat</option>
              <option>Highlight / Pinned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Table / Card Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
                <th className="py-4 px-6">Konten & Media</th>
                <th className="py-4 px-6">Tipe & Kategori</th>
                <th className="py-4 px-6">Sumber / Penulis</th>
                <th className="py-4 px-6">Interaksi Warga</th>
                <th className="py-4 px-6">Status Publikasi</th>
                <th className="py-4 px-6 text-center">Aksi Manajemen Redaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-800 mb-2"></div>
                    <p className="text-sm font-semibold">Memuat data konten Jurnal Vibes...</p>
                  </td>
                </tr>
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map((post) => {
                  const isReels = post.type === 'reels'
                  const isCitizen = post.type === 'citizen'

                  return (
                    <tr key={post.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Media & Content Details */}
                      <td className="py-4 px-6 max-w-md">
                        <div className="flex gap-3.5 items-start">
                          {/* Media Thumbnail Preview */}
                          <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative group/thumb">
                            {isReels ? (
                              <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white relative">
                                <video
                                  src={post.media_url}
                                  className="w-full h-full object-cover opacity-70"
                                  muted
                                />
                                <span className="material-symbols-outlined absolute text-xl">play_circle</span>
                              </div>
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={post.media_url}
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            )}

                            {post.is_pinned && (
                              <span
                                className="absolute top-1 left-1 bg-amber-500 text-white rounded-full p-0.5 shadow"
                                title="Sorotan Utama / Pinned"
                              >
                                <span className="material-symbols-outlined text-[10px] block">push_pin</span>
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {post.is_pinned && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                                  <span className="material-symbols-outlined text-[12px]">push_pin</span> HEADLINE
                                </span>
                              )}
                              <span className="text-[11px] text-slate-400 font-semibold">
                                {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>

                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-red-800 transition-colors line-clamp-2 leading-snug">
                              {post.title}
                            </h4>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-normal">
                              {post.content}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type & Category */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          {isReels ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full uppercase">
                              <span className="material-symbols-outlined text-[12px]">movie</span> Reels Video
                            </span>
                          ) : isCitizen ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-0.5 rounded-full uppercase">
                              <span className="material-symbols-outlined text-[12px]">groups</span> Kiriman Warga
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase">
                              <span className="material-symbols-outlined text-[12px]">newspaper</span> Berita Vibes
                            </span>
                          )}

                          <span className="text-xs font-medium text-slate-600 block pt-0.5">
                            🏷️ {post.category}
                          </span>
                        </div>
                      </td>

                      {/* Source / Author */}
                      <td className="py-4 px-6">
                        <span className="text-xs font-semibold text-slate-800 block">
                          {post.source}
                        </span>
                        <span className="text-[11px] text-slate-400 block">Penulis / Kontributor</span>
                      </td>

                      {/* Engagement Metrics */}
                      <td className="py-4 px-6">
                        <div className="space-y-1 text-xs text-slate-600 font-semibold">
                          <div className="flex items-center gap-1 text-slate-700">
                            <span className="material-symbols-outlined text-sm text-slate-400">visibility</span>
                            <span>{post.views_count.toLocaleString('id-ID')} Pembaca</span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-700">
                            <span className="material-symbols-outlined text-sm text-amber-500">thumb_up</span>
                            <span>{post.likes_count} Dukungan</span>
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-6">
                        {post.is_public ? (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                            PUBLISHED
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-xs">visibility_off</span>
                            DRAFT / PRIVAT
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(post)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Edit Konten"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>

                          {/* Toggle Pin Button */}
                          <button
                            type="button"
                            disabled={actionLoading === post.id}
                            onClick={() => handleTogglePin(post.id, post.is_pinned)}
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${
                              post.is_pinned
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                                : 'bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700'
                            }`}
                            title={post.is_pinned ? 'Lepas dari Sorotan Utama' : 'Jadikan Sorotan Utama (Headline)'}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {post.is_pinned ? 'push_pin' : 'keep_off'}
                            </span>
                          </button>

                          {/* Toggle Visibility (Publish / Hide) */}
                          <button
                            type="button"
                            disabled={actionLoading === post.id}
                            onClick={() => handleToggleVisibility(post.id, post.is_public)}
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${
                              post.is_public
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700'
                            }`}
                            title={post.is_public ? 'Takedown / Sembunyikan' : 'Tayangkan ke Publik'}
                          >
                            <span className="material-symbols-outlined text-lg">
                              {post.is_public ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmPost(post)}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-colors cursor-pointer"
                            title="Hapus Permanen"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">newspaper</span>
                    <p className="font-semibold text-sm text-slate-800">Tidak ada konten ditemukan</p>
                    <p className="text-xs text-slate-500 mt-1">Coba ganti filter tab atau kata kunci pencarian Anda.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Upload & Edit Konten Redaksi */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl p-6 sm:p-8 my-8 relative space-y-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center border border-red-100 font-bold">
                  <span className="material-symbols-outlined text-xl">
                    {editingPost ? 'edit_note' : 'add_box'}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-['Libre_Franklin']">
                    {editingPost ? 'Edit Konten Redaksi Jurnal Vibes' : 'Upload Konten Redaksi Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingPost ? 'Perbarui judul, isi artikel, link media, atau status publikasi.' : 'Tambahkan berita atau video reels pendek ke portal publik.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSavePost} className="space-y-5">
              {/* Content Type Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Pilihan Tipe Konten
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormType('news')}
                    className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      formType === 'news'
                        ? 'bg-red-800 text-white border-red-800 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">newspaper</span>
                    <span>Berita Vibes (Artikel/Foto)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormType('reels')}
                    className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      formType === 'reels'
                        ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">movie</span>
                    <span>Video Pendek / Reels</span>
                  </button>
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Judul Berita / Vibes <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Perbaikan Jalan Cikole Rampung Tepat Waktu"
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/10 transition-all [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_white_inset]"
                />
              </div>

              {/* Category & Source Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Kategori / Tag
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/10 transition-all cursor-pointer"
                  >
                    <option>Sukabumi Today</option>
                    <option>Infrastruktur</option>
                    <option>Wisata & Alam</option>
                    <option>Pelayanan Publik</option>
                    <option>Kuliner & UMKM</option>
                    <option>Event & Budaya</option>
                    <option>Lingkungan Hidup</option>
                    <option>Transparansi Pemda</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Sumber / Penulis
                  </label>
                  <input
                    type="text"
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    placeholder="e.g. Redaksi Jurnal Sukabumi"
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/10 transition-all [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_white_inset]"
                  />
                </div>
              </div>

              {/* Media Upload & URL */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Media Konten ({formType === 'reels' ? 'Video Reels MP4/Stream' : 'Foto Banner/Gambar Artikel'})
                </label>

                {/* File Drag-and-Drop / Upload */}
                <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 text-center hover:bg-slate-100/80 transition-colors">
                  <input
                    type="file"
                    accept={formType === 'reels' ? 'video/*' : 'image/*'}
                    onChange={handleFileUpload}
                    className="hidden"
                    id="vibes-media-file-input"
                  />
                  <label htmlFor="vibes-media-file-input" className="cursor-pointer flex flex-col items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-3xl text-slate-400">
                      {formType === 'reels' ? 'video_call' : 'cloud_upload'}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      Klik untuk pilih file {formType === 'reels' ? 'Video' : 'Gambar'} dari laptop
                    </span>
                    <span className="text-[11px] text-slate-400">Format: JPG, PNG, WEBP, atau MP4 (Maks. 50MB)</span>
                  </label>
                </div>

                {uploadProgress && (
                  <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    {uploadProgress}
                  </p>
                )}

                {/* Fallback Direct URL Input */}
                <div className="space-y-1 pt-1">
                  <span className="text-[11px] font-semibold text-slate-500 block">atau masukkan URL Media langsung:</span>
                  <input
                    type="url"
                    value={formMediaUrl}
                    onChange={(e) => setFormMediaUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-700"
                  />
                </div>

                {/* Media Preview Card */}
                {formMediaUrl && (
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Pratinjau Media:</span>
                    {formType === 'reels' ? (
                      <video src={formMediaUrl} controls className="w-full max-h-48 rounded-lg object-cover bg-black" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={formMediaUrl} alt="Preview" className="w-full max-h-48 rounded-lg object-cover" />
                    )}
                  </div>
                )}
              </div>

              {/* Content Description / Body */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Caption / Isi Berita Redaksi
                </label>
                <textarea
                  rows={4}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Tuliskan ulasan lengkap berita atau deskripsi video di sini..."
                  className="w-full p-4 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-700 focus:ring-2 focus:ring-red-700/10 transition-all"
                />
              </div>

              {/* Status & Options Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Status Publikasi
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 outline-none focus:border-red-700 cursor-pointer"
                  >
                    <option value="published">Tayang Langsung (Published)</option>
                    <option value="draft">Simpan Draf (Privat)</option>
                    <option value="scheduled">Jadwalkan</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formIsPinned}
                      onChange={(e) => setFormIsPinned(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-red-800 focus:ring-red-700 cursor-pointer"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-900 group-hover:text-red-800 transition-colors block">
                        Jadikan Sorotan Utama (Headline)
                      </span>
                      <span className="text-[11px] text-slate-500 block">Postingan akan disematkan di posisi teratas.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit / Cancel Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'saving' || uploadingFile}
                  className="px-6 py-3 rounded-xl bg-red-800 hover:bg-red-900 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading === 'saving' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">save</span>
                      <span>{editingPost ? 'Simpan Perubahan' : 'Terbitkan Konten'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus Permanen Confirmation */}
      {deleteConfirmPost && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 relative space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base font-['Libre_Franklin']">Hapus Konten Permanen?</h4>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">{deleteConfirmPost.title}</p>
              <p className="text-slate-500">{deleteConfirmPost.category} • {deleteConfirmPost.source}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmPost(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">delete</span>
                <span>Ya, Hapus Permanen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
