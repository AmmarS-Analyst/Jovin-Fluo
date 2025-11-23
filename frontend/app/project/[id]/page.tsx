'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Database, BarChart3, Calculator, Trash2, Upload as UploadIcon, Clock, FileText, Settings, Download, LayoutGrid } from 'lucide-react'
import api from '@/lib/api'
import { authService } from '@/lib/auth'
import { showToast } from '@/lib/toast'
import { CardSkeleton } from '@/components/LoadingSkeleton'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import FileUpload from '@/components/FileUpload'
import DataProfile from '@/components/DataProfile'
import VisualizationBuilder from '@/components/VisualizationBuilder'
import CalculationsBuilder from '@/components/CalculationsBuilder'
import ExportButton from '@/components/ExportButton'
import AdvancedFilters from '@/components/AdvancedFilters'
import DashboardBuilder from '@/components/DashboardBuilder'
import DataTransform from '@/components/DataTransform'

interface Dataset {
  id: number
  name: string
  file_size: number
  file_type: string
  project_id: number
  created_at: string
}

type ViewMode = 'upload' | 'datasets' | 'profile' | 'visualizations' | 'calculations' | 'dashboard' | 'transform'

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
  const [savedVisualizations, setSavedVisualizations] = useState<any[]>([])

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    loadDatasets()
    loadVisualizations()
  }, [projectId, router])

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'u',
      ctrl: true,
      action: () => setCurrentView('upload'),
      description: 'Go to Upload'
    },
    {
      key: 'd',
      ctrl: true,
      action: () => setCurrentView('datasets'),
      description: 'Go to Datasets'
    },
    {
      key: 'p',
      ctrl: true,
      action: () => selectedDataset && setCurrentView('profile'),
      description: 'Go to Profile'
    },
    {
      key: 'v',
      ctrl: true,
      action: () => selectedDataset && setCurrentView('visualizations'),
      description: 'Go to Visualizations'
    },
    {
      key: 'c',
      ctrl: true,
      action: () => selectedDataset && setCurrentView('calculations'),
      description: 'Go to Calculations'
    },
    {
      key: 'e',
      ctrl: true,
    },
  ])

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

  const loadVisualizations = async () => {
    if (!projectId) return
    try {
      const response = await api.get(`/visualizations/project/${projectId}`)
      setSavedVisualizations(response.data || [])
    } catch (error) {
      console.error('Failed to load visualizations:', error)
      setSavedVisualizations([])
    }
  }

  const handleDatasetSelect = async (datasetId: number) => {
    setSelectedDataset(datasetId)
    setLoading(true)
    setProfileData(null)
    try {
      const response = await api.get(`/datasets/${datasetId}/profile`)
      setProfileData(response.data)
      setCurrentView('profile')
      loadVisualizations()
    } catch (error: any) {
      console.error('Failed to load profile:', error)
      showToast.error(error.response?.data?.detail || 'Failed to load dataset profile')
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
      showToast.success('Dataset deleted successfully. It has been archived.')
    } catch (error: any) {
      console.error('Failed to delete dataset:', error)
      showToast.error(error.response?.data?.detail || 'Failed to delete dataset')
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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, requiresDataset: false },
    { id: 'calculations', label: 'Calculations', icon: Calculator, requiresDataset: true },
  ]

  const canAccessView = (view: ViewMode) => {
    if (view === 'upload' || view === 'datasets' || view === 'dashboard') return true
    return selectedDataset !== null && profileData !== null
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-[#D9BFA0] via-[#A69677] to-[#D9BFA0]">
      {/* Power BI-like Top Navbar */}
      <nav className="bg-white shadow-lg border-b-2 border-[#A69677] sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back button and title */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-[#D9BFA0] rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-black" />
              </motion.button>
              <div>
                <h1 className="text-xl font-bold text-black">Project Workspace</h1>
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
                        ? 'bg-[#403B33] text-white shadow-md'
                        : isDisabled
                        ? 'text-black/40 cursor-not-allowed'
                        : 'text-black hover:bg-[#D9BFA0]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-[#403B33] rounded-lg -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Right: Selected Dataset Info & Export Button */}
            <div className="flex items-center gap-3">
              {selectedDataset && (
                <>
                  <div className="flex items-center gap-3 px-4 py-2 bg-[#BF8A49] rounded-lg border-2 border-[#403B33]">
                    <Database className="w-4 h-4 text-white" />
                    <span className="text-sm font-medium text-white">
                      {datasets.find(d => d.id === selectedDataset)?.name || 'Dataset'}
                    </span>
                  </div>
                  <ExportButton datasetId={selectedDataset} projectId={projectId} />
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 py-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <div key="loading" className="space-y-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : currentView === 'upload' ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-[#A69677]">
                <div className="text-center mb-6">
                  <UploadIcon className="w-16 h-16 text-[#403B33] mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-black mb-2">Upload Dataset</h2>
                  <p className="text-black">Upload CSV or Excel files to get started</p>
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
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#A69677]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Database className="w-6 h-6 text-[#403B33]" />
                    <div>
                      <h2 className="text-2xl font-bold text-black">Datasets</h2>
                      <p className="text-sm text-black/70">{datasets.length} dataset{datasets.length !== 1 ? 's' : ''} available</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentView('upload')}
                    className="px-4 py-2 bg-[#403B33] text-white rounded-lg font-semibold hover:bg-[#2d2822] transition flex items-center gap-2"
                  >
                    <UploadIcon className="w-4 h-4" />
                    Upload New
                  </motion.button>
                </div>

                {datasets.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed border-[#A69677] rounded-xl">
                    <Database className="w-16 h-16 text-black/40 mx-auto mb-4" />
                    <p className="text-black text-lg mb-2">No datasets uploaded yet</p>
                    <p className="text-sm text-black/70 mb-6">Upload your first dataset to get started</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentView('upload')}
                      className="px-6 py-3 bg-[#403B33] text-white rounded-lg font-semibold hover:bg-[#2d2822] transition"
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
                              ? 'border-2 border-[#0D0D0D] bg-white shadow-lg'
                              : 'border-2 border-[#A69677] bg-white hover:border-[#403B33] hover:shadow-md'
                          }`}
                          onClick={() => handleDatasetSelect(dataset.id)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="p-2 bg-[#BF8A49] rounded-lg">
                              <Database className="w-5 h-5 text-white" />
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => handleDeleteDataset(dataset.id, e)}
                              className="p-1.5 text-[#BF8A49] hover:bg-[#BF8A49]/20 rounded-lg transition"
                              title="Delete dataset"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                          <h3 className="font-bold text-black mb-2 truncate">{dataset.name}</h3>
                          <div className="space-y-1 text-sm text-black/70">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              <span>{date} at {time}</span>
                            </div>
                            <div>{(dataset.file_size / 1024).toFixed(2)} KB</div>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-3 h-3 bg-[#0D0D0D] rounded-full"></div>
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
              <AdvancedFilters 
                columns={profileData.columns}
                onFilterChange={(filters) => {
                  showToast.info(`${filters.length} filter(s) applied`)
                }}
              />
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
          ) : currentView === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-[calc(100vh-200px)]"
            >
              <DashboardBuilder 
                projectId={projectId} 
                visualizations={savedVisualizations}
              />
            </motion.div>
          ) : currentView === 'transform' && profileData ? (
            <motion.div
              key="transform"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DataTransform 
                columns={profileData.columns}
                onTransform={(transformations) => {
                  // Handle transformations
                  showToast.info(`${transformations.length} transformation(s) queued`)
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-[#A69677]"
            >
              <Database className="w-16 h-16 text-black/40 mx-auto mb-4" />
              <p className="text-black text-lg mb-2">Select a dataset to get started</p>
              <p className="text-sm text-black/70 mb-6">Go to Datasets tab and select a dataset</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView('datasets')}
                className="px-6 py-3 bg-[#403B33] text-white rounded-lg font-semibold hover:bg-[#2d2822] transition"
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
