'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GridLayout, { Layout } from 'react-grid-layout'
import { 
  Save, Maximize2, Minimize2, X, Plus, Trash2, Settings, 
  LayoutGrid, Layers, Eye, EyeOff, Download, Copy, GripVertical,
  BarChart3, TrendingUp, PieChart, AreaChart, ScatterChart
} from 'lucide-react'
import { showToast } from '@/lib/toast'
import api from '@/lib/api'
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

interface DashboardBuilderProps {
  projectId: number
  visualizations: any[]
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

const DASHBOARD_TEMPLATES = [
  {
    id: 'single',
    name: 'Single Chart',
    icon: BarChart3,
    layout: [{ i: '1', x: 0, y: 0, w: 12, h: 8 }]
  },
  {
    id: 'two-column',
    name: 'Two Column',
    icon: LayoutGrid,
    layout: [
      { i: '1', x: 0, y: 0, w: 6, h: 8 },
      { i: '2', x: 6, y: 0, w: 6, h: 8 }
    ]
  },
  {
    id: 'three-column',
    name: 'Three Column',
    icon: Layers,
    layout: [
      { i: '1', x: 0, y: 0, w: 4, h: 6 },
      { i: '2', x: 4, y: 0, w: 4, h: 6 },
      { i: '3', x: 8, y: 0, w: 4, h: 6 }
    ]
  },
  {
    id: 'grid',
    name: 'Grid (2x2)',
    icon: LayoutGrid,
    layout: [
      { i: '1', x: 0, y: 0, w: 6, h: 6 },
      { i: '2', x: 6, y: 0, w: 6, h: 6 },
      { i: '3', x: 0, y: 6, w: 6, h: 6 },
      { i: '4', x: 6, y: 6, w: 6, h: 6 }
    ]
  },
  {
    id: 'dashboard',
    name: 'Dashboard Layout',
    icon: Layers,
    layout: [
      { i: '1', x: 0, y: 0, w: 8, h: 6 },
      { i: '2', x: 8, y: 0, w: 4, h: 3 },
      { i: '3', x: 8, y: 3, w: 4, h: 3 },
      { i: '4', x: 0, y: 6, w: 6, h: 4 },
      { i: '5', x: 6, y: 6, w: 6, h: 4 }
    ]
  }
]

export default function DashboardBuilder({ projectId, visualizations }: DashboardBuilderProps) {
  const [layout, setLayout] = useState<Layout[]>([])
  const [selectedViz, setSelectedViz] = useState<Map<string, number>>(new Map())
  const [dashboardName, setDashboardName] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [savedDashboards, setSavedDashboards] = useState<any[]>([])
  const [showVisualizationPanel, setShowVisualizationPanel] = useState(true)
  const [showTemplates, setShowTemplates] = useState(false)
  const [isEditMode, setIsEditMode] = useState(true)
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null)
  const [widgetSettings, setWidgetSettings] = useState<Map<string, any>>(new Map())

  useEffect(() => {
    loadDashboards()
  }, [projectId])

  const loadDashboards = async () => {
    try {
      const response = await api.get(`/projects/${projectId}/dashboards`)
      setSavedDashboards(response.data || [])
    } catch (error) {
      console.error('Failed to load dashboards:', error)
    }
  }

  const onLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout)
  }

  const addVisualization = (vizId: number) => {
    const newId = `viz-${Date.now()}`
    const newLayout = [...layout, { 
      i: newId, 
      x: (layout.length % 12) * 1, 
      y: Math.floor(layout.length / 12) * 6, 
      w: 6, 
      h: 6,
      minW: 3,
      minH: 3,
      maxW: 12,
      maxH: 12
    }]
    setLayout(newLayout)
    setSelectedViz(new Map(selectedViz).set(newId, vizId))
    showToast.success('Visualization added to canvas')
  }

  const removeVisualization = (id: string) => {
    setLayout(layout.filter(item => item.i !== id))
    const newSelected = new Map(selectedViz)
    newSelected.delete(id)
    setSelectedViz(newSelected)
    if (selectedWidget === id) {
      setSelectedWidget(null)
    }
  }

  const duplicateWidget = (id: string) => {
    const widget = layout.find(item => item.i === id)
    if (!widget) return
    
    const newId = `viz-${Date.now()}`
    const newLayout = [...layout, { 
      ...widget, 
      i: newId,
      x: widget.x + 1,
      y: widget.y + 1
    }]
    setLayout(newLayout)
    const vizId = selectedViz.get(id)
    if (vizId) {
      setSelectedViz(new Map(selectedViz).set(newId, vizId))
    }
    showToast.success('Widget duplicated')
  }

  const applyTemplate = (template: typeof DASHBOARD_TEMPLATES[0]) => {
    setLayout(template.layout.map(item => ({
      ...item,
      minW: 3,
      minH: 3,
      maxW: 12,
      maxH: 12
    })))
    setSelectedViz(new Map())
    setShowTemplates(false)
    showToast.success(`Applied ${template.name} template`)
  }

  const saveDashboard = async () => {
    if (!dashboardName.trim()) {
      showToast.error('Please enter a dashboard name')
      return
    }
    
    if (layout.length === 0) {
      showToast.error('Add at least one visualization to the canvas')
      return
    }
    
    try {
      const dashboardConfig = {
        name: dashboardName,
        layout: layout.map(item => ({
          i: item.i,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h
        })),
        visualizations: Array.from(selectedViz.entries()).map(([widgetId, vizId]) => ({
          widget_id: widgetId,
          visualization_id: vizId
        })),
        settings: Object.fromEntries(widgetSettings)
      }

      await api.post(`/projects/${projectId}/dashboards`, dashboardConfig)
      showToast.success('Dashboard saved successfully!')
      setDashboardName('')
      loadDashboards()
    } catch (error: any) {
      showToast.error(error.response?.data?.detail || 'Failed to save dashboard')
    }
  }

  const renderVisualization = (viz: any) => {
    if (!viz || !viz.config || !viz.config.data) {
      return (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No data available</p>
          </div>
        </div>
      )
    }

    const { type, data, x_axis, y_axis, y_axis2, chartConfig } = viz.config
    const chartData = Array.isArray(data) ? data : []

    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 10, left: 10, bottom: 10 }
    }

    switch (type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {chartConfig?.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={x_axis} />
            <YAxis />
            <Tooltip />
            {chartConfig?.showLegend && <Legend />}
            <Bar dataKey={y_axis} fill={chartConfig?.colors || COLORS[0]} />
            {y_axis2 && <Bar dataKey={y_axis2} fill={COLORS[1]} />}
          </BarChart>
        )
      case 'line':
        return (
          <LineChart {...commonProps}>
            {chartConfig?.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={x_axis} />
            <YAxis />
            <Tooltip />
            {chartConfig?.showLegend && <Legend />}
            <Line type="monotone" dataKey={y_axis} stroke={chartConfig?.colors || COLORS[0]} strokeWidth={2} />
            {y_axis2 && <Line type="monotone" dataKey={y_axis2} stroke={COLORS[1]} strokeWidth={2} />}
          </LineChart>
        )
      case 'area':
        return (
          <RechartsAreaChart {...commonProps}>
            {chartConfig?.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={x_axis} />
            <YAxis />
            <Tooltip />
            {chartConfig?.showLegend && <Legend />}
            <Area type="monotone" dataKey={y_axis} stroke={chartConfig?.colors || COLORS[0]} fill={chartConfig?.colors || COLORS[0]} fillOpacity={0.6} />
            {y_axis2 && <Area type="monotone" dataKey={y_axis2} stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.6} />}
          </RechartsAreaChart>
        )
      case 'pie':
        return (
          <RechartsPieChart>
            <Pie
              data={chartData}
              dataKey={y_axis}
              nameKey={x_axis}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            {chartConfig?.showLegend && <Legend />}
          </RechartsPieChart>
        )
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p className="text-sm">Chart type not supported</p>
          </div>
        )
    }
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''} flex flex-col h-full`}>
      {/* Power BI-style Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gradient-to-br from-primary-600 to-indigo-600 rounded-lg">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Builder</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Create interactive dashboards with drag & drop</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                isEditMode 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {isEditMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isEditMode ? 'Edit Mode' : 'View Mode'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={saveDashboard}
              className="px-4 py-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-indigo-700 transition flex items-center gap-2 shadow-lg"
            >
              <Save className="w-4 h-4" />
              Save Dashboard
            </motion.button>
          </div>
        </div>

        {/* Dashboard Name Input */}
        <div className="mt-4">
          <input
            type="text"
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            placeholder="Enter dashboard name..."
            className="w-full max-w-md px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Visualizations Panel */}
        <AnimatePresence>
          {showVisualizationPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto"
            >
              <div className="p-4 space-y-4">
                {/* Templates Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Templates</h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showTemplates ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </motion.button>
                  </div>
                  <AnimatePresence>
                    {showTemplates && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 mb-4"
                      >
                        {DASHBOARD_TEMPLATES.map(template => {
                          const Icon = template.icon
                          return (
                            <motion.button
                              key={template.id}
                              whileHover={{ scale: 1.02, x: 4 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => applyTemplate(template)}
                              className="w-full p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 transition text-left flex items-center gap-3"
                            >
                              <Icon className="w-5 h-5 text-primary-600" />
                              <div>
                                <div className="font-medium text-sm text-gray-900 dark:text-white">{template.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {template.layout.length} widget{template.layout.length !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </motion.button>
                          )
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Visualizations Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                    Visualizations ({visualizations.length})
                  </h3>
                  {visualizations.length === 0 ? (
                    <div className="p-6 text-center bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                      <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No visualizations available</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Create some in the Visualizations tab</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {visualizations.map(viz => (
                        <motion.div
                          key={viz.id}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => addVisualization(viz.id)}
                          className="p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 transition cursor-pointer group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <GripVertical className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900 dark:text-white truncate">{viz.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{viz.type}</div>
                              </div>
                            </div>
                            <Plus className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setShowVisualizationPanel(!showVisualizationPanel)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 border-r border-t border-b border-gray-200 dark:border-gray-700 rounded-r-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          {showVisualizationPanel ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>

        {/* Main Canvas Area */}
        <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-6">
          {layout.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[600px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center max-w-md"
              >
                <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <LayoutGrid className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Empty Canvas</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start building your dashboard by adding visualizations from the panel or applying a template
                  </p>
                  <div className="flex gap-3 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowTemplates(true)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
                    >
                      Browse Templates
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowVisualizationPanel(true)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    >
                      Add Visualization
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="relative" style={{ minHeight: '800px' }}>
              <GridLayout
                className="layout"
                layout={layout}
                onLayoutChange={onLayoutChange}
                cols={12}
                rowHeight={50}
                width={typeof window !== 'undefined' ? window.innerWidth - (showVisualizationPanel ? 320 : 0) - 48 : 1200}
                isDraggable={isEditMode}
                isResizable={isEditMode}
                compactType="vertical"
                preventCollision={false}
                margin={[16, 16]}
              >
                {layout.map(item => {
                  const vizId = selectedViz.get(item.i)
                  const viz = visualizations.find(v => v.id === vizId)
                  const isSelected = selectedWidget === item.i
                  
                  return (
                    <div
                      key={item.i}
                      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 transition-all relative group ${
                        isSelected 
                          ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                      }`}
                      onClick={() => isEditMode && setSelectedWidget(item.i)}
                    >
                      {/* Widget Header */}
                      <div className={`px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between ${
                        isEditMode ? 'cursor-move' : ''
                      }`}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {isEditMode && (
                            <GripVertical className="w-4 h-4 text-gray-400" />
                          )}
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                            {viz?.name || 'Empty Widget'}
                          </h4>
                          {viz && (
                            <span className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded">
                              {viz.type}
                            </span>
                          )}
                        </div>
                        {isEditMode && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                duplicateWidget(item.i)
                              }}
                              className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                removeVisualization(item.i)
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        )}
                      </div>

                      {/* Widget Content */}
                      <div className="p-4 h-[calc(100%-48px)]">
                        {viz ? (
                          <ResponsiveContainer width="100%" height="100%">
                            {renderVisualization(viz)}
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <div className="text-center">
                              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No visualization selected</p>
                              {isEditMode && (
                                <p className="text-xs mt-1">Add one from the panel</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </GridLayout>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
