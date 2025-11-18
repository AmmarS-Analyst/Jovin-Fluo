'use client'

interface ColumnProfile {
  name: string
  type: string
  null_percentage: number
  distinct_count?: number
  statistics?: {
    mean?: number
    median?: number
    std?: number
    min?: number
    max?: number
  }
}

interface DataProfileProps {
  data: {
    columns: ColumnProfile[]
    row_count: number
    preview_data: any[][]
    summary?: string
  }
}

export default function DataProfile({ data }: DataProfileProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-4">Data Profile</h2>
      
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total Rows</div>
          <div className="text-2xl font-bold text-blue-600">{data.row_count.toLocaleString()}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total Columns</div>
          <div className="text-2xl font-bold text-green-600">{data.columns.length}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Data Quality</div>
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(100 - (data.columns.reduce((acc, col) => acc + col.null_percentage, 0) / data.columns.length))}%
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Column Information</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Column</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Null %</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distinct</th>
                {data.columns.some(col => col.statistics) && (
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stats</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.columns.map((col, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{col.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span className={`px-2 py-1 rounded text-xs ${
                      col.type === 'numeric' ? 'bg-blue-100 text-blue-800' :
                      col.type === 'string' ? 'bg-green-100 text-green-800' :
                      col.type === 'datetime' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {col.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{col.null_percentage.toFixed(2)}%</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{col.distinct_count?.toLocaleString() || '-'}</td>
                  {col.statistics && (
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="text-xs">
                        <div>Mean: {col.statistics.mean?.toFixed(2) || '-'}</div>
                        <div>Min: {col.statistics.min?.toFixed(2) || '-'} | Max: {col.statistics.max?.toFixed(2) || '-'}</div>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Data Preview (First 10 Rows)</h3>
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {data.columns.map((col, idx) => (
                  <th key={idx} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    {col.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.preview_data.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-4 py-2 text-sm text-gray-600">
                      {cell !== null && cell !== undefined ? String(cell) : <span className="text-gray-400">null</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

