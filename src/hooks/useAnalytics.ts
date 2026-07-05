import { useCallback } from 'react'
import { AnalyticsEventType, AnalyticsEvent } from '@/types'

const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

const getSessionId = (): string => {
  let sessionId = localStorage.getItem('analytics_session_id')
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem('analytics_session_id', sessionId)
  }
  return sessionId
}

const getUserId = (): string => {
  let userId = localStorage.getItem('analytics_user_id')
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    localStorage.setItem('analytics_user_id', userId)
  }
  return userId
}

export const useAnalytics = () => {
  const trackEvent = useCallback((eventType: AnalyticsEventType, metadata?: Record<string, unknown>) => {
    const event: AnalyticsEvent = {
      eventType,
      timestamp: Date.now(),
      sessionId: getSessionId(),
      userId: getUserId(),
      metadata
    }

    console.log('Track event:', event)
    localStorage.setItem(`event_${event.timestamp}`, JSON.stringify(event))
  }, [])

  const trackPageView = useCallback((page: string) => {
    trackEvent(AnalyticsEventType.PAGE_VIEW, { page })
  }, [trackEvent])

  const trackToolOpen = useCallback((toolId: string) => {
    trackEvent(AnalyticsEventType.TOOL_OPEN, { toolId })
  }, [trackEvent])

  const trackToolAction = useCallback((toolId: string, action: string) => {
    trackEvent(AnalyticsEventType.TOOL_ACTION, { toolId, action })
  }, [trackEvent])

  const trackSearch = useCallback((query: string) => {
    trackEvent(AnalyticsEventType.SEARCH, { query })
  }, [trackEvent])

  const trackSearchClick = useCallback((query: string, toolId: string) => {
    trackEvent(AnalyticsEventType.SEARCH_CLICK, { query, toolId })
  }, [trackEvent])

  const trackCategoryClick = useCallback((categoryId: string) => {
    trackEvent(AnalyticsEventType.CATEGORY_CLICK, { categoryId })
  }, [trackEvent])

  return {
    trackEvent,
    trackPageView,
    trackToolOpen,
    trackToolAction,
    trackSearch,
    trackSearchClick,
    trackCategoryClick
  }
}

export default useAnalytics
