import { useState, useCallback } from 'react'

export const useToolCounter = (toolId: string) => {
  const [count, setCount] = useState(() => {
    try {
      const stored = localStorage.getItem(`tool_count_${toolId}`)
      return stored ? parseInt(stored, 10) : 0
    } catch {
      return 0
    }
  })

  const increment = useCallback(() => {
    const newCount = count + 1
    setCount(newCount)
    try {
      localStorage.setItem(`tool_count_${toolId}`, String(newCount))
    } catch {
      console.error('Failed to save tool count')
    }
  }, [count, toolId])

  const reset = useCallback(() => {
    setCount(0)
    try {
      localStorage.removeItem(`tool_count_${toolId}`)
    } catch {
      console.error('Failed to remove tool count')
    }
  }, [toolId])

  return { count, increment, reset }
}

export default useToolCounter
