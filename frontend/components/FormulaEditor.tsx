'use client'

import { useRef } from 'react'
import Editor, { useMonaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'

interface FormulaEditorProps {
  value: string
  onChange: (value: string) => void
  availableColumns: Array<{ name: string; type: string }>
  height?: string
}

export default function FormulaEditor({ 
  value, 
  onChange, 
  availableColumns,
  height = '200px' 
}: FormulaEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const monaco = useMonaco()

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
    
    if (!monaco) return
    
    // Configure autocomplete
    const columnSuggestions = availableColumns.map(col => ({
      label: col.name,
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: col.name,
      detail: `Column (${col.type})`
    }))

    // Add function suggestions
    const functionSuggestions = [
      { label: 'SUM', kind: monaco.languages.CompletionItemKind.Function, insertText: 'SUM(${1:column})', detail: 'Sum of values' },
      { label: 'AVG', kind: monaco.languages.CompletionItemKind.Function, insertText: 'AVG(${1:column})', detail: 'Average of values' },
      { label: 'COUNT', kind: monaco.languages.CompletionItemKind.Function, insertText: 'COUNT(${1:column})', detail: 'Count of values' },
      { label: 'MIN', kind: monaco.languages.CompletionItemKind.Function, insertText: 'MIN(${1:column})', detail: 'Minimum value' },
      { label: 'MAX', kind: monaco.languages.CompletionItemKind.Function, insertText: 'MAX(${1:column})', detail: 'Maximum value' },
      { label: 'IF', kind: monaco.languages.CompletionItemKind.Function, insertText: 'IF(${1:condition}, ${2:true_value}, ${3:false_value})', detail: 'Conditional expression' },
      { label: 'YEAR', kind: monaco.languages.CompletionItemKind.Function, insertText: 'YEAR(${1:date_column})', detail: 'Extract year from date' },
      { label: 'MONTH', kind: monaco.languages.CompletionItemKind.Function, insertText: 'MONTH(${1:date_column})', detail: 'Extract month from date' },
      { label: 'FORMAT', kind: monaco.languages.CompletionItemKind.Function, insertText: 'FORMAT(${1:value}, "${2:format}")', detail: 'Format value' },
    ]

    // Register completion provider
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: () => {
        return {
          suggestions: [...columnSuggestions, ...functionSuggestions] as any
        }
      }
    })
  }

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      <Editor
        height={height}
        defaultLanguage="javascript"
        value={value}
        onChange={(val) => onChange(val || '')}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
        }}
      />
    </div>
  )
}

