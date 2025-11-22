'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, X, Calendar, Hash, List } from 'lucide-react'

interface FilterConfig {
  column: string
  type: 'date' | 'numeric' | 'string' | 'multi-select'
  operator: string
  value: any
  value2?: any // For range filters
  options?: string[] // For multi-select
}

interface AdvancedFiltersProps {
  columns: Array<{ name: string; type: string }>
  onFilterChange: (filters: FilterConfig[]) => void
}

export default function AdvancedFilters({ columns, onFilterChange }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterConfig[]>([])
  const [showAddFilter, setShowAddFilter] = useState(false)
  const [newFilter, setNewFilter] = useState<Partial<FilterConfig>>({
    type: 'string',
    operator: 'equals'
  })

  const addFilter = () => {
    if (!newFilter.column || !newFilter.value) return
    
    const filter: FilterConfig = {
      column: newFilter.column!,
      type: newFilter.type || 'string',
      operator: newFilter.operator || 'equals',
      value: newFilter.value,
      value2: newFilter.value2,
      options: newFilter.options
    }
    
    setFilters([...filters, filter])
    onFilterChange([...filters, filter])
    setNewFilter({ type: 'string', operator: 'equals' })
    setShowAddFilter(false)
  }

  const removeFilter = (index: number) => {
    const updated = filters.filter((_, i) => i !== index)
    setFilters(updated)
    onFilterChange(updated)
  }

  const getOperators = (type: string) => {
    switch (type) {
      case 'date':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'before', label: 'Before' },
          { value: 'after', label: 'After' },
          { value: 'between', label: 'Between' }
        ]
      case 'numeric':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'greater', label: 'Greater than' },
          { value: 'less', label: 'Less than' },
          { value: 'between', label: 'Between' }
        ]
      case 'string':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'contains', label: 'Contains' },
          { value: 'starts', label: 'Starts with' },
          { value: 'ends', label: 'Ends with' }
        ]
      case 'multi-select':
        return [
          { value: 'in', label: 'In' },
          { value: 'not-in', label: 'Not in' }
        ]
      default:
        return []
    }
  }

  const getFilteredColumns = (type: string) => {
    return columns.filter(col => {
      if (type === 'date') return col.type === 'datetime'
      if (type === 'numeric') return col.type === 'numeric'
      if (type === 'string') return col.type === 'string'
      return true
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Filters</h3>
          {filters.length > 0 && (
            <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-xs font-semibold">
              {filters.length}
            </span>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddFilter(!showAddFilter)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Add Filter
        </motion.button>
      </div>

      {/* Active Filters */}
      {filters.length > 0 && (
        <div className="space-y-2 mb-4">
          {filters.map((filter, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{filter.column}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{filter.operator}</span>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {Array.isArray(filter.value) ? filter.value.join(', ') : filter.value}
                {filter.value2 && ` - ${filter.value2}`}
              </span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => removeFilter(idx)}
                className="ml-auto p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Filter Form */}
      <AnimatePresence>
        {showAddFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter Type
                </label>
                <select
                  value={newFilter.type || 'string'}
                  onChange={(e) => setNewFilter({ ...newFilter, type: e.target.value as any, column: undefined })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="string">String</option>
                  <option value="numeric">Numeric</option>
                  <option value="date">Date</option>
                  <option value="multi-select">Multi-Select</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Column
                </label>
                <select
                  value={newFilter.column || ''}
                  onChange={(e) => setNewFilter({ ...newFilter, column: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select column...</option>
                  {getFilteredColumns(newFilter.type || 'string').map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Operator
                </label>
                <select
                  value={newFilter.operator || 'equals'}
                  onChange={(e) => setNewFilter({ ...newFilter, operator: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {getOperators(newFilter.type || 'string').map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Value
                </label>
                {newFilter.type === 'date' ? (
                  <input
                    type="date"
                    value={newFilter.value || ''}
                    onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : newFilter.type === 'numeric' ? (
                  <input
                    type="number"
                    value={newFilter.value || ''}
                    onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : newFilter.type === 'multi-select' ? (
                  <input
                    type="text"
                    placeholder="Comma-separated values"
                    value={Array.isArray(newFilter.value) ? newFilter.value.join(', ') : newFilter.value || ''}
                    onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value.split(',').map(v => v.trim()) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <input
                    type="text"
                    value={newFilter.value || ''}
                    onChange={(e) => setNewFilter({ ...newFilter, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                )}
                {(newFilter.operator === 'between') && (
                  <input
                    type={newFilter.type === 'date' ? 'date' : 'number'}
                    placeholder="To"
                    value={newFilter.value2 || ''}
                    onChange={(e) => setNewFilter({ ...newFilter, value2: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mt-2"
                  />
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addFilter}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                Apply Filter
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowAddFilter(false)
                  setNewFilter({ type: 'string', operator: 'equals' })
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

