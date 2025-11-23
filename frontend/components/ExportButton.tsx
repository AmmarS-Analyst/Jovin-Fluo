'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, FileText, FileSpreadsheet, Trash2, ChevronDown, Check } from 'lucide-react'
import api from '@/lib/api'
import { showToast } from '@/lib/toast'

interface ExportButtonProps {
  datasetId: number
  projectId?: number
}

export default function ExportButton({ datasetId, projectId }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [visualizations, setVisualizations] = useState<any[]>([])
  const [selectedVizIds, setSelectedVizIds] = useState<number[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (projectId) {
      loadVisualizations()
    }
  }, [projectId])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

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
    setIsOpen(false) // Close dropdown when export starts
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
        showToast.success('CSV exported successfully!')
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
        showToast.success('PDF report exported successfully!')
      }
    } catch (error: any) {
      console.error('Export failed:', error)
      const errorMsg = error.response?.data?.detail || 'Export failed. Please try again.'
      showToast.error(errorMsg)
    } finally {
      setExporting(false)
    }
  }

  const handleDeleteReport = async () => {
    if (!confirm('Are you sure you want to archive this report? It will be removed from your view but preserved for audit purposes.')) {
      return
    }

    setDeleting(true)
    setIsOpen(false) // Close dropdown
    try {
      await api.delete(`/exports/report/${datasetId}`)
      showToast.success('Report archived successfully.')
    } catch (error: any) {
      console.error('Failed to archive report:', error)
      showToast.error(error.response?.data?.detail || 'Failed to archive report')
    } finally {
      setDeleting(false)
    }
  }

  const toggleVisualization = (vizId: number) => {
    setSelectedVizIds(prev => {
      const newIds = prev.includes(vizId)
        ? prev.filter(id => id !== vizId)
        : [...prev, vizId]
      // Save to localStorage
      if (projectId) {
        localStorage.setItem(`selectedViz_${projectId}`, JSON.stringify(newIds))
      }
      return newIds
    })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Export Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        disabled={exporting || deleting}
        className="flex items-center gap-2 px-4 py-2 bg-[#403B33] text-white rounded-lg font-medium hover:bg-[#2d2822] transition shadow-md disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Content */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border-2 border-[#A69677] z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b-2 border-[#A69677] bg-[#D9BFA0]">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-[#403B33]" />
                  <h3 className="font-semibold text-black">Export Options</h3>
                </div>
                {visualizations.length > 0 && (
                  <p className="text-xs text-black/70 mt-1">
                    {selectedVizIds.length} of {visualizations.length} visualizations selected
                  </p>
                )}
              </div>

              {/* Export Options */}
              <div className="p-2">
                {/* CSV Export */}
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleExport('csv')}
                  disabled={exporting}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#D9BFA0] transition text-left disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-5 h-5 text-[#403B33]" />
                  <div className="flex-1">
                    <div className="font-medium text-black">Export as CSV</div>
                    <div className="text-xs text-black/60">Download dataset as spreadsheet</div>
                  </div>
                  {exporting && <div className="w-4 h-4 border-2 border-[#403B33] border-t-transparent rounded-full animate-spin" />}
                </motion.button>

                {/* PDF Export */}
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleExport('pdf')}
                  disabled={exporting || selectedVizIds.length === 0}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#D9BFA0] transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText className="w-5 h-5 text-[#BF8A49]" />
                  <div className="flex-1">
                    <div className="font-medium text-black">Export as PDF</div>
                    <div className="text-xs text-black/60">
                      {selectedVizIds.length > 0 
                        ? `Include ${selectedVizIds.length} visualization${selectedVizIds.length !== 1 ? 's' : ''}`
                        : 'Select visualizations first'}
                    </div>
                  </div>
                  {exporting && <div className="w-4 h-4 border-2 border-[#BF8A49] border-t-transparent rounded-full animate-spin" />}
                </motion.button>

                {/* Visualization Selection (if available) */}
                {visualizations.length > 0 && (
                  <>
                    <div className="h-px bg-[#A69677] my-2 mx-4" />
                    <div className="px-4 py-2">
                      <div className="text-xs font-medium text-black mb-2">Select Visualizations for PDF:</div>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {visualizations.map((viz) => {
                          const isSelected = selectedVizIds.includes(viz.id)
                          return (
                            <motion.button
                              key={viz.id}
                              whileHover={{ scale: 1.02, x: 2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => toggleVisualization(viz.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#D9BFA0] transition text-left"
                            >
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                isSelected 
                                  ? 'bg-[#403B33] border-[#403B33]' 
                                  : 'border-[#A69677]'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <span className="text-sm text-black flex-1 truncate">{viz.name || `Visualization ${viz.id}`}</span>
                            </motion.button>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}

                {/* Archive Report */}
                <div className="h-px bg-[#A69677] my-2 mx-4" />
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteReport}
                  disabled={deleting || exporting}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[#BF8A49]/20 transition text-left disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5 text-[#BF8A49]" />
                  <div className="flex-1">
                    <div className="font-medium text-black">Archive Report</div>
                    <div className="text-xs text-black/60">Remove from view (preserved for audit)</div>
                  </div>
                  {deleting && <div className="w-4 h-4 border-2 border-[#BF8A49] border-t-transparent rounded-full animate-spin" />}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
