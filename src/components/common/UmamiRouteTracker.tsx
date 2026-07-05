import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getToolById } from '@/data/toolsFromJson'
import { umamiTrackEvent, umamiTrackPageView } from '@/utils/umami'

let lastTrackKey = ''
let lastTrackAt = 0

const UmamiRouteTracker: React.FC = () => {
  const location = useLocation()

  useEffect(() => {
    const url = `${location.pathname}${location.search}`
    const now = Date.now()
    const key = `pv:${url}`
    if (key === lastTrackKey && now - lastTrackAt < 800) return
    lastTrackKey = key
    lastTrackAt = now

    umamiTrackPageView(url, document.title)

    const toolMatch = location.pathname.match(/^\/tool\/([^/]+)$/)
    if (toolMatch) {
      const toolId = toolMatch[1]
      const tool = getToolById(toolId)
      umamiTrackEvent('tool_open', {
        toolId,
        category: tool?.category,
      })
      return
    }

    const categoryMatch = location.pathname.match(/^\/category\/([^/]+)$/)
    if (categoryMatch) {
      umamiTrackEvent('category_open', { categoryId: categoryMatch[1] })
      return
    }

    if (location.pathname === '/') {
      umamiTrackEvent('home_open')
      return
    }

    if (location.pathname === '/search') {
      const query = new URLSearchParams(location.search).get('q') || ''
      umamiTrackEvent('search_open', { qlen: query.length })
    }
  }, [location.pathname, location.search])

  return null
}

export default UmamiRouteTracker
