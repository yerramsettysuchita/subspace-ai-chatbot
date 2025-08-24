// ============= src/components/UI/Avatar.tsx =============
import React from 'react'
import { UserIcon } from '@heroicons/react/24/solid'

interface AvatarProps {
  src?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  name, 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  }

  const getInitials = (name?: string) => {
    if (!name) return ''
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-primary-600 text-white flex items-center justify-center font-medium ${className}`}
    >
      {name ? getInitials(name) : <UserIcon className="w-1/2 h-1/2" />}
    </div>
  )
}

export default Avatar
