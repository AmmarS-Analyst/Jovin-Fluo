'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, File, CheckCircle, AlertCircle, X } from 'lucide-react'
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
      const response = await api.post(`/datasets/upload?project_id=${projectId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setSuccess(true)
      setUploading(false)
      // Wait a moment to show success message, then reload datasets
      setTimeout(() => {
        onUploaded()
        setTimeout(() => setSuccess(false), 2000)
      }, 500)
    } catch (err: any) {
      setUploading(false)
      const errorMessage = err.response?.data?.detail || err.message || 'Upload failed. Please try again.'
      setError(errorMessage)
      console.error('Upload error:', err)
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
    maxSize: 1073741824, // 1GB
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Upload className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Upload Dataset</h2>
          <p className="text-sm text-gray-500">Drag & drop or click to select</p>
        </div>
      </div>
      
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-primary-600 bg-primary-50 scale-105'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full mb-3"
            />
            <p className="text-primary-600 font-semibold">Uploading...</p>
          </div>
        ) : (
          <>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="inline-block mb-4"
            >
              <File className="w-12 h-12 text-gray-400 mx-auto" />
            </motion.div>
            <p className="text-gray-700 font-medium mb-2">
              {isDragActive ? 'Drop file here' : 'Drag & drop a file here'}
            </p>
            <p className="text-sm text-gray-500 mb-2">or</p>
            <p className="text-sm text-primary-600 font-semibold hover:underline">
              Browse files
            </p>
            <p className="text-xs text-gray-500 mt-4">
              Supports CSV, XLS, XLSX, XLSM, XLSB (Max 1GB)
            </p>
          </>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Upload Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-800">File uploaded successfully!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
