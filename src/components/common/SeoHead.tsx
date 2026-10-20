import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getSeoMetaForRoute } from '../../seo/routeSeo'

const ensureMeta = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value)
  })

  return element
}

const ensureLink = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector<HTMLLinkElement>(selector)
  if (!element) {
    element = document.createElement('link')
    document.head.appendChild(element)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value)
  })

  return element
}

const ensureJsonLdScript = (id: string) => {
  let element = document.head.querySelector<HTMLScriptElement>(`script#${id}`)
  if (!element) {
    element = document.createElement('script')
    element.type = 'application/ld+json'
    element.id = id
    document.head.appendChild(element)
  }
  return element
}

const SeoHead = () => {
  const location = useLocation()

  useEffect(() => {
    const meta = getSeoMetaForRoute(location.pathname, location.search, window.location.origin)

    document.title = meta.title

    ensureMeta('meta[name="description"]', { name: 'description', content: meta.description })
    ensureMeta('meta[name="keywords"]', { name: 'keywords', content: meta.keywords })
    ensureMeta('meta[name="robots"]', { name: 'robots', content: meta.robots })
    ensureMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    ensureMeta('meta[property="og:locale"]', { property: 'og:locale', content: 'zh_CN' })
    ensureMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: '百宝箱' })
    ensureMeta('meta[property="og:title"]', { property: 'og:title', content: meta.title })
    ensureMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: meta.description,
    })
    ensureMeta('meta[property="og:url"]', { property: 'og:url', content: meta.canonical })
    ensureMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary' })
    ensureMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: meta.title })
    ensureMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: meta.description,
    })
    ensureLink('link[rel="canonical"]', { rel: 'canonical', href: meta.canonical })

    const jsonLd = ensureJsonLdScript('seo-json-ld')
    jsonLd.textContent = JSON.stringify(meta.structuredData)
  }, [location.pathname, location.search])

  return null
}

export default SeoHead
