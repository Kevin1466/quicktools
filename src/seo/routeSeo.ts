import { categories, getCategoryById } from '../data/categories'
import {
  getCategoryName,
  getToolById,
  getToolsByCategory,
  isToolIndexable,
  tools,
} from '../data/toolCatalogCore'

const DEFAULT_SITE_URL = 'https://tools.blockth.ink'
const SITE_NAME = '百宝箱'

export interface ParsedToolIntro {
  intro: string
  steps: string[]
}

export interface SeoMeta {
  title: string
  description: string
  keywords: string
  canonical: string
  robots: string
  structuredData: object[]
}

export type SeoRoute =
  | { kind: 'home'; pathname: '/' }
  | { kind: 'search'; pathname: '/search'; query: string }
  | { kind: 'category'; pathname: string; categoryId: string }
  | { kind: 'tool'; pathname: string; toolId: string }
  | { kind: 'not-found'; pathname: string }

const toAbsoluteUrl = (pathname: string, origin?: string): string => {
  const base = (origin && origin.trim()) || DEFAULT_SITE_URL
  return new URL(pathname, base).toString()
}

export const parseToolIntroUsage = (text?: string): ParsedToolIntro => {
  if (!text) {
    return { intro: '', steps: [] }
  }

  const introEndIndex = text.indexOf('1、')
  if (introEndIndex === -1) {
    return { intro: text.trim(), steps: [] }
  }

  const intro = text.slice(0, introEndIndex).trim()
  const stepsText = text.slice(introEndIndex)
  const stepRegex = /(\d+)[、\.](.+?)(?=\d+[、\.]|$)/gs
  const steps: string[] = []
  let match: RegExpExecArray | null

  while ((match = stepRegex.exec(stepsText)) !== null) {
    steps.push(match[2].trim())
  }

  return { intro, steps }
}

const trimDescription = (text: string, maxLength = 120): string => {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) {
    return normalized
  }
  return `${normalized.slice(0, maxLength - 1)}…`
}

const buildBreadcrumbs = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
})

const normalizePathname = (pathname: string): string => {
  if (!pathname || pathname === '/') {
    return '/'
  }

  const normalized = pathname.replace(/\/+$/, '')
  return normalized || '/'
}

export const resolveSeoRoute = (pathname: string, search = ''): SeoRoute => {
  const normalizedPathname = normalizePathname(pathname)

  if (normalizedPathname === '/') {
    return { kind: 'home', pathname: '/' }
  }

  if (normalizedPathname === '/search') {
    const params = new URLSearchParams(search)
    return {
      kind: 'search',
      pathname: '/search',
      query: params.get('q')?.trim() || '',
    }
  }

  if (normalizedPathname.startsWith('/category/')) {
    return {
      kind: 'category',
      pathname: normalizedPathname,
      categoryId: normalizedPathname.slice('/category/'.length),
    }
  }

  if (normalizedPathname.startsWith('/tool/')) {
    return {
      kind: 'tool',
      pathname: normalizedPathname,
      toolId: normalizedPathname.slice('/tool/'.length),
    }
  }

  return { kind: 'not-found', pathname: normalizedPathname }
}

export const getSeoMetaForRoute = (
  pathname: string,
  search = '',
  origin?: string,
): SeoMeta => {
  const route = resolveSeoRoute(pathname, search)

  if (route.kind === 'home') {
    const categoryCount = categories.filter(category => category.id !== 'all').length
    const description = `百宝箱提供 ${tools.length} 款在线工具，覆盖图片处理、PDF 转换、文本处理、开发调试、教育学习等 ${categoryCount} 大类场景，无需下载即可在线使用。`
    const canonical = toAbsoluteUrl(route.pathname, origin)

    return {
      title: `${SITE_NAME} - 在线实用工具箱`,
      description,
      keywords: '在线工具,在线工具箱,图片处理,PDF转换,文本工具,开发工具,教育工具',
      canonical,
      robots: 'index,follow',
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: canonical,
          inLanguage: 'zh-CN',
          potentialAction: {
            '@type': 'SearchAction',
            target: `${toAbsoluteUrl('/search', origin)}?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        },
      ],
    }
  }

  if (route.kind === 'search') {
    const description = route.query
      ? `搜索“${route.query}”相关的在线工具结果页。`
      : '按关键词快速查找百宝箱中的在线工具。'

    return {
      title: route.query ? `搜索“${route.query}”的结果 | ${SITE_NAME}` : `搜索工具 | ${SITE_NAME}`,
      description,
      keywords: '工具搜索,在线工具搜索',
      canonical: toAbsoluteUrl(route.pathname, origin),
      robots: 'noindex,nofollow',
      structuredData: [],
    }
  }

  if (route.kind === 'category') {
    const category = getCategoryById(route.categoryId)

    if (!category) {
      return {
        title: `页面不存在 | ${SITE_NAME}`,
        description: '你访问的页面不存在或已下线。',
        keywords: '404,页面不存在',
        canonical: toAbsoluteUrl(route.pathname, origin),
        robots: 'noindex,nofollow',
        structuredData: [],
      }
    }

    const categoryTools = getToolsByCategory(category.id)
    const doneCount = categoryTools.filter(isToolIndexable).length
    const description = `${category.name}频道收录 ${categoryTools.length} 款在线工具，其中 ${doneCount} 款可直接在线使用，覆盖${category.description || `${category.name}相关场景`}。`
    const canonical = toAbsoluteUrl(route.pathname, origin)
    const shouldIndex = category.id !== 'all'

    return {
      title: `${category.name} - 在线${category.name}合集 | ${SITE_NAME}`,
      description,
      keywords: `${category.name},${getCategoryName(category.id)},在线${category.name},${category.description || category.name}`,
      canonical,
      robots: shouldIndex ? 'index,follow' : 'noindex,follow',
      structuredData: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: category.name,
          description,
          url: canonical,
          inLanguage: 'zh-CN',
        },
        buildBreadcrumbs([
          { name: SITE_NAME, url: toAbsoluteUrl('/', origin) },
          { name: category.name, url: canonical },
        ]),
      ],
    }
  }

  if (route.kind === 'tool') {
    const tool = getToolById(route.toolId)

    if (!tool) {
      return {
        title: `页面不存在 | ${SITE_NAME}`,
        description: '你访问的工具页不存在或已下线。',
        keywords: '404,工具不存在',
        canonical: toAbsoluteUrl(route.pathname, origin),
        robots: 'noindex,nofollow',
        structuredData: [],
      }
    }

    const categoryName = getCategoryName(tool.category)
    const intro = parseToolIntroUsage(tool.toolIntroUsage || tool.description)
    const description = trimDescription(
      intro.intro || tool.description || `${tool.name}是一款在线${categoryName}，支持浏览器中直接使用。`,
      118,
    )
    const canonical = toAbsoluteUrl(tool.route, origin)
    const shouldIndex = isToolIndexable(tool)
    const breadcrumbs = buildBreadcrumbs([
      { name: SITE_NAME, url: toAbsoluteUrl('/', origin) },
      { name: categoryName, url: toAbsoluteUrl(`/category/${tool.category}`, origin) },
      { name: tool.name, url: canonical },
    ])

    const howToSteps = intro.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: `步骤 ${index + 1}`,
      text: step,
    }))

    const structuredData: object[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: tool.name,
        applicationCategory: categoryName,
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'CNY',
        },
        description,
        url: canonical,
        inLanguage: 'zh-CN',
      },
      breadcrumbs,
    ]

    if (howToSteps.length > 0) {
      structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: `${tool.name}使用方法`,
        step: howToSteps,
      })
    }

    return {
      title: `${tool.name} - 在线${categoryName} | ${SITE_NAME}`,
      description,
      keywords: `${tool.name},${categoryName},在线工具,${tool.name}在线使用`,
      canonical,
      robots: shouldIndex ? 'index,follow' : 'noindex,follow',
      structuredData,
    }
  }

  return {
    title: `页面不存在 | ${SITE_NAME}`,
    description: '你访问的页面不存在或已下线。',
    keywords: '404,页面不存在',
    canonical: toAbsoluteUrl(route.pathname, origin),
    robots: 'noindex,nofollow',
    structuredData: [],
  }
}

export const getStaticRoutePaths = (): string[] => {
  const categoryPaths = categories.map(category => `/category/${category.id}`)
  const toolPaths = tools.map(tool => tool.route)
  return Array.from(new Set(['/', '/search', ...categoryPaths, ...toolPaths]))
}

export const getSitemapRoutePaths = (): string[] => {
  const categoryPaths = categories
    .filter(category => category.id !== 'all')
    .map(category => `/category/${category.id}`)

  const toolPaths = tools
    .filter(isToolIndexable)
    .map(tool => tool.route)

  return Array.from(new Set(['/', ...categoryPaths, ...toolPaths]))
}
