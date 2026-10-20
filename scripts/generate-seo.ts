import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { Route, Routes, StaticRouter } from 'react-router-dom'
import { categories, getCategoryById } from '../src/data/categories'
import Layout from '../src/components/layout/Layout'
import { AIConfigProvider } from '../src/contexts/AIConfigContext'
import { ExchangeProvider } from '../src/contexts/ExchangeContext'
import { FeedbackProvider } from '../src/contexts/FeedbackContext'
import CategoryPage from '../src/pages/category/CategoryPage'
import HomePage from '../src/pages/home/HomePage'
import SearchPage from '../src/pages/search/SearchPage'
import {
  getCategoryName,
  getToolById,
  getToolsByCategory,
  isToolIndexable,
  tools,
} from '../src/data/toolCatalogCore'
import {
  getSeoMetaForRoute,
  getSitemapRoutePaths,
  getStaticRoutePaths,
  parseToolIntroUsage,
  resolveSeoRoute,
} from '../src/seo/routeSeo'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const distDir = path.join(projectRoot, 'dist')
const siteUrl = process.env.SITE_URL || 'https://tools.blockth.ink'

const inlineStyle = `
  <style id="seo-prerender-style">
    #root[data-seo-static="1"]{min-height:100vh;background:#f6f8fb;color:#111827;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    #root[data-seo-static="1"] .seo-shell{max-width:1100px;margin:0 auto;padding:40px 20px 72px}
    #root[data-seo-static="1"] .seo-card{background:#fff;border:1px solid #e5e7eb;border-radius:20px;padding:28px;box-shadow:0 10px 30px rgba(15,23,42,.05)}
    #root[data-seo-static="1"] .seo-card + .seo-card{margin-top:20px}
    #root[data-seo-static="1"] .seo-breadcrumbs{font-size:14px;color:#6b7280;margin-bottom:18px}
    #root[data-seo-static="1"] .seo-breadcrumbs a{color:#315fdd;text-decoration:none}
    #root[data-seo-static="1"] h1{font-size:34px;line-height:1.2;margin:0 0 14px}
    #root[data-seo-static="1"] h2{font-size:22px;line-height:1.35;margin:0 0 14px}
    #root[data-seo-static="1"] p{font-size:16px;line-height:1.8;margin:0 0 12px}
    #root[data-seo-static="1"] ul,#root[data-seo-static="1"] ol{padding-left:20px;line-height:1.9}
    #root[data-seo-static="1"] li+li{margin-top:6px}
    #root[data-seo-static="1"] .seo-links{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px;padding:0;list-style:none}
    #root[data-seo-static="1"] .seo-links li{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:16px}
    #root[data-seo-static="1"] .seo-links a{color:#111827;text-decoration:none;font-weight:600}
    #root[data-seo-static="1"] .seo-links p{font-size:14px;color:#6b7280;margin:6px 0 0}
    #root[data-seo-static="1"] .seo-tag{display:inline-block;border-radius:999px;background:#eef4ff;color:#315fdd;padding:6px 12px;font-size:13px;margin-right:10px}
    #root[data-seo-static="1"] .seo-muted{color:#6b7280}
    #root[data-seo-static="1"] .seo-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}
  </style>
`

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const stripHtml = (value: string): string => value.replace(/<[^>]+>/g, '')

const escapeJsonForScript = (value: string): string =>
  value.replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')

const renderBreadcrumbs = (items: Array<{ href?: string; label: string }>): string => {
  const rendered = items
    .map(item =>
      item.href
        ? `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`
        : `<span>${escapeHtml(item.label)}</span>`,
    )
    .join(' / ')

  return `<nav class="seo-breadcrumbs">${rendered}</nav>`
}

const renderToolLinks = (toolItems: typeof tools, limit = 24): string => {
  const rendered = toolItems.slice(0, limit).map(tool => {
    const intro = parseToolIntroUsage(tool.toolIntroUsage || tool.description)
    const description = intro.intro || tool.description || `${tool.name}在线工具`

    return `
      <li>
        <a href="${escapeHtml(tool.route)}">${escapeHtml(tool.name)}</a>
        <p>${escapeHtml(description.slice(0, 90))}</p>
      </li>
    `
  })

  return `<ul class="seo-links">${rendered.join('')}</ul>`
}

const renderHomeContent = (): string => {
  const doneTools = tools.filter(isToolIndexable)
  const hotTools = tools.filter(tool => tool.isHot).slice(0, 12)
  const categoryCards = categories
    .filter(category => category.id !== 'all')
    .map(category => {
      const categoryTools = getToolsByCategory(category.id)
      const doneCount = categoryTools.filter(isToolIndexable).length
      return `
        <li>
          <a href="/category/${escapeHtml(category.id)}">${escapeHtml(category.name)}</a>
          <p>${escapeHtml(category.description || '')}</p>
          <p class="seo-muted">共 ${categoryTools.length} 个工具，${doneCount} 个已可在线使用</p>
        </li>
      `
    })
    .join('')

  return `
    <main class="seo-shell">
      <section class="seo-card">
        <h1>百宝箱在线工具箱</h1>
        <p>百宝箱收录了图片处理、PDF 转换、文本处理、开发调试、教育学习等常用在线工具。当前共有 ${tools.length} 个工具页面，其中 ${doneTools.length} 个工具已可直接在线使用，适合日常办公、学习和内容创作场景。</p>
        <p>你可以通过分类浏览，也可以直接进入具体工具页查看使用方法、适用场景和相关推荐工具。</p>
      </section>

      <section class="seo-card">
        <h2>热门工具</h2>
        ${renderToolLinks(hotTools, 12)}
      </section>

      <section class="seo-card">
        <h2>工具分类导航</h2>
        <ul class="seo-links">${categoryCards}</ul>
      </section>
    </main>
  `
}

const renderCategoryContent = (categoryId: string): string => {
  const category = getCategoryById(categoryId)
  if (!category) {
    return renderNotFoundContent('/category/' + categoryId)
  }

  const categoryTools = getToolsByCategory(category.id)
  const doneTools = categoryTools.filter(isToolIndexable)

  return `
    <main class="seo-shell">
      <section class="seo-card">
        ${renderBreadcrumbs([
          { href: '/', label: '首页' },
          { label: category.name },
        ])}
        <h1>${escapeHtml(category.name)}</h1>
        <p>${escapeHtml(category.description || `${category.name}相关在线工具合集`)}</p>
        <p>当前频道共收录 ${categoryTools.length} 个工具，其中 ${doneTools.length} 个工具已可直接在线使用。你可以先从高频需求工具开始，也可以浏览完整列表选择适合自己的处理方式。</p>
      </section>

      <section class="seo-card">
        <h2>${escapeHtml(category.name)}工具列表</h2>
        ${renderToolLinks(categoryTools, 60)}
      </section>
    </main>
  `
}

const renderToolContent = (toolId: string): string => {
  const tool = getToolById(toolId)
  if (!tool) {
    return renderNotFoundContent('/tool/' + toolId)
  }

  const intro = parseToolIntroUsage(tool.toolIntroUsage || tool.description)
  const relatedTools = getToolsByCategory(tool.category).filter(item => item.id !== tool.id).slice(0, 8)
  const statusText =
    tool.status === 'done' ? '已上线，可直接在线使用' : tool.status === 'doing' ? '开发中' : '未上线'

  return `
    <main class="seo-shell">
      <section class="seo-card">
        ${renderBreadcrumbs([
          { href: '/', label: '首页' },
          { href: `/category/${tool.category}`, label: getCategoryName(tool.category) },
          { label: tool.name },
        ])}
        <span class="seo-tag">${escapeHtml(statusText)}</span>
        <h1>${escapeHtml(tool.name)}</h1>
        <p>${escapeHtml(intro.intro || tool.description || `${tool.name}在线工具`)}</p>
      </section>

      ${
        intro.steps.length > 0
          ? `
      <section class="seo-card">
        <h2>使用方法</h2>
        <ol>
          ${intro.steps.map(step => `<li>${escapeHtml(step)}</li>`).join('')}
        </ol>
      </section>
      `
          : ''
      }

      ${
        relatedTools.length > 0
          ? `
      <section class="seo-card">
        <h2>相关工具推荐</h2>
        ${renderToolLinks(relatedTools, 8)}
      </section>
      `
          : ''
      }
    </main>
  `
}

const renderSearchContent = (): string => `
  <main class="seo-shell">
    <section class="seo-card">
      ${renderBreadcrumbs([
        { href: '/', label: '首页' },
        { label: '搜索' },
      ])}
      <h1>搜索工具</h1>
      <p>你可以在站内通过关键词搜索图片、PDF、文本、开发、教育等不同类型的在线工具。搜索结果页不参与索引，但仍然可以帮助用户快速定位目标工具。</p>
    </section>
  </main>
`

const renderNotFoundContent = (pathname: string): string => `
  <main class="seo-shell">
    <section class="seo-card">
      ${renderBreadcrumbs([
        { href: '/', label: '首页' },
        { label: '404' },
      ])}
      <h1>页面不存在</h1>
      <p>未找到路径 ${escapeHtml(pathname)} 对应的内容。请返回首页重新浏览工具分类或搜索目标工具。</p>
      <p><a href="/">返回首页</a></p>
    </section>
  </main>
`

const shouldUseReactSsr = (pathname: string): boolean => {
  const route = resolveSeoRoute(pathname)
  return route.kind !== 'tool'
}

const SsrNotFoundPage = () =>
  createElement(
    'div',
    { className: 'flex flex-col items-center justify-center min-h-[60vh]' },
    createElement('h1', { className: 'text-4xl font-bold text-gray-800 mb-4' }, '404'),
    createElement('p', { className: 'text-gray-600 mb-8' }, '页面不存在'),
    createElement(
      'a',
      {
        href: '/',
        className: 'px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition',
      },
      '返回首页',
    ),
  )

const SsrApp = () =>
  createElement(
    AIConfigProvider,
    null,
    createElement(
      FeedbackProvider,
      null,
      createElement(
        ExchangeProvider,
        null,
        createElement(
          Layout,
          null,
          createElement(
            Routes,
            null,
            createElement(Route, { path: '/', element: createElement(HomePage) }),
            createElement(Route, {
              path: '/category/:categoryId',
              element: createElement(CategoryPage),
            }),
            createElement(Route, { path: '/search', element: createElement(SearchPage) }),
            createElement(Route, { path: '*', element: createElement(SsrNotFoundPage) }),
          ),
        ),
      ),
    ),
  )

const renderReactApp = (pathname: string): string =>
  renderToString(
    createElement(
      StaticRouter,
      { location: pathname },
      createElement(SsrApp),
    ),
  )

const buildContentForRoute = (pathname: string): string => {
  const route = resolveSeoRoute(pathname)

  switch (route.kind) {
    case 'home':
      return renderHomeContent()
    case 'search':
      return renderSearchContent()
    case 'category':
      return renderCategoryContent(route.categoryId)
    case 'tool':
      return renderToolContent(route.toolId)
    case 'not-found':
      return renderNotFoundContent(pathname)
  }
}

const renderHtml = (template: string, pathname: string): string => {
  const meta = getSeoMetaForRoute(pathname, '', siteUrl)
  const useReactSsr = shouldUseReactSsr(pathname)
  const content = useReactSsr ? renderReactApp(pathname) : buildContentForRoute(pathname)
  const jsonLd = escapeJsonForScript(JSON.stringify(meta.structuredData))
  const rootAttributes = useReactSsr ? ' id="root" data-react-ssr="1"' : ' id="root" data-seo-static="1"'

  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`)
    .replace(
      /<meta name="description" content="[\s\S]*?"\s*\/?>/,
      `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    )
    .replace(
      /<meta name="keywords" content="[\s\S]*?"\s*\/?>/,
      `<meta name="keywords" content="${escapeHtml(meta.keywords)}" />`,
    )
    .replace('<div id="root"></div>', `<div${rootAttributes}>${content}</div>`)

  html = html.replace(
    '</head>',
    `
    <meta name="robots" content="${escapeHtml(meta.robots)}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="zh_CN" />
    <meta property="og:site_name" content="百宝箱" />
    <meta property="og:title" content="${escapeHtml(meta.title)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:url" content="${escapeHtml(meta.canonical)}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
    <link rel="canonical" href="${escapeHtml(meta.canonical)}" />
    ${inlineStyle}
    <script id="seo-json-ld" type="application/ld+json">${jsonLd}</script>
  </head>`,
  )

  return html
}

const writeRouteHtml = (pathname: string, template: string) => {
  const outputPath =
    pathname === '/'
      ? path.join(distDir, 'index.html')
      : path.join(distDir, pathname.replace(/^\/+/, ''), 'index.html')

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, renderHtml(template, pathname), 'utf8')
}

const buildSitemap = () => {
  const routes = getSitemapRoutePaths()
  const lines = routes.map(route => {
    const loc = new URL(route, siteUrl).toString()
    return `  <url><loc>${escapeHtml(loc)}</loc></url>`
  })

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${lines.join('\n')}\n</urlset>\n`
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8')
}

const buildRobots = () => {
  const content = `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /search\n\nSitemap: ${new URL('/sitemap.xml', siteUrl).toString()}\n`
  fs.writeFileSync(path.join(distDir, 'robots.txt'), content, 'utf8')
}

const build404Page = (template: string) => {
  const html = renderHtml(template, '/404')
  fs.writeFileSync(path.join(distDir, '404.html'), html, 'utf8')
}

const main = () => {
  if (!fs.existsSync(distDir)) {
    throw new Error(`dist 目录不存在: ${distDir}`)
  }

  const templatePath = path.join(distDir, 'index.html')
  const template = fs.readFileSync(templatePath, 'utf8')

  getStaticRoutePaths().forEach(route => {
    writeRouteHtml(route, template)
  })

  buildSitemap()
  buildRobots()
  build404Page(template)

  const summary = {
    routes: getStaticRoutePaths().length,
    sitemapEntries: getSitemapRoutePaths().length,
    output: distDir,
  }

  console.log(stripHtml(JSON.stringify(summary)))
}

main()
