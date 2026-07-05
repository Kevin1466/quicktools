import { createContext, useContext, ReactNode, useState, useCallback } from 'react'
import { Tool } from '@/types'
import { tools, getToolsByCategory, searchTools, getHotTools, getNewTools } from '@/data/toolsFromJson'
import { categories, getCategoryById } from '@/data/categories'

interface ToolContextType {
  allTools: Tool[]
  hotTools: Tool[]
  newTools: Tool[]
  getToolsByCategory: (categoryId: string) => Tool[]
  searchTools: (query: string) => Tool[]
  getToolById: (id: string) => Tool | undefined
  getCategoryById: (id: string) => typeof categories[0] | undefined
  categories: typeof categories
  useCount: Record<string, number>
  incrementUseCount: (toolId: string) => void
}

const ToolContext = createContext<ToolContextType | undefined>(undefined)

interface ToolProviderProps {
  children: ReactNode
}

export const ToolProvider: React.FC<ToolProviderProps> = ({ children }) => {
  const [useCount, setUseCount] = useState<Record<string, number>>(() => {
    const stored = localStorage.getItem('tool_use_counts')
    return stored ? JSON.parse(stored) : {}
  })

  const incrementUseCount = useCallback((toolId: string) => {
    setUseCount(prev => {
      const newCount = { ...prev, [toolId]: (prev[toolId] || 0) + 1 }
      localStorage.setItem('tool_use_counts', JSON.stringify(newCount))
      return newCount
    })
  }, [])

  const value: ToolContextType = {
    allTools: tools,
    hotTools: getHotTools(),
    newTools: getNewTools(),
    getToolsByCategory,
    searchTools,
    getToolById: (id) => tools.find(tool => tool.id === id),
    getCategoryById,
    categories,
    useCount,
    incrementUseCount
  }

  return (
    <ToolContext.Provider value={value}>
      {children}
    </ToolContext.Provider>
  )
}

export const useToolContext = (): ToolContextType => {
  const context = useContext(ToolContext)
  if (context === undefined) {
    throw new Error('useToolContext must be used within a ToolProvider')
  }
  return context
}

export { ToolContext }
