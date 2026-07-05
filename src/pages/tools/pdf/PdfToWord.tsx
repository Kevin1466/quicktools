import { useState } from 'react'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { PdfFileHeader, PdfInfoCard, PdfTwoColumn } from '@/components/pdf/PdfToolUI'
import { saveAs } from 'file-saver'
import * as pdfjsLib from 'pdfjs-dist'
import { getFileNameWithoutExtension } from '@/utils/fileUtils'

;(pdfjsLib as unknown as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

const PdfToWord: React.FC = () => {
  const tool = getToolById('pdf-to-word')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isConverted, setIsConverted] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null)

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setSelectedFile(file)
      setIsConverted(false)
      setConvertedBlob(null)
      setError('')
      setProgress(0)
      return
    }
    setError('请选择PDF文件')
  }

  const handleConvert = async () => {
    if (!selectedFile) return
    
    setIsProcessing(true)
    setError('')
    setIsConverted(false)
    setConvertedBlob(null)
    setProgress(0)

    try {
      const data = new Uint8Array(await selectedFile.arrayBuffer())
      const loadingTask = (pdfjsLib as unknown as { getDocument: (d: unknown) => { promise: Promise<unknown> } }).getDocument({ data })
      const pdf = (await loadingTask.promise) as { numPages: number; getPage: (n: number) => Promise<unknown> }

      const parts: string[] = []
      const base = getFileNameWithoutExtension(selectedFile.name)

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = (await pdf.getPage(i)) as { getTextContent: () => Promise<{ items: Array<{ str?: string }> }> }
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((it) => (it?.str ? String(it.str) : ''))
          .filter(Boolean)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()

        parts.push(`第 ${i} 页\n\n${pageText}\n`)
        setProgress(Math.round((i / pdf.numPages) * 100))
      }

      const text = parts.join('\n\n')
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

      const html = `<!doctype html><html><head><meta charset="utf-8"><title>${base}</title><style>body{font-family:Microsoft YaHei,Arial,sans-serif;line-height:1.7;color:#111827;margin:24px}pre{white-space:pre-wrap;word-break:break-word;margin:0}</style></head><body><pre>${escaped}</pre></body></html>`
      const blob = new Blob([html], { type: 'application/msword' })
      setConvertedBlob(blob)
      setIsConverted(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!selectedFile || !convertedBlob) return
    const base = getFileNameWithoutExtension(selectedFile.name)
    saveAs(convertedBlob, `${base}.doc`)
  }

  const handleReset = () => {
    setSelectedFile(null)
    setIsConverted(false)
    setConvertedBlob(null)
    setError('')
    setProgress(0)
  }

  if (!tool) {
    return <div className="p-8 text-center">工具不存在</div>
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        {!selectedFile ? (
          <div className="space-y-4">
            <FileUploader
              onFileSelect={handleFileSelect}
              accept="application/pdf"
              placeholder="将文件拖拽到虚框内"
              primaryActionText="点击上传文件(小于20M)"
              showFormatHint={false}
            />
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
          </div>
        ) : (
          <PdfTwoColumn
            left={
              <div>
                <PdfFileHeader
                  fileName={selectedFile.name}
                  subtitle="提取 PDF 文本并导出 Word（.doc）"
                  onReselect={handleReset}
                  disabled={isProcessing}
                />

                <div className="space-y-6">
                  <div className="flex gap-3 flex-wrap">
                    <ActionButton onClick={handleConvert} loading={isProcessing} disabled={isProcessing || isConverted}>
                      {isConverted ? '已转换' : '开始转换'}
                    </ActionButton>
                    {isConverted ? (
                      <ActionButton variant="secondary" onClick={handleDownload} disabled={isProcessing}>
                        下载Word文档
                      </ActionButton>
                    ) : null}
                  </div>

                  {isProcessing ? <div className="text-sm text-gray-600">正在提取文本… {progress}%</div> : null}
                  {error ? <div className="text-sm text-red-600">{error}</div> : null}
                </div>
              </div>
            }
            right={
              <div className="space-y-4">
                <PdfInfoCard title="注意">
                  <div className="text-sm text-gray-600 leading-relaxed">
                    当前实现会从 PDF 中提取文本并导出为 Word 可打开的 .doc（HTML 文档）。可用于复制/编辑，但不保证复杂排版、图片、表格的还原效果。
                  </div>
                </PdfInfoCard>
                <div className="text-sm text-gray-500 leading-relaxed">若需要高保真排版还原（含图片/表格），通常需要服务端渲染或专业排版引擎。</div>
              </div>
            }
          />
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default PdfToWord
