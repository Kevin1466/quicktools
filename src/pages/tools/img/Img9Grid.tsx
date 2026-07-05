import { useMemo, useState } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { getFileNameWithoutExtension, readFileAsDataURL } from '@/utils/fileUtils'

const Img9Grid: React.FC = () => {
  const tool = getToolById('img9grid')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [cellSize, setCellSize] = useState(360)
  const [busy, setBusy] = useState(false)
  const [cells, setCells] = useState<string[]>([])

  if (!tool) return null

  const onFileSelect = (f: File) => {
    if (!f.type.startsWith('image/')) return
    setFile(f)
    setCells([])
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(f))
  }

  const totalSize = useMemo(() => Math.max(90, Math.min(1200, Math.floor(cellSize))), [cellSize])

  const slice = async () => {
    if (!file) return
    setBusy(true)
    try {
      const dataUrl = await readFileAsDataURL(file)
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = reject
        image.src = dataUrl
      })

      const side = Math.min(img.width, img.height)
      const sx = Math.floor((img.width - side) / 2)
      const sy = Math.floor((img.height - side) / 2)

      const canvas = document.createElement('canvas')
      canvas.width = totalSize * 3
      canvas.height = totalSize * 3
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, sx, sy, side, side, 0, 0, canvas.width, canvas.height)

      const out: string[] = []
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const cell = document.createElement('canvas')
          cell.width = totalSize
          cell.height = totalSize
          const cctx = cell.getContext('2d')
          if (!cctx) continue
          cctx.drawImage(canvas, c * totalSize, r * totalSize, totalSize, totalSize, 0, 0, totalSize, totalSize)
          out.push(cell.toDataURL('image/png'))
        }
      }
      setCells(out)
    } finally {
      setBusy(false)
    }
  }

  const downloadZip = async () => {
    if (!file || cells.length !== 9) return
    const zip = new JSZip()
    const base = getFileNameWithoutExtension(file.name)
    for (let i = 0; i < cells.length; i++) {
      const data = cells[i].split(',')[1] || ''
      zip.file(`${base}_${i + 1}.png`, data, { base64: true })
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, `${base}_9grid.zip`)
  }

  const downloadSingle = (idx: number) => {
    if (!file) return
    const a = document.createElement('a')
    a.href = cells[idx]
    a.download = `${getFileNameWithoutExtension(file.name)}_${idx + 1}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
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
                id="img9grid-upload"
              />
              <label htmlFor="img9grid-upload" className="mx-auto flex w-32 h-10 items-center justify-center bg-[#3b6de3] text-white rounded cursor-pointer hover:bg-[#2a52c2] transition font-medium text-sm">
                选择文件
              </label>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left side: Original Image Preview */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center justify-between mb-3 h-8">
                <div className="text-sm font-medium text-gray-900 truncate pr-4">{file.name}</div>
              </div>
              <div className="flex-1 min-h-[400px] border border-gray-200 bg-[#f6f7fb] rounded flex items-center justify-center p-4">
                {previewUrl && <img src={previewUrl} alt="preview" className="max-w-full max-h-[500px] object-contain" />}
              </div>
            </div>

            {/* Right side: Sliced Result */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center justify-end mb-3 h-8 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-500 w-32">
                  <span>大小:</span>
                  <input
                    type="range"
                    min={90}
                    max={1200}
                    value={cellSize}
                    onChange={(e) => setCellSize(Number(e.target.value))}
                    className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="w-px h-4 bg-gray-200 mx-1"></div>
                <button
                  onClick={downloadZip}
                  disabled={cells.length !== 9 || busy}
                  className="text-sm text-[#3b6de3] hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                >
                  打包下载
                </button>
              </div>
              
              <div className="flex-1 min-h-[400px] border border-gray-200 bg-[#f8fafc] rounded flex items-center justify-center p-4">
                {cells.length ? (
                  <div className="grid grid-cols-3 gap-1 w-full max-w-[400px] aspect-square">
                    {cells.map((src, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => downloadSingle(idx)}
                        className="bg-white overflow-hidden border border-transparent hover:border-[#3b6de3] transition w-full h-full p-0"
                        title="点击下载单张"
                      >
                        <img src={src} alt={`cell-${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">点击底部“切割”按钮生成九宫格预览</div>
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
              onClick={slice}
              disabled={busy}
              className="px-6 py-2 rounded bg-[#3b6de3] text-white hover:bg-[#2a52c2] transition text-sm disabled:opacity-50"
            >
              {busy ? '切割中...' : cells.length ? '重新切割' : '切割'}
            </button>
          </div>
        </div>
      )}
    </ToolPageTemplate>
  )
}

export default Img9Grid
