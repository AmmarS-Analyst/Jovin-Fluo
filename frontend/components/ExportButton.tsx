'use client'

import { useState } from 'react'
import api from '@/lib/api'

interface ExportButtonProps {
  datasetId: number
}

export default function ExportButton({ datasetId }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async (format: 'csv' | 'pdf') => {
    setExporting(true)
    try {
      if (format === 'csv') {
        const response = await api.get(`/exports/dataset/${datasetId}/csv`, {
          responseType: 'blob',
        })
        
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `dataset_${datasetId}.csv`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } else {
        // PDF export would go here
        alert('PDF export coming soon!')
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Export Data</h2>
      <div className="flex gap-4">
        <button
          onClick={() => handleExport('csv')}
          disabled={exporting}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
        >
          {exporting ? 'Exporting...' : 'Export as CSV'}
        </button>
        <button
          onClick={() => handleExport('pdf')}
          disabled={exporting}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
        >
          Export as PDF (Coming Soon)
        </button>
      </div>
    </div>
  )
}

