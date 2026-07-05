import { useMemo, useState } from 'react'
import { downloadFile, getFileNameWithoutExtension } from '@/utils/fileUtils'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'

type Mode = 'color' | 'bw'

const ImgPixel: React.FC = () => {
  const tool = getToolById('img-pixel')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [pixelSize, setPixelSize] = useState(10)
  const [mode, setMode] = useState<Mode>('color')
  const [busy, setBusy] = useState(false)
  const [out, setOut] = useState<Blob | null>(null)
  const [outUrl, setOutUrl] = useState<string | null>(null)

  if (!tool) return null

  const onFileSelect = (f: File) => {
    if (!f.type.startsWith('image/')) return
    setFile(f)
    setOut(null)
    if (outUrl) URL.revokeObjectURL(outUrl)
    setOutUrl(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(f))
  }

  const target = useMemo(() => {
    const n = Math.max(2, Math.min(80, Math.floor(pixelSize)))
    return n
  }, [pixelSize])

  const process = async () => {
    if (!file) return
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

      const w = img.width
      const h = img.height
      const smallW = Math.max(1, Math.floor(w / target))
      const smallH = Math.max(1, Math.floor(h / target))

      const small = document.createElement('canvas')
      small.width = smallW
      small.height = smallH
      const sctx = small.getContext('2d')
      if (!sctx) return
      sctx.imageSmoothingEnabled = true
      sctx.drawImage(img, 0, 0, smallW, smallH)

      if (mode === 'bw') {
        const imageData = sctx.getImageData(0, 0, smallW, smallH)
        const data = imageData.data
        for (let i = 0; i < data.length; i += 4) {
          const y = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
          data[i] = y
          data[i + 1] = y
          data[i + 2] = y
        }
        sctx.putImageData(imageData, 0, 0)
      }

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(small, 0, 0, w, h)

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))
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
    downloadFile(out, `${getFileNameWithoutExtension(file.name)}_pixel.png`)
  }

  return (
    <ToolPageTemplate tool={tool}>
      {!file ? (
        <FileUploader onFileSelect={onFileSelect} accept="image/*" placeholder="点击或拖拽图片到此处" />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center justify-between mb-3 h-8">
                <div className="text-sm font-medium text-gray-900 truncate pr-4">{file.name}</div>
              </div>
              <div className="flex-1 min-h-[400px] border border-gray-200 bg-[#f6f7fb] rounded flex items-center justify-center p-4">
                {previewUrl && <img src={previewUrl} alt="preview" className="max-w-full max-h-[500px] object-contain" />}
              </div>
            </div>

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
                <div className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">像素块大小</div>
                    <div className="flex items-center gap-3 bg-[#f6f7fb] px-4 py-2 rounded">
                      <input
                        type="range"
                        min={2}
                        max={80}
                        value={pixelSize}
                        onChange={(e) => setPixelSize(Number(e.target.value))}
                        className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm text-gray-500 font-mono w-12 text-right">{target}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">模式</div>
                    <div className="flex items-center gap-3 bg-[#f6f7fb] px-4 py-2 rounded">
                      <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value as Mode)}
                        className="flex-1 outline-none text-sm text-gray-700 bg-transparent cursor-pointer"
                      >
                        <option value="color">彩色</option>
                        <option value="bw">黑白</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-white border border-gray-100 rounded-lg flex items-center justify-center p-4 overflow-hidden min-h-[240px]">
                  {outUrl ? (
                    <img src={outUrl} alt="output" className="max-w-full max-h-[300px] object-contain" />
                  ) : (
                    <div className="text-sm text-gray-400">
                      {busy ? '处理中...' : '点击底部按钮开始像素化'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

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
              disabled={busy}
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

export default ImgPixel
