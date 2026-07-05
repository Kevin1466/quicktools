import { useState, useEffect, useCallback } from 'react'

export const useDebounce = <T>(value: T, delay: number = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export const useDebouncedCallback = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 300
) => {
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null)

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      const id = setTimeout(() => {
        callback(...args)
      }, delay)
      setTimeoutId(id)
    },
    [callback, delay, timeoutId]
  )

  return debouncedCallback
}

export default useDebounce
