import { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import pptxgen from 'pptxgenjs'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { PdfFileHeader, PdfInfoCard, PdfTwoColumn } from '@/components/pdf/PdfToolUI'
import { getToolById } from '@/data/toolsFromJson'
import { getFileNameWithoutExtension } from '@/utils/fileUtils'
import { useAIConfigContext } from '@/contexts/AIConfigContext'
import { extractPresentationContent } from '@/utils/aiService'

// Set worker source for pdf.js
;(pdfjsLib as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

const PdfToPpt: React.FC = () => {
  const tool = getToolById('pdf-2-ppt')
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

      const pres = new pptxgen()

      // Limit to 5 pages max for AI processing
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
        
        // Extract content using AI
        const pptData = await extractPresentationContent(b64, config)
        
        const slide = pres.addSlide()
        
        // Add Title
        slide.addText(pptData.title, {
          x: 0.5,
          y: 0.5,
          w: '90%',
          h: 1,
          fontSize: 24,
          bold: true,
          color: '363636'
        })
        
        // Add Bullets
        if (pptData.bullets && pptData.bullets.length > 0) {
          const bulletTexts = pptData.bullets.map(b => ({ text: b, options: { bullet: true } }))
          slide.addText(bulletTexts, {
            x: 0.5,
            y: 1.8,
            w: '90%',
            h: 3,
            fontSize: 16,
            color: '666666',
            lineSpacing: 24
          })
        }
        
        // Add the original image as a small thumbnail reference (optional) or just use the text.
        // Let's add the original image as background with low opacity, or just a small preview.
        // We will just use the text.
      }

      const base = getFileNameWithoutExtension(file.name)
      await pres.writeFile({ fileName: `${base}.pptx` })
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
                  subtitle="将 PDF 转换为 PPT 文件 (AI 驱动)"
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
                    <p>2. 调用硅基流动视觉大模型提炼核心标题与要点。</p>
                    <p>3. 组装并生成本地 .pptx 文件。</p>
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

export default PdfToPpt
