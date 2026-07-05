import { PDFDocument } from '@maxwbh/pdf-lib'
import { downloadFile, readFileAsArrayBuffer } from './fileUtils'

type WatermarkPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tile'

interface WatermarkConfig {
  text?: string
  image?: string
  position?: WatermarkPosition
  opacity?: number
  rotation?: number
  fontSize?: number
  color?: { r: number; g: number; b: number }
  fontFamily?: string
}

const ptToPx = (pt: number): number => (pt * 96) / 72
const pxToPt = (px: number): number => (px * 72) / 96

const rgbaToString = (r: number, g: number, b: number, a: number): string => {
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`
}

const createWatermarkImage = (
  text: string,
  fontSize: number,
  color: { r: number; g: number; b: number },
  opacity: number,
  rotation: number
): string => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('无法创建 Canvas 上下文')
  }

  const cssFontSize = ptToPx(fontSize)
  const padding = cssFontSize * 2
  
  ctx.font = `${cssFontSize}px "Microsoft YaHei", "SimHei", "PingFang SC", sans-serif`
  const textMetrics = ctx.measureText(text)
  const textWidth = textMetrics.width
  const textHeight = cssFontSize * 1.4

  const radians = (rotation * Math.PI) / 180
  const cos = Math.abs(Math.cos(radians))
  const sin = Math.abs(Math.sin(radians))
  
  const rotatedWidth = textWidth * cos + textHeight * sin + padding * 2
  const rotatedHeight = textWidth * sin + textHeight * cos + padding * 2

  canvas.width = rotatedWidth
  canvas.height = rotatedHeight

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.font = `${cssFontSize}px "Microsoft YaHei", "SimHei", "PingFang SC", sans-serif`
  ctx.fillStyle = rgbaToString(color.r, color.g, color.b, opacity)
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'

  ctx.save()
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate(radians)
  ctx.fillText(text, 0, 0)
  ctx.restore()

  return canvas.toDataURL('image/png')
}

export const addTextWatermark = async (
  file: File,
  config: WatermarkConfig
): Promise<Blob> => {
  try {
    console.log('开始添加水印，文件名:', file.name, '大小:', file.size)
    
    const {
      text = 'WATERMARK',
      opacity = 0.3,
      rotation = 0,
      fontSize = 48,
      color = { r: 0.5, g: 0.5, b: 0.5 },
      position = 'tile'
    } = config
    
    console.log('水印配置:', { text, opacity, rotation, fontSize, color, position })

    const finalRotation = rotation !== 0 ? rotation : -45
    console.log('最终旋转角度:', finalRotation)

    const watermarkImageUrl = createWatermarkImage(text, fontSize, color, opacity, finalRotation)
    console.log('水印图片创建成功')

    const arrayBuffer = await readFileAsArrayBuffer(file)
    console.log('文件读取成功，大小:', arrayBuffer.byteLength)
    
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    console.log('PDF加载成功')
    
    const pngImage = await pdfDoc.embedPng(watermarkImageUrl)
    console.log('水印图片嵌入成功')

    const pages = pdfDoc.getPages()
    console.log('PDF页数:', pages.length)

    const imgWPt = pxToPt(pngImage.width)
    const imgHPt = pxToPt(pngImage.height)
    console.log('水印图片尺寸 (pt):', imgWPt, 'x', imgHPt)

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      const { width: pageW, height: pageH } = page.getSize()
      console.log(`处理第 ${i + 1} 页，尺寸: ${pageW}x${pageH}`)

      if (position === 'tile') {
        const xGap = Math.max(imgWPt + 100, 200)
        const yGap = Math.max(imgHPt + 80, 150)
        
        let tileCount = 0
        for (let x = -pageW; x < pageW * 2; x += xGap) {
          for (let y = -pageH; y < pageH * 2; y += yGap) {
            page.drawImage(pngImage, {
              x,
              y,
              width: imgWPt,
              height: imgHPt,
              opacity: 1
            })
            tileCount++
          }
        }
        console.log(`平铺水印数量: ${tileCount}`)
      } else {
        let xPos: number
        let yPos: number
        const margin = 50

        switch (position) {
          case 'top-left':
            xPos = margin
            yPos = pageH - margin - imgHPt
            break
          case 'top-right':
            xPos = pageW - margin - imgWPt
            yPos = pageH - margin - imgHPt
            break
          case 'bottom-left':
            xPos = margin
            yPos = margin
            break
          case 'bottom-right':
            xPos = pageW - margin - imgWPt
            yPos = margin
            break
          case 'center':
          default:
            xPos = (pageW - imgWPt) / 2
            yPos = (pageH - imgHPt) / 2
            break
        }

        page.drawImage(pngImage, {
          x: xPos,
          y: yPos,
          width: imgWPt,
          height: imgHPt,
          opacity: 1
        })
        console.log(`水印位置: x=${xPos}, y=${yPos}`)
      }
    }

    console.log('开始保存PDF...')
    const pdfBytes = await pdfDoc.save()
    console.log('PDF保存成功，大小:', pdfBytes.length)

    const bytes = pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes)
    const safeBytes = Uint8Array.from(bytes)
    return new Blob([safeBytes], { type: 'application/pdf' })
  } catch (error) {
    console.error('addTextWatermark 错误:', error)
    if (error instanceof Error) {
      console.error('错误名称:', error.name)
      console.error('错误消息:', error.message)
      console.error('错误堆栈:', error.stack)
    }
    throw error
  }
}

export const generateWatermarkPreview = (
  text: string,
  fontSize: number,
  color: { r: number; g: number; b: number },
  opacity: number,
  rotation: number
): string => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    return ''
  }

  const cssFontSize = ptToPx(fontSize)
  const previewSize = 200
  canvas.width = previewSize
  canvas.height = previewSize

  ctx.clearRect(0, 0, previewSize, previewSize)
  ctx.fillStyle = '#fafafa'
  ctx.fillRect(0, 0, previewSize, previewSize)

  ctx.strokeStyle = '#e0e0e0'
  ctx.lineWidth = 1
  ctx.setLineDash([5, 5])
  ctx.strokeRect(10, 10, previewSize - 20, previewSize - 20)
  ctx.setLineDash([])

  const finalRotation = rotation !== 0 ? rotation : -45
  const radians = (finalRotation * Math.PI) / 180

  ctx.save()
  ctx.translate(previewSize / 2, previewSize / 2)
  ctx.rotate(radians)
  ctx.font = `${cssFontSize * 0.6}px "Microsoft YaHei", "SimHei", "PingFang SC", sans-serif`
  ctx.fillStyle = rgbaToString(color.r, color.g, color.b, opacity)
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText(text || 'WATERMARK', 0, 0)
  ctx.restore()

  return canvas.toDataURL('image/png')
}

export const pdfUtils = {
  compressPdf: async (file: File): Promise<Blob> => {
    console.warn('PDF compression requires pdf-lib or pdf.js library')
    return file
  },

  mergePdfs: async (files: File[]): Promise<Blob> => {
    console.warn('PDF merging requires pdf-lib library')
    return files[0] || new Blob()
  },

  splitPdf: async (file: File, pageNumbers: number[]): Promise<Blob> => {
    console.warn('PDF splitting requires pdf-lib library')
    return file
  },

  addWatermark: async (
    file: File,
    watermark: WatermarkConfig
  ): Promise<Blob> => {
    return addTextWatermark(file, watermark)
  },

  pdfToImages: async (file: File): Promise<string[]> => {
    console.warn('PDF to images conversion requires pdf.js library')
    return []
  },

  downloadPdf: (blob: Blob, filename: string) => {
    downloadFile(blob, filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
  },

  generateWatermarkPreview
}

export default pdfUtils
