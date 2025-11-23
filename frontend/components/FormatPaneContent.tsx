'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import AdvancedColorPicker from './AdvancedColorPicker'

interface FormatPaneContentProps {
  chartConfig: any
  setChartConfig: any
  chartData: any[]
  generateChart: () => void
  chartType: string
  yAxis2: string
}

export default function FormatPaneContent({
  chartConfig,
  setChartConfig,
  chartData,
  generateChart,
  chartType,
  yAxis2
}: FormatPaneContentProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['colors', 'display']))

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
      {/* Colors Section */}
      <div className="border-2 border-[#A69677] rounded-lg overflow-hidden">
        <motion.button
          whileHover={{ backgroundColor: '#D9BFA0' }}
          onClick={() => toggleSection('colors')}
          className="w-full flex items-center justify-between p-3 bg-white"
        >
          <span className="text-sm font-semibold text-black">Colors</span>
          <ChevronRight 
            className={`w-4 h-4 text-black transition-transform ${expandedSections.has('colors') ? 'rotate-90' : ''}`} 
          />
        </motion.button>
        {expandedSections.has('colors') && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-3 space-y-3 bg-[#D9BFA0]/30"
          >
            <AdvancedColorPicker
              color={chartConfig.barColor}
              onChange={(color) => {
                setChartConfig({ ...chartConfig, barColor: color })
                if (chartData.length > 0) generateChart()
              }}
              label="Bar Color"
            />

            {yAxis2 && (
              <AdvancedColorPicker
                color={chartConfig.barColor2}
                onChange={(color) => {
                  setChartConfig({ ...chartConfig, barColor2: color })
                  if (chartData.length > 0) generateChart()
                }}
                label="Secondary Bar Color"
              />
            )}

            <AdvancedColorPicker
              color={chartConfig.legendColor}
              onChange={(color) => {
                setChartConfig({ ...chartConfig, legendColor: color })
                if (chartData.length > 0) generateChart()
              }}
              label="Legend Color"
            />

            <AdvancedColorPicker
              color={chartConfig.xAxisColor}
              onChange={(color) => {
                setChartConfig({ ...chartConfig, xAxisColor: color })
                if (chartData.length > 0) generateChart()
              }}
              label="X-Axis Color"
            />

            <AdvancedColorPicker
              color={chartConfig.yAxisColor}
              onChange={(color) => {
                setChartConfig({ ...chartConfig, yAxisColor: color })
                if (chartData.length > 0) generateChart()
              }}
              label="Y-Axis Color"
            />

            <AdvancedColorPicker
              color={chartConfig.gridColor}
              onChange={(color) => {
                setChartConfig({ ...chartConfig, gridColor: color })
                if (chartData.length > 0) generateChart()
              }}
              label="Grid Color"
            />
          </motion.div>
        )}
      </div>

      {/* Display Options */}
      <div className="border-2 border-[#A69677] rounded-lg overflow-hidden">
        <motion.button
          whileHover={{ backgroundColor: '#D9BFA0' }}
          onClick={() => toggleSection('display')}
          className="w-full flex items-center justify-between p-3 bg-white"
        >
          <span className="text-sm font-semibold text-black">Display Options</span>
          <ChevronRight 
            className={`w-4 h-4 text-black transition-transform ${expandedSections.has('display') ? 'rotate-90' : ''}`} 
          />
        </motion.button>
        {expandedSections.has('display') && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-3 space-y-3 bg-[#D9BFA0]/30"
          >
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-[#A69677]">
              <label htmlFor="showGrid" className="text-sm font-medium text-black cursor-pointer">
                Show Grid
              </label>
              <input
                type="checkbox"
                id="showGrid"
                checked={chartConfig.showGrid}
                onChange={(e) => {
                  setChartConfig({ ...chartConfig, showGrid: e.target.checked })
                  if (chartData.length > 0) generateChart()
                }}
                className="w-5 h-5 rounded border-2 border-[#A69677] text-[#403B33] focus:ring-[#403B33] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-[#A69677]">
              <label htmlFor="showLegend" className="text-sm font-medium text-black cursor-pointer">
                Show Legend
              </label>
              <input
                type="checkbox"
                id="showLegend"
                checked={chartConfig.showLegend}
                onChange={(e) => {
                  setChartConfig({ ...chartConfig, showLegend: e.target.checked })
                  if (chartData.length > 0) generateChart()
                }}
                className="w-5 h-5 rounded border-2 border-[#A69677] text-[#403B33] focus:ring-[#403B33] cursor-pointer"
              />
            </div>

            {(chartType === 'bar' || chartType === 'area') && (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-[#A69677]">
                <label htmlFor="stacked" className="text-sm font-medium text-black cursor-pointer">
                  Stacked Bars
                </label>
                <input
                  type="checkbox"
                  id="stacked"
                  checked={chartConfig.stacked}
                  onChange={(e) => {
                    setChartConfig({ ...chartConfig, stacked: e.target.checked })
                    if (chartData.length > 0) generateChart()
                  }}
                  className="w-5 h-5 rounded border-2 border-[#A69677] text-[#403B33] focus:ring-[#403B33] cursor-pointer"
                />
              </div>
            )}

            {chartType === 'bar' && (
              <div className="p-3 bg-white rounded-lg border-2 border-[#A69677]">
                <label className="block text-sm font-medium text-black mb-2">
                  Bar Size: {chartConfig.barSize}
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={chartConfig.barSize}
                  onChange={(e) => {
                    setChartConfig({ ...chartConfig, barSize: parseInt(e.target.value) })
                    if (chartData.length > 0) generateChart()
                  }}
                  className="w-full h-2 bg-[#D9BFA0] rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #403B33 0%, #403B33 ${chartConfig.barSize}%, #D9BFA0 ${chartConfig.barSize}%, #D9BFA0 100%)`
                  }}
                />
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

