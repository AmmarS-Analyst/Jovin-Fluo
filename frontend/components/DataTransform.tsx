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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Data Transformations</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Clean and transform your data</p>
        </div>
        {transformations.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={applyTransformations}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition flex items-center gap-2"
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
            className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white">{col.name}</span>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs">
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
                    className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                    autoFocus
                  />
                  <button
                    onClick={() => renameColumn(col.name)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setShowRename(null)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
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
                  className="p-1 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
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
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    To String
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fillMissing(col.name, 'mean')}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
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
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    To Number
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => removeDuplicates(col.name)}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Remove Dups
                  </motion.button>
                </>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => removeDuplicates(col.name)}
                className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800"
              >
                Remove Dups
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Applied Transformations */}
      {transformations.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Applied Transformations</h3>
          <div className="space-y-2">
            {transformations.map((trans, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {trans.type === 'rename' && <Edit2 className="w-4 h-4 text-blue-600" />}
                  {trans.type === 'change-type' && <Type className="w-4 h-4 text-green-600" />}
                  {trans.type === 'remove-duplicates' && <Trash2 className="w-4 h-4 text-red-600" />}
                  {trans.type === 'fill-missing' && <RefreshCw className="w-4 h-4 text-purple-600" />}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
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
                  className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
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

