import { useMemo, useState } from 'react'
import { PDFDocument, StandardFonts, rgb } from '@maxwbh/pdf-lib'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { PdfFileHeader, PdfInfoCard, PdfTwoColumn } from '@/components/pdf/PdfToolUI'
import { getToolById } from '@/data/toolsFromJson'
import { downloadFile } from '@/utils/fileUtils'

type Pos = 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'

const PdfPageNumber: React.FC = () => {
  const tool = getToolById('pdf-page-number')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [start, setStart] = useState(1)
  const [fontSize, setFontSize] = useState(12)
  const [pos, setPos] = useState<Pos>('bottom-center')
  const [margin, setMargin] = useState(24)
  const [error, setError] = useState('')

  if (!tool) return null

  const canRun = useMemo(() => !!file, [file])

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
      const pdf = await PDFDocument.load(await file.arrayBuffer())
      const font = await pdf.embedFont(StandardFonts.Helvetica)
      const pages = pdf.getPages()

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        const { width, height } = page.getSize()
        const text = String(start + i)
        const textWidth = font.widthOfTextAtSize(text, fontSize)
        const textHeight = fontSize

        let x = margin
        let y = margin
        if (pos === 'bottom-center') {
          x = (width - textWidth) / 2
          y = margin
        } else if (pos === 'bottom-right') {
          x = width - margin - textWidth
          y = margin
        } else if (pos === 'bottom-left') {
          x = margin
          y = margin
        } else if (pos === 'top-right') {
          x = width - margin - textWidth
          y = height - margin - textHeight
        } else if (pos === 'top-left') {
          x = margin
          y = height - margin - textHeight
        }

        page.drawText(text, { x, y, size: fontSize, font, color: rgb(0, 0, 0) })
      }

      const bytes = await pdf.save()
      downloadFile(new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }), 'page_numbered.pdf')
    } catch {
      setError('处理失败（可能是加密PDF）')
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
                  subtitle="为每页添加页码"
                  onReselect={() => setFile(null)}
                  disabled={busy}
                />

                <div className="space-y-6">
                  <div>
                    <div className="flex items-start gap-6">
                      <div className="w-16 text-right pt-2.5">
                        <span className="text-gray-600">参数</span>
                      </div>
                      <div className="flex-1">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600">起始页码</div>
                            <input
                              type="number"
                              value={start}
                              onChange={(e) => setStart(Number(e.target.value))}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600">字号</div>
                            <input
                              type="number"
                              value={fontSize}
                              min={6}
                              max={48}
                              onChange={(e) => setFontSize(Number(e.target.value))}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600">边距（pt）</div>
                            <input
                              type="number"
                              value={margin}
                              min={0}
                              max={200}
                              onChange={(e) => setMargin(Number(e.target.value))}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600">位置</div>
                            <select
                              value={pos}
                              onChange={(e) => setPos(e.target.value as Pos)}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                            >
                              <option value="bottom-center">下中</option>
                              <option value="bottom-left">下左</option>
                              <option value="bottom-right">下右</option>
                              <option value="top-left">上左</option>
                              <option value="top-right">上右</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {error ? <div className="text-sm text-red-600">{error}</div> : null}

                  <div className="flex gap-3 flex-wrap">
                    <ActionButton onClick={run} loading={busy} disabled={!canRun || busy}>
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
                      <div className="text-xs text-gray-500">起始</div>
                      <div className="text-lg font-semibold text-gray-900">{start}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">字号</div>
                      <div className="text-lg font-semibold text-gray-900">{fontSize}</div>
                    </div>
                  </div>
                </PdfInfoCard>
                <div className="text-sm text-gray-500 leading-relaxed">加密PDF可能无法写入页码。</div>
              </div>
            }
          />
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default PdfPageNumber
