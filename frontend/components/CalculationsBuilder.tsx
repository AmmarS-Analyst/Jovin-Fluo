'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, Plus, Trash2, Sparkles, X, GripVertical, Eye, EyeOff, Database } from 'lucide-react'
import api from '@/lib/api'
import { showToast } from '@/lib/toast'
import DataTable from './DataTable'
import { TableSkeleton } from './LoadingSkeleton'
import FormulaEditor from './FormulaEditor'

interface CalculatedColumn {
  id: number
  name: string
  formula: string
  data_type: string
  dataset_id: number
  created_at: string
}

interface CalculationsBuilderProps {
  datasetId: number
  availableColumns: Array<{ name: string; type: string }>
}

const PRE_GENERATED_FORMULAS = [
  {
    name: 'Total Revenue',
    formula: 'Sales * Quantity',
    data_type: 'numeric',
    description: 'Calculate total revenue from sales and quantity'
  },
  {
    name: 'Profit Margin %',
    formula: '(Profit / Sales) * 100',
    data_type: 'numeric',
    description: 'Calculate profit margin percentage'
  },
  {
    name: 'Average Order Value',
    formula: 'Sales / Quantity',
    data_type: 'numeric',
    description: 'Calculate average value per order'
  },
  {
    name: 'Year',
    formula: 'YEAR(Date)',
    data_type: 'numeric',
    description: 'Extract year from date column'
  },
  {
    name: 'Month',
    formula: 'MONTH(Date)',
    data_type: 'numeric',
    description: 'Extract month from date column'
  },
  {
    name: 'Quarter',
    formula: 'QUARTER(Date)',
    data_type: 'numeric',
    description: 'Extract quarter from date column'
  },
  {
    name: 'Year-Month',
    formula: 'FORMAT(Date, "YYYY-MM")',
    data_type: 'string',
    description: 'Format date as year-month string'
  },
  {
    name: 'Is High Value',
    formula: 'IF(Sales > 10000, "High", "Low")',
    data_type: 'string',
    description: 'Categorize sales as high or low value'
  }
]

export default function CalculationsBuilder({ datasetId, availableColumns }: CalculationsBuilderProps) {
  const [calculations, setCalculations] = useState<CalculatedColumn[]>([])
  const [datasetData, setDatasetData] = useState<{ columns: string[], rows: any[][], row_count: number } | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showPreGenerated, setShowPreGenerated] = useState(false)
  const [showDataPreview, setShowDataPreview] = useState(true)
  const [selectedCalculations, setSelectedCalculations] = useState<Set<number>>(new Set())
  const [formData, setFormData] = useState({
    name: '',
    formula: '',
    data_type: 'numeric'
  })
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    loadCalculations()
    loadDatasetData()
  }, [datasetId])

  const loadCalculations = async () => {
    try {
      const response = await api.get(`/calculated-columns/dataset/${datasetId}`)
      setCalculations(response.data)
      // Select all by default
      setSelectedCalculations(new Set(response.data.map((c: CalculatedColumn) => c.id)))
    } catch (error) {
      console.error('Failed to load calculations:', error)
    }
  }

  const loadDatasetData = async () => {
    setLoadingData(true)
    try {
      const response = await api.get(`/datasets/${datasetId}/data?limit=50`)
      setDatasetData(response.data)
    } catch (error) {
      console.error('Failed to load dataset data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const validateFormula = (formula: string): { valid: boolean; error?: string } => {
    if (!formula.trim()) {
      return { valid: false, error: 'Formula cannot be empty' }
    }
    
    // Check for basic syntax errors
    const openParens = (formula.match(/\(/g) || []).length
    const closeParens = (formula.match(/\)/g) || []).length
    if (openParens !== closeParens) {
      return { valid: false, error: 'Mismatched parentheses' }
    }
    
    // Check for valid column names
    const columnNames = availableColumns.map(c => c.name)
    const formulaWords = formula.match(/\b\w+\b/g) || []
    const invalidColumns = formulaWords.filter(
      word => !columnNames.includes(word) && 
      !['SUM', 'AVG', 'COUNT', 'MIN', 'MAX', 'IF', 'YEAR', 'MONTH', 'QUARTER', 'FORMAT'].includes(word.toUpperCase()) &&
      !/^\d+$/.test(word)
    )
    
    if (invalidColumns.length > 0) {
      return { valid: false, error: `Unknown column or function: ${invalidColumns.join(', ')}` }
    }
    
    return { valid: true }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate formula
    const validation = validateFormula(formData.formula)
    if (!validation.valid) {
      showToast.error(validation.error || 'Invalid formula')
      return
    }
    
    setLoading(true)
    try {
      await api.post('/calculated-columns', {
        ...formData,
        dataset_id: datasetId
      })
      setFormData({ name: '', formula: '', data_type: 'numeric' })
      setShowModal(false)
      loadCalculations()
      loadDatasetData() // Reload data to show new calculated column
      showToast.success('Calculation created successfully!')
    } catch (error: any) {
      showToast.error(error.response?.data?.detail || 'Failed to create calculation')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    // Using a simple confirm for now - could be replaced with a custom modal
    if (!window.confirm('Are you sure you want to delete this calculation?')) return
    try {
      await api.delete(`/calculated-columns/${id}`)
      loadCalculations()
      loadDatasetData() // Reload data
      showToast.success('Calculation deleted successfully!')
    } catch (error: any) {
      showToast.error(error.response?.data?.detail || 'Failed to delete calculation')
    }
  }

  const usePreGenerated = (formula: typeof PRE_GENERATED_FORMULAS[0]) => {
    setFormData({
      name: formula.name,
      formula: formula.formula,
      data_type: formula.data_type
    })
    setShowPreGenerated(false)
    setShowModal(true)
  }

  const createFromTemplate = async (formula: typeof PRE_GENERATED_FORMULAS[0]) => {
    setLoading(true)
    try {
      await api.post('/calculated-columns', {
        name: formula.name,
        formula: formula.formula,
        data_type: formula.data_type,
        dataset_id: datasetId
      })
      setShowPreGenerated(false)
      loadCalculations()
      loadDatasetData() // Reload data to show new calculated column
    } catch (error: any) {
      showToast.error(error.response?.data?.detail || 'Failed to create calculation from template')
    } finally {
      setLoading(false)
    }
  }

  const toggleCalculation = (calcId: number) => {
    const newSelected = new Set(selectedCalculations)
    if (newSelected.has(calcId)) {
      newSelected.delete(calcId)
    } else {
      newSelected.add(calcId)
    }
    setSelectedCalculations(newSelected)
  }

  // Get all columns including selected calculated columns
  const getAllColumns = () => {
    if (!datasetData) return []
    const baseColumns = datasetData.columns
    const calcColumns = calculations
      .filter(c => selectedCalculations.has(c.id))
      .map(c => c.name)
    return [...baseColumns, ...calcColumns]
  }

  // Memoized formula evaluation with caching (placeholder - in real implementation, this would use a proper formula engine)
  const formulaCache = useMemo(() => new Map<string, any>(), [])
  
  const evaluateFormula = (formula: string, row: any[], columns: string[]): any => {
    // Create cache key
    const cacheKey = `${formula}-${row.join(',')}`
    if (formulaCache.has(cacheKey)) {
      return formulaCache.get(cacheKey)
    }
    
    // This is a placeholder - in production, you'd use a proper formula parser
    try {
      // Basic evaluation for simple formulas (this is simplified)
      let result = formula
      columns.forEach((col, idx) => {
        const value = row[idx]
        result = result.replace(new RegExp(`\\b${col}\\b`, 'g'), String(value || 0))
      })
      // Try to evaluate as JavaScript (not safe for production, but works for demo)
      // In production, use a proper formula engine
      const evaluated = eval(result) || 'N/A'
      formulaCache.set(cacheKey, evaluated)
      // Limit cache size to prevent memory issues
      if (formulaCache.size > 1000) {
        const firstKey = formulaCache.keys().next().value
        if (firstKey) {
          formulaCache.delete(firstKey)
        }
      }
      return evaluated
    } catch {
      const error = 'N/A'
      formulaCache.set(cacheKey, error)
      return error
    }
  }

  return (
    <div className="flex gap-6" style={{ height: 'calc(100vh - 12rem)' }}>
      {/* Left Side: Calculations Pane - Compact Sidebar */}
      <div className="flex flex-col h-full w-80 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-[#A69677] flex flex-col h-full">
          {/* Header - Compact */}
          <div className="mb-3 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-[#403B33] rounded-lg">
                <Calculator className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-bold text-black">Calculations</h2>
            </div>
            <p className="text-xs text-black/70 ml-8">Create DAX-like calculated columns</p>
          </div>

          {/* Action Buttons - Compact */}
          <div className="flex gap-2 mb-3 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPreGenerated(true)}
              className="flex-1 px-3 py-1.5 bg-[#BF8A49] text-white rounded-lg text-sm font-semibold hover:bg-[#A6753A] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Templates
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="flex-1 px-3 py-1.5 bg-[#403B33] text-white rounded-lg text-sm font-semibold hover:bg-[#2d2822] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </motion.button>
          </div>

          {/* Calculations List with Scroll - Compact */}
          <div className="flex-1 overflow-hidden">
            {calculations.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-[#A69677] rounded-lg">
                <Calculator className="w-8 h-8 text-black/40 mx-auto mb-2" />
                <p className="text-sm text-black mb-1">No calculations yet</p>
                <p className="text-xs text-black/70">Create calculated columns</p>
              </div>
            ) : (
              <div className="h-full overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#A69677 #D9BFA0' }}>
                <p className="text-xs text-black/70 mb-2">
                  Select to include:
                </p>
                <div className="space-y-2">
                  <AnimatePresence>
                    {calculations.map((calc) => {
                      const isSelected = selectedCalculations.has(calc.id)
                      return (
                        <motion.div
                          key={calc.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`p-2.5 rounded-lg border-2 transition cursor-pointer ${
                            isSelected
                              ? 'bg-white border-[#0D0D0D] shadow-sm'
                              : 'bg-white border-[#A69677] hover:border-[#403B33]'
                          }`}
                          onClick={() => toggleCalculation(calc.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                              <GripVertical className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isSelected ? 'text-[#403B33]' : 'text-[#A69677]'}`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                                  <h3 className="font-semibold text-sm text-black truncate">{calc.name}</h3>
                                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                                    isSelected ? 'bg-[#BF8A49] text-white' : 'bg-[#D9BFA0] text-black'
                                  }`}>
                                    {calc.data_type}
                                  </span>
                                  {isSelected && (
                                    <span className="text-xs text-[#403B33] font-medium flex-shrink-0">✓</span>
                                  )}
                                </div>
                                <code className="text-xs text-black bg-[#D9BFA0] px-2 py-1 rounded block font-mono break-all">
                                  {calc.formula}
                                </code>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(calc.id)
                              }}
                              className="p-1 text-[#BF8A49] hover:bg-[#BF8A49]/20 rounded transition flex-shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Data Preview with Calculations - Takes most space */}
      <div className="flex flex-col h-full flex-1 min-w-0">
        {datasetData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#A69677] flex flex-col h-full"
          >
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-black">Data Preview with Calculations</h3>
                {selectedCalculations.size > 0 && (
                  <span className="px-3 py-1 bg-[#BF8A49] text-white rounded-full text-sm font-semibold">
                    {selectedCalculations.size} calculation{selectedCalculations.size !== 1 ? 's' : ''} active
                  </span>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDataPreview(!showDataPreview)}
                className="p-2 bg-[#D9BFA0] hover:bg-[#BF8A49] rounded-lg transition"
              >
                {showDataPreview ? <EyeOff className="w-5 h-5 text-black" /> : <Eye className="w-5 h-5 text-black" />}
              </motion.button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col" style={{ position: 'relative' }}>
              {loadingData ? (
                <div className="h-full overflow-auto">
                  <TableSkeleton rows={10} cols={getAllColumns().length || 5} />
                </div>
              ) : showDataPreview ? (
                <div className="flex-1 flex flex-col min-h-0" style={{ position: 'relative', height: '100%' }}>
                  {/* Prepare data with calculated columns */}
                  {(() => {
                    const allCols = getAllColumns()
                    const calcCols = calculations.filter(c => selectedCalculations.has(c.id))
                    const tableData = datasetData.rows.map((row: any[]) => {
                      const baseRow = [...row]
                      calcCols.forEach(calc => {
                        baseRow.push(evaluateFormula(calc.formula, row, datasetData.columns))
                      })
                      return baseRow
                    })
                    const tableColumns = [
                      ...datasetData.columns.map((col: string) => ({ name: col, label: col, sortable: true })),
                      ...calcCols.map(calc => ({ 
                        name: calc.name, 
                        label: `${calc.name} (Calc)`, 
                        sortable: false 
                      }))
                    ]
                    return (
                      <div 
                        className="absolute inset-0 pr-2" 
                        style={{ 
                          overflow: 'auto',
                          scrollbarWidth: 'thin', 
                          scrollbarColor: '#A69677 #D9BFA0',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <div style={{ flex: '1 1 auto', minHeight: 0, overflow: 'auto' }}>
                          <DataTable
                            columns={tableColumns}
                            data={tableData}
                            searchable={true}
                            sortable={true}
                            paginated={true}
                            pageSize={10}
                          />
                        </div>
                      </div>
                    )
                  })()}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-[#A69677] rounded-lg">
                  <EyeOff className="w-12 h-12 text-black/40 mx-auto mb-4" />
                  <p className="text-black">Data preview is hidden</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#A69677] flex items-center justify-center h-full">
            <div className="text-center">
              <Database className="w-16 h-16 text-black/40 mx-auto mb-4" />
              <p className="text-black">Load dataset to see data preview</p>
            </div>
          </div>
        )}
      </div>


      {/* Pre-generated Templates Modal */}
      <AnimatePresence>
        {showPreGenerated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreGenerated(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border-2 border-[#A69677]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b-2 border-[#A69677] flex items-center justify-between">
                <h3 className="text-2xl font-bold text-black">Pre-generated Formulas</h3>
                <button
                  onClick={() => setShowPreGenerated(false)}
                  className="p-2 hover:bg-[#D9BFA0] rounded-lg"
                >
                  <X className="w-5 h-5 text-black" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-black/70 mb-4">
                  Choose a template to use directly, or customize it before creating
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PRE_GENERATED_FORMULAS.map((formula, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 border-2 border-[#A69677] rounded-lg hover:border-[#403B33] hover:bg-[#D9BFA0] transition-all"
                    >
                      <h4 className="font-semibold text-black mb-1">{formula.name}</h4>
                      <code className="text-xs text-black/70 block mb-2 bg-[#D9BFA0] px-2 py-1 rounded">{formula.formula}</code>
                      <p className="text-xs text-black/60 mb-3">{formula.description}</p>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => createFromTemplate(formula)}
                          disabled={loading}
                          className="flex-1 px-3 py-1.5 bg-[#403B33] text-white text-xs rounded-lg hover:bg-[#2d2822] transition disabled:opacity-50"
                        >
                          Use Template
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => usePreGenerated(formula)}
                          className="flex-1 px-3 py-1.5 bg-[#D9BFA0] text-black text-xs rounded-lg hover:bg-[#BF8A49] hover:text-white transition"
                        >
                          Customize
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b-2 border-[#A69677] flex items-center justify-between">
                <h3 className="text-2xl font-bold text-black">Create Calculation</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-[#D9BFA0] rounded-lg"
                >
                  <X className="w-5 h-5 text-black" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Column Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-[#A69677] rounded-lg focus:ring-2 focus:ring-[#403B33] focus:border-[#403B33] bg-white text-black"
                    placeholder="e.g., Total Revenue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Formula (DAX-like)
                  </label>
                  <FormulaEditor
                    value={formData.formula}
                    onChange={(val) => setFormData({ ...formData, formula: val })}
                    availableColumns={availableColumns}
                    height="200px"
                  />
                  <p className="text-xs text-black/70 mt-2">
                    Available columns: {availableColumns.map(c => c.name).join(', ')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Data Type
                  </label>
                  <select
                    value={formData.data_type}
                    onChange={(e) => setFormData({ ...formData, data_type: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-[#A69677] rounded-lg focus:ring-2 focus:ring-[#403B33] focus:border-[#403B33] bg-white text-black"
                  >
                    <option value="numeric">Numeric</option>
                    <option value="string">String</option>
                    <option value="boolean">Boolean</option>
                    <option value="datetime">DateTime</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-accent-600 to-accent-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-accent-700 hover:to-accent-600 transition-all shadow-md disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Calculation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-[#D9BFA0] text-black py-3 px-4 rounded-lg font-semibold hover:bg-[#BF8A49] hover:text-white transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
