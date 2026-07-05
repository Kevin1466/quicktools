import { useState, useRef, useEffect } from 'react'
import { fabric } from 'fabric'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'
import { downloadFile, getFileNameWithoutExtension } from '@/utils/fileUtils'
import { useAIConfigContext } from '@/contexts/AIConfigContext'

const ImgWatermarkRemove: React.FC = () => {
  const tool = getToolById('img-watermark-remove')
  const { config, openModal } = useAIConfigContext()
  
  const [file, setFile] = useState<File | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const [imgObj, setImgObj] = useState<fabric.Image | null>(null)
  
  const [brushWidth, setBrushWidth] = useState(20)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [outUrl, setOutUrl] = useState<string | null>(null)

  if (!tool) return null

  useEffect(() => {
    if (file && canvasRef.current && containerRef.current && !canvas) {
      const c = new fabric.Canvas(canvasRef.current, {
        backgroundColor: '#f8fafc',
        isDrawingMode: true,
      })
      setCanvas(c)

      const url = URL.createObjectURL(file)
      fabric.Image.fromURL(url, (img) => {
        if (img.width && img.height) {
          const maxW = containerRef.current?.clientWidth ? containerRef.current.clientWidth - 40 : 800
          const maxH = 600
          const scale = Math.min(maxW / img.width, maxH / img.height, 1)
          
          c.setWidth(img.width * scale)
          c.setHeight(img.height * scale)
          
          img.set({
            scaleX: scale,
            scaleY: scale,
            left: 0,
            top: 0,
            selectable: false,
            evented: false,
          })
          c.add(img)
          c.sendToBack(img)
          setImgObj(img)
        }
        URL.revokeObjectURL(url)
      })

      return () => {
        c.dispose()
        setCanvas(null)
      }
    }
  }, [file])

  useEffect(() => {
    if (canvas) {
      canvas.freeDrawingBrush.color = 'rgba(255, 0, 0, 0.5)'
      canvas.freeDrawingBrush.width = brushWidth
    }
  }, [brushWidth, canvas])

  const clearMask = () => {
    if (!canvas || !imgObj) return
    const objects = canvas.getObjects()
    objects.forEach(obj => {
      if (obj !== imgObj) canvas.remove(obj)
    })
    canvas.renderAll()
  }

  const processAI = async () => {
    if (!canvas || !file || !imgObj) return
    if (!config.silicon.apiKey) {
      openModal()
      return
    }

    setBusy(true)
    setError('')
    
    try {
      // 1. Export original image
      const origCanvas = document.createElement('canvas')
      origCanvas.width = imgObj.width!
      origCanvas.height = imgObj.height!
      const origCtx = origCanvas.getContext('2d')
      if (origCtx) {
        origCtx.drawImage(imgObj.getElement(), 0, 0)
      }
      
      const origBlob = await new Promise<Blob>((resolve) => origCanvas.toBlob(b => resolve(b!), 'image/png'))

      // 2. Export mask image (black background, white mask)
      const maskCanvas = document.createElement('canvas')
      maskCanvas.width = imgObj.getScaledWidth()
      maskCanvas.height = imgObj.getScaledHeight()
      const maskCtx = maskCanvas.getContext('2d')
      
      if (maskCtx) {
        maskCtx.fillStyle = '#000000'
        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height)
        
        // draw the strokes as white
        const objects = canvas.getObjects()
        objects.forEach(obj => {
          if (obj !== imgObj) {
            const clone = fabric.util.object.clone(obj)
            clone.set({ stroke: '#ffffff', opacity: 1 })
            clone.render(maskCtx)
          }
        })
      }
      
      const maskBlob = await new Promise<Blob>((resolve) => maskCanvas.toBlob(b => resolve(b!), 'image/png'))

      // 3. Call SiliconFlow Inpainting API
      const formData = new FormData()
      formData.append('image', origBlob, 'image.png')
      formData.append('mask', maskBlob, 'mask.png')
      formData.append('prompt', 'background') // Inpainting models usually need a prompt
      formData.append('model', 'stabilityai/stable-diffusion-xl-base-1.0') // Attempting with a standard model

      const res = await fetch(`${config.silicon.baseUrl}/images/edits`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.silicon.apiKey}`
        },
        body: formData
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`API 请求失败 (${res.status}): ${errText}`)
      }

      const data = await res.json()
      if (data.data && data.data[0] && data.data[0].url) {
        setOutUrl(data.data[0].url)
      } else {
        throw new Error('未获取到生成的图片URL')
      }

    } catch (e) {
      setError(e instanceof Error ? e.message : '未知错误')
    } finally {
      setBusy(false)
    }
  }

  const download = () => {
    if (!outUrl || !file) return
    fetch(outUrl).then(r => r.blob()).then(blob => {
      downloadFile(blob, `${getFileNameWithoutExtension(file.name)}_nowatermark.png`)
    })
  }

  return (
    <ToolPageTemplate tool={tool}>
      {!file ? (
        <FileUploader onFileSelect={setFile} accept="image/*" placeholder="上传需要去水印的图片" />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-72 space-y-4 shrink-0">
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-5">
              
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">使用说明</div>
                <div className="text-xs text-gray-500 leading-relaxed">
                  请使用画笔涂抹图片中包含水印或需要消除的区域。系统将调用 AI Inpainting 模型智能擦除并还原背景。
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">画笔粗细</div>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" min="5" max="100" 
                    value={brushWidth} 
                    onChange={e => setBrushWidth(Number(e.target.value))} 
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-500 w-8">{brushWidth}px</span>
                </div>
              </div>

              <div className="space-y-3">
                <button onClick={clearMask} className="w-full py-2 px-3 text-sm rounded bg-white border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors">
                  清除所有涂抹
                </button>
              </div>

              {error && <div className="text-xs text-red-600 break-words">{error}</div>}

              <div className="pt-5 border-t border-gray-200 space-y-3">
                <ActionButton onClick={processAI} loading={busy} disabled={busy} className="w-full">
                  开始 AI 智能擦除
                </ActionButton>
                <ActionButton variant="secondary" onClick={() => { setFile(null); setOutUrl(null) }} className="w-full">
                  重新选择图片
                </ActionButton>
              </div>
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div 
              ref={containerRef} 
              className="bg-gray-100 rounded-xl border border-gray-200 min-h-[500px] overflow-auto p-4 relative"
              style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            >
              <div className="shadow-md mx-auto w-max h-max">
                <canvas ref={canvasRef} />
              </div>
            </div>

            {outUrl && (
              <div className="bg-white rounded-xl border border-green-200 p-4 space-y-4">
                <div className="text-sm font-medium text-green-700 flex items-center justify-between">
                  <span>AI 擦除结果</span>
                  <button onClick={download} className="text-[#3b6de3] hover:underline">下载图片</button>
                </div>
                <div className="flex justify-center bg-gray-50 rounded border border-gray-100 p-4">
                  <img src={outUrl} className="max-w-full max-h-[400px] object-contain shadow-sm" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </ToolPageTemplate>
  )
}

export default ImgWatermarkRemove
