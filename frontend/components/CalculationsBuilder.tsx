'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, Plus, Trash2, Sparkles, X, GripVertical, Eye, EyeOff } from 'lucide-react'
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
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calculator className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Calculations</h2>
              <p className="text-sm text-gray-500">Create DAX-like calculated columns</p>
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPreGenerated(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Templates
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Calculation
            </motion.button>
          </div>
        </div>

        {/* Calculations List */}
        {calculations.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No calculations yet</p>
            <p className="text-sm text-gray-500">Create calculated columns to enhance your analysis</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-3">
              Select calculations to include in the data preview:
            </p>
            <AnimatePresence>
              {calculations.map((calc) => {
                const isSelected = selectedCalculations.has(calc.id)
                return (
                  <motion.div
                    key={calc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`p-4 rounded-lg border-2 transition cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50 border-purple-400 shadow-md'
                        : 'bg-gradient-to-r from-gray-50 to-white border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => toggleCalculation(calc.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <GripVertical className={`w-5 h-5 mt-1 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{calc.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              isSelected ? 'bg-purple-200 text-purple-800' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {calc.data_type}
                            </span>
                            {isSelected && (
                              <span className="text-xs text-purple-600 font-medium">✓ Selected</span>
                            )}
                          </div>
                          <code className="text-sm text-gray-700 bg-gray-100 px-3 py-1.5 rounded block font-mono">
                            {calc.formula}
                          </code>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(calc.id)
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Dataset Data Preview with Calculated Columns */}
      {datasetData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-gray-900">Data Preview with Calculations</h3>
              {selectedCalculations.size > 0 && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  {selectedCalculations.size} calculation{selectedCalculations.size !== 1 ? 's' : ''} active
                </span>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDataPreview(!showDataPreview)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              {showDataPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </motion.button>
          </div>

          {loadingData ? (
            <TableSkeleton rows={10} cols={getAllColumns().length || 5} />
          ) : showDataPreview ? (
            <div>
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
                  <DataTable
                    columns={tableColumns}
                    data={tableData}
                    searchable={true}
                    sortable={true}
                    paginated={true}
                    pageSize={20}
                  />
                )
              })()}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <EyeOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Data preview is hidden</p>
            </div>
          )}
        </motion.div>
      )}

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
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Pre-generated Formulas</h3>
                <button
                  onClick={() => setShowPreGenerated(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Choose a template to use directly, or customize it before creating
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PRE_GENERATED_FORMULAS.map((formula, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                    >
                      <h4 className="font-semibold text-gray-900 mb-1">{formula.name}</h4>
                      <code className="text-xs text-gray-600 block mb-2">{formula.formula}</code>
                      <p className="text-xs text-gray-500 mb-3">{formula.description}</p>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => createFromTemplate(formula)}
                          disabled={loading}
                          className="flex-1 px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                        >
                          Use Template
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => usePreGenerated(formula)}
                          className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300 transition"
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
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Create Calculation</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Column Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Total Revenue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Formula (DAX-like)
                  </label>
                  <FormulaEditor
                    value={formData.formula}
                    onChange={(val) => setFormData({ ...formData, formula: val })}
                    availableColumns={availableColumns}
                    height="200px"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Available columns: {availableColumns.map(c => c.name).join(', ')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Type
                  </label>
                  <select
                    value={formData.data_type}
                    onChange={(e) => setFormData({ ...formData, data_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Calculation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition"
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
