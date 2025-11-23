'use client'

import { motion } from 'framer-motion'
import { Database, BarChart3, CheckCircle } from 'lucide-react'
import DataTable from './DataTable'

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
        className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#A69677]"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#403B33] rounded-lg">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-black">Data Profile</h2>
            <p className="text-sm text-black/70">Dataset overview and statistics</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl border-2 border-[#A69677]"
          >
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-[#403B33]" />
              <div className="text-sm font-medium text-black">Total Rows</div>
            </div>
            <div className="text-3xl font-bold text-[#403B33]">{data.row_count.toLocaleString()}</div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl border-2 border-[#A69677]"
          >
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-5 h-5 text-[#BF8A49]" />
              <div className="text-sm font-medium text-black">Total Columns</div>
            </div>
            <div className="text-3xl font-bold text-[#BF8A49]">{data.columns.length}</div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl border-2 border-[#A69677]"
          >
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-[#BF8A49]" />
              <div className="text-sm font-medium text-black">Data Quality</div>
            </div>
            <div className="text-3xl font-bold text-[#BF8A49]">
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
        className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#A69677]"
      >
        <h3 className="text-xl font-bold text-black mb-4">Column Information</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#A69677]">
            <thead className="bg-[#D9BFA0]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Column</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Null %</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Distinct</th>
                {data.columns.some(col => col.statistics) && (
                  <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Statistics</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#A69677]">
              {data.columns.map((col, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="hover:bg-[#D9BFA0]"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-black">{col.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black/70">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      col.type === 'numeric' ? 'bg-blue-100 text-blue-800' :
                      col.type === 'string' ? 'bg-green-100 text-green-800' :
                      col.type === 'datetime' ? 'bg-purple-100 text-purple-800' :
                      'bg-[#D9BFA0] text-black'
                    }`}>
                      {col.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black/70">{col.null_percentage.toFixed(2)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black/70">{col.distinct_count?.toLocaleString() || '-'}</td>
                  {col.statistics && (
                    <td className="px-6 py-4 text-sm text-black/70">
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
        className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#A69677]"
      >
        <h3 className="text-xl font-bold text-black mb-4">Data Preview</h3>
        <DataTable
          columns={data.columns.map(col => ({ name: col.name, label: col.name, sortable: true }))}
          data={data.preview_data}
          searchable={true}
          sortable={true}
          paginated={true}
          pageSize={10}
        />
      </motion.div>
    </div>
  )
}
