'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, FileSpreadsheet, Trash2 } from 'lucide-react'
import api from '@/lib/api'

interface ExportButtonProps {
  datasetId: number
  projectId?: number
}

export default function ExportButton({ datasetId, projectId }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [visualizations, setVisualizations] = useState<any[]>([])
  const [selectedVizIds, setSelectedVizIds] = useState<number[]>([])

  useEffect(() => {
    if (projectId) {
      loadVisualizations()
    }
  }, [projectId])

  const loadVisualizations = async () => {
    try {
      const response = await api.get(`/visualizations/project/${projectId}`)
      setVisualizations(response.data || [])
      // Load selected visualizations from localStorage
      const saved = localStorage.getItem(`selectedViz_${projectId}`)
      if (saved) {
        try {
          const savedIds = JSON.parse(saved)
          setSelectedVizIds(savedIds)
        } catch (e) {
          // If parsing fails, select all by default
          setSelectedVizIds(response.data?.map((v: any) => v.id) || [])
        }
      } else {
        // Select all by default if nothing saved
        setSelectedVizIds(response.data?.map((v: any) => v.id) || [])
      }
    } catch (error) {
      console.error('Failed to load visualizations:', error)
    }
  }

  const handleExport = async (format: 'csv' | 'pdf') => {
    setExporting(true)
    try {
      if (format === 'csv') {
        const response = await api.get(`/exports/dataset/${datasetId}/csv`, {
          responseType: 'blob',
        })
        
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `dataset_${datasetId}.csv`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } else {
        // PDF export with selected visualizations
        const response = await api.get(`/exports/dataset/${datasetId}/pdf`, {
          params: {
            visualization_ids: selectedVizIds.join(',')
          },
          responseType: 'blob',
        })
        
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `analysis_report_${datasetId}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      }
    } catch (error: any) {
      console.error('Export failed:', error)
      const errorMsg = error.response?.data?.detail || 'Export failed. Please try again.'
      alert(errorMsg)
    } finally {
      setExporting(false)
    }
  }

  const handleDeleteReport = async () => {
    if (!confirm('Are you sure you want to archive this report? It will be removed from your view but preserved for audit purposes.')) {
      return
    }

    setDeleting(true)
    try {
      await api.delete(`/exports/report/${datasetId}`)
      alert('Report archived successfully.')
    } catch (error: any) {
      console.error('Failed to archive report:', error)
      alert(error.response?.data?.detail || 'Failed to archive report')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Download className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Export Data</h2>
          <p className="text-sm text-gray-500">Download your analysis and reports</p>
        </div>
      </div>

      {visualizations.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-blue-900 mb-2">
            {selectedVizIds.length > 0 
              ? `${selectedVizIds.length} visualization${selectedVizIds.length !== 1 ? 's' : ''} selected for PDF export`
              : 'No visualizations selected for PDF export'}
          </p>
          <div className="text-xs text-blue-700">
            {visualizations.length} total visualization{visualizations.length !== 1 ? 's' : ''} available. 
            Select visualizations in the Visualizations tab to include them in the report.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleExport('csv')}
          disabled={exporting || deleting}
          className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition shadow-lg disabled:opacity-50"
        >
          <FileSpreadsheet className="w-5 h-5" />
          {exporting ? 'Exporting...' : 'Export as CSV'}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleExport('pdf')}
          disabled={exporting || deleting}
          className="flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-rose-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transition shadow-lg disabled:opacity-50"
        >
          <FileText className="w-5 h-5" />
          {exporting ? 'Exporting...' : 'Export Analysis Report (PDF)'}
        </motion.button>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleDeleteReport}
        disabled={deleting || exporting}
        className="w-full flex items-center justify-center gap-3 bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-700 transition shadow-lg disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
        {deleting ? 'Archiving Report...' : 'Archive Report'}
      </motion.button>
    </motion.div>
  )
}
