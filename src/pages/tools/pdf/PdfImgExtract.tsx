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

const parsePages = (text: string, total: number): number[] => {
  const t = text.trim()
  if (!t || t.toLowerCase() === 'all') return Array.from({ length: total }, (_, i) => i + 1)
  const out = new Set<number>()
  const parts = t.split(',').map(s => s.trim()).filter(Boolean)
  for (const p of parts) {
    const m = p.match(/^(\d+)\s*-\s*(\d+)$/)
    if (m) {
      const a = Math.max(1, Number(m[1]))
      const b = Math.min(total, Number(m[2]))
      for (let i = Math.min(a, b); i <= Math.max(a, b); i++) out.add(i)
      continue
    }
    const n = Number(p)
    if (Number.isFinite(n) && n >= 1 && n <= total) out.add(n)
  }
  return Array.from(out).sort((a, b) => a - b)
}

const PdfImgExtract: React.FC = () => {
  const tool = getToolById('pdf-img-extract')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [scale, setScale] = useState(2)
  const [pageText, setPageText] = useState('all')

  if (!tool) return null

  const s = useMemo(() => Math.max(1, Math.min(4, Number(scale) || 2)), [scale])

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
      const pdf = (await loadingTask.promise) as { numPages: number; getPage: (n: number) => Promise<unknown> }

      const pages = parsePages(pageText, pdf.numPages)
      if (!pages.length) {
        setError('页码为空或不合法')
        return
      }

      const zip = new JSZip()
      const base = getFileNameWithoutExtension(file.name)

      for (const i of pages) {
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
        zip.file(`${base}_${String(i).padStart(3, '0')}.png`, await blob.arrayBuffer())
      }

      const out = await zip.generateAsync({ type: 'blob' })
      saveAs(out, `${base}_images.zip`)
    } catch (e) {
      setError(e instanceof Error ? e.message : '提取失败（可能是加密PDF或worker加载失败）')
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
                  subtitle="按页渲染为PNG并打包ZIP（该方式不解析原始内嵌图片）"
                  onReselect={() => setFile(null)}
                  disabled={busy}
                />

                <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-6">
                    <div className="w-16 text-right">
                      <span className="text-gray-600">页码</span>
                    </div>
                    <div className="flex-1">
                      <input
                        value={pageText}
                        onChange={(e) => setPageText(e.target.value)}
                        placeholder="all 或 1,3,5-7"
                        className="w-full max-w-2xl px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                      />
                      <div className="text-xs text-gray-500 mt-2">支持区间与逗号分隔</div>
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
                      <div className="text-sm text-gray-500">倍率越大越清晰，但更耗时</div>
                    </div>
                  </div>
                </div>

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

                {error ? <div className="text-sm text-red-600">{error}</div> : null}

                <div className="flex gap-3 flex-wrap">
                  <ActionButton onClick={run} loading={busy} disabled={busy}>
                    提取并下载ZIP
                  </ActionButton>
                </div>
                </div>
              </div>
            }
            right={
              <div className="space-y-4">
                <PdfInfoCard title="输出">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>文件名：原文件名 + 页码</div>
                    <div>格式：PNG</div>
                    <div>打包：ZIP</div>
                  </div>
                </PdfInfoCard>
                <div className="text-sm text-gray-500 leading-relaxed">如果想提取“PDF内嵌图片素材”而不是页面渲染结果，需要更复杂的解析能力，后续再补。</div>
              </div>
            }
          />
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default PdfImgExtract
