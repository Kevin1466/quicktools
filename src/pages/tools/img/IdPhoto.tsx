import { useEffect, useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { useAIConfigContext } from '@/contexts/AIConfigContext'
import { getToolById } from '@/data/toolsFromJson'
import { downloadFile, getFileNameWithoutExtension, readFileAsDataURL } from '@/utils/fileUtils'
import { generateImageWithReferences } from '@/utils/aiService'

type PresetCategory = 'common' | 'civil' | 'visa' | 'other'
type PresetKey =
  | '1inch'
  | '2inch'
  | 'resume2'
  | 'resume1'
  | 'large1'
  | 'small1'
  | 'small2'
  | 'large2'
  | 'social'
  | 'residence'
  | 'identity'
  | 'exam'
  | 'teacher'
  | 'passport'
  | 'japan'
  | 'korea'
  | 'square'
  | 'customWide'

const dpi = 300
const mmToPx = (mm: number) => Math.round((mm / 25.4) * dpi)

const presetCategories: Array<{ key: PresetCategory; label: string }> = [
  { key: 'common', label: '常用尺寸' },
  { key: 'civil', label: '公务员' },
  { key: 'visa', label: '签证' },
  { key: 'other', label: '其他' },
]

const presetsByCategory: Record<
  PresetCategory,
  Array<{ key: PresetKey; name: string; mm: string; w: number; h: number }>
> = {
  common: [
    { key: '1inch', name: '一寸', mm: '25*35mm', w: mmToPx(25), h: mmToPx(35) },
    { key: '2inch', name: '二寸', mm: '35*49mm', w: mmToPx(35), h: mmToPx(49) },
    { key: 'resume2', name: '简历照(二寸)', mm: '35*49mm', w: mmToPx(35), h: mmToPx(49) },
    { key: 'resume1', name: '简历照(一寸)', mm: '25*35mm', w: mmToPx(25), h: mmToPx(35) },
    { key: 'large1', name: '大一寸', mm: '33*48mm', w: mmToPx(33), h: mmToPx(48) },
    { key: 'small1', name: '小一寸', mm: '22*32mm', w: mmToPx(22), h: mmToPx(32) },
    { key: 'small2', name: '小二寸', mm: '35*45mm', w: mmToPx(35), h: mmToPx(45) },
    { key: 'large2', name: '大二寸', mm: '35*53mm', w: mmToPx(35), h: mmToPx(53) },
    { key: 'social', name: '社保卡', mm: '26*32mm', w: mmToPx(26), h: mmToPx(32) },
    { key: 'residence', name: '居住证', mm: '26*32mm', w: mmToPx(26), h: mmToPx(32) },
    { key: 'identity', name: '身份证', mm: '26*32mm', w: mmToPx(26), h: mmToPx(32) },
  ],
  civil: [
    { key: 'exam', name: '公务员考试', mm: '35*45mm', w: mmToPx(35), h: mmToPx(45) },
    { key: 'teacher', name: '教师资格证', mm: '35*45mm', w: mmToPx(35), h: mmToPx(45) },
    { key: 'identity', name: '身份证', mm: '26*32mm', w: mmToPx(26), h: mmToPx(32) },
  ],
  visa: [
    { key: 'passport', name: '护照', mm: '33*48mm', w: mmToPx(33), h: mmToPx(48) },
    { key: 'japan', name: '日本签证', mm: '35*45mm', w: mmToPx(35), h: mmToPx(45) },
    { key: 'korea', name: '韩国签证', mm: '35*45mm', w: mmToPx(35), h: mmToPx(45) },
  ],
  other: [
    { key: 'square', name: '方形证件照', mm: '40*40mm', w: mmToPx(40), h: mmToPx(40) },
    { key: 'customWide', name: '横版证件照', mm: '48*33mm', w: mmToPx(48), h: mmToPx(33) },
  ],
}

const bgOptions = [
  { value: '#2F6DE6', label: '蓝底' },
  { value: '#D93A49', label: '红底' },
  { value: '#FFFFFF', label: '白底' },
]

const renderModeOptions = [
  { key: 'ai', label: 'AI 优先' },
  { key: 'local', label: '本地兜底' },
] as const

type RenderMode = (typeof renderModeOptions)[number]['key']

const IdPhoto: React.FC = () => {
  const tool = getToolById('id-photo')
  const { config, hasConfig, openModal } = useAIConfigContext()
  const [category, setCategory] = useState<PresetCategory>('common')
  const [preset, setPreset] = useState<PresetKey>('1inch')
  const [hasPickedSize, setHasPickedSize] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [bg, setBg] = useState('#2F6DE6')
  const [renderMode, setRenderMode] = useState<RenderMode>('ai')
  const [busy, setBusy] = useState(false)
  const [out, setOut] = useState<Blob | null>(null)
  const [outUrl, setOutUrl] = useState<string | null>(null)
  const [error, setError] = useState('')

  const presetList = useMemo(() => presetsByCategory[category], [category])
  const p = useMemo(() => {
    const allPresets = Object.values(presetsByCategory).flat()
    return allPresets.find(x => x.key === preset) || allPresets[0]
  }, [preset])

  const currentStep = useMemo(() => {
    if (outUrl) return 4
    if (file) return 3
    if (hasPickedSize) return 2
    return 1
  }, [file, hasPickedSize, outUrl])

  useEffect(() => {
    if (!presetList.some(item => item.key === preset)) {
      setPreset(presetList[0].key)
    }
  }, [category, preset, presetList])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      if (outUrl) URL.revokeObjectURL(outUrl)
    }
  }, [previewUrl, outUrl])

  const onFileSelect = (f: File) => {
    if (!f.type.startsWith('image/')) return
    setFile(f)
    setError('')
    setOut(null)
    if (outUrl) URL.revokeObjectURL(outUrl)
    setOutUrl(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(f))
  }

  const generateLocal = async () => {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const dataUrl = await readFileAsDataURL(file)
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image()
        i.onload = () => resolve(i)
        i.onerror = reject
        i.src = dataUrl
      })

      const canvas = document.createElement('canvas')
      canvas.width = p.w
      canvas.height = p.h
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.fillStyle = bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const targetRatio = p.w / p.h
      const srcRatio = img.width / img.height
      let sx = 0
      let sy = 0
      let sw = img.width
      let sh = img.height
      if (srcRatio > targetRatio) {
        sw = Math.round(img.height * targetRatio)
        sx = Math.round((img.width - sw) / 2)
      } else {
        sh = Math.round(img.width / targetRatio)
        sy = Math.round((img.height - sh) / 2)
      }

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(b => resolve(b), 'image/png'))
      if (!blob) return
      setOut(blob)
      if (outUrl) URL.revokeObjectURL(outUrl)
      setOutUrl(URL.createObjectURL(blob))
    } finally {
      setBusy(false)
    }
  }

  const generateWithAI = async () => {
    if (!file) return
    if (!hasConfig) {
      openModal()
      return
    }

    setBusy(true)
    setError('')

    try {
      const imageDataUrl = await readFileAsDataURL(file)
      const bgLabel = bgOptions.find(option => option.value === bg)?.label || '蓝底'
      const prompt = [
        '请基于输入的人像照片生成标准中文证件照。',
        `尺寸要求：${p.name}，${p.mm}。`,
        `背景要求：纯净${bgLabel}背景，背景平整，无杂色。`,
        '人物要求：保持同一人物的五官、发型、服饰与朝向，不要新增配饰，不要更换性别与年龄。',
        '构图要求：人物居中，头顶留白自然，肩部完整，适合正式证件照排版。',
        '风格要求：真实写实，不要卡通化，不要艺术化，不要文字，不要边框。',
      ].join('\n')

      const generatedUrl = await generateImageWithReferences(prompt, [imageDataUrl], config, {
        size: '2K',
        responseFormat: 'url',
        watermark: true,
      })

      const response = await fetch(generatedUrl)
      if (!response.ok) {
        throw new Error('生成后的图片下载失败')
      }

      const blob = await response.blob()
      setOut(blob)
      if (outUrl) URL.revokeObjectURL(outUrl)
      setOutUrl(URL.createObjectURL(blob))
    } catch (err) {
      setError((err as Error).message || 'AI 证件照生成失败')
    } finally {
      setBusy(false)
    }
  }

  const generate = async () => {
    if (renderMode === 'ai') {
      await generateWithAI()
      return
    }
    await generateLocal()
  }

  const download = () => {
    if (!file || !out) return
    downloadFile(out, `${getFileNameWithoutExtension(file.name)}_${p.key}.png`)
  }

  const resetOutput = () => {
    setOut(null)
    if (outUrl) URL.revokeObjectURL(outUrl)
    setOutUrl(null)
  }

  const reselectFile = () => {
    setFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    resetOutput()
  }

  if (!tool) return null

  return (
    <ToolPageTemplate tool={tool}>
      <div className="bg-white rounded border border-gray-200">
        {/* Stepper Header */}
        <div className="flex items-center justify-between px-16 py-6 border-b border-gray-100">
          {[
            '选择尺寸',
            '上传照片',
            '一键抠图',
            '下载照片',
          ].map((label, index) => {
            const step = index + 1
            const isCompleted = step < currentStep
            const isActive = step === currentStep
            const isDisabled = step > currentStep

            return (
              <div key={label} className="flex items-center">
                <div 
                  className={`flex items-center gap-2 cursor-pointer transition ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
                  onClick={() => {
                    if (step === 1) {
                      setHasPickedSize(false)
                      setFile(null)
                      setOutUrl(null)
                    } else if (step === 2 && currentStep > 2) {
                      setFile(null)
                      setOutUrl(null)
                    }
                  }}
                >
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isCompleted || isActive ? 'bg-[#3b6de3] text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? '✓' : step}
                  </div>
                  <span className={`text-sm ${isCompleted || isActive ? 'text-[#3b6de3]' : 'text-gray-500'}`}>
                    {label}
                  </span>
                </div>
                {step < 4 && (
                  <div className={`w-24 mx-4 h-[1px] ${isCompleted ? 'bg-[#3b6de3]' : 'bg-gray-200'}`}></div>
                )}
              </div>
            )
          })}
        </div>

        {/* Step 1: Choose Size */}
        {currentStep === 1 && (
          <div className="p-8 space-y-6">
            <div className="flex gap-8 border-b border-gray-100">
              {presetCategories.map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setCategory(item.key)}
                  className={`pb-3 text-sm font-medium transition border-b-2 ${
                    category === item.key
                      ? 'border-[#3b6de3] text-[#3b6de3]'
                      : 'border-transparent text-gray-600 hover:text-[#3b6de3]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {presetList.map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setPreset(item.key)
                    setHasPickedSize(true)
                    resetOutput()
                  }}
                  className="flex flex-col items-center justify-center py-6 px-4 rounded border border-gray-200 hover:border-[#3b6de3] hover:shadow-sm transition bg-[#fafafa] hover:bg-white"
                >
                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  <div className="mt-2 text-xs text-gray-500">{item.mm}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Upload Photo */}
        {currentStep === 2 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-xl font-bold text-gray-900">{p.name}</div>
            <div className="mt-3 flex gap-4 text-sm text-gray-500">
              <span>{p.mm}</span>
              <span>{p.w}*{p.h}px</span>
            </div>
            
            <div className="mt-10 relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    onFileSelect(e.target.files[0])
                  }
                }}
                className="hidden"
                id="upload-id-photo"
              />
              <label 
                htmlFor="upload-id-photo"
                className="flex items-center justify-center w-[300px] h-[160px] rounded-lg border-2 border-dashed border-[#c0ccda] bg-[#fafafa] cursor-pointer hover:border-[#3b6de3] transition group"
              >
                <div className="flex px-8 py-3 bg-[#3b6de3] text-white rounded cursor-pointer group-hover:bg-[#2a52c2] transition font-medium text-sm">
                  点击上传照片
                </div>
              </label>
            </div>

            <div className="mt-8 flex gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1"><i>📸</i> 不戴眼镜</span>
              <span className="flex items-center gap-1"><i>📸</i> 不戴首饰</span>
              <span className="flex items-center gap-1"><i>📸</i> 露出肩膀</span>
              <span className="flex items-center gap-1"><i>📸</i> 露出耳朵</span>
            </div>
          </div>
        )}

        {/* Step 3: Processing (Matting) */}
        {currentStep === 3 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-xl font-bold text-gray-900 mb-8">一键抠图</div>
            
            {previewUrl && (
              <div className="w-48 h-64 border border-gray-200 rounded overflow-hidden mb-8 shadow-sm">
                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
              </div>
            )}
            
            <div className="flex gap-4">
              <button
                onClick={reselectFile}
                disabled={busy}
                className="px-6 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm disabled:opacity-50"
              >
                重新上传
              </button>
              <button
                onClick={renderMode === 'ai' ? generateWithAI : generateLocal}
                disabled={busy}
                className="px-6 py-2 rounded bg-[#3b6de3] text-white hover:bg-[#2a52c2] transition text-sm disabled:opacity-50"
              >
                {busy ? '抠图中...' : '开始生成证件照'}
              </button>
            </div>

            {/* AI / Local Switch for demo/fallback purposes */}
            <div className="mt-6 flex items-center gap-2 text-sm">
              <span className="text-gray-500">生成模式:</span>
              <select
                value={renderMode}
                onChange={(e) => setRenderMode(e.target.value as RenderMode)}
                className="outline-none text-gray-700 bg-transparent border border-gray-200 rounded px-2 py-1"
                disabled={busy}
              >
                <option value="ai">AI 优先</option>
                <option value="local">本地兜底</option>
              </select>
              {renderMode === 'ai' && !hasConfig && (
                <button onClick={openModal} className="text-[#3b6de3] underline">配置 API</button>
              )}
            </div>

            {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
          </div>
        )}

        {/* Step 4: Download */}
        {currentStep === 4 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-xl font-bold text-gray-900 mb-8">下载照片</div>
            
            {outUrl && (
              <div 
                className="w-48 h-64 border border-gray-200 rounded overflow-hidden mb-8 shadow-sm transition-colors duration-300"
                style={{ backgroundColor: bg }}
              >
                <img src={outUrl} className="w-full h-full object-contain" alt="Result" />
              </div>
            )}
            
            <div className="mb-8">
              <div className="text-sm text-gray-500 text-center mb-3">更换背景色</div>
              <div className="flex gap-3">
                {bgOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setBg(option.value)}
                    className={`w-8 h-8 rounded-full border-2 transition ${
                      bg === option.value ? 'border-[#3b6de3] scale-110' : 'border-gray-200 hover:scale-105'
                    }`}
                    style={{ backgroundColor: option.value }}
                    title={option.label}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={reselectFile}
                className="px-6 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm"
              >
                再做一张
              </button>
              <button
                onClick={download}
                className="px-6 py-2 rounded bg-[#3b6de3] text-white hover:bg-[#2a52c2] transition text-sm font-medium"
              >
                下载照片
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default IdPhoto
