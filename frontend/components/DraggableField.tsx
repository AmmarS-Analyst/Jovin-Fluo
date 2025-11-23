'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GripVertical, X } from 'lucide-react'

interface DraggableFieldProps {
  field: string
  type: 'x-axis' | 'y-axis' | 'y-axis2'
  onRemove: () => void
  onDrop: (field: string, type: 'x-axis' | 'y-axis' | 'y-axis2') => void
}

export default function DraggableField({ field, type, onRemove, onDrop }: DraggableFieldProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', JSON.stringify({ field, type }))
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'))
      onDrop(data.field, data.type)
    } catch (error) {
      console.error('Failed to parse drag data:', error)
    }
  }

  return (
    <motion.div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center gap-2 p-3 bg-white border-2 border-dashed rounded-lg cursor-move transition ${
        isDragging
          ? 'opacity-50 border-[#403B33]'
          : 'border-[#A69677] hover:border-[#403B33]'
      }`}
    >
      <GripVertical className="w-4 h-4 text-[#403B33]" />
      <span className="flex-1 text-sm font-medium text-black">{field}</span>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onRemove}
        className="p-1 text-[#BF8A49] hover:bg-[#BF8A49]/20 rounded"
      >
        <X className="w-3 h-3" />
      </motion.button>
    </motion.div>
  )
}

