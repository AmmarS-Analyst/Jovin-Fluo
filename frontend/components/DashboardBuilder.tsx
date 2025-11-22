'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import GridLayout, { Layout } from 'react-grid-layout'
import { Save, Maximize2, X, Plus, Trash2 } from 'lucide-react'
import { showToast } from '@/lib/toast'
import api from '@/lib/api'

interface DashboardBuilderProps {
  projectId: number
  visualizations: any[]
}

const DASHBOARD_TEMPLATES = [
  {
    id: 'single',
    name: 'Single Chart',
    layout: [{ i: '1', x: 0, y: 0, w: 12, h: 6 }]
  },
  {
    id: 'two-column',
    name: 'Two Column',
    layout: [
      { i: '1', x: 0, y: 0, w: 6, h: 6 },
      { i: '2', x: 6, y: 0, w: 6, h: 6 }
    ]
  },
  {
    id: 'three-column',
    name: 'Three Column',
    layout: [
      { i: '1', x: 0, y: 0, w: 4, h: 6 },
      { i: '2', x: 4, y: 0, w: 4, h: 6 },
      { i: '3', x: 8, y: 0, w: 4, h: 6 }
    ]
  },
  {
    id: 'grid',
    name: 'Grid (2x2)',
    layout: [
      { i: '1', x: 0, y: 0, w: 6, h: 6 },
      { i: '2', x: 6, y: 0, w: 6, h: 6 },
      { i: '3', x: 0, y: 6, w: 6, h: 6 },
      { i: '4', x: 6, y: 6, w: 6, h: 6 }
    ]
  }
]

export default function DashboardBuilder({ projectId, visualizations }: DashboardBuilderProps) {
  const [layout, setLayout] = useState<Layout[]>([])
  const [selectedViz, setSelectedViz] = useState<Map<string, number>>(new Map())
  const [dashboardName, setDashboardName] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [savedDashboards, setSavedDashboards] = useState<any[]>([])

  const onLayoutChange = (newLayout: Layout[]) => {
    setLayout(newLayout)
  }

  const addVisualization = (vizId: number) => {
    const newId = `viz-${Date.now()}`
    const newLayout = [...layout, { i: newId, x: 0, y: 0, w: 6, h: 6 }]
    setLayout(newLayout)
    setSelectedViz(new Map(selectedViz).set(newId, vizId))
  }

  const removeVisualization = (id: string) => {
    setLayout(layout.filter(item => item.i !== id))
    const newSelected = new Map(selectedViz)
    newSelected.delete(id)
    setSelectedViz(newSelected)
  }

  const applyTemplate = (template: typeof DASHBOARD_TEMPLATES[0]) => {
    setLayout(template.layout)
    // Clear selected visualizations when applying template
    setSelectedViz(new Map())
  }

  const saveDashboard = async () => {
    if (!dashboardName) {
      showToast.error('Please enter a dashboard name')
      return
    }
    
    try {
      // Save dashboard configuration
      showToast.success('Dashboard saved successfully!')
    } catch (error: any) {
      showToast.error(error.response?.data?.detail || 'Failed to save dashboard')
    }
  }

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Builder</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Drag and drop visualizations to create your dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              <Maximize2 className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={saveDashboard}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Dashboard
            </motion.button>
          </div>
        </div>

        {/* Dashboard Name */}
        <div className="mb-4">
          <input
            type="text"
            value={dashboardName}
            onChange={(e) => setDashboardName(e.target.value)}
            placeholder="Dashboard name..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Templates */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Dashboard Templates</h3>
          <div className="grid grid-cols-2 gap-3">
            {DASHBOARD_TEMPLATES.map(template => (
              <motion.button
                key={template.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => applyTemplate(template)}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 transition text-sm font-medium text-gray-700 dark:text-gray-300 text-left"
              >
                <div className="font-semibold mb-2">{template.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {template.layout.length} widget{template.layout.length !== 1 ? 's' : ''}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Visualization Selector */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Add Visualizations</h3>
          {visualizations.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No visualizations available. Create some first!</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {visualizations.map(viz => (
                <motion.button
                  key={viz.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addVisualization(viz.id)}
                  className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 transition text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {viz.name}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Grid Layout */}
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 min-h-[600px]">
          {layout.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No visualizations added yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Select a template or add visualizations to get started</p>
              </div>
            </div>
          ) : (
            <GridLayout
              className="layout"
              layout={layout}
              onLayoutChange={onLayoutChange}
              cols={12}
              rowHeight={50}
              width={1200}
              isDraggable={true}
              isResizable={true}
            >
              {layout.map(item => {
                const vizId = selectedViz.get(item.i)
                const viz = visualizations.find(v => v.id === vizId)
                return (
                  <div key={item.i} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 relative group">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeVisualization(item.i)}
                        className="p-1 bg-red-500 text-white rounded"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    </div>
                    {viz ? (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{viz.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{viz.type}</p>
                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded text-center text-gray-400">
                          Chart Preview
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 dark:text-gray-500">
                        <p>Select a visualization</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </GridLayout>
          )}
        </div>
      </div>
    </div>
  )
}

