import { createContext, useContext, ReactNode } from 'react'
import { analytics } from '@/utils/analytics'
import { AnalyticsEventType } from '@/types'

interface AnalyticsContextType {
  trackEvent: typeof analytics.trackEvent
  trackPageView: typeof analytics.trackPageView
  trackToolOpen: typeof analytics.trackToolOpen
  trackToolAction: typeof analytics.trackToolAction
  trackToolSuccess: typeof analytics.trackToolSuccess
  trackToolError: typeof analytics.trackToolError
  trackSearch: typeof analytics.trackSearch
  trackSearchClick: typeof analytics.trackSearchClick
  trackCategoryClick: typeof analytics.trackCategoryClick
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

interface AnalyticsProviderProps {
  children: ReactNode
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const value: AnalyticsContextType = {
    trackEvent: analytics.trackEvent,
    trackPageView: analytics.trackPageView,
    trackToolOpen: analytics.trackToolOpen,
    trackToolAction: analytics.trackToolAction,
    trackToolSuccess: analytics.trackToolSuccess,
    trackToolError: analytics.trackToolError,
    trackSearch: analytics.trackSearch,
    trackSearchClick: analytics.trackSearchClick,
    trackCategoryClick: analytics.trackCategoryClick
  }

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export const useAnalyticsContext = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider')
  }
  return context
}

export { AnalyticsContext }
