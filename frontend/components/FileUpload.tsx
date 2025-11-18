'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import api from '@/lib/api'

interface FileUploadProps {
  projectId: number
  onUploaded: () => void
}

export default function FileUpload({ projectId, onUploaded }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setError('')
    setSuccess(false)

    const formData = new FormData()
    formData.append('file', file)

    try {
      await api.post(`/datasets/upload?project_id=${projectId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setSuccess(true)
      onUploaded()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [projectId, onUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel.sheet.macroEnabled.12': ['.xlsm'],
      'application/vnd.ms-excel.sheet.binary.macroEnabled.12': ['.xlsb'],
    },
    maxFiles: 1,
  })

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Upload Dataset</h2>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
          isDragActive
            ? 'border-primary-600 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="text-primary-600">Uploading...</div>
        ) : (
          <>
            <div className="text-4xl mb-4">📁</div>
            <p className="text-gray-600 mb-2">
              {isDragActive ? 'Drop file here' : 'Drag & drop a file here, or click to select'}
            </p>
            <p className="text-sm text-gray-500">
              Supports CSV, XLS, XLSX, XLSM, XLSB
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
          File uploaded successfully!
        </div>
      )}
    </div>
  )
}

