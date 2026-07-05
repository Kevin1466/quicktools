import { useEffect, useMemo, useRef, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import { getToolById } from '@/data/toolsFromJson'
import { downloadFile, getFileNameWithoutExtension, readFileAsDataURL } from '@/utils/fileUtils'

type TextStyle = {
  size: number
  color: string
  stroke: string
  strokeWidth: number
}

const defaultStyle: TextStyle = {
  size: 52,
  color: '#ffffff',
  stroke: '#000000',
  strokeWidth: 8,
}

const Biaoqing: React.FC = () => {
  const tool = getToolById('biaoqing')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [topText, setTopText] = useState('安排！')
  const [bottomText, setBottomText] = useState('')
  const [style, setStyle] = useState<TextStyle>(defaultStyle)
  const [busy, setBusy] = useState(false)
  const [out, setOut] = useState<Blob | null>(null)
  const [outUrl, setOutUrl] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  if (!tool) return null

  const safeStyle = useMemo(() => {
    return {
      size: Math.max(18, Math.min(120, Number(style.size) || defaultStyle.size)),
      color: style.color || defaultStyle.color,
      stroke: style.stroke || defaultStyle.stroke,
      strokeWidth: Math.max(0, Math.min(16, Number(style.strokeWidth) || defaultStyle.strokeWidth)),
    }
  }, [style])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      if (outUrl) URL.revokeObjectURL(outUrl)
    }
  }, [previewUrl, outUrl])

  const onFileSelect = (f: File) => {
    if (!f.type.startsWith('image/')) return
    setFile(f)
    if (outUrl) URL.revokeObjectURL(outUrl)
    setOutUrl(null)
    setOut(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(f))
  }

  const draw = async () => {
    if (!file) return
    setBusy(true)
    try {
      const dataUrl = await readFileAsDataURL(file)
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image()
        i.onload = () => resolve(i)
        i.onerror = reject
        i.src = dataUrl
      })

      const canvas = canvasRef.current || document.createElement('canvas')
      canvasRef.current = canvas

      const w = img.width
      const h = img.height
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)

      const pad = Math.max(18, Math.floor(w * 0.04))
      const fontSize = safeStyle.size
      ctx.font = `900 ${fontSize}px "Microsoft YaHei","PingFang SC",system-ui,sans-serif`
      ctx.textAlign = 'center'
      ctx.lineJoin = 'round'
      ctx.miterLimit = 2

      const drawLine = (t: string, y: number) => {
        if (!t.trim()) return
        ctx.lineWidth = safeStyle.strokeWidth
        ctx.strokeStyle = safeStyle.stroke
        ctx.fillStyle = safeStyle.color
        ctx.strokeText(t, w / 2, y)
        ctx.fillText(t, w / 2, y)
      }

      drawLine(topText.trim(), pad + fontSize)
      drawLine(bottomText.trim(), h - pad)

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(b => resolve(b), 'image/png'))
      if (!blob) return
      setOut(blob)
      if (outUrl) URL.revokeObjectURL(outUrl)
      setOutUrl(URL.createObjectURL(blob))
    } finally {
      setBusy(false)
    }
  }

  const download = () => {
    if (!file || !out) return
    downloadFile(out, `${getFileNameWithoutExtension(file.name)}_biaoqing.png`)
  }

  const reset = () => {
    setTopText('安排！')
    setBottomText('')
    setStyle(defaultStyle)
  }

  return (
    <ToolPageTemplate tool={tool}>
      {!file ? (
        <FileUploader onFileSelect={onFileSelect} accept="image/*" placeholder="上传图片，添加上下文字，生成表情包" />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left side: Input & Options */}
            <div className="w-full lg:w-[400px] shrink-0 space-y-4">
              <div className="p-5 rounded-xl border border-gray-100 bg-gray-50 space-y-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">上文字</div>
                  <input
                    value={topText}
                    onChange={(e) => setTopText(e.target.value)}
                    className="w-full px-4 py-3 rounded border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">下文字</div>
                  <input
                    value={bottomText}
                    onChange={(e) => setBottomText(e.target.value)}
                    className="w-full px-4 py-3 rounded border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">字号</div>
                    <input
                      type="number"
                      value={safeStyle.size}
                      onChange={(e) => setStyle((s) => ({ ...s, size: Number(e.target.value) }))}
                      min={18}
                      max={120}
                      className="w-full px-4 py-3 rounded border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">描边宽度</div>
                    <input
                      type="number"
                      value={safeStyle.strokeWidth}
                      onChange={(e) => setStyle((s) => ({ ...s, strokeWidth: Number(e.target.value) }))}
                      min={0}
                      max={16}
                      className="w-full px-4 py-3 rounded border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">文字颜色</div>
                    <input
                      value={safeStyle.color}
                      onChange={(e) => setStyle((s) => ({ ...s, color: e.target.value }))}
                      type="color"
                      className="w-full h-12 rounded border border-gray-200 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">描边颜色</div>
                    <input
                      value={safeStyle.stroke}
                      onChange={(e) => setStyle((s) => ({ ...s, stroke: e.target.value }))}
                      type="color"
                      className="w-full h-12 rounded border border-gray-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={draw}
                  disabled={busy}
                  className="w-full py-2.5 rounded bg-[#3b6de3] text-white hover:bg-[#2a52c2] transition text-sm font-medium disabled:opacity-50"
                >
                  {busy ? '处理中...' : '生成表情包'}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={download}
                    disabled={!out}
                    className="flex-1 py-2.5 rounded border border-[#3b6de3] text-[#3b6de3] hover:bg-blue-50 transition text-sm disabled:opacity-50 disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent"
                  >
                    下载图片
                  </button>
                  <button
                    onClick={reset}
                    disabled={busy}
                    className="flex-1 py-2.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm disabled:opacity-50"
                  >
                    重置参数
                  </button>
                </div>
                <button
                  onClick={() => setFile(null)}
                  disabled={busy}
                  className="w-full py-2.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm disabled:opacity-50"
                >
                  重新选择图片
                </button>
              </div>
            </div>

            {/* Right side: Preview */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-1 border border-gray-200 bg-[#f8fafc] rounded p-6 flex flex-col items-center justify-center min-h-[500px]">
                {outUrl ? (
                  <img src={outUrl} alt="output" className="max-w-full max-h-[500px] object-contain" />
                ) : previewUrl ? (
                  <img src={previewUrl} alt="preview" className="max-w-full max-h-[500px] object-contain opacity-50" />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </ToolPageTemplate>
  )
}

export default Biaoqing
