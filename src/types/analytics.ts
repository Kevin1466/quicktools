export enum AnalyticsEventType {
  PAGE_VIEW = 'page_view',
  TOOL_OPEN = 'tool_open',
  TOOL_ACTION = 'tool_action',
  TOOL_SUCCESS = 'tool_success',
  TOOL_ERROR = 'tool_error',
  TOOL_DOWNLOAD = 'tool_download',
  SEARCH = 'search',
  SEARCH_CLICK = 'search_click',
  CATEGORY_CLICK = 'category_click',
  SIDEBAR_CLICK = 'sidebar_click',
}

export interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  timestamp: number;
  sessionId: string;
  userId?: string;
  toolId?: string;
  categoryId?: string;
  metadata?: Record<string, unknown>;
}
