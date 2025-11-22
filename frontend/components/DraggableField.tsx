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
      className={`flex items-center gap-2 p-3 bg-white dark:bg-gray-700 border-2 border-dashed rounded-lg cursor-move transition ${
        isDragging
          ? 'opacity-50 border-primary-500'
          : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
      }`}
    >
      <GripVertical className="w-4 h-4 text-gray-400" />
      <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{field}</span>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onRemove}
        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded"
      >
        <X className="w-3 h-3" />
      </motion.button>
    </motion.div>
  )
}

