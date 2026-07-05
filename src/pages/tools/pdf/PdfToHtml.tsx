import { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { PdfFileHeader, PdfInfoCard, PdfTwoColumn } from '@/components/pdf/PdfToolUI'
import { getToolById } from '@/data/toolsFromJson'
import { getFileNameWithoutExtension } from '@/utils/fileUtils'
import { useAIConfigContext } from '@/contexts/AIConfigContext'
import { extractHtmlContent } from '@/utils/aiService'

// Set worker source for pdf.js
;(pdfjsLib as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

const PdfToHtml: React.FC = () => {
  const tool = getToolById('pdf-2-html')
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

      const zip = new JSZip()
      const maxPages = Math.min(pdf.numPages, 5) // Limit for AI to avoid long wait

      let fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${file.name} - Converted</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; color: #333; }
    .page-break { border-top: 1px dashed #ccc; margin: 2rem 0; padding-top: 2rem; position: relative; }
    .page-break::before { content: attr(data-page); position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: #fff; padding: 0 10px; color: #999; font-size: 0.875rem; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { border: 1px solid #ddd; padding: 8px; }
  </style>
</head>
<body>`

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
        
        const htmlPart = await extractHtmlContent(b64, config)
        
        if (i > 1) {
          fullHtml += `\n<div class="page-break" data-page="Page ${i}"></div>\n`
        }
        fullHtml += `\n<div class="page-content">\n${htmlPart}\n</div>\n`
      }

      fullHtml += `\n</body>\n</html>`

      const base = getFileNameWithoutExtension(file.name)
      zip.file(`${base}.html`, fullHtml)

      const out = await zip.generateAsync({ type: 'blob' })
      saveAs(out, `${base}_html.zip`)
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
                  subtitle="将 PDF 转换为 HTML 文件 (AI 驱动)"
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
                      开始转换并下载 ZIP
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
                    <p>2. 调用硅基流动视觉大模型还原排版并生成 HTML 标签。</p>
                    <p>3. 组装并生成打包的 ZIP 文件。</p>
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

export default PdfToHtml
