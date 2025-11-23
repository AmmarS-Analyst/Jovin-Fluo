'use client'

import { useState, useMemo } from 'react'
import { FixedSizeList as List } from 'react-window'
import { motion } from 'framer-motion'
import { Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { TableSkeleton } from './LoadingSkeleton'

interface Column {
  name: string
  label?: string
  sortable?: boolean
}

interface DataTableProps {
  columns: Column[]
  data: any[][]
  searchable?: boolean
  sortable?: boolean
  paginated?: boolean
  pageSize?: number
  loading?: boolean
}

export default function DataTable({ 
  columns, 
  data, 
  searchable = true, 
  sortable = true,
  paginated = true,
  pageSize = 10,
  loading = false
}: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: number; direction: 'asc' | 'desc' } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Search filtering
  const filteredData = useMemo(() => {
    if (!searchQuery) return data
    const query = searchQuery.toLowerCase()
    return data.filter(row => 
      row.some(cell => String(cell).toLowerCase().includes(query))
    )
  }, [data, searchQuery])

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig || !sortable) return filteredData
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key]
      const bVal = b[sortConfig.key]
      
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1
      
      const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
  }, [filteredData, sortConfig, sortable])

  // Pagination
  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, currentPage, pageSize, paginated])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = (columnIndex: number) => {
    if (!sortable) return
    setSortConfig(prev => {
      if (prev?.key === columnIndex) {
        return prev.direction === 'asc' 
          ? { key: columnIndex, direction: 'desc' }
          : null
      }
      return { key: columnIndex, direction: 'asc' }
    })
  }

  if (loading) {
    return <TableSkeleton rows={pageSize} cols={columns.length} />
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search data..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1) // Reset to first page on search
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      )}

      {/* Table */}
      <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" style={{ width: 'max-content', minWidth: '100%' }}>
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={`px-4 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 last:border-r-0 ${
                      col.sortable !== false && sortable ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800' : ''
                    }`}
                    onClick={() => col.sortable !== false && handleSort(idx)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{col.label || col.name}</span>
                      {col.sortable !== false && sortable && (
                        <div className="flex flex-col">
                          {sortConfig?.key === idx ? (
                            sortConfig.direction === 'asc' ? (
                              <ArrowUp className="w-3 h-3 text-primary-600" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-primary-600" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                    No data found
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIdx) => (
                  <motion.tr
                    key={rowIdx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: rowIdx * 0.01 }}
                    className="hover:bg-blue-50 dark:hover:bg-gray-700 transition"
                  >
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-100 dark:border-gray-700 last:border-r-0"
                      >
                        {cell !== null && cell !== undefined ? String(cell) : <span className="text-gray-400 italic">null</span>}
                      </td>
                    ))}
                  </motion.tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  )
}

