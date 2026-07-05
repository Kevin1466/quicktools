import { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { PdfFileHeader, PdfInfoCard, PdfTwoColumn } from '@/components/pdf/PdfToolUI'
import { getToolById } from '@/data/toolsFromJson'
import { getFileNameWithoutExtension } from '@/utils/fileUtils'
import { useAIConfigContext } from '@/contexts/AIConfigContext'
import { extractTableData } from '@/utils/aiService'

// Set worker source for pdf.js
;(pdfjsLib as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

const PdfToExcel: React.FC = () => {
  const tool = getToolById('pdf-2-excel')
  const { config } = useAIConfigContext()
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!tool) return null

  const onFileSelect = (f: File) => {
    if (!(f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))) {
      setError('请选择PDF文件')
      return
    }
    setFile(f)
    setError('')
  }

  const run = async () => {
    if (!file) return
    if (!config.silicon.apiKey) {
      setError('请先配置硅基流动 API Key')
      return
    }

    setBusy(true)
    setError('')
    try {
      const data = new Uint8Array(await file.arrayBuffer())
      const loadingTask = (pdfjsLib as unknown as { getDocument: (d: unknown) => { promise: Promise<unknown> } }).getDocument({ data })
      const pdf = (await loadingTask.promise) as { numPages: number; getPage: (n: number) => Promise<unknown> }

      const wb = XLSX.utils.book_new()

      // Limit to 5 pages max for AI processing to avoid long wait and token limits
      const maxPages = Math.min(pdf.numPages, 5)

      for (let i = 1; i <= maxPages; i++) {
        const page = (await pdf.getPage(i)) as { getViewport: (o: { scale: number }) => { width: number; height: number }; render: (o: unknown) => { promise: Promise<void> } }
        const viewport = page.getViewport({ scale: 1.5 })
        const canvas = document.createElement('canvas')
        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        const ctx = canvas.getContext('2d')
        if (!ctx) continue
        const renderTask = page.render({ canvasContext: ctx, viewport })
        await renderTask.promise
        
        const b64 = canvas.toDataURL('image/jpeg', 0.8)
        
        // Extract table data using AI
        const tableData = await extractTableData(b64, config)
        
        if (tableData && tableData.length > 0) {
          const ws = XLSX.utils.aoa_to_sheet(tableData)
          XLSX.utils.book_append_sheet(wb, ws, `Page ${i}`)
        } else {
          // Empty page
          const ws = XLSX.utils.aoa_to_sheet([['(此页未识别到表格数据)']])
          XLSX.utils.book_append_sheet(wb, ws, `Page ${i}`)
        }
      }

      if (wb.SheetNames.length === 0) {
        throw new Error('未识别到任何数据')
      }

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const base = getFileNameWithoutExtension(file.name)
      saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `${base}.xlsx`)
    } catch (err: any) {
      setError(err.message || '转换失败，请检查 API 配置或网络')
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
                  subtitle="将 PDF 转换为 Excel 文件 (AI 驱动)"
                  onReselect={() => {
                    setFile(null)
                    setError('')
                  }}
                  disabled={busy}
                />

                <div className="space-y-6">
                  {error ? <div className="text-sm text-red-600">{error}</div> : null}

                  <div className="flex gap-3 flex-wrap">
                    <ActionButton onClick={run} loading={busy} disabled={busy}>
                      开始转换并下载
                    </ActionButton>
                  </div>
                </div>
              </div>
            }
            right={
              <div className="space-y-4">
                <PdfInfoCard title="工作原理">
                  <div className="text-sm text-gray-600 leading-relaxed space-y-2">
                    <p>1. 使用本地引擎将 PDF 按页渲染为图片。</p>
                    <p>2. 调用硅基流动视觉大模型识别表格结构。</p>
                    <p>3. 组装并生成本地 .xlsx 文件。</p>
                    <p className="text-orange-500 mt-2">注意：为保证体验，当前最多只处理前 5 页。</p>
                  </div>
                </PdfInfoCard>
              </div>
            }
          />
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default PdfToExcel
