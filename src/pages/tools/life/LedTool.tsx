import { useEffect, useMemo, useRef, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

type Dir = 'left' | 'right'

const LedTool: React.FC = () => {
  const tool = getToolById('led')
  const [text, setText] = useState('Hello')
  const [bg, setBg] = useState('#000000')
  const [color, setColor] = useState('#FF2D2D')
  const [size, setSize] = useState(120)
  const [speed, setSpeed] = useState(12)
  const [dir, setDir] = useState<Dir>('left')
  const [full, setFull] = useState(false)
  const boxRef = useRef<HTMLDivElement | null>(null)

  if (!tool) return null

  const duration = useMemo(() => {
    const s = Math.max(1, Math.min(60, speed))
    return `${(61 - s) * 0.4 + 1.2}s`
  }, [speed])

  useEffect(() => {
    const onFull = () => setFull(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFull)
    return () => document.removeEventListener('fullscreenchange', onFull)
  }, [])

  const toggleFull = async () => {
    const el = boxRef.current
    if (!el) return
    if (!document.fullscreenElement) await el.requestFullscreen()
    else await document.exitFullscreen()
  }

  const animName = dir === 'left' ? 'led-left' : 'led-right'

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
          <div className="space-y-4 p-5 rounded-xl border border-gray-100 bg-gray-50">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">文字</div>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">背景色</div>
                <input value={bg} onChange={(e) => setBg(e.target.value)} type="color" className="w-full h-12 rounded-xl border border-gray-200 bg-white" />
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">文字色</div>
                <input value={color} onChange={(e) => setColor(e.target.value)} type="color" className="w-full h-12 rounded-xl border border-gray-200 bg-white" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>字号</span>
                <span className="font-mono">{size}px</span>
              </div>
              <input type="range" min={24} max={240} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>速度</span>
                <span className="font-mono">{speed}</span>
              </div>
              <input type="range" min={1} max={60} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full" />
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-600">方向</div>
              <select
                value={dir}
                onChange={(e) => setDir(e.target.value as Dir)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
              >
                <option value="left">从右往左</option>
                <option value="right">从左往右</option>
              </select>
            </div>

            <ActionButton onClick={toggleFull} variant={full ? 'danger' : 'primary'}>
              {full ? '退出全屏' : '全屏播放'}
            </ActionButton>
          </div>

          <div ref={boxRef} className="rounded-xl border border-gray-100 overflow-hidden">
            <style>
              {`
                @keyframes led-left { 
                  0% { transform: translateX(100%); }
                  100% { transform: translateX(-100%); }
                }
                @keyframes led-right { 
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(100%); }
                }
              `}
            </style>
            <div className="w-full h-[360px] md:h-[520px] flex items-center overflow-hidden" style={{ background: bg }}>
              <div
                className="whitespace-nowrap font-bold"
                style={{
                  color,
                  fontSize: `${size}px`,
                  animation: `${animName} ${duration} linear infinite`,
                  textShadow: `0 0 12px ${color}`,
                }}
              >
                {text || ' '}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default LedTool
