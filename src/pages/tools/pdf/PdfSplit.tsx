import { useMemo, useState } from 'react'
import { PDFDocument } from '@maxwbh/pdf-lib'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { PdfFileHeader, PdfInfoCard, PdfTwoColumn } from '@/components/pdf/PdfToolUI'
import { getToolById } from '@/data/toolsFromJson'
import { downloadFile } from '@/utils/fileUtils'

const parsePages = (text: string, max: number) => {
  const cleaned = text.replace(/\s+/g, '')
  if (!cleaned) return []
  const parts = cleaned.split(',')
  const out = new Set<number>()
  for (const p of parts) {
    const m = p.match(/^(\d+)-(\d+)$/)
    if (m) {
      const a = Number(m[1])
      const b = Number(m[2])
      const lo = Math.max(1, Math.min(a, b))
      const hi = Math.min(max, Math.max(a, b))
      for (let i = lo; i <= hi; i++) out.add(i)
      continue
    }
    const n = Number(p)
    if (Number.isFinite(n) && n >= 1 && n <= max) out.add(Math.floor(n))
  }
  return Array.from(out).sort((a, b) => a - b)
}

const PdfSplit: React.FC = () => {
  const tool = getToolById('pdf-split')
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [pagesText, setPagesText] = useState('1-1')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!tool) return null

  const pages = useMemo(() => parsePages(pagesText, pageCount), [pagesText, pageCount])

  const onFileSelect = async (f: File) => {
    if (!(f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))) return
    setFile(f)
    setError('')
    setBusy(true)
    try {
      const doc = await PDFDocument.load(await f.arrayBuffer())
      const n = doc.getPageCount()
      setPageCount(n)
      setPagesText(`1-${n}`)
    } catch {
      setError('无法读取PDF')
      setFile(null)
      setPageCount(0)
    } finally {
      setBusy(false)
    }
  }

  const split = async () => {
    if (!file || !pages.length) return
    setBusy(true)
    setError('')
    try {
      const src = await PDFDocument.load(await file.arrayBuffer())
      const out = await PDFDocument.create()
      const indices = pages.map(p => p - 1)
      const copied = await out.copyPages(src, indices)
      copied.forEach(p => out.addPage(p))
      const bytes = await out.save()
      downloadFile(new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }), 'split.pdf')
    } catch {
      setError('拆分失败')
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
                <PdfFileHeader fileName={file.name} subtitle={`页数：${pageCount}`} onReselect={() => setFile(null)} disabled={busy} />

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-6">
                      <div className="w-16 text-right">
                        <span className="text-gray-600">页码</span>
                      </div>
                      <div className="flex-1">
                        <input
                          value={pagesText}
                          onChange={(e) => setPagesText(e.target.value)}
                          className="w-full max-w-2xl px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
                          placeholder="例如：1,3-5"
                        />
                        <div className="text-xs text-gray-500 mt-2">将生成包含这些页的新PDF</div>
                      </div>
                    </div>
                  </div>

                  {error ? <div className="text-sm text-red-600">{error}</div> : null}

                  <div className="flex gap-3 flex-wrap items-center">
                    <ActionButton onClick={split} loading={busy} disabled={!pages.length || busy}>
                      生成并下载
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
                      <div className="text-xs text-gray-500">页数</div>
                      <div className="text-lg font-semibold text-gray-900">{pageCount}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">已选择</div>
                      <div className="text-lg font-semibold text-gray-900">{pages.length}</div>
                    </div>
                  </div>
                </PdfInfoCard>
                <div className="text-sm text-gray-500 leading-relaxed">
                  常用写法：<span className="font-mono">1-{pageCount}</span>（提取全部）、<span className="font-mono">1</span>（仅第一页）
                </div>
              </div>
            }
          />
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default PdfSplit
