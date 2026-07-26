'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    if (loading) return
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (err) {
      console.error(err)
      window.location.href = '/'
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="font-['Public_Sans'] text-[14px] leading-[20px] tracking-[0.01em] font-semibold text-white border border-white/30 px-6 py-2 rounded-[0.25rem] hover:bg-white/10 transition-all disabled:opacity-50 min-h-[38px] cursor-pointer flex items-center gap-2"
    >
      {loading ? (
        <>
          <span className="material-symbols-outlined text-sm animate-spin">sync</span>
          Logging out...
        </>
      ) : (
        'Logout'
      )}
    </button>
  )
}
