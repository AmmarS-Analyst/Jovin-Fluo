'use client'

import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave'
}

export function Skeleton({ 
  className = '', 
  variant = 'rectangular', 
  width, 
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const baseClasses = `bg-gray-200 dark:bg-gray-700 ${
    animation === 'pulse' ? 'animate-pulse' : ''
  }`
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} height={40} className="flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Skeleton key={colIdx} height={32} className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton height={40} width="60%" />
      <Skeleton height={300} />
      <div className="flex gap-4">
        <Skeleton height={20} width="30%" />
        <Skeleton height={20} width="30%" />
        <Skeleton height={20} width="30%" />
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <Skeleton height={24} width="40%" />
      <Skeleton height={16} width="80%" />
      <Skeleton height={16} width="60%" />
    </div>
  )
}

