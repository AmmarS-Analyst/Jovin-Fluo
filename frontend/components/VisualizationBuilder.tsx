'use client'

import { useState } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '@/lib/api'

interface VisualizationBuilderProps {
  datasetId: number
  profileData: any
}

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function VisualizationBuilder({ datasetId, profileData }: VisualizationBuilderProps) {
  const [chartType, setChartType] = useState('bar')
  const [xAxis, setXAxis] = useState('')
  const [yAxis, setYAxis] = useState('')
  const [chartData, setChartData] = useState<any[]>([])

  const numericColumns = profileData.columns.filter((col: any) => col.type === 'numeric')
  const stringColumns = profileData.columns.filter((col: any) => col.type === 'string')

  const generateChart = async () => {
    if (!xAxis || !yAxis) {
      alert('Please select both X and Y axes')
      return
    }

    // For MVP, we'll use preview data to generate chart
    // In production, this would call the backend to aggregate data
    const xIndex = profileData.columns.findIndex((col: any) => col.name === xAxis)
    const yIndex = profileData.columns.findIndex((col: any) => col.name === yAxis)

    if (xIndex === -1 || yIndex === -1) return

    // Aggregate data (simple grouping for MVP)
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
      [yAxis]: item[yAxis] / item.count, // Average
    }))

    setChartData(data)

    // Save visualization
    try {
      await api.post('/visualizations', {
        name: `${chartType} Chart - ${xAxis} vs ${yAxis}`,
        type: chartType,
        config: { x_axis: xAxis, y_axis: yAxis },
        project_id: profileData.project_id || 1,
      })
    } catch (error) {
      console.error('Failed to save visualization:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-4">Create Visualization</h2>

      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="pie">Pie Chart</option>
          </select>
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

        <button
          onClick={generateChart}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-primary-700 transition"
        >
          Generate Chart
        </button>
      </div>

      {chartData.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Chart Preview</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' && (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xAxis} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={yAxis} fill="#0ea5e9" />
                </BarChart>
              )}
              {chartType === 'line' && (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xAxis} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey={yAxis} stroke="#0ea5e9" />
                </LineChart>
              )}
              {chartType === 'pie' && (
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey={yAxis}
                    nameKey={xAxis}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

