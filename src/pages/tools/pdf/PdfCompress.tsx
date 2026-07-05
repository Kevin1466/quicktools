import { useMemo, useState } from 'react'
import { PDFDocument } from '@maxwbh/pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { PdfFileHeader, PdfInfoCard, PdfTwoColumn } from '@/components/pdf/PdfToolUI'
import { getToolById } from '@/data/toolsFromJson'
import { downloadFile, getFileNameWithoutExtension } from '@/utils/fileUtils'

;(pdfjsLib as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

const PdfCompress: React.FC = () => {
  const tool = getToolById('pdf-compress')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [scale, setScale] = useState(2)
  const [quality, setQuality] = useState(70)

  if (!tool) return null

  const s = useMemo(() => Math.max(1, Math.min(4, Number(scale) || 2)), [scale])
  const q = useMemo(() => Math.max(20, Math.min(95, Number(quality) || 70)), [quality])

  const onFileSelect = (f: File) => {
    if (!(f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))) return
    setFile(f)
    setError('')
  }

  const run = async () => {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const data = new Uint8Array(await file.arrayBuffer())
      const loadingTask = (pdfjsLib as unknown as { getDocument: (d: unknown) => { promise: Promise<unknown> } }).getDocument({
        data,
        password: password.trim() ? password.trim() : undefined,
      })
      const pdf = (await loadingTask.promise) as {
        numPages: number
        getPage: (n: number) => Promise<unknown>
      }

      const outPdf = await PDFDocument.create()
      const base = getFileNameWithoutExtension(file.name)

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = (await pdf.getPage(i)) as {
          getViewport: (o: { scale: number }) => { width: number; height: number }
          render: (o: unknown) => { promise: Promise<void> }
        }
        const viewport = page.getViewport({ scale: s })
        const canvas = document.createElement('canvas')
        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        const ctx = canvas.getContext('2d')
        if (!ctx) continue
        const renderTask = page.render({ canvasContext: ctx, viewport })
        await renderTask.promise

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), 'image/jpeg', q / 100)
        )
        if (!blob) continue

        const imgBytes = new Uint8Array(await blob.arrayBuffer())
        const img = await outPdf.embedJpg(imgBytes)
        const p = outPdf.addPage([img.width, img.height])
        p.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height })
      }

      const pdfBytes = await outPdf.save()
      const bytes = pdfBytes instanceof Uint8Array ? Uint8Array.from(pdfBytes) : new Uint8Array(pdfBytes)
      const out = new Blob([bytes], { type: 'application/pdf' })
      downloadFile(out, `${base}_compressed.pdf`)
    } catch (e) {
      setError(e instanceof Error ? e.message : '压缩失败')
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
                  subtitle="适合图片型PDF，压缩速度与文件页数相关"
                  onReselect={() => setFile(null)}
                  disabled={busy}
                />

                <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-6">
                    <div className="w-16 text-right">
                      <span className="text-gray-600">密码</span>
                    </div>
                    <div className="flex-1">
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="可选"
                        className="w-full max-w-xs px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                      />
                    </div>
                  </div>
                </div>

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
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-sm">JPEG质量</span>
                        <input
                          type="number"
                          value={quality}
                          onChange={(e) => setQuality(Number(e.target.value))}
                          min={20}
                          max={95}
                          className="w-28 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {error ? <div className="text-sm text-red-600">{error}</div> : null}

                <div className="flex gap-3 flex-wrap">
                  <ActionButton onClick={run} loading={busy} disabled={busy}>
                    压缩并下载PDF
                  </ActionButton>
                </div>
                </div>
              </div>
            }
            right={
              <div className="space-y-4">
                <PdfInfoCard title="建议">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>渲染倍率越大越清晰，但更耗时</div>
                    <div>JPEG质量越低压缩越强，但更模糊</div>
                  </div>
                </PdfInfoCard>
                <div className="text-sm text-gray-500 leading-relaxed">该工具会把页面转成图片再重打包，适合扫描件/图片型PDF。</div>
              </div>
            }
          />
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default PdfCompress
