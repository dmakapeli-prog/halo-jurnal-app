'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold text-white border border-white/30 px-6 py-2 rounded-[0.25rem] hover:bg-white/10 transition-all"
    >
      Keluar
    </button>
  )
}
