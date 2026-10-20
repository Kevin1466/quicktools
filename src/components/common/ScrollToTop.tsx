import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

const ScrollToTop = () => {
  const location = useLocation()

  useLayoutEffect(() => {
    if (location.hash) {
      return
    }

    window.scrollTo(0, 0)
  }, [location.pathname, location.search, location.hash])

  return null
}

export default ScrollToTop
