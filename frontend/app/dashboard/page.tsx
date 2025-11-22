'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FolderPlus, LogOut, BarChart3, Database, TrendingUp, Search, Filter, Clock } from 'lucide-react'
import api from '@/lib/api'
import { authService } from '@/lib/auth'
import { CardSkeleton } from '@/components/LoadingSkeleton'

interface Project {
  id: number
  name: string
  description?: string
  owner_id: number
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [projectName, setProjectName] = useState('')
  const [projectDesc, setProjectDesc] = useState('')

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push('/login')
      return
    }
    loadProjects()
  }, [router])

  const loadProjects = async () => {
    try {
      const response = await api.get('/projects')
      setProjects(response.data)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await api.post('/projects', {
        name: projectName,
        description: projectDesc,
      })
      setProjects([...projects, response.data])
      setShowCreateModal(false)
      setProjectName('')
      setProjectDesc('')
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const handleLogout = () => {
    authService.logout()
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Enhanced Navbar */}
      <nav className="bg-white/90 backdrop-blur-lg shadow-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="p-3 bg-gradient-to-br from-primary-600 via-indigo-600 to-purple-600 rounded-2xl shadow-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Jovin Fluo
                </h1>
                <p className="text-xs text-gray-600 font-medium">Data Analytics Platform</p>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl transition-all flex items-center gap-2 font-medium shadow-sm hover:shadow"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </motion.button>
            </motion.div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-primary-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                My Projects
              </h2>
              <p className="text-lg text-gray-600">Manage your analytics projects and datasets</p>
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
                </span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:from-primary-700 hover:via-indigo-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl flex items-center gap-3 text-lg"
            >
              <FolderPlus className="w-6 h-6" />
              New Project
            </motion.button>
          </div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative max-w-lg"
          >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-lg hover:shadow-xl transition-all text-lg"
            />
          </motion.div>
        </motion.div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-300"
          >
            <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? 'Try a different search term' : 'Create your first project to get started!'}
            </p>
            {!searchQuery && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                Create Project
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Link href={`/project/${project.id}`}>
                  <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border-2 border-gray-100 hover:border-primary-300 h-full flex flex-col group cursor-pointer relative overflow-hidden">
                    {/* Gradient Background Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-50/0 via-indigo-50/0 to-purple-50/0 group-hover:from-primary-50/50 group-hover:via-indigo-50/50 group-hover:to-purple-50/50 transition-all duration-300" />
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <div className="p-4 bg-gradient-to-br from-primary-500 via-indigo-500 to-purple-500 rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                          <Database className="w-8 h-8 text-white" />
                        </div>
                        <TrendingUp className="w-6 h-6 text-gray-300 group-hover:text-primary-600 transition transform group-hover:rotate-12" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
                        <span className="text-sm text-gray-500 font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(project.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                        <span className="text-primary-600 font-bold text-base group-hover:translate-x-2 transition-transform flex items-center gap-1">
                          Open
                          <span className="text-xl">→</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-900">Create New Project</h3>
            </div>
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="My Analytics Project"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  placeholder="Project description..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-primary-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-primary-700 hover:to-indigo-700 transition shadow-lg"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
