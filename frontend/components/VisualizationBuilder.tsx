'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'
import { BarChart3, TrendingUp, PieChart as PieChartIcon, AreaChart as AreaChartIcon, ScatterChart as ScatterIcon, Save, Download, FileText, Check } from 'lucide-react'
import api from '@/lib/api'

interface VisualizationBuilderProps {
  datasetId: number
  profileData: any
  projectId?: number
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

const CHART_TYPES = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'line', label: 'Line Chart', icon: TrendingUp },
  { value: 'area', label: 'Area Chart', icon: AreaChartIcon },
  { value: 'pie', label: 'Pie Chart', icon: PieChartIcon },
  { value: 'scatter', label: 'Scatter Plot', icon: ScatterIcon },
]

export default function VisualizationBuilder({ datasetId, profileData, projectId }: VisualizationBuilderProps) {
  const [chartType, setChartType] = useState('bar')
  const [xAxis, setXAxis] = useState('')
  const [yAxis, setYAxis] = useState('')
  const [chartData, setChartData] = useState<any[]>([])
  const [savedVisualizations, setSavedVisualizations] = useState<any[]>([])
  const [chartName, setChartName] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedForReport, setSelectedForReport] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadVisualizations()
  }, [datasetId, projectId])

  useEffect(() => {
    // Load selected visualizations from localStorage
    if (projectId) {
      const saved = localStorage.getItem(`selectedViz_${projectId}`)
      if (saved) {
        try {
          setSelectedForReport(new Set(JSON.parse(saved)))
        } catch (e) {
          console.error('Failed to load selected visualizations:', e)
        }
      }
    }
  }, [projectId])

  const toggleReportSelection = (vizId: number) => {
    const newSelected = new Set(selectedForReport)
    if (newSelected.has(vizId)) {
      newSelected.delete(vizId)
    } else {
      newSelected.add(vizId)
    }
    setSelectedForReport(newSelected)
    // Save to localStorage
    if (projectId) {
      localStorage.setItem(`selectedViz_${projectId}`, JSON.stringify(Array.from(newSelected)))
    }
  }

  const numericColumns = profileData.columns.filter((col: any) => col.type === 'numeric')
  const stringColumns = profileData.columns.filter((col: any) => col.type === 'string')

  const loadVisualizations = async () => {
    if (!projectId) return
    try {
      const response = await api.get(`/visualizations/project/${projectId}`)
      setSavedVisualizations(response.data || [])
    } catch (error) {
      console.error('Failed to load visualizations:', error)
    }
  }

  const generateChart = async () => {
    if (!xAxis || !yAxis) {
      alert('Please select both X and Y axes')
      return
    }

    const xIndex = profileData.columns.findIndex((col: any) => col.name === xAxis)
    const yIndex = profileData.columns.findIndex((col: any) => col.name === yAxis)

    if (xIndex === -1 || yIndex === -1) return

    // Aggregate data
    const grouped: any = {}
    profileData.preview_data.forEach((row: any[]) => {
      const key = String(row[xIndex])
      if (!grouped[key]) {
        grouped[key] = { [xAxis]: key, [yAxis]: 0, count: 0 }
      }
      grouped[key][yAxis] += parseFloat(row[yIndex]) || 0
      grouped[key].count += 1
    })

    const data = Object.values(grouped).map((item: any) => ({
      [xAxis]: item[xAxis],
      [yAxis]: item[yAxis] / item.count,
    }))

    setChartData(data)
    setChartName(`${chartType} Chart - ${xAxis} vs ${yAxis}`)
  }

  const saveVisualization = async () => {
    if (!chartName || !chartData.length) {
      alert('Please generate a chart first and give it a name')
      return
    }
    setLoading(true)
    try {
      await api.post('/visualizations', {
        name: chartName,
        type: chartType,
        config: { x_axis: xAxis, y_axis: yAxis, data: chartData },
        dataset_id: datasetId,
      })
      loadVisualizations()
      alert('Visualization saved successfully!')
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to save visualization')
    } finally {
      setLoading(false)
    }
  }

  const renderChart = (): JSX.Element => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxis} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={yAxis} fill="#0ea5e9" />
          </BarChart>
        )
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxis} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={yAxis} stroke="#0ea5e9" strokeWidth={2} />
          </LineChart>
        )
      case 'area':
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxis} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey={yAxis} stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} />
          </AreaChart>
        )
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={chartData}
              dataKey={yAxis}
              nameKey={xAxis}
              cx="50%"
              cy="50%"
              outerRadius={120}
              label
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )
      case 'scatter':
        return (
          <ScatterChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxis} />
            <YAxis dataKey={yAxis} />
            <Tooltip />
            <Legend />
            <Scatter dataKey={yAxis} fill="#0ea5e9" />
          </ScatterChart>
        )
      default:
        return <BarChart data={chartData}><Bar dataKey={yAxis} fill="#0ea5e9" /></BarChart>
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Visualizations</h2>
            <p className="text-sm text-gray-500">Create interactive charts and graphs</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
            <div className="grid grid-cols-2 gap-2">
              {CHART_TYPES.map((type) => {
                const Icon = type.icon
                return (
                  <motion.button
                    key={type.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setChartType(type.value)}
                    className={`p-3 rounded-lg border-2 transition ${
                      chartType === type.value
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-xs font-medium">{type.label}</div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">X-Axis (Category)</label>
            <select
              value={xAxis}
              onChange={(e) => setXAxis(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select column...</option>
              {stringColumns.map((col: any) => (
                <option key={col.name} value={col.name}>{col.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Y-Axis (Value)</label>
            <select
              value={yAxis}
              onChange={(e) => setYAxis(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select column...</option>
              {numericColumns.map((col: any) => (
                <option key={col.name} value={col.name}>{col.name}</option>
              ))}
            </select>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateChart}
            className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-primary-700 hover:to-indigo-700 transition shadow-md"
          >
            Generate Chart
          </motion.button>

          {chartData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <input
                type="text"
                value={chartName}
                onChange={(e) => setChartName(e.target.value)}
                placeholder="Chart name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveVisualization}
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Visualization'}
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Chart Preview */}
        <div className="lg:col-span-2">
          {chartData.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200"
            >
              <h3 className="text-lg font-semibold mb-4">{chartName || 'Chart Preview'}</h3>
              <div className="h-96">
                {chartData.length > 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300 h-96 flex items-center justify-center">
              <div>
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select axes and generate a chart to preview</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Saved Visualizations */}
      {savedVisualizations.length > 0 && (
        <div className="mt-8 pt-6 border-t">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Saved Visualizations</h3>
            {selectedForReport.size > 0 && (
              <span className="text-sm text-primary-600 font-medium">
                {selectedForReport.size} selected for report
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedVisualizations.map((viz) => {
              const isSelected = selectedForReport.has(viz.id)
              return (
                <motion.div
                  key={viz.id}
                  whileHover={{ y: -5 }}
                  className={`p-4 rounded-lg border-2 transition ${
                    isSelected
                      ? 'bg-primary-50 border-primary-400 shadow-md'
                      : 'bg-gray-50 border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{viz.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {viz.type}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleReportSelection(viz.id)}
                        className={`p-1.5 rounded-lg transition ${
                          isSelected
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        title={isSelected ? 'Remove from report' : 'Add to report'}
                      >
                        {isSelected ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {viz.config?.x_axis} vs {viz.config?.y_axis}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
