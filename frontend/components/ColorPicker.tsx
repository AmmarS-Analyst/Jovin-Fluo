'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, X } from 'lucide-react'

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  label?: string
}

const PRESET_COLORS = [
  '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', 
  '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#eab308',
  '#3b82f6', '#22c55e', '#f43f5e', '#a855f7', '#06b6d4', '#64748b'
]

export default function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customColor, setCustomColor] = useState(color)

  const handleColorChange = (newColor: string) => {
    setCustomColor(newColor)
    onChange(newColor)
  }

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-black mb-2">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 border-2 border-[#A69677] rounded-lg bg-white hover:bg-[#D9BFA0] transition"
        >
          <div
            className="w-6 h-6 rounded border-2 border-[#A69677]"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-mono text-black">{color.toUpperCase()}</span>
          <Palette className="w-4 h-4 text-[#403B33]" />
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-full left-0 mt-2 z-20 bg-white rounded-xl shadow-2xl border-2 border-[#A69677] p-4 w-80"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-black">Color Picker</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-black hover:text-black/70"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Preset Colors */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-black mb-2">
                  Preset Colors
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((presetColor) => (
                    <motion.button
                      key={presetColor}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleColorChange(presetColor)}
                      className={`w-8 h-8 rounded border-2 transition ${
                        color === presetColor
                          ? 'border-[#0D0D0D] ring-2 ring-[#403B33]'
                          : 'border-[#A69677] hover:border-[#403B33]'
                      }`}
                      style={{ backgroundColor: presetColor }}
                      title={presetColor}
                    />
                  ))}
                </div>
              </div>

              {/* Custom Color Input */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-black mb-2">
                  Custom Color (Hex Code)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-12 h-10 rounded border-2 border-[#A69677] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => {
                      const value = e.target.value
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                        handleColorChange(value)
                      }
                    }}
                    placeholder="#000000"
                    className="flex-1 px-3 py-2 border-2 border-[#A69677] rounded-lg bg-white text-black font-mono text-sm focus:ring-2 focus:ring-[#403B33] focus:border-[#403B33]"
                  />
                </div>
              </div>

              {/* Color Preview */}
              <div className="pt-4 border-t border-[#A69677]">
                <div className="flex items-center gap-2">
                  <div
                    className="w-12 h-12 rounded border-2 border-[#A69677]"
                    style={{ backgroundColor: customColor }}
                  />
                  <div>
                    <div className="text-xs font-medium text-black">Selected Color</div>
                    <div className="text-xs font-mono text-black/70">{customColor.toUpperCase()}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

