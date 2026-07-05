import { useEffect, useRef, useState } from 'react'
import { fabric } from 'fabric'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'
import { downloadFile, getFileNameWithoutExtension } from '@/utils/fileUtils'

const ImgEditCanvas: React.FC = () => {
  const tool = getToolById('img-edit-canvas')
  const [file, setFile] = useState<File | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const [imgObj, setImgObj] = useState<fabric.Image | null>(null)
  
  const [mode, setMode] = useState<'select' | 'draw'>('select')
  const [color, setColor] = useState('#ff0000')
  const [brushWidth, setBrushWidth] = useState(5)
  const [brightness, setBrightness] = useState(0) // -1 to 1

  if (!tool) return null

  useEffect(() => {
    if (file && canvasRef.current && containerRef.current && !canvas) {
      const c = new fabric.Canvas(canvasRef.current, {
        backgroundColor: '#f8fafc',
        preserveObjectStacking: true,
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
    if (!canvas) return
    canvas.isDrawingMode = mode === 'draw'
    if (mode === 'draw') {
      canvas.freeDrawingBrush.color = color
      canvas.freeDrawingBrush.width = brushWidth
    }
  }, [mode, color, brushWidth, canvas])

  const addText = () => {
    if (!canvas) return
    const text = new fabric.IText('双击编辑文字', {
      left: canvas.width ? canvas.width / 2 - 80 : 100,
      top: canvas.height ? canvas.height / 2 - 20 : 100,
      fontFamily: '"Microsoft YaHei", sans-serif',
      fill: color,
      fontSize: 32,
      borderColor: '#3b6de3',
      cornerColor: '#3b6de3',
      cornerSize: 8,
      transparentCorners: false,
    })
    canvas.add(text)
    canvas.setActiveObject(text)
    setMode('select')
  }

  // Need a wrapper to handle rotation since the canvas size changes
  const handleRotate = () => {
    if (!imgObj || !canvas) return
    const current = imgObj.angle || 0
    const nextAngle = (current + 90) % 360
    
    const w = imgObj.getScaledWidth()
    const h = imgObj.getScaledHeight()
    
    if (nextAngle === 90) {
      canvas.setWidth(h)
      canvas.setHeight(w)
      imgObj.set({ angle: nextAngle, left: h, top: 0 })
    } else if (nextAngle === 180) {
      canvas.setWidth(w)
      canvas.setHeight(h)
      imgObj.set({ angle: nextAngle, left: w, top: h })
    } else if (nextAngle === 270) {
      canvas.setWidth(h)
      canvas.setHeight(w)
      imgObj.set({ angle: nextAngle, left: 0, top: w })
    } else {
      canvas.setWidth(w)
      canvas.setHeight(h)
      imgObj.set({ angle: nextAngle, left: 0, top: 0 })
    }
    
    imgObj.setCoords()
    canvas.renderAll()
  }

  const flipX = () => {
    if (!imgObj || !canvas) return
    imgObj.set({ flipX: !imgObj.flipX })
    canvas.renderAll()
  }

  const flipY = () => {
    if (!imgObj || !canvas) return
    imgObj.set({ flipY: !imgObj.flipY })
    canvas.renderAll()
  }

  const applyFilter = () => {
    if (!imgObj || !canvas) return
    imgObj.filters = []
    if (brightness !== 0) {
      const filter = new fabric.Image.filters.Brightness({ brightness })
      imgObj.filters.push(filter)
    }
    imgObj.applyFilters()
    canvas.renderAll()
  }

  useEffect(() => {
    applyFilter()
  }, [brightness])

  const clearObjects = () => {
    if (!canvas || !imgObj) return
    const objects = canvas.getObjects()
    objects.forEach(obj => {
      if (obj !== imgObj) canvas.remove(obj)
    })
    canvas.renderAll()
  }

  const download = () => {
    if (!canvas || !file) return
    canvas.discardActiveObject()
    canvas.renderAll()
    const dataUrl = canvas.toDataURL({ format: 'png', quality: 1 })
    fetch(dataUrl).then(r => r.blob()).then(blob => {
      downloadFile(blob, `${getFileNameWithoutExtension(file.name)}_edit.png`)
    })
  }

  return (
    <ToolPageTemplate tool={tool}>
      {!file ? (
        <FileUploader onFileSelect={setFile} accept="image/*" />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-72 space-y-4 shrink-0">
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-5">
              
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">操作模式</div>
                <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <button 
                    onClick={() => setMode('select')} 
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === 'select' ? 'bg-[#eef4ff] text-[#3b6de3]' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    选择/移动
                  </button>
                  <div className="w-px bg-gray-200"></div>
                  <button 
                    onClick={() => setMode('draw')} 
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${mode === 'draw' ? 'bg-[#eef4ff] text-[#3b6de3]' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    自由涂鸦
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">画布工具</div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={addText} className="py-2 px-3 text-sm rounded bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors">添加文字</button>
                  <button onClick={clearObjects} className="py-2 px-3 text-sm rounded bg-white border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors">清除涂鸦/字</button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">图片变换</div>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={handleRotate} className="py-2 px-2 text-xs rounded bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">旋转90°</button>
                  <button onClick={flipX} className="py-2 px-2 text-xs rounded bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">水平翻转</button>
                  <button onClick={flipY} className="py-2 px-2 text-xs rounded bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">垂直翻转</button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">样式设置</div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 w-12">颜色</span>
                    <div className="flex-1 flex gap-2">
                      {['#ff0000', '#000000', '#ffffff', '#3b6de3', '#10b981', '#f59e0b'].map(c => (
                        <button 
                          key={c} 
                          onClick={() => setColor(c)} 
                          className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: c, boxShadow: c === '#ffffff' ? 'inset 0 0 0 1px #e5e7eb' : 'none' }}
                        />
                      ))}
                      <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-6 h-6 p-0 border-0 rounded cursor-pointer" />
                    </div>
                  </div>
                  
                  {mode === 'draw' && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 w-12">粗细</span>
                      <input 
                        type="range" min="1" max="30" 
                        value={brushWidth} 
                        onChange={e => setBrushWidth(Number(e.target.value))} 
                        className="flex-1"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 w-12">亮度</span>
                    <input 
                      type="range" min="-0.5" max="0.5" step="0.05"
                      value={brightness} 
                      onChange={e => setBrightness(Number(e.target.value))} 
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-gray-200 space-y-3">
                <ActionButton onClick={download} className="w-full">保存并下载</ActionButton>
                <ActionButton variant="secondary" onClick={() => setFile(null)} className="w-full">重新选择图片</ActionButton>
              </div>
            </div>
          </div>
          
          <div 
            ref={containerRef} 
            className="flex-1 bg-gray-100 rounded-xl border border-gray-200 min-h-[600px] overflow-auto p-4 relative"
            style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          >
            <div className="shadow-md mx-auto w-max h-max">
              <canvas ref={canvasRef} />
            </div>
          </div>
        </div>
      )}
    </ToolPageTemplate>
  )
}

export default ImgEditCanvas
