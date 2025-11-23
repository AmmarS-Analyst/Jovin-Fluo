'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FolderPlus, LogOut, BarChart3, Database, TrendingUp, Search, Filter, Clock, Activity, Zap, Users, FileText, LayoutGrid, ArrowRight } from 'lucide-react'
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
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalDatasets: 0,
    totalVisualizations: 0,
    recentActivity: [] as any[]
  })

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
      
      // Load stats
      const projectsData = response.data || []
      let totalDatasets = 0
      let totalVisualizations = 0
      
      // Get datasets and visualizations count for each project
      for (const project of projectsData) {
        try {
          const datasetsRes = await api.get(`/datasets/project/${project.id}`)
          totalDatasets += (datasetsRes.data || []).length
          
          const vizRes = await api.get(`/visualizations/project/${project.id}`)
          totalVisualizations += (vizRes.data || []).length
        } catch (err) {
          // Ignore errors for individual projects
        }
      }
      
      const sortedProjects = [...projectsData].sort((a: Project, b: Project) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      
      setStats({
        totalProjects: projectsData.length,
        totalDatasets,
        totalVisualizations,
        recentActivity: sortedProjects.slice(0, 5).map((p: Project) => ({
          type: 'project',
          name: p.name,
          date: p.created_at,
          id: p.id
        }))
      })
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
      <div className="min-h-screen bg-gradient-to-br from-[#D9BFA0] via-[#A69677] to-[#D9BFA0]">
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
      <div className="min-h-screen bg-gradient-to-br from-[#D9BFA0] via-[#A69677] to-[#D9BFA0]">
      {/* Enhanced Navbar */}
      <nav className="bg-white/95 backdrop-blur-lg shadow-lg border-b-2 border-[#A69677] sticky top-0 z-50">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="p-3 bg-[#403B33] rounded-2xl shadow-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black">
                  Jovin Fluo
                </h1>
                <p className="text-xs text-black font-medium">Data Analytics Platform</p>
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
                className="px-5 py-2.5 text-[#403B33] hover:bg-[#BF8A49] hover:text-white rounded-xl transition-all flex items-center gap-2 font-medium shadow-sm hover:shadow"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </motion.button>
            </motion.div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#403B33]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black mb-1">Total Projects</p>
                <p className="text-3xl font-bold text-black">{stats.totalProjects}</p>
              </div>
              <div className="p-3 bg-[#BF8A49] rounded-xl">
                <Database className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#BF8A49]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black mb-1">Datasets</p>
                <p className="text-3xl font-bold text-black">{stats.totalDatasets}</p>
              </div>
              <div className="p-3 bg-[#BF8A49] rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#BF8A49]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black mb-1">Visualizations</p>
                <p className="text-3xl font-bold text-black">{stats.totalVisualizations}</p>
              </div>
              <div className="p-3 bg-[#BF8A49] rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#403B33]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black mb-1">Activity</p>
                <p className="text-3xl font-bold text-black">{stats.recentActivity.length}</p>
              </div>
              <div className="p-3 bg-[#BF8A49] rounded-xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <h2 className="text-5xl font-bold text-black mb-3">
                My Projects
              </h2>
              <p className="text-lg text-black">Manage your analytics projects and datasets</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-[#403B33] text-white rounded-2xl font-bold hover:bg-[#2d2822] transition-all shadow-xl hover:shadow-2xl flex items-center gap-3 text-lg"
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
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-[#A69677] rounded-2xl focus:ring-2 focus:ring-[#403B33] focus:border-[#403B33] bg-white text-black shadow-lg hover:shadow-xl transition-all text-lg"
            />
          </motion.div>
        </motion.div>

        {/* Recent Activity & Quick Actions */}
        {stats.recentActivity.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
          >
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border-2 border-[#A69677]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-black flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#403B33]" />
                  Recent Activity
                </h3>
                <button className="text-sm text-[#403B33] hover:text-[#2d2822] font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {stats.recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#D9BFA0] transition cursor-pointer border border-transparent hover:border-[#A69677]"
                    onClick={() => router.push(`/project/${activity.id}`)}
                  >
                    <div className="p-2 bg-[#BF8A49] rounded-lg">
                      <Database className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-black truncate">{activity.name}</p>
                      <p className="text-sm text-black/70">
                        {new Date(activity.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#403B33]" />
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[#A69677]">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#BF8A49]" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCreateModal(true)}
                  className="w-full p-4 bg-[#403B33] text-white rounded-xl font-semibold hover:bg-[#2d2822] transition flex items-center justify-between shadow-lg"
                >
                  <span className="flex items-center gap-2">
                    <FolderPlus className="w-5 h-5" />
                    Create Project
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 bg-[#BF8A49] text-white rounded-xl font-semibold hover:bg-[#A6753A] transition flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5" />
                    View Dashboards
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-4 bg-[#BF8A49] text-white rounded-xl font-semibold hover:bg-[#A6753A] transition flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Analytics
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white rounded-2xl shadow-lg border-2 border-dashed border-[#A69677]"
          >
            <Database className="w-16 h-16 text-black mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-black mb-2">
              {searchQuery ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-black mb-6">
              {searchQuery ? 'Try a different search term' : 'Create your first project to get started!'}
            </p>
            {!searchQuery && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-[#403B33] text-white rounded-xl font-semibold hover:bg-[#2d2822] transition-all shadow-lg"
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
                  <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border-2 border-[#A69677] hover:border-[#0D0D0D] h-full flex flex-col group cursor-pointer relative overflow-hidden">
                    {/* Background Effect */}
                    <div className="absolute inset-0 bg-[#D9BFA0]/0 group-hover:bg-[#D9BFA0]/30 transition-all duration-300" />
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <div className="p-4 bg-[#403B33] rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                          <Database className="w-8 h-8 text-white" />
                        </div>
                        <TrendingUp className="w-6 h-6 text-[#BF8A49] group-hover:text-[#403B33] transition transform group-hover:rotate-12" />
                      </div>
                      <h3 className="text-2xl font-bold text-black mb-3 group-hover:text-[#403B33] transition">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-black/70 text-sm mb-6 flex-1 line-clamp-3 leading-relaxed">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-6 border-t-2 border-[#A69677]">
                        <span className="text-sm text-black/70 font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(project.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                        <span className="text-[#403B33] font-bold text-base group-hover:translate-x-2 transition-transform flex items-center gap-1">
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
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full border-2 border-[#A69677]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b-2 border-[#A69677]">
              <h3 className="text-2xl font-bold text-black">Create New Project</h3>
            </div>
            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#A69677] rounded-xl focus:ring-2 focus:ring-[#403B33] focus:border-[#403B33] bg-white text-black"
                  placeholder="My Analytics Project"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#A69677] rounded-xl focus:ring-2 focus:ring-[#403B33] focus:border-[#403B33] bg-white text-black"
                  rows={3}
                  placeholder="Project description..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#403B33] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#2d2822] transition shadow-lg"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-[#BF8A49] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#A6753A] transition"
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
