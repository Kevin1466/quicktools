import { useEffect, useMemo, useRef, useState } from 'react'
import { saveAs } from 'file-saver'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

const ZitieTool: React.FC = () => {
  const tool = getToolById('zitie-new')
  const [text, setText] = useState('天地玄黄 宇宙洪荒')
  const [cols, setCols] = useState(10)
  const [rows, setRows] = useState(14)
  const [fontSize, setFontSize] = useState(48)
  const [showTian, setShowTian] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  if (!tool) return null

  const layout = useMemo(() => {
    const dpi = 150
    const width = Math.floor((210 / 25.4) * dpi)
    const height = Math.floor((297 / 25.4) * dpi)
    const padding = 24
    const gridW = width - padding * 2
    const gridH = height - padding * 2
    const c = clamp(cols, 4, 20)
    const r = clamp(rows, 6, 28)
    const cell = Math.floor(Math.min(gridW / c, gridH / r))
    const startX = Math.floor((width - cell * c) / 2)
    const startY = Math.floor((height - cell * r) / 2)
    return { width, height, padding, c, r, cell, startX, startY }
  }, [cols, rows])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = layout.width
    canvas.height = layout.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1

    for (let r = 0; r <= layout.r; r++) {
      const y = layout.startY + r * layout.cell
      ctx.beginPath()
      ctx.moveTo(layout.startX, y)
      ctx.lineTo(layout.startX + layout.c * layout.cell, y)
      ctx.stroke()
    }

    for (let c = 0; c <= layout.c; c++) {
      const x = layout.startX + c * layout.cell
      ctx.beginPath()
      ctx.moveTo(x, layout.startY)
      ctx.lineTo(x, layout.startY + layout.r * layout.cell)
      ctx.stroke()
    }

    if (showTian) {
      ctx.strokeStyle = '#f1f5f9'
      for (let r = 0; r < layout.r; r++) {
        for (let c = 0; c < layout.c; c++) {
          const x = layout.startX + c * layout.cell
          const y = layout.startY + r * layout.cell
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x + layout.cell, y + layout.cell)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(x + layout.cell, y)
          ctx.lineTo(x, y + layout.cell)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(x + layout.cell / 2, y)
          ctx.lineTo(x + layout.cell / 2, y + layout.cell)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(x, y + layout.cell / 2)
          ctx.lineTo(x + layout.cell, y + layout.cell / 2)
          ctx.stroke()
        }
      }
      ctx.strokeStyle = '#e5e7eb'
    }

    const chars = Array.from(text.replace(/\s+/g, ''))
    ctx.fillStyle = '#111827'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const fs = clamp(fontSize, 16, layout.cell - 6)
    ctx.font = `${fs}px "KaiTi","STKaiti","Kaiti SC","PingFang SC","Microsoft YaHei",serif`

    let i = 0
    for (let r = 0; r < layout.r; r++) {
      for (let c = 0; c < layout.c; c++) {
        const ch = chars[i++]
        if (!ch) return
        const cx = layout.startX + c * layout.cell + layout.cell / 2
        const cy = layout.startY + r * layout.cell + layout.cell / 2
        ctx.fillText(ch, cx, cy)
      }
    }
  }, [text, fontSize, showTian, layout])

  const download = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) return
    saveAs(blob, 'zitie.png')
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">内容</div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="输入要练习的文字"
              className="w-full min-h-[180px] p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] resize-y"
            />
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">列数</div>
                <input
                  type="number"
                  value={cols}
                  min={4}
                  max={20}
                  onChange={(e) => setCols(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">行数</div>
                <input
                  type="number"
                  value={rows}
                  min={6}
                  max={28}
                  onChange={(e) => setRows(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">字体大小</div>
                <div className="text-sm text-gray-700 font-mono">{fontSize}</div>
              </div>
              <input
                type="range"
                min={16}
                max={80}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={showTian}
                onChange={(e) => setShowTian(e.target.checked)}
              />
              显示田字格辅助线
            </label>

            <div className="flex items-center gap-3">
              <ActionButton onClick={download}>
                下载PNG
              </ActionButton>
              <div className="text-sm text-gray-600">
                {layout.c}×{layout.r}（共 {layout.c * layout.r} 格）
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 overflow-auto">
          <canvas ref={canvasRef} className="bg-white rounded-lg shadow-sm" />
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default ZitieTool

