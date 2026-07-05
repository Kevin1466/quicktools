import { useMemo, useState } from 'react'
import { downloadFile, formatFileSize, getFileNameWithoutExtension } from '@/utils/fileUtils'
import { getImageInfo } from '@/utils/imageUtils'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'

type Mode = 'scale' | 'size'

const ImgEnlarge: React.FC = () => {
  const tool = getToolById('img-enlarge')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>('scale')
  const [scale, setScale] = useState(2)
  const [targetW, setTargetW] = useState('')
  const [targetH, setTargetH] = useState('')
  const [keepRatio, setKeepRatio] = useState(true)
  const [meta, setMeta] = useState<{ w: number; h: number; size: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const [out, setOut] = useState<Blob | null>(null)
  const [outUrl, setOutUrl] = useState<string | null>(null)

  if (!tool) return null

  const onFileSelect = async (f: File) => {
    if (!f.type.startsWith('image/')) return
    setFile(f)
    setOut(null)
    if (outUrl) URL.revokeObjectURL(outUrl)
    setOutUrl(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    const url = URL.createObjectURL(f)
    setPreviewUrl(url)
    const info = await getImageInfo(f)
    setMeta({ w: info.width, h: info.height, size: info.size })
    setTargetW(String(info.width))
    setTargetH(String(info.height))
  }

  const computeTarget = useMemo(() => {
    if (!meta) return null
    if (mode === 'scale') {
      const s = Number(scale)
      if (!Number.isFinite(s) || s <= 0) return null
      return { w: Math.max(1, Math.round(meta.w * s)), h: Math.max(1, Math.round(meta.h * s)) }
    }
    const w = Number(targetW)
    const h = Number(targetH)
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return null
    return { w: Math.round(w), h: Math.round(h) }
  }, [meta, mode, scale, targetW, targetH])

  const process = async () => {
    if (!file || !computeTarget) return
    setBusy(true)
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const image = new Image()
          image.onload = () => resolve(image)
          image.onerror = reject
          image.src = String(reader.result || '')
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const canvas = document.createElement('canvas')
      canvas.width = computeTarget.w
      canvas.height = computeTarget.h
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/png')
      )
      if (!blob) return
      setOut(blob)
      if (outUrl) URL.revokeObjectURL(outUrl)
      setOutUrl(URL.createObjectURL(blob))
    } finally {
      setBusy(false)
    }
  }

  const onSizeChange = (which: 'w' | 'h', value: string) => {
    if (!meta) {
      if (which === 'w') setTargetW(value)
      else setTargetH(value)
      return
    }
    if (!keepRatio) {
      if (which === 'w') setTargetW(value)
      else setTargetH(value)
      return
    }
    const n = Number(value)
    if (!Number.isFinite(n) || n <= 0) {
      if (which === 'w') setTargetW(value)
      else setTargetH(value)
      return
    }
    if (which === 'w') {
      const h = Math.round((n / meta.w) * meta.h)
      setTargetW(String(Math.round(n)))
      setTargetH(String(h))
    } else {
      const w = Math.round((n / meta.h) * meta.w)
      setTargetH(String(Math.round(n)))
      setTargetW(String(w))
    }
  }

  const download = () => {
    if (!file || !out) return
    const name = `${getFileNameWithoutExtension(file.name)}_enlarge.png`
    downloadFile(out, name)
  }

  return (
    <ToolPageTemplate tool={tool}>
      {!file ? (
        <div className="space-y-6">
          <div className="relative">
            <div
              className="rounded-[8px] border border-dashed border-[#c0ccda] bg-[#fafafa] py-20 text-center cursor-pointer hover:border-[#3b6de3] transition-all"
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && onFileSelect(e.target.files[0])}
                className="hidden"
                id="img-enlarge-upload"
              />
              <label htmlFor="img-enlarge-upload" className="mx-auto flex w-32 h-10 items-center justify-center bg-[#3b6de3] text-white rounded cursor-pointer hover:bg-[#2a52c2] transition font-medium text-sm">
                点击上传图片
              </label>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left side: Original Image */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center justify-between mb-3 h-8">
                <div className="text-sm font-medium text-gray-900 truncate pr-4">{file.name}</div>
                <div className="text-sm text-gray-500 whitespace-nowrap">
                  {meta ? `${meta.w}×${meta.h} ｜ ${formatFileSize(meta.size)}` : ''}
                </div>
              </div>
              <div className="flex-1 min-h-[400px] border border-gray-200 bg-[#f6f7fb] rounded flex items-center justify-center p-4">
                {previewUrl && <img src={previewUrl} alt="preview" className="max-w-full max-h-[500px] object-contain" />}
              </div>
            </div>

            {/* Right side: Settings & Output */}
            <div className="flex-1 flex flex-col min-w-0 max-w-[420px]">
              <div className="flex items-center justify-end mb-3 h-8 gap-3">
                <button
                  onClick={download}
                  disabled={!outUrl || busy}
                  className="text-sm text-[#3b6de3] hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                >
                  下载图片
                </button>
              </div>
              
              <div className="flex-1 border border-gray-200 bg-[#f8fafc] rounded p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setMode('scale')}
                    className={`px-4 py-1.5 rounded text-sm transition-colors ${
                      mode === 'scale'
                        ? 'bg-[#eef4ff] text-[#3b6de3] font-medium'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    按倍数
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('size')}
                    className={`px-4 py-1.5 rounded text-sm transition-colors ${
                      mode === 'size'
                        ? 'bg-[#eef4ff] text-[#3b6de3] font-medium'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    按尺寸
                  </button>
                </div>

                {mode === 'scale' ? (
                  <div className="flex items-center gap-3 bg-[#f6f7fb] px-4 py-2 rounded mb-4">
                    <span className="text-sm text-gray-500 w-16">放大倍数</span>
                    <select
                      value={scale}
                      onChange={(e) => setScale(Number(e.target.value))}
                      className="flex-1 outline-none text-sm text-gray-700 bg-transparent cursor-pointer"
                    >
                      <option value={1.5}>1.5×</option>
                      <option value={2}>2×</option>
                      <option value={3}>3×</option>
                      <option value={4}>4×</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 bg-[#f6f7fb] px-4 py-2 rounded">
                        <span className="text-sm text-gray-500">宽</span>
                        <input
                          value={targetW}
                          onChange={(e) => onSizeChange('w', e.target.value)}
                          className="flex-1 w-full outline-none text-sm text-gray-700 bg-transparent font-mono"
                        />
                      </div>
                      <div className="flex items-center gap-3 bg-[#f6f7fb] px-4 py-2 rounded">
                        <span className="text-sm text-gray-500">高</span>
                        <input
                          value={targetH}
                          onChange={(e) => onSizeChange('h', e.target.value)}
                          className="flex-1 w-full outline-none text-sm text-gray-700 bg-transparent font-mono"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input type="checkbox" checked={keepRatio} onChange={(e) => setKeepRatio(e.target.checked)} className="rounded border-gray-300" />
                      保持比例
                    </label>
                  </div>
                )}

                <div className="text-sm text-gray-500 mb-6">
                  目标尺寸：<span className="font-mono text-gray-800">{computeTarget ? `${computeTarget.w}×${computeTarget.h}` : '--'}</span>
                  {out && <span className="ml-4">输出大小：<span className="font-mono text-gray-800">{formatFileSize(out.size)}</span></span>}
                </div>

                <div className="flex-1 bg-white border border-gray-100 rounded-lg flex items-center justify-center p-4 overflow-hidden min-h-[200px]">
                  {outUrl ? (
                    <img src={outUrl} alt="output" className="max-w-full max-h-[240px] object-contain" />
                  ) : (
                    <div className="text-sm text-gray-400">
                      {busy ? '处理中...' : '点击底部按钮开始放大'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setFile(null)}
              className="px-6 py-2 rounded border border-[#3b6de3] text-[#3b6de3] hover:bg-blue-50 transition text-sm"
              disabled={busy}
            >
              重新选择
            </button>
            <button
              onClick={process}
              disabled={!computeTarget || busy}
              className="px-6 py-2 rounded bg-[#3b6de3] text-white hover:bg-[#2a52c2] transition text-sm disabled:opacity-50"
            >
              {busy ? '处理中...' : '开始处理'}
            </button>
          </div>
        </div>
      )}
    </ToolPageTemplate>
  )
}

export default ImgEnlarge
