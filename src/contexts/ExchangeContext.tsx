import { createContext, useCallback, useContext, useState } from 'react'

interface ExchangeContextValue {
  isOpen: boolean
  openExchange: () => void
  closeExchange: () => void
}

const ExchangeContext = createContext<ExchangeContextValue | undefined>(undefined)

export const ExchangeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)

  const openExchange = useCallback(() => setIsOpen(true), [])
  const closeExchange = useCallback(() => setIsOpen(false), [])

  return (
    <ExchangeContext.Provider value={{ isOpen, openExchange, closeExchange }}>
      {children}
    </ExchangeContext.Provider>
  )
}

export const useExchangeContext = () => {
  const ctx = useContext(ExchangeContext)
  if (!ctx) {
    throw new Error('useExchangeContext 必须在 ExchangeProvider 内部使用')
  }
  return ctx
}

