import { useState } from 'react'
import { downloadFile, getFileNameWithoutExtension } from '@/utils/fileUtils'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'

const ImgFade: React.FC = () => {
  const tool = getToolById('img-fade')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [out, setOut] = useState<Blob | null>(null)
  const [outUrl, setOutUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

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

      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const y = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
        data[i] = y
        data[i + 1] = y
        data[i + 2] = y
      }
      ctx.putImageData(imageData, 0, 0)
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
    downloadFile(out, `${getFileNameWithoutExtension(file.name)}_bw.png`)
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

            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center justify-end mb-3 h-8 gap-3">
                <button
                  onClick={download}
                  disabled={!out}
                  className="text-sm text-[#3b6de3] hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                >
                  下载图片
                </button>
              </div>
              
              <div className="flex-1 border border-gray-200 bg-[#f8fafc] rounded p-6 flex flex-col items-center justify-center">
                {outUrl ? (
                  <img src={outUrl} alt="output" className="max-w-full max-h-[400px] object-contain" />
                ) : (
                  <div className="text-sm text-gray-400">
                    {busy ? '处理中...' : '点击底部按钮开始黑白化'}
                  </div>
                )}
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

export default ImgFade
