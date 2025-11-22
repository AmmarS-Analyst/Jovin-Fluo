'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  ScatterChart, Scatter, ComposedChart, Brush, ReferenceLine
} from 'recharts'
import { 
  BarChart3, TrendingUp, PieChart as PieChartIcon, AreaChart as AreaChartIcon, 
  ScatterChart as ScatterIcon, Save, FileText, Check, Layers, Gauge, 
  Activity, Zap, Settings, Palette, X, ChevronRight
} from 'lucide-react'
import api from '@/lib/api'
import { showToast } from '@/lib/toast'
import ColorPicker from './ColorPicker'
import DraggableField from './DraggableField'

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
  { value: 'composed', label: 'Composed Chart', icon: Layers },
  { value: 'histogram', label: 'Histogram', icon: BarChart3 },
  { value: 'waterfall', label: 'Waterfall', icon: Activity },
  { value: 'gauge', label: 'Gauge', icon: Gauge },
  { value: 'funnel', label: 'Funnel', icon: Zap },
]

export default function VisualizationBuilder({ datasetId, profileData, projectId }: VisualizationBuilderProps) {
  const [chartType, setChartType] = useState('bar')
  const [xAxis, setXAxis] = useState('')
  const [yAxis, setYAxis] = useState('')
  const [yAxis2, setYAxis2] = useState('') // For multi-series
  const [chartData, setChartData] = useState<any[]>([])
  const [savedVisualizations, setSavedVisualizations] = useState<any[]>([])
  const [chartName, setChartName] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedForReport, setSelectedForReport] = useState<Set<number>>(new Set())
  const [showSettingsPane, setShowSettingsPane] = useState(true)
  const [chartConfig, setChartConfig] = useState({
    colors: COLORS[0],
    showGrid: true,
    showLegend: true,
    stacked: false,
    barSize: 30,
  })
  const [availableFields, setAvailableFields] = useState<Array<{ name: string; type: string }>>([])

  useEffect(() => {
    loadVisualizations()
    // Initialize available fields from profile data
    if (profileData?.columns) {
      setAvailableFields(profileData.columns)
    }
  }, [datasetId, projectId, profileData])

  useEffect(() => {
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
    if (projectId) {
      localStorage.setItem(`selectedViz_${projectId}`, JSON.stringify(Array.from(newSelected)))
    }
  }

  const numericColumns = profileData.columns.filter((col: any) => col.type === 'numeric')
  const stringColumns = profileData.columns.filter((col: any) => col.type === 'string')
  
  const handleFieldDrop = (field: string, sourceType: 'x-axis' | 'y-axis' | 'y-axis2') => {
    if (sourceType === 'x-axis') {
      setXAxis(field)
    } else if (sourceType === 'y-axis') {
      setYAxis(field)
    } else if (sourceType === 'y-axis2') {
      setYAxis2(field)
    }
  }

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
      showToast.error('Please select both X and Y axes')
      return
    }

    // Use availableFields if it has more columns (includes calculated columns), otherwise use profileData
    const columnsToUse = availableFields.length > profileData.columns.length ? availableFields : profileData.columns
    const dataToUse = { ...profileData, columns: columnsToUse }

    const xIndex = dataToUse.columns.findIndex((col: any) => col.name === xAxis)
    const yIndex = dataToUse.columns.findIndex((col: any) => col.name === yAxis)

    if (xIndex === -1 || yIndex === -1) return

    let data: any[] = []

    // Handle different chart types
    if (chartType === 'histogram') {
      // Create bins for histogram
      const values = dataToUse.preview_data.map((row: any[]) => parseFloat(row[yIndex]) || 0).filter((v: number) => !isNaN(v))
      const min = Math.min(...values)
      const max = Math.max(...values)
      const bins = 10
      const binWidth = (max - min) / bins
      const histogram: any = {}
      
      values.forEach((val: number) => {
        const bin = Math.floor((val - min) / binWidth)
        const binKey = `${(min + bin * binWidth).toFixed(2)}-${(min + (bin + 1) * binWidth).toFixed(2)}`
        histogram[binKey] = (histogram[binKey] || 0) + 1
      })
      
      data = Object.entries(histogram).map(([range, count]) => ({
        range,
        count,
        [yAxis]: count
      }))
    } else if (chartType === 'waterfall') {
      // Waterfall chart - cumulative values
      const grouped: any = {}
      dataToUse.preview_data.forEach((row: any[]) => {
        const key = String(row[xIndex])
        if (!grouped[key]) {
          grouped[key] = { [xAxis]: key, [yAxis]: 0 }
        }
        grouped[key][yAxis] += parseFloat(row[yIndex]) || 0
      })
      
      let cumulative = 0
      data = Object.values(grouped).map((item: any) => {
        cumulative += item[yAxis]
        return {
          ...item,
          cumulative,
          start: cumulative - item[yAxis],
          end: cumulative
        }
      })
    } else if (chartType === 'gauge') {
      // Gauge chart - single value
      const total = dataToUse.preview_data.reduce((sum: number, row: any[]) => 
        sum + (parseFloat(row[yIndex]) || 0), 0
      )
      const avg = total / dataToUse.preview_data.length
      data = [{ value: avg, max: Math.max(...dataToUse.preview_data.map((r: any[]) => parseFloat(r[yIndex]) || 0)) }]
    } else if (chartType === 'funnel') {
      // Funnel chart - sorted descending
      const grouped: any = {}
      dataToUse.preview_data.forEach((row: any[]) => {
        const key = String(row[xIndex])
        if (!grouped[key]) {
          grouped[key] = { [xAxis]: key, [yAxis]: 0 }
        }
        grouped[key][yAxis] += parseFloat(row[yIndex]) || 0
      })
      data = Object.values(grouped)
        .sort((a: any, b: any) => b[yAxis] - a[yAxis])
        .map((item: any, idx: number) => ({
          ...item,
          width: 100 - (idx * 10) // Decreasing width for funnel effect
        }))
    } else {
      // Standard aggregation
      const grouped: any = {}
      dataToUse.preview_data.forEach((row: any[]) => {
        const key = String(row[xIndex])
        if (!grouped[key]) {
          grouped[key] = { [xAxis]: key, [yAxis]: 0, count: 0 }
          if (yAxis2) {
            grouped[key][yAxis2] = 0
          }
        }
        grouped[key][yAxis] += parseFloat(row[yIndex]) || 0
        if (yAxis2) {
          const y2Index = dataToUse.columns.findIndex((col: any) => col.name === yAxis2)
          if (y2Index !== -1) {
            grouped[key][yAxis2] += parseFloat(row[y2Index]) || 0
          }
        }
        grouped[key].count += 1
      })

      data = Object.values(grouped).map((item: any) => ({
        [xAxis]: item[xAxis],
        [yAxis]: item[yAxis] / item.count,
        ...(yAxis2 && { [yAxis2]: item[yAxis2] / item.count })
      }))
    }

    setChartData(data)
    setChartName(`${chartType} Chart - ${xAxis} vs ${yAxis}${yAxis2 ? ` & ${yAxis2}` : ''}`)
    showToast.success('Chart generated successfully!')
  }

  const saveVisualization = async () => {
    if (!chartName || !chartData.length) {
      showToast.error('Please generate a chart first and give it a name')
      return
    }
    setLoading(true)
    try {
      await api.post('/visualizations', {
        name: chartName,
        type: chartType,
        config: { 
          x_axis: xAxis, 
          y_axis: yAxis, 
          y_axis2: yAxis2 || undefined,
          data: chartData,
          chartConfig 
        },
        dataset_id: datasetId,
        project_id: projectId,
      })
      loadVisualizations()
      showToast.success('Visualization saved successfully!')
      setChartName('')
      setChartData([])
    } catch (error: any) {
      showToast.error(error.response?.data?.detail || 'Failed to save visualization')
    } finally {
      setLoading(false)
    }
  }

  const renderChart = (): JSX.Element => {
    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    }

    switch (chartType) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxis} />
            <YAxis />
            <Tooltip />
            {chartConfig.showLegend && <Legend />}
            <Bar 
              dataKey={yAxis} 
              fill={chartConfig.colors}
              barSize={chartConfig.barSize}
              stackId={chartConfig.stacked ? 'stack' : undefined}
            />
            {yAxis2 && (
              <Bar 
                dataKey={yAxis2} 
                fill={COLORS[1]}
                barSize={chartConfig.barSize}
                stackId={chartConfig.stacked ? 'stack' : undefined}
              />
            )}
            <Brush dataKey={xAxis} height={30} />
          </BarChart>
        )
      case 'line':
        return (
          <LineChart {...commonProps}>
            {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxis} />
            <YAxis />
            <Tooltip />
            {chartConfig.showLegend && <Legend />}
            <Line type="monotone" dataKey={yAxis} stroke={chartConfig.colors} strokeWidth={2} />
            {yAxis2 && <Line type="monotone" dataKey={yAxis2} stroke={COLORS[1]} strokeWidth={2} />}
            <Brush dataKey={xAxis} height={30} />
          </LineChart>
        )
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxis} />
            <YAxis />
            <Tooltip />
            {chartConfig.showLegend && <Legend />}
            <Area type="monotone" dataKey={yAxis} stroke={chartConfig.colors} fill={chartConfig.colors} fillOpacity={0.6} />
            {yAxis2 && <Area type="monotone" dataKey={yAxis2} stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.6} />}
            <Brush dataKey={xAxis} height={30} />
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
            {chartConfig.showLegend && <Legend />}
          </PieChart>
        )
      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxis} />
            <YAxis dataKey={yAxis} />
            <Tooltip />
            {chartConfig.showLegend && <Legend />}
            <Scatter dataKey={yAxis} fill={chartConfig.colors} />
          </ScatterChart>
        )
      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxis} />
            <YAxis yAxisId="left" />
            {yAxis2 && <YAxis yAxisId="right" orientation="right" />}
            <Tooltip />
            {chartConfig.showLegend && <Legend />}
            <Bar dataKey={yAxis} fill={chartConfig.colors} yAxisId="left" />
            {yAxis2 && <Line type="monotone" dataKey={yAxis2} stroke={COLORS[1]} yAxisId="right" />}
            <Brush dataKey={xAxis} height={30} />
          </ComposedChart>
        )
      case 'histogram':
        return (
          <BarChart {...commonProps}>
            {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            {chartConfig.showLegend && <Legend />}
            <Bar dataKey="count" fill={chartConfig.colors} />
          </BarChart>
        )
      case 'waterfall':
        return (
          <BarChart {...commonProps}>
            {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={xAxis} />
            <YAxis />
            <Tooltip />
            {chartConfig.showLegend && <Legend />}
            <Bar dataKey={yAxis} fill={chartConfig.colors} />
            {chartData.map((item, idx) => (
              <ReferenceLine 
                key={idx} 
                y={item.start} 
                stroke="#666" 
                strokeDasharray="2 2" 
              />
            ))}
          </BarChart>
        )
      case 'gauge':
        const gaugeValue = chartData[0]?.value || 0
        const gaugeMax = chartData[0]?.max || 100
        const percentage = (gaugeValue / gaugeMax) * 100
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative w-64 h-64">
              <svg className="transform -rotate-90 w-64 h-64">
                <circle
                  cx="128"
                  cy="128"
                  r="100"
                  stroke="#e5e7eb"
                  strokeWidth="20"
                  fill="none"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="100"
                  stroke={chartConfig.colors}
                  strokeWidth="20"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 100}`}
                  strokeDashoffset={`${2 * Math.PI * 100 * (1 - percentage / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold">{gaugeValue.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">of {gaugeMax.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        )
      case 'funnel':
        return (
          <div className="space-y-2">
            {chartData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium">{item[xAxis]}</div>
                <div className="flex-1 relative">
                  <div 
                    className="h-8 rounded"
                    style={{
                      width: `${item.width}%`,
                      backgroundColor: COLORS[idx % COLORS.length]
                    }}
                  />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-sm font-semibold">
                    {item[yAxis].toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      default:
        return <BarChart {...commonProps}><Bar dataKey={yAxis} fill={chartConfig.colors} /></BarChart>
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Visualizations</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create interactive charts and graphs</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSettingsPane(!showSettingsPane)}
          className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
          <ChevronRight className={`w-4 h-4 transition-transform ${showSettingsPane ? 'rotate-90' : ''}`} />
        </motion.button>
      </div>

      <div className="space-y-6">
        {/* Top Section - Chart Builder and Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Chart Builder */}
          <div className="lg:col-span-1 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Chart Type</label>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
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
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-xs font-medium">{type.label}</div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Available Fields - Draggable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Available Fields (Drag to axes below)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
              {availableFields.map((col) => (
                <div
                  key={col.name}
                  draggable
                  onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                    e.dataTransfer.effectAllowed = 'move'
                    e.dataTransfer.setData('text/plain', JSON.stringify({ field: col.name, type: col.type }))
                  }}
                  className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg cursor-move text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-primary-400 transition hover:scale-105"
                >
                  {col.name}
                </div>
              ))}
            </div>
          </div>

          {/* X-Axis Drop Zone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">X-Axis (Category)</label>
            <div
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
              }}
              onDrop={(e) => {
                e.preventDefault()
                try {
                  const data = JSON.parse(e.dataTransfer.getData('text/plain'))
                  if (data.type === 'string' || stringColumns.some((c: any) => c.name === data.field)) {
                    setXAxis(data.field)
                  } else {
                    showToast.error('X-axis must be a string/category column')
                  }
                } catch (error) {
                  console.error('Failed to parse drag data:', error)
                }
              }}
              className="min-h-[60px] p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 hover:border-primary-400 transition"
            >
              {xAxis ? (
                <DraggableField
                  field={xAxis}
                  type="x-axis"
                  onRemove={() => setXAxis('')}
                  onDrop={handleFieldDrop}
                />
              ) : (
                <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-2">
                  Drag a field here or select from dropdown
                </div>
              )}
            </div>
          </div>

          {/* Y-Axis Drop Zone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Y-Axis (Value)</label>
            <div
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
              }}
              onDrop={(e) => {
                e.preventDefault()
                try {
                  const data = JSON.parse(e.dataTransfer.getData('text/plain'))
                  if (data.type === 'numeric' || numericColumns.some((c: any) => c.name === data.field)) {
                    setYAxis(data.field)
                  } else {
                    showToast.error('Y-axis must be a numeric column')
                  }
                } catch (error) {
                  console.error('Failed to parse drag data:', error)
                }
              }}
              className="min-h-[60px] p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 hover:border-primary-400 transition"
            >
              {yAxis ? (
                <DraggableField
                  field={yAxis}
                  type="y-axis"
                  onRemove={() => setYAxis('')}
                  onDrop={handleFieldDrop}
                />
              ) : (
                <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-2">
                  Drag a numeric field here
                </div>
              )}
            </div>
          </div>

          {/* Y-Axis 2 Drop Zone */}
          {(chartType === 'composed' || chartType === 'bar' || chartType === 'line' || chartType === 'area') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Y-Axis 2 (Optional)</label>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  e.dataTransfer.dropEffect = 'move'
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  try {
                    const data = JSON.parse(e.dataTransfer.getData('text/plain'))
                    if (data.type === 'numeric' || numericColumns.some((c: any) => c.name === data.field)) {
                      setYAxis2(data.field)
                    } else {
                      showToast.error('Y-axis 2 must be a numeric column')
                    }
                  } catch (error) {
                    console.error('Failed to parse drag data:', error)
                  }
                }}
                className="min-h-[60px] p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 hover:border-primary-400 transition"
              >
                {yAxis2 ? (
                  <DraggableField
                    field={yAxis2}
                    type="y-axis2"
                    onRemove={() => setYAxis2('')}
                    onDrop={handleFieldDrop}
                  />
                ) : (
                  <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-2">
                    Drag a numeric field here (optional)
                  </div>
                )}
              </div>
            </div>
          )}


          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => generateChart()}
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
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-700 h-full min-h-[500px]"
              >
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{chartName || 'Chart Preview'}</h3>
                <div className="h-[450px]">
                  {chartData.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                      {renderChart()}
                    </ResponsiveContainer>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 h-full min-h-[500px] flex items-center justify-center">
                <div>
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Select axes and generate a chart to preview</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settings Pane - Below Chart */}
        <AnimatePresence>
          {showSettingsPane && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chart Settings</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSettingsPane(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ColorPicker
                  color={chartConfig.colors}
                  onChange={(color) => {
                    setChartConfig({ ...chartConfig, colors: color })
                    if (chartData.length > 0) {
                      generateChart() // Regenerate chart with new color
                    }
                  }}
                  label="Chart Color"
                />

                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <label htmlFor="showGrid" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show Grid
                  </label>
                  <input
                    type="checkbox"
                    id="showGrid"
                    checked={chartConfig.showGrid}
                    onChange={(e) => {
                      setChartConfig({ ...chartConfig, showGrid: e.target.checked })
                      if (chartData.length > 0) {
                        generateChart()
                      }
                    }}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <label htmlFor="showLegend" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show Legend
                  </label>
                  <input
                    type="checkbox"
                    id="showLegend"
                    checked={chartConfig.showLegend}
                    onChange={(e) => {
                      setChartConfig({ ...chartConfig, showLegend: e.target.checked })
                      if (chartData.length > 0) {
                        generateChart()
                      }
                    }}
                    className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                  />
                </div>

                {(chartType === 'bar' || chartType === 'area') && (
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <label htmlFor="stacked" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Stacked Bars
                    </label>
                    <input
                      type="checkbox"
                      id="stacked"
                      checked={chartConfig.stacked}
                      onChange={(e) => {
                        setChartConfig({ ...chartConfig, stacked: e.target.checked })
                        if (chartData.length > 0) {
                          generateChart()
                        }
                      }}
                      className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                    />
                  </div>
                )}

                {chartType === 'bar' && (
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bar Size: {chartConfig.barSize}
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={chartConfig.barSize}
                      onChange={(e) => {
                        setChartConfig({ ...chartConfig, barSize: parseInt(e.target.value) })
                        if (chartData.length > 0) {
                          generateChart()
                        }
                      }}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Saved Visualizations */}
      {savedVisualizations.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Saved Visualizations</h3>
            {selectedForReport.size > 0 && (
              <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">
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
                      ? 'bg-primary-50 dark:bg-primary-900 border-primary-400 shadow-md'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{viz.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                        {viz.type}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleReportSelection(viz.id)}
                        className={`p-1.5 rounded-lg transition ${
                          isSelected
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300'
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">
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
