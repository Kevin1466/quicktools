import { AIConfig } from '@/contexts/AIConfigContext'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatCompletionResponse {
  choices: {
    message: ChatMessage
  }[]
}

interface ImageGenerationResponse {
  data?: Array<{
    url?: string
    b64_json?: string
  }>
}

interface CompressionRecommendationInput {
  fileName: string
  type: string
  sizeBytes: number
  width: number
  height: number
}

interface CompressionRecommendation {
  quality: number
  maxWidth?: number
  maxHeight?: number
  reason: string
}

interface StructuredOcrField {
  key: string
  label: string
  description: string
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const extractJsonObject = (text: string): string => {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) {
    throw new Error('AI 返回结果中未找到 JSON')
  }
  return match[0]
}

// 通用文本对话（使用硅基流动）
export const callSiliconFlowText = async (
  messages: ChatMessage[],
  config: AIConfig,
  options?: {
    model?: string
    temperature?: number
    maxTokens?: number
  }
): Promise<string> => {
  if (!config.silicon.apiKey || !config.silicon.apiKey.trim()) {
    throw new Error('请先配置硅基流动 API Key')
  }

  const model = options?.model ?? 'Qwen/Qwen2.5-7B-Instruct'

  const response = await fetch(`${config.silicon.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.silicon.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `API 请求失败: ${response.status}`)
  }

  const data: ChatCompletionResponse = await response.json()
  return data.choices[0]?.message?.content || ''
}

// 通用文本对话（使用火山引擎）
export const callOpenAI = async (
  messages: ChatMessage[],
  config: AIConfig,
  options?: {
    temperature?: number
    maxTokens?: number
  }
): Promise<string> => {
  if (!config.volc.apiKey || !config.volc.apiKey.trim()) {
    throw new Error('请先配置火山引擎 API Key')
  }

  const response = await fetch(`${config.volc.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.volc.apiKey}`,
    },
    body: JSON.stringify({
      model: config.volc.modelText,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `API 请求失败: ${response.status}`)
  }

  const data: ChatCompletionResponse = await response.json()
  return data.choices[0]?.message?.content || ''
}

export const callTTS = async (
  text: string,
  config: AIConfig,
  options?: {
    voice?: string
    speed?: number
  }
): Promise<Blob> => {
  if (!config.volc.apiKey || !config.volc.apiKey.trim()) {
    throw new Error('请先配置火山引擎 API Key')
  }

  const response = await fetch(`${config.volc.baseUrl}/audio/speech`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.volc.apiKey}`,
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: options?.voice ?? 'alloy',
      speed: options?.speed ?? 1.0,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `TTS 请求失败: ${response.status}`)
  }

  return await response.blob()
}

// 图片生成（使用火山引擎）
export const generateImageWithReferences = async (
  prompt: string,
  images: string[],
  config: AIConfig,
  options?: {
    size?: string
    responseFormat?: 'url' | 'b64_json'
    watermark?: boolean
  }
): Promise<string> => {
  if (!config.volc.apiKey || !config.volc.apiKey.trim()) {
    throw new Error('请先配置火山引擎 API Key')
  }

  if (!images.length) {
    throw new Error('缺少参考图片')
  }

  const response = await fetch(`${config.volc.baseUrl}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.volc.apiKey}`,
    },
    body: JSON.stringify({
      model: config.volc.modelImage,
      prompt,
      image: images.length === 1 ? images[0] : images,
      size: options?.size ?? '2K',
      response_format: options?.responseFormat ?? 'url',
      watermark: options?.watermark ?? true,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `图片生成请求失败: ${response.status}`)
  }

  const data: ImageGenerationResponse = await response.json()
  const imageData = data.data?.[0]

  if (imageData?.url) {
    return imageData.url
  }

  if (imageData?.b64_json) {
    return `data:image/jpeg;base64,${imageData.b64_json}`
  }

  throw new Error('图片生成结果为空')
}

// 图片压缩推荐（使用火山引擎）
export const recommendImageCompression = async (
  input: CompressionRecommendationInput,
  config: AIConfig
): Promise<CompressionRecommendation> => {
  const prompt = `你是图片压缩策略助手。请根据以下图片信息，为网页场景返回压缩建议。

要求：
1. 仅返回 JSON，不要输出任何解释。
2. JSON 格式必须为 {"quality":0.82,"maxWidth":1920,"maxHeight":1920,"reason":"..."}。
3. quality 取值范围 0.55-0.95。
4. 如果图片本来就不大，可以不缩尺寸，此时 maxWidth/maxHeight 设为原尺寸。
5. reason 用一句中文简述原因。
6. 优先兼顾清晰度与文件大小，适合网页浏览。

图片信息：
- 文件名：${input.fileName}
- MIME：${input.type}
- 大小：${input.sizeBytes} bytes
- 宽：${input.width}
- 高：${input.height}`

  const text = await callOpenAI(
    [
      {
        role: 'system',
        content: '你是一个严谨的图片压缩策略助手，只输出合法 JSON。',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    config,
    { temperature: 0.1, maxTokens: 300 }
  )

  const parsed = JSON.parse(extractJsonObject(text)) as Partial<CompressionRecommendation>
  return {
    quality: clamp(parsed.quality ?? 0.8, 0.55, 0.95),
    maxWidth: parsed.maxWidth ? Math.max(256, Math.round(parsed.maxWidth)) : input.width,
    maxHeight: parsed.maxHeight ? Math.max(256, Math.round(parsed.maxHeight)) : input.height,
    reason: parsed.reason?.trim() || 'AI 已按网页浏览场景给出压缩建议',
  }
}

// OCR（使用硅基流动）
export const performOCR = async (
  imageBase64: string,
  config: AIConfig,
  options?: {
    language?: string
  }
): Promise<string> => {
  if (!config.silicon.apiKey || !config.silicon.apiKey.trim()) {
    throw new Error('请先配置硅基流动 API Key')
  }

  const prompt = options?.language
    ? `请识别图片中的所有文字，以${options.language}为主`
    : '请识别图片中的所有文字，包括中文和英文'

  const response = await fetch(`${config.silicon.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.silicon.apiKey}`,
    },
    body: JSON.stringify({
      model: config.silicon.modelOcr,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageBase64 } },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `OCR 请求失败: ${response.status}`)
  }

  const data: ChatCompletionResponse = await response.json()
  return data.choices[0]?.message?.content || ''
}

export const performStructuredOCR = async (
  imageBase64: string,
  config: AIConfig,
  options: {
    documentName: string
    fields: StructuredOcrField[]
    extraPrompt?: string
  }
): Promise<Record<string, string>> => {
  if (!config.silicon.apiKey || !config.silicon.apiKey.trim()) {
    throw new Error('请先配置硅基流动 API Key')
  }

  const fieldTemplate = options.fields
    .map(field => `"${field.key}":"${field.description}"`)
    .join(', ')

  const prompt = [
    `你是${options.documentName}信息提取助手，请基于图片内容提取字段。`,
    '仅返回一个合法 JSON 对象，不要输出 markdown，不要输出解释。',
    `字段模板：{${fieldTemplate}}`,
    '识别不到的字段请返回空字符串。',
    '如果图片中存在多个候选值，请优先返回最完整、最正式的一项。',
    options.extraPrompt || '',
  ]
    .filter(Boolean)
    .join('\n')

  const response = await fetch(`${config.silicon.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.silicon.apiKey}`,
    },
    body: JSON.stringify({
      model: config.silicon.modelOcr,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageBase64 } },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `结构化 OCR 请求失败: ${response.status}`)
  }

  const data: ChatCompletionResponse = await response.json()
  const content = data.choices[0]?.message?.content || ''
  const parsed = JSON.parse(extractJsonObject(content)) as Record<string, unknown>

  return options.fields.reduce<Record<string, string>>((acc, field) => {
    const value = parsed[field.key]
    acc[field.key] = typeof value === 'string' ? value.trim() : value == null ? '' : String(value)
    return acc
  }, {})
}

export const extractTableData = async (
  imageBase64: string,
  config: AIConfig
): Promise<string[][]> => {
  if (!config.silicon.apiKey || !config.silicon.apiKey.trim()) {
    throw new Error('请先配置硅基流动 API Key')
  }

  const prompt = `你是一个表格数据提取助手。请识别图片中的表格或排版数据，并将其提取为二维数组格式的 JSON。
要求：
1. 仅返回合法 JSON，不要输出任何解释、markdown 标记或其他内容。
2. JSON 格式必须是字符串二维数组，例如：[["表头1", "表头2"], ["数据1", "数据2"]]。
3. 如果图片中有多个表格，请将它们合并为一个大数组，中间可以插入空行数组 ["", ""] 作为分隔。
4. 尽可能保留原始数据结构和对齐关系。`

  const response = await fetch(`${config.silicon.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.silicon.apiKey}`,
    },
    body: JSON.stringify({
      model: config.silicon.modelOcr,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageBase64 } },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `表格提取请求失败: ${response.status}`)
  }

  const data: ChatCompletionResponse = await response.json()
  const content = data.choices[0]?.message?.content || ''
  try {
    const parsed = JSON.parse(extractJsonObject(content)) as string[][]
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    console.error('Failed to parse table data:', content, e)
    return []
  }
}

export const extractPresentationContent = async (
  imageBase64: string,
  config: AIConfig
): Promise<{ title: string; bullets: string[] }> => {
  if (!config.silicon.apiKey || !config.silicon.apiKey.trim()) {
    throw new Error('请先配置硅基流动 API Key')
  }

  const prompt = `你是一个幻灯片内容提取助手。请识别图片中的排版内容，并将其提取为幻灯片格式。
要求：
1. 仅返回合法 JSON，不要输出任何解释或 markdown 标记。
2. JSON 格式必须为 {"title": "主标题", "bullets": ["要点1", "要点2"]}。
3. 如果没有明显的主标题，请将最醒目的文本作为 title。
4. 将其余主要内容提炼为 bullets 数组。`

  const response = await fetch(`${config.silicon.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.silicon.apiKey}`,
    },
    body: JSON.stringify({
      model: config.silicon.modelOcr,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageBase64 } },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `PPT内容提取请求失败: ${response.status}`)
  }

  const data: ChatCompletionResponse = await response.json()
  const content = data.choices[0]?.message?.content || ''
  try {
    const parsed = JSON.parse(extractJsonObject(content))
    return {
      title: parsed.title || '无标题',
      bullets: Array.isArray(parsed.bullets) ? parsed.bullets : [],
    }
  } catch (e) {
    console.error('Failed to parse presentation content:', content, e)
    return { title: '解析失败', bullets: [] }
  }
}

export const extractHtmlContent = async (
  imageBase64: string,
  config: AIConfig
): Promise<string> => {
  if (!config.silicon.apiKey || !config.silicon.apiKey.trim()) {
    throw new Error('请先配置硅基流动 API Key')
  }

  const prompt = `你是一个网页开发助手。请识别图片中的排版和内容，并生成对应的简单 HTML 结构。
要求：
1. 仅返回 HTML 字符串，不要输出任何解释或 markdown 标记。
2. 使用内联 CSS 尽量还原图片中的字体大小、颜色和粗细。
3. 不要生成完整的 <html> 和 <body> 标签，只生成内容块，如 <div>、<h1>、<p> 等。
4. 如果是表格，请生成 <table>。`

  const response = await fetch(`${config.silicon.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.silicon.apiKey}`,
    },
    body: JSON.stringify({
      model: config.silicon.modelOcr,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageBase64 } },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `HTML内容提取请求失败: ${response.status}`)
  }

  const data: ChatCompletionResponse = await response.json()
  let content = data.choices[0]?.message?.content || ''
  content = content.replace(/^```html/i, '').replace(/```$/i, '').trim()
  return content
}

// 文本转拼音（使用硅基流动）
export const textToPinyin = async (
  text: string,
  config: AIConfig,
  mode: 'tone' | 'no-tone' | 'initial' = 'tone'
): Promise<string> => {
  const modeDescriptions: Record<string, string> = {
    'tone': '带声调的拼音，例如：nǐ hǎo',
    'no-tone': '不带声调的拼音，例如：ni hao',
    'initial': '只输出拼音首字母，例如：N H',
  }

  const prompt = `请将以下中文文本转换为${modeDescriptions[mode]}。

要求：
1. 只输出转换后的拼音，不要输出任何其他内容
2. 多音字请根据上下文选择正确的读音
3. 保持原文的标点符号和换行

中文文本：
${text}`

  return await callSiliconFlowText(
    [
      {
        role: 'system',
        content: '你是一个专业的中文拼音转换助手。',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    config,
    { temperature: 0.1 }
  )
}

export const textToSpeechWithWebAPI = (
  text: string,
  options?: {
    lang?: string
    rate?: number
    pitch?: number
    volume?: number
  }
): SpeechSynthesisUtterance => {
  const utterance = new SpeechSynthesisUtterance(text)
  
  if (options?.lang) utterance.lang = options.lang
  if (options?.rate) utterance.rate = options.rate
  if (options?.pitch) utterance.pitch = options.pitch
  if (options?.volume !== undefined) utterance.volume = options.volume
  
  return utterance
}
