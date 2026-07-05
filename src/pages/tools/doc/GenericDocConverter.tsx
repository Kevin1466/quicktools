import { useState } from 'react'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { PdfFileHeader, PdfTwoColumn } from '@/components/pdf/PdfToolUI'
import * as XLSX from 'xlsx'
import { PDFDocument } from '@maxwbh/pdf-lib'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

interface GenericDocConverterProps {
  toolId: string
  acceptTypes: string
  acceptHint: string
  targetFormats?: string[] // If provided, shows a dropdown to select format
  defaultTargetExt?: string
}

const GenericDocConverter: React.FC<GenericDocConverterProps> = ({
  toolId,
  acceptTypes,
  acceptHint,
  targetFormats,
  defaultTargetExt = '.pdf',
}) => {
  const tool = getToolById(toolId)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [targetFormat, setTargetFormat] = useState(targetFormats ? targetFormats[0] : defaultTargetExt)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isConverted, setIsConverted] = useState(false)
  const [error, setError] = useState('')
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null)

  const handleFileSelect = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!ext || !acceptTypes.includes(ext)) {
      setError(`请选择支持的文件格式 (${acceptHint})`)
      return
    }
    setSelectedFile(file)
    setIsConverted(false)
    setConvertedBlob(null)
    setError('')
  }

  // 真正的转换逻辑
  const handleConvert = async () => {
    if (!selectedFile) return
    setIsProcessing(true)
    setError('')

    try {
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase() || ''
      const targetExt = targetFormat.startsWith('.') ? targetFormat : `.${targetFormat.toLowerCase()}`
      const targetExtClean = targetExt.replace('.', '')

      let resultBlob: Blob | null = null

      const escapeHtml = (s: string) =>
        s
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')

      const buildHtml = (title: string, body: string) =>
        `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{font-family:Microsoft YaHei,Arial,sans-serif;line-height:1.7;color:#111827;margin:24px}pre{white-space:pre-wrap;word-break:break-word;margin:0}table{border-collapse:collapse}td,th{border:1px solid #e5e7eb;padding:6px 10px;font-size:12px}</style></head><body>${body}</body></html>`

      const ooxmlTextToPdf = async (text: string) => {
        const scale = 2
        const pageWidth = 595
        const pageHeight = 842
        const canvasWidth = pageWidth * scale
        const canvasHeight = pageHeight * scale
        const margin = 40 * scale
        const fontSize = 12 * scale
        const lineHeight = 18 * scale

        const makeCtx = () => {
          const canvas = document.createElement('canvas')
          canvas.width = canvasWidth
          canvas.height = canvasHeight
          const ctx = canvas.getContext('2d')
          if (!ctx) throw new Error('无法获取 Canvas 上下文')
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvasWidth, canvasHeight)
          ctx.fillStyle = '#111827'
          ctx.font = `${fontSize}px Microsoft YaHei, Arial, sans-serif`
          ctx.textBaseline = 'top'
          return { canvas, ctx }
        }

        const wrapLine = (ctx: CanvasRenderingContext2D, raw: string, maxWidth: number) => {
          const out: string[] = []
          if (!raw) return ['']
          const normalized = raw.replace(/\s+/g, ' ').trimEnd()
          if (!normalized) return ['']

          const tokens = normalized.includes(' ') ? normalized.split(' ') : Array.from(normalized)
          let current = ''

          const pushCurrent = () => {
            if (current) out.push(current)
            current = ''
          }

          for (const token of tokens) {
            const candidate = current ? (normalized.includes(' ') ? `${current} ${token}` : `${current}${token}`) : token
            if (ctx.measureText(candidate).width <= maxWidth) {
              current = candidate
              continue
            }
            if (current) {
              pushCurrent()
              const retry = token
              if (ctx.measureText(retry).width <= maxWidth) {
                current = retry
              } else {
                let chunk = ''
                for (const ch of Array.from(retry)) {
                  const c2 = chunk ? `${chunk}${ch}` : ch
                  if (ctx.measureText(c2).width <= maxWidth) {
                    chunk = c2
                  } else {
                    if (chunk) out.push(chunk)
                    chunk = ch
                  }
                }
                if (chunk) out.push(chunk)
              }
              continue
            }
            current = candidate
          }
          if (current) out.push(current)
          return out
        }

        const rawLines = text.replace(/\r\n/g, '\n').split('\n')
        const pages: Uint8Array[] = []

        let { canvas, ctx } = makeCtx()
        let y = margin
        const maxWidth = canvasWidth - margin * 2

        const flush = async () => {
          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob((b) => {
              if (!b) reject(new Error('生成图片失败'))
              else resolve(b)
            }, 'image/png')
          })
          pages.push(new Uint8Array(await blob.arrayBuffer()))
          ;({ canvas, ctx } = makeCtx())
          y = margin
        }

        for (const raw of rawLines) {
          const wrapped = wrapLine(ctx, raw, maxWidth)
          for (const line of wrapped) {
            if (y + lineHeight > canvasHeight - margin) await flush()
            ctx.fillText(line, margin, y)
            y += lineHeight
          }
        }
        await flush()

        const pdf = await PDFDocument.create()
        for (const pngBytes of pages) {
          const img = await pdf.embedPng(pngBytes)
          const page = pdf.addPage([pageWidth, pageHeight])
          page.drawImage(img, { x: 0, y: 0, width: pageWidth, height: pageHeight })
        }
        const bytes = await pdf.save()
        return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' })
      }

      const extractDocxText = async (file: File) => {
        const zip = await JSZip.loadAsync(await file.arrayBuffer())
        const docXml = await zip.file('word/document.xml')?.async('text')
        if (!docXml) throw new Error('无法读取 DOCX 内容')
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(docXml, 'application/xml')

        const wNs =
          xmlDoc.documentElement.lookupNamespaceURI('w') ||
          xmlDoc.documentElement.getAttribute('xmlns:w') ||
          ''

        const ps = wNs
          ? Array.from(xmlDoc.getElementsByTagNameNS(wNs, 'p'))
          : Array.from(xmlDoc.getElementsByTagName('w:p'))

        const out: string[] = []

        const walk = (node: Node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element
            const ln = el.localName || el.nodeName
            if (ln === 't') {
              out.push(el.textContent || '')
              return
            }
            if (ln === 'tab') {
              out.push('\t')
              return
            }
            if (ln === 'br' || ln === 'cr') {
              out.push('\n')
              return
            }
          }
          node.childNodes.forEach(walk)
        }

        for (const p of ps) {
          const beforeLen = out.length
          walk(p)
          const afterLen = out.length
          if (afterLen === beforeLen) out.push('')
          out.push('\n')
        }

        return out
          .join('')
          .replace(/\r\n/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim()
      }

      const extractPptxText = async (file: File) => {
        const zip = await JSZip.loadAsync(await file.arrayBuffer())
        const slideFiles = Object.keys(zip.files)
          .filter(p => /^ppt\/slides\/slide\d+\.xml$/.test(p))
          .sort((a, b) => {
            const na = Number(a.match(/slide(\d+)\.xml$/)?.[1] || 0)
            const nb = Number(b.match(/slide(\d+)\.xml$/)?.[1] || 0)
            return na - nb
          })
        if (slideFiles.length === 0) throw new Error('无法读取 PPTX 内容')
        const parser = new DOMParser()
        const out: string[] = []
        for (let i = 0; i < slideFiles.length; i++) {
          const xml = await zip.file(slideFiles[i])!.async('text')
          const xmlDoc = parser.parseFromString(xml, 'application/xml')
          const aNs =
            xmlDoc.documentElement.lookupNamespaceURI('a') ||
            xmlDoc.documentElement.getAttribute('xmlns:a') ||
            ''

          const ts = aNs
            ? Array.from(xmlDoc.getElementsByTagNameNS(aNs, 't'))
            : Array.from(xmlDoc.getElementsByTagName('a:t'))

          const t = ts
            .map(n => n.textContent || '')
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim()
          out.push(`第 ${i + 1} 页`)
          if (t) out.push(t)
          out.push('')
        }
        return out.join('\n')
      }

      // ====== Excel 处理 (xlsx 库) ======
      if (['xlsx', 'xls', 'csv'].includes(fileExt)) {
        const arrayBuffer = await selectedFile.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })

        if (targetExtClean === 'csv') {
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const csvContent = XLSX.utils.sheet_to_csv(firstSheet)
          resultBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
        } else if (targetExtClean === 'html') {
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const htmlContent = XLSX.utils.sheet_to_html(firstSheet)
          resultBlob = new Blob([buildHtml(selectedFile.name, htmlContent)], { type: 'text/html;charset=utf-8' })
        } else if (targetExtClean === 'pdf') {
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const csvContent = XLSX.utils.sheet_to_csv(firstSheet)
          resultBlob = await ooxmlTextToPdf(csvContent)
        } else if (targetExtClean === 'xlsx') {
          const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
          resultBlob = new Blob([wbout], { type: 'application/octet-stream' })
        }
      }

      if (['pptx', 'ppt'].includes(fileExt)) {
        if (fileExt === 'ppt') {
          setError('PPT 为旧格式，浏览器端暂不支持解析，请使用 PPTX')
          return
        }
        if (targetExtClean === 'html') {
          const text = await extractPptxText(selectedFile)
          resultBlob = new Blob([buildHtml(selectedFile.name, `<pre>${escapeHtml(text)}</pre>`)], { type: 'text/html;charset=utf-8' })
        } else if (targetExtClean === 'pdf') {
          const text = await extractPptxText(selectedFile)
          resultBlob = await ooxmlTextToPdf(text)
        } else if (targetExtClean === 'pptx') {
          resultBlob = selectedFile.slice(0, selectedFile.size, 'application/vnd.openxmlformats-officedocument.presentationml.presentation')
        }
      }

      // ====== PDF 处理 (pdf-lib 库) ======
      if (fileExt === 'pdf') {
        const arrayBuffer = await selectedFile.arrayBuffer()

        if (['png', 'jpg', 'jpeg'].includes(targetExtClean)) {
          setError('PDF 转图片请使用“PDF转图片”工具（按页渲染并打包下载），该工具页不提供占位下载。')
          return
        }

        if (targetExtClean === 'pdf') {
          // PDF 瘦身/合并/水印等简单操作
          const pdfDoc = await PDFDocument.load(arrayBuffer)
          // 这里做一个简单的"优化"（移除元数据等）
          const pdfBytes = await pdfDoc.save({ useObjectStreams: true })
          resultBlob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
        }
      }

      // ====== Word/文本处理 ======
      if (['docx', 'doc', 'txt'].includes(fileExt)) {
        // 读取文本内容
        if (fileExt === 'txt') {
          const text = await selectedFile.text()
          if (targetExtClean === 'txt') {
            resultBlob = new Blob([text], { type: 'text/plain;charset=utf-8' })
          }
          if (targetExtClean === 'pdf') {
            resultBlob = await ooxmlTextToPdf(text)
          }
          if (targetExtClean === 'html') {
            resultBlob = new Blob([buildHtml(selectedFile.name, `<pre>${escapeHtml(text)}</pre>`)], { type: 'text/html;charset=utf-8' })
          }
        } else if (fileExt === 'doc') {
          setError('DOC 为旧格式，浏览器端暂不支持解析，请使用 DOCX')
          return
        } else if (fileExt === 'docx') {
          const text = await extractDocxText(selectedFile)
          if (!text.trim()) {
            setError('未从 DOCX 中提取到可转换的文本内容（可能是纯图片/复杂对象文档）')
            return
          }
          if (targetExtClean === 'html') {
            resultBlob = new Blob([buildHtml(selectedFile.name, `<pre>${escapeHtml(text)}</pre>`)], { type: 'text/html;charset=utf-8' })
          } else if (targetExtClean === 'pdf') {
            resultBlob = await ooxmlTextToPdf(text)
          } else if (targetExtClean === 'txt') {
            resultBlob = new Blob([text], { type: 'text/plain;charset=utf-8' })
          }
        }
      }

      if (resultBlob) {
        setConvertedBlob(resultBlob)
        setIsConverted(true)
      } else {
        // 如果上面的特定处理都没匹配到，给出友好提示
        setError(`暂不支持 ${fileExt.toUpperCase()} 到 ${targetExtClean.toUpperCase()} 的完整转换，请尝试其他格式`)
      }
    } catch (err) {
      console.error(err)
      setError(`转换失败: ${err instanceof Error ? err.message : '未知错误'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!convertedBlob || !selectedFile) return

    let ext = targetFormat.startsWith('.') ? targetFormat : `.${targetFormat.toLowerCase()}`
    const newName = selectedFile.name.replace(/\.[^/.]+$/, '') + '_converted' + ext

    // 使用 file-saver 的 saveAs，兼容性更好
    saveAs(convertedBlob, newName)
  }

  const handleReset = () => {
    setSelectedFile(null)
    setIsConverted(false)
    setConvertedBlob(null)
    setError('')
  }

  if (!tool) {
    return <div className="p-8 text-center">工具不存在</div>
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        {!selectedFile ? (
          <div className="space-y-4 max-w-2xl mx-auto">
            <FileUploader
              onFileSelect={handleFileSelect}
              accept={acceptTypes}
              placeholder="将文件拖拽到此处"
              primaryActionText={`点击上传文件 (${acceptHint})`}
              showFormatHint={false}
            />
            {error ? <div className="text-sm text-red-600 text-center">{error}</div> : null}
          </div>
        ) : (
          <PdfTwoColumn
            left={
              <div>
                <PdfFileHeader
                  fileName={selectedFile.name}
                  subtitle={`${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`}
                  onReselect={handleReset}
                  disabled={isProcessing}
                />

                <div className="space-y-6">
                  {targetFormats && targetFormats.length > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-700">目标格式:</span>
                      <div className="flex gap-2">
                        {targetFormats.map(fmt => (
                          <label key={fmt} className="flex items-center gap-1 text-sm">
                            <input
                              type="radio"
                              name="format"
                              value={fmt}
                              checked={targetFormat === fmt}
                              onChange={(e) => setTargetFormat(e.target.value)}
                              disabled={isProcessing || isConverted}
                            />
                            {fmt.toUpperCase()}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 flex-wrap">
                    <ActionButton onClick={handleConvert} loading={isProcessing} disabled={isProcessing || isConverted}>
                      {isConverted ? '处理完成' : '开始处理'}
                    </ActionButton>
                    {isConverted ? (
                      <ActionButton variant="secondary" onClick={handleDownload} disabled={isProcessing}>
                        下载文件
                      </ActionButton>
                    ) : null}
                  </div>

                  {error ? <div className="text-sm text-red-600">{error}</div> : null}
                </div>
              </div>
            }
          />
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default GenericDocConverter
