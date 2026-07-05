import { AnalyticsEventType, AnalyticsEvent } from '@/types'

export const analyticsService = {
  trackEvent: (eventType: AnalyticsEventType, metadata?: Record<string, unknown>) => {
    const event: AnalyticsEvent = {
      eventType,
      timestamp: Date.now(),
      sessionId: getOrCreateSessionId(),
      userId: getOrCreateUserId(),
      metadata
    }

    console.log('Analytics Event:', event)
    
    try {
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]')
      events.push(event)
      localStorage.setItem('analytics_events', JSON.stringify(events.slice(-1000)))
    } catch (e) {
      console.error('Failed to store analytics event:', e)
    }
  },

  trackPageView: (page: string) => {
    analyticsService.trackEvent(AnalyticsEventType.PAGE_VIEW, { page })
  },

  trackToolOpen: (toolId: string) => {
    analyticsService.trackEvent(AnalyticsEventType.TOOL_OPEN, { toolId })
  },

  trackToolAction: (toolId: string, action: string) => {
    analyticsService.trackEvent(AnalyticsEventType.TOOL_ACTION, { toolId, action })
  },

  trackToolSuccess: (toolId: string) => {
    analyticsService.trackEvent(AnalyticsEventType.TOOL_SUCCESS, { toolId })
  },

  trackToolError: (toolId: string, error: string) => {
    analyticsService.trackEvent(AnalyticsEventType.TOOL_ERROR, { toolId, error })
  },

  trackSearch: (query: string) => {
    analyticsService.trackEvent(AnalyticsEventType.SEARCH, { query })
  },

  trackSearchClick: (query: string, toolId: string) => {
    analyticsService.trackEvent(AnalyticsEventType.SEARCH_CLICK, { query, toolId })
  },

  trackCategoryClick: (categoryId: string) => {
    analyticsService.trackEvent(AnalyticsEventType.CATEGORY_CLICK, { categoryId })
  },

  getStoredEvents: (): AnalyticsEvent[] => {
    try {
      return JSON.parse(localStorage.getItem('analytics_events') || '[]')
    } catch {
      return []
    }
  },

  clearStoredEvents: () => {
    localStorage.removeItem('analytics_events')
  },

  getSessionStats: () => {
    const events = analyticsService.getStoredEvents()
    const pageViews = events.filter(e => e.eventType === AnalyticsEventType.PAGE_VIEW).length
    const toolOpens = events.filter(e => e.eventType === AnalyticsEventType.TOOL_OPEN).length
    const searches = events.filter(e => e.eventType === AnalyticsEventType.SEARCH).length
    
    return {
      totalEvents: events.length,
      pageViews,
      toolOpens,
      searches
    }
  }
}

const getOrCreateSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    sessionStorage.setItem('analytics_session_id', sessionId)
  }
  return sessionId
}

const getOrCreateUserId = (): string => {
  let userId = localStorage.getItem('analytics_user_id')
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem('analytics_user_id', userId)
  }
  return userId
}

export default analyticsService
