import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface FeedbackContextType {
  isOpen: boolean
  openFeedback: () => void
  closeFeedback: () => void
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined)

export const FeedbackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)

  const openFeedback = useCallback(() => setIsOpen(true), [])
  const closeFeedback = useCallback(() => setIsOpen(false), [])

  return (
    <FeedbackContext.Provider value={{ isOpen, openFeedback, closeFeedback }}>
      {children}
    </FeedbackContext.Provider>
  )
}

export const useFeedbackContext = () => {
  const ctx = useContext(FeedbackContext)
  if (!ctx) {
    throw new Error('useFeedbackContext 必须在 FeedbackProvider 内部使用')
  }
  return ctx
}
