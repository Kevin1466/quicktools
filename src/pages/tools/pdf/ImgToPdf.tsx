import { useState, useEffect } from 'react'
import { PDFDocument } from '@maxwbh/pdf-lib'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'
import { downloadFile, formatFileSize } from '@/utils/fileUtils'

const ImgToPdf: React.FC = () => {
  const tool = getToolById('img-2-pdf-convert')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [outUrl, setOutUrl] = useState<string | null>(null)
  const [outBlob, setOutBlob] = useState<Blob | null>(null)
  const [pageSize, setPageSize] = useState<'A4' | 'fit'>('A4')

  if (!tool) return null

  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url))
      if (outUrl) URL.revokeObjectURL(outUrl)
    }
  }, [previews, outUrl])

  const handleFiles = (selected: File | File[]) => {
    const newFiles = Array.isArray(selected) ? selected : [selected]
    const imgFiles = newFiles.filter(f => f.type.startsWith('image/'))
    if (imgFiles.length === 0) return

    setFiles(prev => [...prev, ...imgFiles])
    setPreviews(prev => [...prev, ...imgFiles.map(f => URL.createObjectURL(f))])
    setOutUrl(null)
    setOutBlob(null)
    setError('')
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
    setOutUrl(null)
    setOutBlob(null)
  }

  const createPdf = async () => {
    if (files.length === 0) return
    setBusy(true)
    setError('')
    
    try {
      const pdfDoc = await PDFDocument.create()

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const buffer = await file.arrayBuffer()
        
        let pdfImage
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          pdfImage = await pdfDoc.embedJpg(buffer)
        } else if (file.type === 'image/png') {
          pdfImage = await pdfDoc.embedPng(buffer)
        } else {
          // Fallback: convert other formats (webp, gif) to PNG using canvas
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image()
            image.onload = () => resolve(image)
            image.onerror = reject
            image.src = previews[i]
          })
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          canvas.getContext('2d')?.drawImage(img, 0, 0)
          const pngDataUrl = canvas.toDataURL('image/png')
          const pngBuffer = await (await fetch(pngDataUrl)).arrayBuffer()
          pdfImage = await pdfDoc.embedPng(pngBuffer)
        }

        const imgDims = pdfImage.scale(1)

        if (pageSize === 'A4') {
          // A4 size is roughly 595.28 x 841.89 points
          const A4_WIDTH = 595.28
          const A4_HEIGHT = 841.89
          const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT])
          
          // Scale image to fit A4 while maintaining aspect ratio
          const scale = Math.min(
            (A4_WIDTH - 40) / imgDims.width, 
            (A4_HEIGHT - 40) / imgDims.height
          )
          
          const scaledW = imgDims.width * scale
          const scaledH = imgDims.height * scale
          
          page.drawImage(pdfImage, {
            x: (A4_WIDTH - scaledW) / 2,
            y: (A4_HEIGHT - scaledH) / 2,
            width: scaledW,
            height: scaledH,
          })
        } else {
          // Fit page to image size
          const page = pdfDoc.addPage([imgDims.width, imgDims.height])
          page.drawImage(pdfImage, {
            x: 0,
            y: 0,
            width: imgDims.width,
            height: imgDims.height,
          })
        }
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
      setOutBlob(blob)
      setOutUrl(URL.createObjectURL(blob))
    } catch (e) {
      setError('生成 PDF 失败：' + (e instanceof Error ? e.message : '未知错误'))
    } finally {
      setBusy(false)
    }
  }

  const download = () => {
    if (!outBlob) return
    downloadFile(outBlob, 'images_converted.pdf')
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        {files.length === 0 ? (
          <FileUploader onFileSelect={handleFiles} accept="image/*" multiple placeholder="上传多张图片合成 PDF" />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 space-y-4 min-w-0">
              <div className="p-5 rounded-xl border border-gray-100 bg-gray-50 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-600 block">页面尺寸</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="pageSize" checked={pageSize === 'A4'} onChange={() => setPageSize('A4')} />
                      <span className="text-sm">统一A4尺寸 (居中)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="pageSize" checked={pageSize === 'fit'} onChange={() => setPageSize('fit')} />
                      <span className="text-sm">自适应原图尺寸</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <label className="flex items-center justify-center w-full py-2 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input type="file" multiple accept="image/*" className="hidden" onChange={e => {
                      if (e.target.files) handleFiles(Array.from(e.target.files))
                    }} />
                    继续添加图片
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative group aspect-square rounded-lg border border-gray-200 bg-[#f8fafc] overflow-hidden flex items-center justify-center">
                    <img src={src} className="max-w-full max-h-full object-contain" />
                    <button 
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center py-1">
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full lg:w-[400px] shrink-0 space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center min-h-[400px]">
                {outUrl ? (
                  <div className="space-y-4 w-full flex flex-col items-center">
                    <object data={outUrl} type="application/pdf" className="w-full h-[400px] rounded border border-gray-200">
                      <p>无法预览 PDF，请直接下载</p>
                    </object>
                    <div className="text-sm text-gray-500">
                      大小: {outBlob && formatFileSize(outBlob.size)}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">
                    {busy ? '正在生成 PDF，请稍候...' : '点击底部按钮生成 PDF'}
                  </div>
                )}
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <div className="flex gap-3">
                <ActionButton 
                  className="flex-1" 
                  onClick={createPdf} 
                  disabled={busy || files.length === 0}
                  loading={busy}
                >
                  开始生成
                </ActionButton>
                {outUrl && (
                  <ActionButton 
                    variant="secondary" 
                    className="flex-1" 
                    onClick={download}
                  >
                    下载 PDF
                  </ActionButton>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default ImgToPdf
