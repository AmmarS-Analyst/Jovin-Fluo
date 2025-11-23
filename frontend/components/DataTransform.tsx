'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Trash2, Edit2, Type, X } from 'lucide-react'
import { showToast } from '@/lib/toast'

interface DataTransformProps {
  columns: Array<{ name: string; type: string }>
  onTransform: (transformations: any[]) => void
}

export default function DataTransform({ columns, onTransform }: DataTransformProps) {
  const [transformations, setTransformations] = useState<any[]>([])
  const [showRename, setShowRename] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  const renameColumn = (oldName: string) => {
    if (!newName.trim()) {
      showToast.error('Column name cannot be empty')
      return
    }
    if (columns.some(c => c.name === newName && c.name !== oldName)) {
      showToast.error('Column name already exists')
      return
    }
    setTransformations([...transformations, { type: 'rename', oldName, newName: newName.trim() }])
    setShowRename(null)
    setNewName('')
    showToast.success('Column renamed')
  }

  const changeType = (columnName: string, newType: string) => {
    setTransformations([...transformations, { type: 'change-type', column: columnName, newType }])
    showToast.success('Type conversion added')
  }

  const removeDuplicates = (columnName?: string) => {
    setTransformations([...transformations, { type: 'remove-duplicates', column: columnName }])
    showToast.success('Remove duplicates added')
  }

  const fillMissing = (columnName: string, method: 'mean' | 'median' | 'mode' | 'zero' | 'forward') => {
    setTransformations([...transformations, { type: 'fill-missing', column: columnName, method }])
    showToast.success('Fill missing values added')
  }

  const splitColumn = (columnName: string, delimiter: string) => {
    setTransformations([...transformations, { type: 'split', column: columnName, delimiter }])
    showToast.success('Split column added')
  }

  const removeTransformation = (index: number) => {
    const updated = transformations.filter((_, i) => i !== index)
    setTransformations(updated)
    onTransform(updated)
  }

  const applyTransformations = () => {
    onTransform(transformations)
    showToast.success('Transformations applied!')
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#A69677]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-black">Data Transformations</h2>
          <p className="text-sm text-black/70">Clean and transform your data</p>
        </div>
        {transformations.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={applyTransformations}
            className="px-4 py-2 bg-[#403B33] text-white rounded-lg font-semibold hover:bg-[#2d2822] transition flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Apply Transformations
          </motion.button>
        )}
      </div>

      {/* Column Operations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {columns.map(col => (
          <motion.div
            key={col.name}
            whileHover={{ scale: 1.02 }}
            className="p-4 border-2 border-[#A69677] rounded-lg hover:border-[#403B33] transition"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-black">{col.name}</span>
                <span className="px-2 py-1 bg-[#D9BFA0] text-black rounded text-xs">
                  {col.type}
                </span>
              </div>
              {showRename === col.name ? (
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') renameColumn(col.name)
                      if (e.key === 'Escape') setShowRename(null)
                    }}
                    className="w-24 px-2 py-1 text-sm border-2 border-[#A69677] rounded bg-white text-black"
                    autoFocus
                  />
                  <button
                    onClick={() => renameColumn(col.name)}
                    className="p-1 text-[#403B33] hover:bg-[#D9BFA0] rounded"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setShowRename(null)}
                    className="p-1 text-[#BF8A49] hover:bg-[#BF8A49]/20 rounded"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setShowRename(col.name)
                    setNewName(col.name)
                  }}
                  className="p-1 text-[#403B33] hover:bg-[#D9BFA0] rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </motion.button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {col.type === 'numeric' && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => changeType(col.name, 'string')}
                    className="px-2 py-1 text-xs bg-[#D9BFA0] text-black rounded hover:bg-[#BF8A49] hover:text-white"
                  >
                    To String
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fillMissing(col.name, 'mean')}
                    className="px-2 py-1 text-xs bg-[#D9BFA0] text-black rounded hover:bg-[#BF8A49] hover:text-white"
                  >
                    Fill (Mean)
                  </motion.button>
                </>
              )}
              {col.type === 'string' && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => changeType(col.name, 'numeric')}
                    className="px-2 py-1 text-xs bg-[#D9BFA0] text-black rounded hover:bg-[#BF8A49] hover:text-white"
                  >
                    To Number
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => removeDuplicates(col.name)}
                    className="px-2 py-1 text-xs bg-[#D9BFA0] text-black rounded hover:bg-[#BF8A49] hover:text-white"
                  >
                    Remove Dups
                  </motion.button>
                </>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => removeDuplicates(col.name)}
                className="px-2 py-1 text-xs bg-[#BF8A49] text-white rounded hover:bg-[#A6753A]"
              >
                Remove Dups
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Applied Transformations */}
      {transformations.length > 0 && (
        <div className="border-t border-[#A69677] pt-6">
          <h3 className="text-lg font-semibold text-black mb-4">Applied Transformations</h3>
          <div className="space-y-2">
            {transformations.map((trans, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-white border-2 border-[#A69677] rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {trans.type === 'rename' && <Edit2 className="w-4 h-4 text-[#403B33]" />}
                  {trans.type === 'change-type' && <Type className="w-4 h-4 text-[#BF8A49]" />}
                  {trans.type === 'remove-duplicates' && <Trash2 className="w-4 h-4 text-[#BF8A49]" />}
                  {trans.type === 'fill-missing' && <RefreshCw className="w-4 h-4 text-[#403B33]" />}
                  <span className="text-sm text-black">
                    {trans.type === 'rename' && `Rename "${trans.oldName}" to "${trans.newName}"`}
                    {trans.type === 'change-type' && `Change "${trans.column}" type to ${trans.newType}`}
                    {trans.type === 'remove-duplicates' && `Remove duplicates${trans.column ? ` in "${trans.column}"` : ''}`}
                    {trans.type === 'fill-missing' && `Fill missing values in "${trans.column}" using ${trans.method}`}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeTransformation(idx)}
                  className="p-1 text-[#BF8A49] hover:bg-[#BF8A49]/20 rounded"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

