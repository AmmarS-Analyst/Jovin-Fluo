'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Database, BarChart3, Calculator, Trash2, Upload as UploadIcon, Clock, FileText, Settings, Download } from 'lucide-react'
import api from '@/lib/api'
import { authService } from '@/lib/auth'
import FileUpload from '@/components/FileUpload'
import DataProfile from '@/components/DataProfile'
import VisualizationBuilder from '@/components/VisualizationBuilder'
import CalculationsBuilder from '@/components/CalculationsBuilder'
import ExportButton from '@/components/ExportButton'

interface Dataset {
  id: number
  name: string
  file_size: number
  file_type: string
  project_id: number
  created_at: string
}

type ViewMode = 'upload' | 'datasets' | 'profile' | 'visualizations' | 'calculations' | 'export'

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = parseInt(params.id as string)
  
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [selectedDataset, setSelectedDataset] = useState<number | null>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [currentView, setCurrentView] = useState<ViewMode>('datasets')
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    loadDatasets()
  }, [projectId, router])

  const loadDatasets = async () => {
    try {
      const response = await api.get(`/datasets/project/${projectId}`)
      setDatasets(response.data || [])
    } catch (error) {
      console.error('Failed to load datasets:', error)
      setDatasets([])
    }
  }

  const handleFileUploaded = () => {
    loadDatasets()
    setShowUploadModal(false)
    setCurrentView('datasets')
  }

  const handleDatasetSelect = async (datasetId: number) => {
    setSelectedDataset(datasetId)
    setLoading(true)
    setProfileData(null)
    try {
      const response = await api.get(`/datasets/${datasetId}/profile`)
      setProfileData(response.data)
      setCurrentView('profile')
    } catch (error: any) {
      console.error('Failed to load profile:', error)
      alert(error.response?.data?.detail || 'Failed to load dataset profile')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDataset = async (datasetId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this dataset? It will be archived and hidden from your view, but the data will be preserved.')) {
      return
    }

    try {
      await api.delete(`/datasets/${datasetId}`)
      loadDatasets()
      if (selectedDataset === datasetId) {
        setSelectedDataset(null)
        setProfileData(null)
        setCurrentView('datasets')
      }
      alert('Dataset deleted successfully. It has been archived.')
    } catch (error: any) {
      console.error('Failed to delete dataset:', error)
      alert(error.response?.data?.detail || 'Failed to delete dataset')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const navItems = [
    { id: 'upload', label: 'Upload', icon: UploadIcon, requiresDataset: false },
    { id: 'datasets', label: 'Datasets', icon: Database, requiresDataset: false },
    { id: 'profile', label: 'Data Profile', icon: FileText, requiresDataset: true },
    { id: 'visualizations', label: 'Visualizations', icon: BarChart3, requiresDataset: true },
    { id: 'calculations', label: 'Calculations', icon: Calculator, requiresDataset: true },
    { id: 'export', label: 'Export', icon: Download, requiresDataset: true },
  ]

  const canAccessView = (view: ViewMode) => {
    if (view === 'upload' || view === 'datasets') return true
    return selectedDataset !== null && profileData !== null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Power BI-like Top Navbar */}
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back button and title */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </motion.button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Project Workspace</h1>
              </div>
            </div>

            {/* Center: Navigation Tabs */}
            <div className="flex-1 flex items-center justify-center gap-1 mx-8">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = currentView === item.id
                const isDisabled = !canAccessView(item.id as ViewMode)
                
                return (
                  <motion.button
                    key={item.id}
                    whileHover={!isDisabled ? { y: -2 } : {}}
                    whileTap={!isDisabled ? { scale: 0.98 } : {}}
                    onClick={() => {
                      if (!isDisabled) {
                        setCurrentView(item.id as ViewMode)
                      }
                    }}
                    disabled={isDisabled}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all relative ${
                      isActive
                        ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md'
                        : isDisabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-lg -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Right: Selected Dataset Info */}
            {selectedDataset && (
              <div className="flex items-center gap-3 px-4 py-2 bg-primary-50 rounded-lg border border-primary-200">
                <Database className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-700">
                  {datasets.find(d => d.id === selectedDataset)?.name || 'Dataset'}
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 py-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-xl shadow-lg p-12 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"
              />
              <div className="text-xl text-gray-600">Loading...</div>
            </motion.div>
          ) : currentView === 'upload' ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-6">
                  <UploadIcon className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Dataset</h2>
                  <p className="text-gray-600">Upload CSV or Excel files to get started</p>
                </div>
                <FileUpload projectId={projectId} onUploaded={handleFileUploaded} />
              </div>
            </motion.div>
          ) : currentView === 'datasets' ? (
            <motion.div
              key="datasets"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Database className="w-6 h-6 text-primary-600" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Datasets</h2>
                      <p className="text-sm text-gray-500">{datasets.length} dataset{datasets.length !== 1 ? 's' : ''} available</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentView('upload')}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition flex items-center gap-2"
                  >
                    <UploadIcon className="w-4 h-4" />
                    Upload New
                  </motion.button>
                </div>

                {datasets.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
                    <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-2">No datasets uploaded yet</p>
                    <p className="text-sm text-gray-500 mb-6">Upload your first dataset to get started</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentView('upload')}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
                    >
                      Upload Dataset
                    </motion.button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {datasets.map((dataset) => {
                      const { date, time } = formatDate(dataset.created_at)
                      const isSelected = selectedDataset === dataset.id
                      return (
                        <motion.div
                          key={dataset.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ y: -4, scale: 1.02 }}
                          className={`relative p-5 rounded-xl border-2 transition cursor-pointer ${
                            isSelected
                              ? 'border-primary-600 bg-primary-50 shadow-lg'
                              : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md'
                          }`}
                          onClick={() => handleDatasetSelect(dataset.id)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="p-2 bg-primary-100 rounded-lg">
                              <Database className="w-5 h-5 text-primary-600" />
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => handleDeleteDataset(dataset.id, e)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete dataset"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                          <h3 className="font-bold text-gray-900 mb-2 truncate">{dataset.name}</h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              <span>{date} at {time}</span>
                            </div>
                            <div>{(dataset.file_size / 1024).toFixed(2)} KB</div>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-3 h-3 bg-primary-600 rounded-full"></div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          ) : currentView === 'profile' && profileData ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <DataProfile data={profileData} />
            </motion.div>
          ) : currentView === 'visualizations' && profileData ? (
            <motion.div
              key="visualizations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <VisualizationBuilder datasetId={selectedDataset!} profileData={profileData} projectId={projectId} />
            </motion.div>
          ) : currentView === 'calculations' && profileData ? (
            <motion.div
              key="calculations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CalculationsBuilder
                datasetId={selectedDataset!}
                availableColumns={profileData.columns}
              />
            </motion.div>
          ) : currentView === 'export' && selectedDataset ? (
            <motion.div
              key="export"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ExportButton datasetId={selectedDataset} projectId={projectId} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-lg p-12 text-center"
            >
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">Select a dataset to get started</p>
              <p className="text-sm text-gray-500 mb-6">Go to Datasets tab and select a dataset</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView('datasets')}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                View Datasets
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
