import { useState, useRef, useEffect } from 'react'
import GIF from 'gif.js.optimized'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'
import { downloadFile, formatFileSize } from '@/utils/fileUtils'

const GifCreate: React.FC = () => {
  const tool = getToolById('gifcreate')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [delay, setDelay] = useState(500)
  const [quality, setQuality] = useState(10)
  const [width, setWidth] = useState(500)
  const [height, setHeight] = useState(500)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [outUrl, setOutUrl] = useState<string | null>(null)
  const [outBlob, setOutBlob] = useState<Blob | null>(null)

  if (!tool) return null

  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url))
      if (outUrl) URL.revokeObjectURL(outUrl)
    }
  }, [previews, outUrl])

  const handleFiles = (selected: File | File[]) => {
    const newFiles = Array.isArray(selected) ? selected : [selected]
    const imgFiles = newFiles.filter(f => f.type.startsWith('image/'))
    if (imgFiles.length === 0) return

    setFiles(prev => [...prev, ...imgFiles])
    setPreviews(prev => [...prev, ...imgFiles.map(f => URL.createObjectURL(f))])
    setOutUrl(null)
    setOutBlob(null)
    setError('')
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
    setOutUrl(null)
    setOutBlob(null)
  }

  const createGif = async () => {
    if (files.length === 0) return
    setBusy(true)
    setError('')
    
    try {
      const gif = new GIF({
        workers: 2,
        quality: quality,
        width: width,
        height: height,
        workerScript: '/gif.worker.js', // Needs to be in public folder
      })

      for (let i = 0; i < files.length; i++) {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image()
          image.onload = () => resolve(image)
          image.onerror = reject
          image.src = previews[i]
        })

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, width, height)
          // Scale to fit
          const scale = Math.min(width / img.width, height / img.height)
          const w = img.width * scale
          const h = img.height * scale
          const x = (width - w) / 2
          const y = (height - h) / 2
          ctx.drawImage(img, x, y, w, h)
          gif.addFrame(canvas, { delay })
        }
      }

      gif.on('finished', (blob: Blob) => {
        setOutBlob(blob)
        setOutUrl(URL.createObjectURL(blob))
        setBusy(false)
      })

      gif.render()
    } catch (e) {
      setError('合成 GIF 失败：' + (e instanceof Error ? e.message : '未知错误'))
      setBusy(false)
    }
  }

  const download = () => {
    if (!outBlob) return
    downloadFile(outBlob, 'created.gif')
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        {files.length === 0 ? (
          <FileUploader onFileSelect={handleFiles} accept="image/*" multiple placeholder="上传多张图片合成 GIF" />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left side: Images and settings */}
            <div className="flex-1 space-y-4 min-w-0">
              <div className="p-5 rounded-xl border border-gray-100 bg-gray-50 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600">每帧延迟 (毫秒)</label>
                    <input 
                      type="number" value={delay} onChange={e => setDelay(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#3b6de3]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600">质量 (1-30, 越小质量越好)</label>
                    <input 
                      type="number" value={quality} onChange={e => setQuality(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#3b6de3]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600">输出宽度</label>
                    <input 
                      type="number" value={width} onChange={e => setWidth(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#3b6de3]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600">输出高度</label>
                    <input 
                      type="number" value={height} onChange={e => setHeight(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#3b6de3]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <label className="flex items-center justify-center w-full py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input type="file" multiple accept="image/*" className="hidden" onChange={e => {
                      if (e.target.files) handleFiles(Array.from(e.target.files))
                    }} />
                    继续添加图片
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative group aspect-square rounded-lg border border-gray-200 bg-[#f8fafc] overflow-hidden flex items-center justify-center">
                    <img src={src} className="max-w-full max-h-full object-contain" />
                    <button 
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-1">
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side: Preview */}
            <div className="w-full lg:w-[400px] shrink-0 space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center min-h-[400px]">
                {outUrl ? (
                  <div className="space-y-4 w-full flex flex-col items-center">
                    <img src={outUrl} className="max-w-full max-h-[400px] object-contain shadow-sm bg-white" />
                    <div className="text-sm text-gray-500">
                      大小: {outBlob && formatFileSize(outBlob.size)}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">
                    {busy ? '正在合成，请稍候...' : '点击底部按钮开始合成'}
                  </div>
                )}
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="flex gap-3">
                <ActionButton 
                  className="flex-1" 
                  onClick={createGif} 
                  disabled={busy || files.length === 0}
                  loading={busy}
                >
                  开始合成
                </ActionButton>
                {outUrl && (
                  <ActionButton 
                    variant="secondary" 
                    className="flex-1" 
                    onClick={download}
                  >
                    下载 GIF
                  </ActionButton>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default GifCreate
