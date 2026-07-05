import { useState } from 'react'
import { parseGIF, decompressFrames } from 'gifuct-js'
import JSZip from 'jszip'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'
import { downloadFile, formatFileSize, getFileNameWithoutExtension } from '@/utils/fileUtils'

const GifSplitter: React.FC = () => {
  const tool = getToolById('gifsplitter')
  const [file, setFile] = useState<File | null>(null)
  const [frames, setFrames] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!tool) return null

  const processGif = async (f: File) => {
    setFile(f)
    setBusy(true)
    setError('')
    setFrames([])

    try {
      const buffer = await f.arrayBuffer()
      const gif = parseGIF(buffer) as any
      const gifFrames = decompressFrames(gif, true) as any[]
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas not supported')
      
      canvas.width = gif.lsd.width
      canvas.height = gif.lsd.height

      const frameDataUrls: string[] = []
      let tempCanvas = document.createElement('canvas')
      let tempCtx = tempCanvas.getContext('2d')
      tempCanvas.width = canvas.width
      tempCanvas.height = canvas.height

      for (const frame of gifFrames) {
        if (frame.disposalType === 2 && tempCtx) {
          tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height)
        }
        
        const frameImageData = new ImageData(
          new Uint8ClampedArray(frame.patch),
          frame.dims.width,
          frame.dims.height
        )

        // Draw frame patch to temp canvas
        const patchCanvas = document.createElement('canvas')
        patchCanvas.width = frame.dims.width
        patchCanvas.height = frame.dims.height
        patchCanvas.getContext('2d')?.putImageData(frameImageData, 0, 0)
        
        if (tempCtx) {
          tempCtx.drawImage(patchCanvas, frame.dims.left, frame.dims.top)
        }

        if (ctx && tempCtx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(tempCanvas, 0, 0)
          frameDataUrls.push(canvas.toDataURL('image/png'))
        }
      }

      setFrames(frameDataUrls)
    } catch (e) {
      setError('解析 GIF 失败：' + (e instanceof Error ? e.message : '未知错误'))
    } finally {
      setBusy(false)
    }
  }

  const downloadAll = async () => {
    if (frames.length === 0 || !file) return
    setBusy(true)
    try {
      const zip = new JSZip()
      const folderName = `${getFileNameWithoutExtension(file.name)}_frames`
      const imgFolder = zip.folder(folderName)
      
      frames.forEach((dataUrl, i) => {
        const base64Data = dataUrl.split(',')[1]
        imgFolder?.file(`frame_${String(i + 1).padStart(3, '0')}.png`, base64Data, { base64: true })
      })

      const content = await zip.generateAsync({ type: 'blob' })
      downloadFile(content, `${folderName}.zip`)
    } finally {
      setBusy(false)
    }
  }

  const downloadSingle = (dataUrl: string, index: number) => {
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        downloadFile(blob, `${getFileNameWithoutExtension(file?.name || 'gif')}_frame_${index + 1}.png`)
      })
  }

  return (
    <ToolPageTemplate tool={tool}>
      {!file ? (
        <FileUploader onFileSelect={processGif} accept=".gif" placeholder="上传 GIF 图片以分解为单帧" />
      ) : (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="font-medium text-gray-900 truncate">{file.name}</div>
              <div className="text-sm text-gray-500">
                {formatFileSize(file.size)} {frames.length > 0 && `| 共 ${frames.length} 帧`}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {frames.length > 0 && (
                <ActionButton size="sm" onClick={downloadAll} disabled={busy}>
                  打包下载全部
                </ActionButton>
              )}
              <ActionButton variant="secondary" size="sm" onClick={() => setFile(null)} disabled={busy}>
                重新选择
              </ActionButton>
            </div>
          </div>

          {busy && frames.length === 0 && (
            <div className="py-12 text-center text-gray-500">正在解析 GIF 帧...</div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
          )}

          {frames.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {frames.map((src, i) => (
                <div key={i} className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                  <div className="aspect-square p-2 bg-[#f8fafc] flex items-center justify-center relative" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
                    <img src={src} alt={`frame ${i+1}`} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="p-2 border-t border-gray-100 bg-white flex justify-between items-center">
                    <span className="text-xs text-gray-500">第 {i + 1} 帧</span>
                    <button 
                      onClick={() => downloadSingle(src, i)}
                      className="text-xs text-[#3b6de3] hover:underline"
                    >
                      下载
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </ToolPageTemplate>
  )
}

export default GifSplitter
