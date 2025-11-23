'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Save } from 'lucide-react'
import DraggableField from './DraggableField'
import { showToast } from '@/lib/toast'
import { 
  BarChart3, TrendingUp, PieChart as PieChartIcon, AreaChart as AreaChartIcon, 
  ScatterChart as ScatterIcon, Layers, Gauge, Activity, Zap
} from 'lucide-react'

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

interface VisualsPaneContentProps {
  chartType: string
  setChartType: (type: string) => void
  availableFields: Array<{ name: string; type: string }>
  xAxis: string
  setXAxis: (axis: string) => void
  yAxis: string
  setYAxis: (axis: string) => void
  yAxis2: string
  setYAxis2: (axis: string) => void
  handleFieldDrop: (field: string, sourceType: 'x-axis' | 'y-axis' | 'y-axis2') => void
  numericColumns: any[]
  stringColumns: any[]
  generateChart: () => void
  chartData: any[]
  chartName: string
  setChartName: (name: string) => void
  saveVisualization: () => void
  loading: boolean
}

export default function VisualsPaneContent({
  chartType,
  setChartType,
  availableFields,
  xAxis,
  setXAxis,
  yAxis,
  setYAxis,
  yAxis2,
  setYAxis2,
  handleFieldDrop,
  numericColumns,
  stringColumns,
  generateChart,
  chartData,
  chartName,
  setChartName,
  saveVisualization,
  loading
}: VisualsPaneContentProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['chartType', 'fields', 'axes']))

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  return (
    <div className="flex-1 overflow-y-auto pr-2 space-y-2">
      {/* Chart Type Section */}
      <div className="border-2 border-[#A69677] rounded-lg overflow-hidden">
        <motion.button
          whileHover={{ backgroundColor: '#D9BFA0' }}
          onClick={() => toggleSection('chartType')}
          className="w-full flex items-center justify-between p-3 bg-white"
        >
          <span className="text-sm font-semibold text-black">Chart Type</span>
          <ChevronRight 
            className={`w-4 h-4 text-black transition-transform ${expandedSections.has('chartType') ? 'rotate-90' : ''}`} 
          />
        </motion.button>
        {expandedSections.has('chartType') && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-3 bg-[#D9BFA0]/30"
          >
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
                        ? 'border-[#0D0D0D] bg-white'
                        : 'border-2 border-[#A69677] hover:border-[#403B33]'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-xs font-medium">{type.label}</div>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Available Fields Section */}
      <div className="border-2 border-[#A69677] rounded-lg overflow-hidden">
        <motion.button
          whileHover={{ backgroundColor: '#D9BFA0' }}
          onClick={() => toggleSection('fields')}
          className="w-full flex items-center justify-between p-3 bg-white"
        >
          <span className="text-sm font-semibold text-black">Available Fields</span>
          <ChevronRight 
            className={`w-4 h-4 text-black transition-transform ${expandedSections.has('fields') ? 'rotate-90' : ''}`} 
          />
        </motion.button>
        {expandedSections.has('fields') && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-3 bg-[#D9BFA0]/30"
          >
            <label className="block text-xs font-medium text-black mb-2">
              Drag to axes below
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-[#D9BFA0] rounded-lg border-2 border-[#A69677]">
              {availableFields.map((col) => (
                <div
                  key={col.name}
                  draggable
                  onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                    e.dataTransfer.effectAllowed = 'move'
                    e.dataTransfer.setData('text/plain', JSON.stringify({ field: col.name, type: col.type }))
                  }}
                  className="px-3 py-2 bg-white border-2 border-[#A69677] rounded-lg cursor-move text-sm font-medium text-black hover:border-[#403B33] transition hover:scale-105"
                >
                  {col.name}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Axes Section */}
      <div className="border-2 border-[#A69677] rounded-lg overflow-hidden">
        <motion.button
          whileHover={{ backgroundColor: '#D9BFA0' }}
          onClick={() => toggleSection('axes')}
          className="w-full flex items-center justify-between p-3 bg-white"
        >
          <span className="text-sm font-semibold text-black">Axes</span>
          <ChevronRight 
            className={`w-4 h-4 text-black transition-transform ${expandedSections.has('axes') ? 'rotate-90' : ''}`} 
          />
        </motion.button>
        {expandedSections.has('axes') && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-3 space-y-3 bg-[#D9BFA0]/30"
          >
            {/* X-Axis Drop Zone */}
            <div>
              <label className="block text-xs font-medium text-black mb-2">X-Axis (Category)</label>
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
                className="min-h-[60px] p-3 border-2 border-dashed border-[#A69677] rounded-lg bg-white hover:border-[#403B33] transition"
              >
                {xAxis ? (
                  <DraggableField
                    field={xAxis}
                    type="x-axis"
                    onRemove={() => setXAxis('')}
                    onDrop={handleFieldDrop}
                  />
                ) : (
                  <div className="text-center text-black text-xs py-2">
                    Drag a field here
                  </div>
                )}
              </div>
            </div>

            {/* Y-Axis Drop Zone */}
            <div>
              <label className="block text-xs font-medium text-black mb-2">Y-Axis (Value)</label>
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
                className="min-h-[60px] p-3 border-2 border-dashed border-[#A69677] rounded-lg bg-white hover:border-[#403B33] transition"
              >
                {yAxis ? (
                  <DraggableField
                    field={yAxis}
                    type="y-axis"
                    onRemove={() => setYAxis('')}
                    onDrop={handleFieldDrop}
                  />
                ) : (
                  <div className="text-center text-black text-xs py-2">
                    Drag a numeric field here
                  </div>
                )}
              </div>
            </div>

            {/* Y-Axis 2 Drop Zone */}
            {(chartType === 'composed' || chartType === 'bar' || chartType === 'line' || chartType === 'area') && (
              <div>
                <label className="block text-xs font-medium text-black mb-2">Y-Axis 2 (Optional)</label>
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
                  className="min-h-[60px] p-3 border-2 border-dashed border-[#A69677] rounded-lg bg-white hover:border-[#403B33] transition"
                >
                  {yAxis2 ? (
                    <DraggableField
                      field={yAxis2}
                      type="y-axis2"
                      onRemove={() => setYAxis2('')}
                      onDrop={handleFieldDrop}
                    />
                  ) : (
                    <div className="text-center text-black text-xs py-2">
                      Drag a numeric field here (optional)
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Generate Chart Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => generateChart()}
        className="w-full bg-[#403B33] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#2d2822] transition shadow-md"
      >
        Generate Chart
      </motion.button>

      {/* Save Section */}
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
            className="w-full px-4 py-2 border-2 border-[#A69677] rounded-lg focus:ring-2 focus:ring-[#403B33] focus:border-[#403B33] bg-white text-black text-sm"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={saveVisualization}
            disabled={loading}
            className="w-full bg-[#403B33] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#2d2822] transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Visualization'}
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}

