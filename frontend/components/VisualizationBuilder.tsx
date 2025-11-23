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
  Activity, Zap, Settings, Palette, X
} from 'lucide-react'
import api from '@/lib/api'
import { showToast } from '@/lib/toast'
import AdvancedColorPicker from './AdvancedColorPicker'
import DraggableField from './DraggableField'
import FormatPaneContent from './FormatPaneContent'
import VisualsPaneContent from './VisualsPaneContent'

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
  const [activePane, setActivePane] = useState<'visuals' | 'format'>('visuals')
  const [chartConfig, setChartConfig] = useState({
    barColor: COLORS[0],
    barColor2: COLORS[1],
    legendColor: '#000000',
    xAxisColor: '#000000',
    yAxisColor: '#000000',
    gridColor: '#E5E5E5',
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
            {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridColor} />}
            <XAxis dataKey={xAxis} stroke={chartConfig.xAxisColor} />
            <YAxis stroke={chartConfig.yAxisColor} />
            <Tooltip />
            {chartConfig.showLegend && <Legend wrapperStyle={{ color: chartConfig.legendColor }} />}
            <Bar 
              dataKey={yAxis} 
              fill={chartConfig.barColor}
              barSize={chartConfig.barSize}
              stackId={chartConfig.stacked ? 'stack' : undefined}
            />
            {yAxis2 && (
              <Bar 
                dataKey={yAxis2} 
                fill={chartConfig.barColor2}
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
            {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridColor} />}
            <XAxis dataKey={xAxis} stroke={chartConfig.xAxisColor} />
            <YAxis stroke={chartConfig.yAxisColor} />
            <Tooltip />
            {chartConfig.showLegend && <Legend wrapperStyle={{ color: chartConfig.legendColor }} />}
            <Line type="monotone" dataKey={yAxis} stroke={chartConfig.barColor} strokeWidth={2} />
            {yAxis2 && <Line type="monotone" dataKey={yAxis2} stroke={chartConfig.barColor2} strokeWidth={2} />}
            <Brush dataKey={xAxis} height={30} />
          </LineChart>
        )
      case 'area':
        return (
          <AreaChart {...commonProps}>
            {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridColor} />}
            <XAxis dataKey={xAxis} stroke={chartConfig.xAxisColor} />
            <YAxis stroke={chartConfig.yAxisColor} />
            <Tooltip />
            {chartConfig.showLegend && <Legend wrapperStyle={{ color: chartConfig.legendColor }} />}
            <Area type="monotone" dataKey={yAxis} stroke={chartConfig.barColor} fill={chartConfig.barColor} fillOpacity={0.6} />
            {yAxis2 && <Area type="monotone" dataKey={yAxis2} stroke={chartConfig.barColor2} fill={chartConfig.barColor2} fillOpacity={0.6} />}
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
            {chartConfig.showLegend && <Legend wrapperStyle={{ color: chartConfig.legendColor }} />}
          </PieChart>
        )
      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridColor} />}
            <XAxis dataKey={xAxis} stroke={chartConfig.xAxisColor} />
            <YAxis dataKey={yAxis} stroke={chartConfig.yAxisColor} />
            <Tooltip />
            {chartConfig.showLegend && <Legend wrapperStyle={{ color: chartConfig.legendColor }} />}
            <Scatter dataKey={yAxis} fill={chartConfig.barColor} />
          </ScatterChart>
        )
      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridColor} />}
            <XAxis dataKey={xAxis} stroke={chartConfig.xAxisColor} />
            <YAxis yAxisId="left" stroke={chartConfig.yAxisColor} />
            {yAxis2 && <YAxis yAxisId="right" orientation="right" stroke={chartConfig.yAxisColor} />}
            <Tooltip />
            {chartConfig.showLegend && <Legend wrapperStyle={{ color: chartConfig.legendColor }} />}
            <Bar dataKey={yAxis} fill={chartConfig.barColor} yAxisId="left" />
            {yAxis2 && <Line type="monotone" dataKey={yAxis2} stroke={chartConfig.barColor2} yAxisId="right" />}
            <Brush dataKey={xAxis} height={30} />
          </ComposedChart>
        )
      case 'histogram':
        return (
          <BarChart {...commonProps}>
            {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridColor} />}
            <XAxis dataKey="range" stroke={chartConfig.xAxisColor} />
            <YAxis stroke={chartConfig.yAxisColor} />
            <Tooltip />
            {chartConfig.showLegend && <Legend wrapperStyle={{ color: chartConfig.legendColor }} />}
            <Bar dataKey="count" fill={chartConfig.barColor} />
          </BarChart>
        )
      case 'waterfall':
        return (
          <BarChart {...commonProps}>
            {chartConfig.showGrid && <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.gridColor} />}
            <XAxis dataKey={xAxis} stroke={chartConfig.xAxisColor} />
            <YAxis stroke={chartConfig.yAxisColor} />
            <Tooltip />
            {chartConfig.showLegend && <Legend wrapperStyle={{ color: chartConfig.legendColor }} />}
            <Bar dataKey={yAxis} fill={chartConfig.barColor} />
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
                  stroke={chartConfig.barColor}
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
                  <div className="text-sm text-black">of {gaugeMax.toFixed(2)}</div>
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
        return <BarChart {...commonProps}><Bar dataKey={yAxis} fill={chartConfig.barColor} /></BarChart>
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#A69677]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#403B33] rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-black">Visualizations</h2>
            <p className="text-sm text-black/70">Create interactive charts and graphs</p>
          </div>
        </div>
      </div>

      <div className="flex gap-6" style={{ height: 'calc(100vh - 12rem)' }}>
        {/* Left Panel - Visuals Pane (Chart Builder) */}
        <div className={`flex flex-col transition-all duration-300 ${activePane === 'visuals' ? 'flex-1' : 'w-80 flex-shrink-0'}`}>
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#A69677] flex flex-col h-full">
            {/* Toggle Pane Header */}
            <div className="flex items-center gap-2 mb-4 flex-shrink-0 border-b-2 border-[#A69677] pb-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivePane('visuals')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  activePane === 'visuals'
                    ? 'bg-[#403B33] text-white'
                    : 'bg-[#D9BFA0] text-black hover:bg-[#BF8A49] hover:text-white'
                }`}
              >
                Visuals
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActivePane('format')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  activePane === 'format'
                    ? 'bg-[#403B33] text-white'
                    : 'bg-[#D9BFA0] text-black hover:bg-[#BF8A49] hover:text-white'
                }`}
              >
                Format
              </motion.button>
            </div>

            {/* Visuals Pane Content */}
            {activePane === 'visuals' && (
              <VisualsPaneContent
                chartType={chartType}
                setChartType={setChartType}
                availableFields={availableFields}
                xAxis={xAxis}
                setXAxis={setXAxis}
                yAxis={yAxis}
                setYAxis={setYAxis}
                yAxis2={yAxis2}
                setYAxis2={setYAxis2}
                handleFieldDrop={handleFieldDrop}
                numericColumns={numericColumns}
                stringColumns={stringColumns}
                generateChart={generateChart}
                chartData={chartData}
                chartName={chartName}
                setChartName={setChartName}
                saveVisualization={saveVisualization}
                loading={loading}
              />
            )}

            {/* Format Pane Content */}
            {activePane === 'format' && (
              <FormatPaneContent 
                chartConfig={chartConfig}
                setChartConfig={setChartConfig}
                chartData={chartData}
                generateChart={generateChart}
                chartType={chartType}
                yAxis2={yAxis2}
              />
            )}
          </div>
        </div>

        {/* Right Panel - Chart Preview */}
        <div className="flex-1 flex flex-col">
          {chartData.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 border-2 border-[#A69677] h-full flex flex-col"
            >
              <h3 className="text-lg font-semibold mb-4 text-black flex-shrink-0">{chartName || 'Chart Preview'}</h3>
              <div className="flex-1 min-h-0">
                {chartData.length > 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-[#A69677] h-full flex items-center justify-center">
              <div>
                <BarChart3 className="w-16 h-16 text-black/40 mx-auto mb-4" />
                <p className="text-black/70">Select axes and generate a chart to preview</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Saved Visualizations */}
      {savedVisualizations.length > 0 && (
        <div className="mt-8 pt-6 border-t border-[#A69677]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black">Saved Visualizations</h3>
            {selectedForReport.size > 0 && (
              <span className="text-sm text-black font-medium">
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
                      ? 'bg-white border-[#0D0D0D] shadow-md'
                      : 'bg-white border-[#A69677] hover:border-[#403B33]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-black">{viz.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-[#BF8A49] text-white rounded">
                        {viz.type}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleReportSelection(viz.id)}
                        className={`p-1.5 rounded-lg transition ${
                          isSelected
                            ? 'bg-[#403B33] text-white'
                            : 'bg-[#BF8A49] text-white hover:bg-[#A6753A]'
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
                  <p className="text-sm text-black">
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
