import type { Tool, TagType } from '../types/tool'
import rawTools from '../../sources/tools.json'

const tagMapping: Record<string, TagType> = {
  hot: 'hot',
  new: 'new',
  权益卡: 'vip',
  权益: 'vip',
  限免: 'free',
  vip: 'vip',
  free: 'free',
}

const idMapping: Record<string, string> = {
  tupianyasuo: 'image-compress',
  'pdf-2-word': 'pdf-to-word',
  garbage: 'garbage-sort',
  ocr: 'img-2-text',
  handwriting_erasure: 'handwriting-erasure',
}

const nameMapping: Record<string, string> = {
  'pdf-2-word': 'PDF转Word',
  'pdf-2-excel': 'PDF转Excel',
  'pdf-2-html': 'PDF转HTML',
  'pdf-2-ppt': 'PDF转PPT',
  'word-2-pdf': 'Word转PDF',
  'excel-to-pdf': 'Excel转PDF',
  'ppt-2-pdf': 'PPT转PDF',
  'pdf-2-png': 'PDF转图片',
  'img-2-pdf-convert': '图片转PDF',
  'yaml-2-json': 'YAML与JSON互转',
  jsonbeautify: 'JSON格式化',
  jsondiff: 'JSON对比',
  jsoncheck: 'JSON校验',
  md5: 'MD5加密',
  base64: 'Base64编解码',
  urlencode: 'URL编解码',
  unicode: 'Unicode编解码',
  urlparse: 'URL解析',
  useragent: 'UserAgent解析',
  uuid: 'UUID生成',
  regexp: '正则校验',
  markdown: 'Markdown编辑器',
  pwdgenerator: '随机密码生成',
  'screen-record': '在线录屏',
  'video-2-gif': '视频转GIF',
  crypto: '在线加解密',
  compilation: 'Hello World 代码生成',
  tts: '文本转语音',
  'handwriting-erasure': '去手写',
}

const implementedToolIds = new Set([
  'image-compress',
  'tupianyasuo',
  'id_photo',
  'imgconvert',
  'img9grid',
  'qrcode',
  'prettify-qrcode',
  'qrcode-scan',
  'visit-card',
  'gifsplitter',
  'gifcreate',
  'biaoqing',
  'img-edit-canvas',
  'avatar-pendant',
  'img_2_text',
  'img-fade',
  'img-pixel',
  'img-enlarge',
  'image-secret-msg',
  'img-pic-beauty',
  'img-human-split',
  'img-painting-filter',
  'img-module-face-stylize',
  'img-face-anime',
  'img-ai-cartoon',
  'img-ai-watercolor',
  'img-ai-jordanstyle',
  'img-anime-filter',
  'face-gender-transformation',
  'face-age-transformation',
  'image-enhance',
  'img-fix',
  'doc-wrap',
  'identification',
  'bankcard-ocr',
  'basic-ocr',
  'handwriting-ocr',
  'ocr-advertise',
  'ocr-english',
  'passport-ocr',
  'waybill',
  'container-ocr',
  'carcard-ocr',
  'ocr-bizLicense',
  'ocr-businesscard',
  'ocr-permit',
  'bankslip-ocr',
  'ocr-dutypaidproof',
  'ocr-recognize-medical-invoice',
  'onlinetaxi-ocr',
  'invoice-extract',
  'pdf-watermark',
  'pdf-to-word',
  'pdf-2-excel',
  'pdf-2-html',
  'pdf-2-png',
  'pdf-2-ppt',
  'pdf-compress',
  'img-2-pdf-convert',
  'pdf-split',
  'pdf-merge',
  'pdf-sign',
  'pdf-page-manage',
  'pdf-page-number',
  'pdf-metadata',
  'pdf-img-extract',
  'pdf-password',
  'pdf-crop',
  'pdf-pagesize',
  'pdf-imagefy',
  'garbage-sort',
  'chinese',
  'toMars',
  'unique',
  'text-secret-msg',
  'textdiff',
  'tta',
  'tts',
  'hexconvert',
  'timestamp',
  'temperaturetrans',
  'lengthconvert',
  'byte-cal',
  'num2zh',
  'bmi',
  'datecal',
  'calculator',
  'partition',
  'invest',
  'mortgage',
  'wuxianyijin',
  'imgconvert',
  'img-enlarge',
  'img-fade',
  'img-pixel',
  'img9grid',
  'qrcode-scan',
  'qrcode',
  'prettify-qrcode',
  'visit-card',
  'biaoqing',
  'gifsplitter',
  'gifcreate',
  'img-edit-canvas',
  'avatar-pendant',
  'qbtool-license',
  'regexp',
  'colortrans',
  'pwdgenerator',
  'wordcount',
  'periodic',
  'dynasties',
  'capital',
  'allegory',
  'jielong',
  'zitie-new',
  'school',
  'radical',
  'explain',
  'chengyujielong',
  'markmap',
  'relatives-name',
  'hanzifayin',
  'translate',
  'relatives',
  'chengyu',
  'xiehouyu',
  'whattoeat',
  'screen-record',
  'jsoncheck',
  'jsonbeautify',
  'urlparse',
  'urlencode',
  'base64',
  'unicode',
  'uuid',
  'useragent',
  'md5',
  'crypto',
  'markdown',
  'yaml-2-json',
  'jsondiff',
  'password-check',
  'compilation',
  'regexp',
  'colortrans',
  'pwdgenerator',
  'random',
  'led',
  'emoji',
  'shelflife',
  'bloodtype',
  'whattoeat',
  'random',
  'makename',
  'poetry',
  'nickname',
  'garbage-sort',
  'carnumber',
  'timer',
  'number-acquisition',
  'nick',
  'fakeword',
  'startupname',
  'contract-comparison',
  'zipcode',
  'phonenumber',
  'iplocation',
  'makename',
  'hospitalrecommend',
  'naming',
  'calories',
  'calories_list',
  'food_calories',
  'kuaidi',
  'image-secret-msg',
  'img-2-text',
  'identification',
  'bankcard-ocr',
  'basic-ocr',
  'handwriting-ocr',
  'ocr-advertise',
  'ocr-english',
  'passport-ocr',
  'waybill',
  'container-ocr',
  'carcard-ocr',
  'ocr-bizLicense',
  'ocr-businesscard',
  'ocr-permit',
  'bankslip-ocr',
  'ocr-dutypaidproof',
  'ocr-recognize-medical-invoice',
  'onlinetaxi-ocr',
  'invoice-extract',
  'id-photo',
  'img-2-pdf-convert',
  'pdf-merge',
  'pdf-split',
  'pdf-page-manage',
  'pdf-page-number',
  'pdf-metadata',
  'pdf-2-png',
  'pdf-imagefy',
  'pdf-compress',
  'pdf-crop',
  'pdf-sign',
  'pdf-pagesize',
  'pdf-img-extract',
  'pdf-search',
  'word-2-pdf',
  'word-convert',
  'ppt-convert',
  'excel-to-pdf',
  'office-reduce',
  'ppt-2-pdf',
  'excel-convert',
  'table-recognize',
  'word-scan',
])

const forceImplementedToolIds = new Set([
  'contract-verification',
  'calories-list',
])

const removedToolIds = new Set([
  'sogou-box',
  'calories',
  'food-calories',
  'video-2-gif',
  'handwriting-erasure',
  'file-scan',
  'app-inspector',
  'face-age-transformation',
  'face-gender-transformation',
  'img-anime-filter',
  'img-face-anime',
  'img-module-face-stylize',
  'img-painting-filter',
  'img-human-split',
  'img-pic-beauty',
  'doc-wrap',
  'img-fix',
  'image-enhance',
  'img-ai-cartoon',
  'img-ai-face',
  'img-ai-jordanstyle',
  'img-ai-watercolor',
])

interface RawTool {
  id: string
  name: string
  tool_intro_usage: string
  tags: string[]
  logo_url: string
  logo_local_path: string
  detail_page_url: string
  category: string
  crawled_at: string
  status: string
}

export const categoryNames: Record<string, string> = {
  img: '图片工具',
  pdf: 'PDF转换工具',
  doc: '文档转换工具',
  life: '生活娱乐工具',
  develop: '开发工具',
  education: '教育工具',
  text: '文本工具',
  data: '数据换算工具',
  video: '视频工具',
  pc_plugin: '浏览器插件',
}

const needsExternalService = (rawTool: RawTool, toolId: string): boolean => {
  if (['pdf', 'doc', 'video'].includes(rawTool.category)) return true
  if (rawTool.id.includes('ocr') || rawTool.name.includes('识别')) return true
  if (rawTool.name.includes('抠图') || rawTool.name.includes('动漫') || rawTool.name.includes('滤镜')) return true
  if (rawTool.name.includes('房贷') || rawTool.name.includes('五险') || rawTool.name.includes('投资')) return true
  if (['mortgage', 'wuxianyijin', 'invest'].includes(toolId)) return true
  if (toolId.includes('ocr')) return true
  return false
}

const mapTags = (tags: string[]): TagType[] =>
  tags
    .map(tag => tagMapping[tag])
    .filter((tag): tag is TagType => tag !== undefined)

const convertTool = (rawTool: RawTool): Tool => {
  const mappedTags = mapTags(rawTool.tags || [])
  const hasHotTag = mappedTags.includes('hot')
  const hasNewTag = mappedTags.includes('new')

  let toolId = rawTool.id.split('_').slice(1).join('-') || rawTool.id

  if (idMapping[toolId]) {
    toolId = idMapping[toolId]
  }

  const displayName = nameMapping[toolId] || rawTool.name
  const rawStatus = (rawTool.status as 'done' | 'doing' | 'todo') || 'todo'
  const status =
    implementedToolIds.has(toolId) || forceImplementedToolIds.has(toolId)
      ? 'done'
      : rawStatus === 'todo' && needsExternalService(rawTool, toolId)
        ? 'doing'
        : rawStatus

  return {
    id: toolId,
    name: displayName,
    description: rawTool.tool_intro_usage || '',
    category: rawTool.category,
    icon: '',
    tags: mappedTags,
    route: `/tool/${toolId}`,
    status,
    isNew: hasNewTag,
    isHot: hasHotTag,
    toolIntroUsage: rawTool.tool_intro_usage,
    logoUrl: rawTool.logo_url,
    logoLocalPath: rawTool.logo_local_path,
    detailPageUrl: rawTool.detail_page_url,
  }
}

export const tools: Tool[] = (rawTools as RawTool[])
  .map(convertTool)
  .filter(tool => !removedToolIds.has(tool.id))

tools.push({
  id: 'img-watermark-remove',
  name: '图片去水印',
  category: 'img',
  icon: 'https://m4.publicimg.browser.qq.com/publicimg/nav/qbtool/qbtool-latest.png',
  description: '使用 AI 模型智能擦除图片中的水印并完美还原背景。',
  route: '/tool/img-watermark-remove',
  status: 'done',
  tags: ['hot'],
})

export const getToolById = (id: string): Tool | undefined => {
  return tools.find(tool => tool.id === id)
}

export const getToolsByCategory = (categoryId: string): Tool[] => {
  if (categoryId === 'all') {
    return tools
  }
  return tools.filter(tool => tool.category === categoryId)
}

export const searchTools = (query: string): Tool[] => {
  const lowerQuery = query.toLowerCase()
  return tools.filter(
    tool =>
      tool.name.toLowerCase().includes(lowerQuery) ||
      tool.description.toLowerCase().includes(lowerQuery),
  )
}

export const getHotTools = (): Tool[] => {
  return tools.filter(tool => tool.isHot)
}

export const getNewTools = (): Tool[] => {
  return tools.filter(tool => tool.isNew)
}

export const getCategoryName = (categoryId: string): string => {
  return categoryNames[categoryId] || categoryId
}

export const getCategories = (): { id: string; name: string; count: number }[] => {
  const categoryMap: Record<string, number> = {}
  tools.forEach(tool => {
    categoryMap[tool.category] = (categoryMap[tool.category] || 0) + 1
  })

  return Object.entries(categoryMap)
    .map(([id, count]) => ({ id, name: getCategoryName(id), count }))
    .sort((a, b) => b.count - a.count)
}

export const isToolIndexable = (tool: Tool): boolean => {
  return tool.status === 'done'
}
