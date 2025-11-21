'use client'

import { motion } from 'framer-motion'
import { Database, BarChart3, CheckCircle } from 'lucide-react'

interface ColumnProfile {
  name: string
  type: string
  null_percentage: number
  distinct_count?: number
  statistics?: {
    mean?: number
    median?: number
    std?: number
    min?: number
    max?: number
  }
}

interface DataProfileProps {
  data: {
    columns: ColumnProfile[]
    row_count: number
    preview_data: any[][]
    summary?: string
  }
}

export default function DataProfile({ data }: DataProfileProps) {
  return (
    <div className="space-y-6">
      {/* Data Profile Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Database className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Data Profile</h2>
            <p className="text-sm text-gray-500">Dataset overview and statistics</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <div className="text-sm font-medium text-gray-600">Total Rows</div>
            </div>
            <div className="text-3xl font-bold text-blue-600">{data.row_count.toLocaleString()}</div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-5 h-5 text-green-600" />
              <div className="text-sm font-medium text-gray-600">Total Columns</div>
            </div>
            <div className="text-3xl font-bold text-green-600">{data.columns.length}</div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              <div className="text-sm font-medium text-gray-600">Data Quality</div>
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {Math.round(100 - (data.columns.reduce((acc, col) => acc + col.null_percentage, 0) / data.columns.length))}%
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Column Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Column Information</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Column</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Null %</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Distinct</th>
                {data.columns.some(col => col.statistics) && (
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Statistics</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.columns.map((col, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{col.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      col.type === 'numeric' ? 'bg-blue-100 text-blue-800' :
                      col.type === 'string' ? 'bg-green-100 text-green-800' :
                      col.type === 'datetime' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {col.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{col.null_percentage.toFixed(2)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{col.distinct_count?.toLocaleString() || '-'}</td>
                  {col.statistics && (
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="text-xs space-y-1">
                        <div>Mean: <span className="font-semibold">{col.statistics.mean?.toFixed(2) || '-'}</span></div>
                        <div>Min: <span className="font-semibold">{col.statistics.min?.toFixed(2) || '-'}</span> | Max: <span className="font-semibold">{col.statistics.max?.toFixed(2) || '-'}</span></div>
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Data Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4">Data Preview (First 10 Rows)</h3>
        <div className="overflow-x-auto border-2 border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                {data.columns.map((col, idx) => (
                  <th key={idx} className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200 last:border-r-0">
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.preview_data.map((row, rowIdx) => (
                <motion.tr
                  key={rowIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: rowIdx * 0.05 }}
                  className="hover:bg-blue-50 transition"
                >
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-4 py-3 text-sm text-gray-700 border-r border-gray-100 last:border-r-0">
                      {cell !== null && cell !== undefined ? String(cell) : <span className="text-gray-400 italic">null</span>}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
