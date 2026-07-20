'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function CompleteProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState('')
  const [status, setStatus] = useState('Memproses pendaftaran Anda...')

  useEffect(() => {
    async function completeRegistration() {
      try {
        const getSupabase = () => createClient()
        const sb = getSupabase()

        // 1. Check if user is authenticated
        const { data: { user } } = await sb.auth.getUser()
        if (!user) {
          setError('Sesi tidak ditemukan. Silakan login kembali.')
          return
        }

        // 2. Read from localStorage
        const regDataStr = localStorage.getItem('halo_jurnal_registration')
        const ktpBase64 = localStorage.getItem('halo_jurnal_ktp_base64')

        // If no registration data, it might just be a regular login magic link
        if (!regDataStr || !ktpBase64) {
          // Check if they already have a profile
          const { data: profile } = await sb.from('profiles').select('id').eq('id', user.id).single()
          if (profile) {
            // Regular login flow via magic link
            const next = searchParams.get('next') ?? '/beranda'
            router.push(next)
            return
          } else {
             // Edge case: Signed up but no localstorage data (e.g., confirmed on a different device)
             // We should probably redirect them to a page to complete their profile manually,
             // but for now let's just create a basic profile or show an error.
             setError('Data pendaftaran tidak ditemukan di perangkat ini. Jika Anda memverifikasi dari perangkat lain, silakan lengkapi profil Anda.')
             return
          }
        }

        const regData = JSON.parse(regDataStr)
        setStatus('Mengunggah dokumen...')

        // 3. Convert base64 back to file for KTP upload
        // The base64 string looks like: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...
        const res = await fetch(ktpBase64)
        const blob = await res.blob()
        const fileExt = regData.ktp_file_name.split('.').pop()
        const filePath = `${user.id}/ktp.${fileExt}`

        const { error: uploadError } = await sb.storage
          .from('ktp-photos')
          .upload(filePath, blob, {
            cacheControl: '3600',
            upsert: true,
            contentType: regData.ktp_file_type
          })

        if (uploadError) {
          throw new Error('Gagal mengunggah KTP: ' + uploadError.message)
        }

        const { data: urlData } = sb.storage
          .from('ktp-photos')
          .getPublicUrl(filePath)

        setStatus('Menyimpan profil...')

        // 4. Update profile
        const { error: profileError } = await sb
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: regData.full_name,
            phone: regData.phone,
            ktp_photo_url: urlData.publicUrl,
            ktp_verified: false,
            role: 'citizen',
          })

        if (profileError) {
          throw new Error('Gagal menyimpan profil: ' + profileError.message)
        }

        setStatus('Pendaftaran berhasil! Mengalihkan...')

        // 5. Clean up local storage
        localStorage.removeItem('halo_jurnal_registration')
        localStorage.removeItem('halo_jurnal_ktp_base64')

        // 6. Redirect
        const next = searchParams.get('next') ?? '/beranda'
        router.push(next)

      } catch (err: any) {
        console.error('Error completing profile:', err)
        setError(err.message || 'Terjadi kesalahan saat menyelesaikan pendaftaran.')
      }
    }

    completeRegistration()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-[#fcf9f4] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md bg-white p-8 rounded-[0.5rem] shadow-lg border border-[#debfbf] text-center">
        <span className="material-symbols-outlined text-[#6b0218] text-6xl mb-4 animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
          hourglass_empty
        </span>
        <h1 className="font-['Libre_Franklin'] text-[24px] font-bold text-[#6b0218] mb-4">
          Menyelesaikan Pendaftaran
        </h1>
        {error ? (
          <div className="p-4 bg-[#ffdad6] border border-[#ba1a1a] rounded-[0.25rem] text-[#93000a] font-['Public_Sans'] text-[14px] text-left">
            <p className="font-bold mb-2">Pendaftaran Tertunda</p>
            <p>{error}</p>
            <button
              onClick={() => router.push('/daftar')}
              className="mt-4 px-4 py-2 bg-[#6b0218] text-white rounded-[0.25rem] font-semibold hover:bg-[#8b1e2c]"
            >
              Kembali ke Daftar
            </button>
          </div>
        ) : (
          <p className="font-['Public_Sans'] text-[#574141]">{status}</p>
        )}
      </div>
    </div>
  )
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fcf9f4] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6b0218]"></div>
      </div>
    }>
      <CompleteProfileContent />
    </Suspense>
  )
}
