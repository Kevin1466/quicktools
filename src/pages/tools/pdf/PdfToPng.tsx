import { useMemo, useState } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import * as pdfjsLib from 'pdfjs-dist'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { PdfFileHeader, PdfInfoCard, PdfTwoColumn } from '@/components/pdf/PdfToolUI'
import { getToolById } from '@/data/toolsFromJson'
import { getFileNameWithoutExtension } from '@/utils/fileUtils'

;(pdfjsLib as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

const PdfToPng: React.FC = () => {
  const tool = getToolById('pdf-2-png')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [scale, setScale] = useState(2)

  if (!tool) return null

  const onFileSelect = (f: File) => {
    if (!(f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))) return
    setFile(f)
    setError('')
  }

  const s = useMemo(() => Math.max(1, Math.min(4, Number(scale) || 2)), [scale])

  const run = async () => {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const data = new Uint8Array(await file.arrayBuffer())
      const loadingTask = (pdfjsLib as unknown as { getDocument: (d: unknown) => { promise: Promise<unknown> } }).getDocument({ data })
      const pdf = (await loadingTask.promise) as { numPages: number; getPage: (n: number) => Promise<unknown> }

      const zip = new JSZip()
      const base = getFileNameWithoutExtension(file.name)

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = (await pdf.getPage(i)) as { getViewport: (o: { scale: number }) => { width: number; height: number }; render: (o: unknown) => { promise: Promise<void> } }
        const viewport = page.getViewport({ scale: s })
        const canvas = document.createElement('canvas')
        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        const ctx = canvas.getContext('2d')
        if (!ctx) continue
        const renderTask = page.render({ canvasContext: ctx, viewport })
        await renderTask.promise
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(b => resolve(b), 'image/png'))
        if (!blob) continue
        const buf = await blob.arrayBuffer()
        zip.file(`${base}_${String(i).padStart(3, '0')}.png`, buf)
      }

      const out = await zip.generateAsync({ type: 'blob' })
      saveAs(out, `${base}_png.zip`)
    } catch {
      setError('转换失败（可能是加密PDF或worker加载失败）')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        {!file ? (
          <FileUploader
            onFileSelect={onFileSelect}
            accept="application/pdf"
            placeholder="将文件拖拽到虚框内"
            primaryActionText="点击上传文件(小于20M)"
            showFormatHint={false}
          />
        ) : (
          <PdfTwoColumn
            left={
              <div>
                <PdfFileHeader
                  fileName={file.name}
                  subtitle="按页渲染为 PNG，并打包 ZIP 下载"
                  onReselect={() => setFile(null)}
                  disabled={busy}
                />

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-6">
                      <div className="w-16 text-right">
                        <span className="text-gray-600">渲染</span>
                      </div>
                      <div className="flex-1 flex flex-wrap items-center gap-4">
                        <select
                          value={scale}
                          onChange={(e) => setScale(Number(e.target.value))}
                          className="appearance-none px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3] bg-white cursor-pointer"
                        >
                          <option value={1}>1x</option>
                          <option value={2}>2x</option>
                          <option value={3}>3x</option>
                          <option value={4}>4x</option>
                        </select>
                        <div className="text-sm text-gray-500">倍率越大越清晰，但更耗时</div>
                      </div>
                    </div>
                  </div>

                  {error ? <div className="text-sm text-red-600">{error}</div> : null}

                  <div className="flex gap-3 flex-wrap">
                    <ActionButton onClick={run} loading={busy} disabled={busy}>
                      转换并下载ZIP
                    </ActionButton>
                  </div>
                </div>
              </div>
            }
            right={
              <div className="space-y-4">
                <PdfInfoCard title="当前信息">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">倍率</div>
                      <div className="text-lg font-semibold text-gray-900">{s}x</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">输出</div>
                      <div className="text-lg font-semibold text-gray-900">ZIP</div>
                    </div>
                  </div>
                </PdfInfoCard>
                <div className="text-sm text-gray-500 leading-relaxed">加密PDF或 worker 加载失败可能导致转换失败。</div>
              </div>
            }
          />
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default PdfToPng
