import React from 'react'

export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return 'U'
  const cleanName = name.trim()
  const parts = cleanName.split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    return parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

interface UserAvatarProps {
  name?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  bgColor?: 'maroon' | 'gold'
  className?: string
}

export default function UserAvatar({
  name,
  size = 'md',
  bgColor = 'maroon',
  className = '',
}: UserAvatarProps) {
  const initials = getInitials(name)

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px] font-bold',
    sm: 'w-8 h-8 text-xs font-bold',
    md: 'w-10 h-10 text-sm font-bold',
    lg: 'w-16 h-16 text-xl font-bold',
    xl: 'w-24 h-24 md:w-28 md:h-28 text-3xl md:text-4xl font-extrabold',
  }[size]

  const bgClasses = bgColor === 'gold' 
    ? 'bg-[#C9A227] text-white shadow-sm border border-[#ffe08e]/30'
    : 'bg-[#8B1E2C] text-white shadow-sm border border-white/20'

  return (
    <div
      className={`rounded-full flex items-center justify-center font-['Libre_Franklin'] shrink-0 select-none tracking-wider ${sizeClasses} ${bgClasses} ${className}`}
      title={name || 'User'}
    >
      <span>{initials}</span>
    </div>
  )
}
