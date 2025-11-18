'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/lib/api'
import { authService } from '@/lib/auth'
import FileUpload from '@/components/FileUpload'
import DataProfile from '@/components/DataProfile'
import VisualizationBuilder from '@/components/VisualizationBuilder'
import ExportButton from '@/components/ExportButton'

interface Dataset {
  id: number
  name: string
  file_size: number
  file_type: string
  project_id: number
  created_at: string
}

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = parseInt(params.id as string)
  
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [selectedDataset, setSelectedDataset] = useState<number | null>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

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
      setDatasets(response.data)
    } catch (error) {
      console.error('Failed to load datasets:', error)
    }
  }

  const handleFileUploaded = () => {
    loadDatasets()
  }

  const handleDatasetSelect = async (datasetId: number) => {
    setSelectedDataset(datasetId)
    setLoading(true)
    try {
      const response = await api.get(`/datasets/${datasetId}/profile`)
      setProfileData(response.data)
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Project Workspace</h1>
          <div></div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Upload & Datasets */}
          <div className="lg:col-span-1 space-y-6">
            <FileUpload projectId={projectId} onUploaded={handleFileUploaded} />
            
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Datasets</h2>
              {datasets.length === 0 ? (
                <p className="text-gray-500 text-sm">No datasets uploaded yet</p>
              ) : (
                <div className="space-y-2">
                  {datasets.map((dataset) => (
                    <button
                      key={dataset.id}
                      onClick={() => handleDatasetSelect(dataset.id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition ${
                        selectedDataset === dataset.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{dataset.name}</div>
                      <div className="text-sm text-gray-500">
                        {(dataset.file_size / 1024).toFixed(2)} KB
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-xl">Loading profile data...</div>
              </div>
            ) : profileData ? (
              <>
                <DataProfile data={profileData} />
                <VisualizationBuilder datasetId={selectedDataset!} profileData={profileData} />
                {selectedDataset && (
                  <ExportButton datasetId={selectedDataset} />
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-600">Select a dataset to view its profile and create visualizations</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

