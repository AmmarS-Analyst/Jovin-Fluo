'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, X, GripVertical } from 'lucide-react'

interface AdvancedColorPickerProps {
  color: string
  onChange: (color: string) => void
  label?: string
}

const PRESET_COLORS = [
  '#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80',
  '#00FFFF', '#0080FF', '#0000FF', '#8000FF', '#FF00FF', '#FF0080',
  '#FFFFFF', '#E0E0E0', '#C0C0C0', '#808080', '#404040', '#000000',
  '#403B33', '#BF8A49', '#D9BFA0', '#A69677', '#0D0D0D'
]

// Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

// Convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360
  s /= 100
  l /= 100

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

export default function AdvancedColorPicker({ color, onChange, label }: AdvancedColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hexColor, setHexColor] = useState(color)
  const [rgb, setRgb] = useState(hexToRgb(color))
  const [hsl, setHsl] = useState(rgbToHsl(rgb.r, rgb.g, rgb.b))
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const newRgb = hexToRgb(color)
    setRgb(newRgb)
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b))
    setHexColor(color)
  }, [color])

  useEffect(() => {
    if (isOpen) {
      // Position popup near the center of the screen initially
      setPosition({ 
        x: window.innerWidth / 2 - 160, 
        y: window.innerHeight / 2 - 200 
      })
    }
  }, [isOpen])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (popupRef.current) {
      const rect = popupRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
      setIsDragging(true)
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && popupRef.current) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  const updateColor = (newRgb: { r: number; g: number; b: number }) => {
    setRgb(newRgb)
    const newHsl = rgbToHsl(newRgb.r, newRgb.g, newRgb.b)
    setHsl(newHsl)
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
    setHexColor(newHex)
    onChange(newHex)
  }

  const updateFromHsl = (newHsl: { h: number; s: number; l: number }) => {
    setHsl(newHsl)
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l)
    setRgb(newRgb)
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
    setHexColor(newHex)
    onChange(newHex)
  }

  const updateFromHex = (hex: string) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setHexColor(hex)
      const newRgb = hexToRgb(hex)
      setRgb(newRgb)
      setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b))
      onChange(hex)
    }
  }

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-black mb-2">
          {label}
        </label>
      )}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border-2 border-[#A69677] rounded-lg bg-white hover:bg-[#D9BFA0] transition w-full"
      >
        <div
          className="w-6 h-6 rounded border-2 border-[#A69677] flex-shrink-0"
          style={{ backgroundColor: hexColor }}
        />
        <span className="text-sm font-mono text-black flex-1 text-left">{hexColor.toUpperCase()}</span>
        <Palette className="w-4 h-4 text-[#403B33] flex-shrink-0" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: position.x,
              y: position.y
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'fixed',
              left: position.x || undefined,
              top: position.y || undefined,
              zIndex: 9999,
              cursor: isDragging ? 'grabbing' : 'default'
            }}
            className="bg-white rounded-xl shadow-2xl border-2 border-[#A69677] p-4 w-80"
            onMouseDown={(e) => {
              const target = e.target as HTMLElement
              if (target.closest('.drag-handle') || target.closest('input[type="range"]')) {
                handleMouseDown(e)
              }
            }}
          >
            {/* Draggable Header */}
            <div 
              className="flex items-center justify-between mb-4 cursor-grab active:cursor-grabbing drag-handle"
              onMouseDown={handleMouseDown}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-[#A69677]" />
                <h3 className="text-sm font-semibold text-black">Color Picker - {label}</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="p-1 text-black hover:text-black/70"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

              {/* Color Preview */}
              <div className="mb-4 p-4 rounded-lg border-2 border-[#A69677]" style={{ backgroundColor: hexColor }}>
                <div className="text-center">
                  <div className="text-xs font-medium text-black mb-1">Preview</div>
                  <div className="text-xs font-mono text-black">{hexColor.toUpperCase()}</div>
                </div>
              </div>

              {/* HSL Sliders */}
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-black">Hue</label>
                    <span className="text-xs text-black/70">{Math.round(hsl.h)}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={hsl.h}
                    onChange={(e) => updateFromHsl({ ...hsl, h: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-cyan-500 via-blue-500 via-magenta-500 to-red-500 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, 
                        hsl(0, 100%, 50%), 
                        hsl(60, 100%, 50%), 
                        hsl(120, 100%, 50%), 
                        hsl(180, 100%, 50%), 
                        hsl(240, 100%, 50%), 
                        hsl(300, 100%, 50%), 
                        hsl(360, 100%, 50%))`
                    }}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-black">Saturation</label>
                    <span className="text-xs text-black/70">{Math.round(hsl.s)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hsl.s}
                    onChange={(e) => updateFromHsl({ ...hsl, s: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gradient-to-r from-gray-300 to-current rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, 
                        hsl(${hsl.h}, 0%, ${hsl.l}%), 
                        hsl(${hsl.h}, 100%, ${hsl.l}%))`
                    }}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-black">Lightness</label>
                    <span className="text-xs text-black/70">{Math.round(hsl.l)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hsl.l}
                    onChange={(e) => updateFromHsl({ ...hsl, l: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gradient-to-r from-black via-current to-white rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, 
                        hsl(${hsl.h}, ${hsl.s}%, 0%), 
                        hsl(${hsl.h}, ${hsl.s}%, 50%), 
                        hsl(${hsl.h}, ${hsl.s}%, 100%))`
                    }}
                  />
                </div>
              </div>

              {/* RGB Inputs */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div>
                  <label className="block text-xs font-medium text-black mb-1">R</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgb.r}
                    onChange={(e) => updateColor({ ...rgb, r: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 border-2 border-[#A69677] rounded text-sm text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-black mb-1">G</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgb.g}
                    onChange={(e) => updateColor({ ...rgb, g: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 border-2 border-[#A69677] rounded text-sm text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-black mb-1">B</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgb.b}
                    onChange={(e) => updateColor({ ...rgb, b: parseInt(e.target.value) || 0 })}
                    className="w-full px-2 py-1 border-2 border-[#A69677] rounded text-sm text-black"
                  />
                </div>
              </div>

              {/* Hex Input */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-black mb-1">Hex</label>
                <input
                  type="text"
                  value={hexColor}
                  onChange={(e) => updateFromHex(e.target.value)}
                  placeholder="#000000"
                  className="w-full px-3 py-2 border-2 border-[#A69677] rounded-lg bg-white text-black font-mono text-sm focus:ring-2 focus:ring-[#403B33] focus:border-[#403B33]"
                />
              </div>

              {/* Preset Colors */}
              <div>
                <label className="block text-xs font-medium text-black mb-2">Preset Colors</label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((presetColor) => (
                    <motion.button
                      key={presetColor}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        const newRgb = hexToRgb(presetColor)
                        updateColor(newRgb)
                      }}
                      className={`w-8 h-8 rounded border-2 transition ${
                        hexColor.toUpperCase() === presetColor.toUpperCase()
                          ? 'border-[#0D0D0D] ring-2 ring-[#403B33]'
                          : 'border-[#A69677] hover:border-[#403B33]'
                      }`}
                      style={{ backgroundColor: presetColor }}
                      title={presetColor}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

