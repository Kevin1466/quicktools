import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'
import { downloadFile } from '@/utils/fileUtils'

type EcLevel = 'L' | 'M' | 'Q' | 'H'

const QrcodeGen: React.FC = () => {
  const tool = getToolById('qrcode')
  const [text, setText] = useState('https://tool.browser.qq.com/')
  const [size, setSize] = useState(360)
  const [margin, setMargin] = useState(2)
  const [ecLevel, setEcLevel] = useState<EcLevel>('M')
  const [fg, setFg] = useState('#000000')
  const [bg, setBg] = useState('#ffffff')
  const [dataUrl, setDataUrl] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!tool) return null

  const opt = useMemo(() => {
    const w = Math.max(160, Math.min(1024, Number(size) || 360))
    const m = Math.max(0, Math.min(20, Number(margin) || 2))
    return { w, m }
  }, [size, margin])

  useEffect(() => {
    const run = async () => {
      const t = text.trim()
      if (!t) {
        setDataUrl('')
        setError('')
        return
      }
      setBusy(true)
      setError('')
      try {
        const url = await QRCode.toDataURL(t, {
          width: opt.w,
          margin: opt.m,
          errorCorrectionLevel: ecLevel,
          color: { dark: fg, light: bg },
        })
        setDataUrl(url)
      } catch (e) {
        setError(e instanceof Error ? e.message : '生成失败')
        setDataUrl('')
      } finally {
        setBusy(false)
      }
    }
    run()
  }, [text, opt.w, opt.m, ecLevel, fg, bg])

  const download = async () => {
    if (!dataUrl) return
    const blob = await (await fetch(dataUrl)).blob()
    downloadFile(blob, 'qrcode.png')
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side: Input & Options */}
          <div className="flex-1 flex flex-col min-w-0 space-y-4">
            <div className="relative border border-[#c0ccda] hover:border-[#3b6de3] focus-within:border-[#3b6de3] rounded bg-white transition-colors">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-[240px] p-4 bg-transparent outline-none resize-none text-sm text-gray-700 leading-relaxed"
                placeholder="请输入文本、网址等内容生成二维码"
              />
              <div className="absolute bottom-3 right-4 text-xs text-gray-400">
                {text.length} 字符
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-[#f6f7fb] px-4 py-2 rounded">
                <span className="text-sm text-gray-500 w-12">容错率</span>
                <select
                  value={ecLevel}
                  onChange={(e) => setEcLevel(e.target.value as EcLevel)}
                  className="flex-1 outline-none text-sm text-gray-700 bg-transparent cursor-pointer"
                >
                  <option value="L">L (7%)</option>
                  <option value="M">M (15%)</option>
                  <option value="Q">Q (25%)</option>
                  <option value="H">H (30%)</option>
                </select>
              </div>
              <div className="flex items-center gap-3 bg-[#f6f7fb] px-4 py-2 rounded">
                <span className="text-sm text-gray-500 w-12">边距</span>
                <select
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="flex-1 outline-none text-sm text-gray-700 bg-transparent cursor-pointer"
                >
                  <option value={0}>无 (0)</option>
                  <option value={1}>小 (1)</option>
                  <option value={2}>中 (2)</option>
                  <option value={4}>大 (4)</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-[#f6f7fb] px-4 py-2 rounded">
                <span className="text-sm text-gray-500 w-12">前景色</span>
                <input 
                  value={fg} 
                  onChange={(e) => setFg(e.target.value)} 
                  type="color" 
                  className="w-8 h-8 rounded border-none cursor-pointer bg-transparent p-0" 
                />
              </div>
              <div className="flex items-center gap-3 bg-[#f6f7fb] px-4 py-2 rounded">
                <span className="text-sm text-gray-500 w-12">背景色</span>
                <input 
                  value={bg} 
                  onChange={(e) => setBg(e.target.value)} 
                  type="color" 
                  className="w-8 h-8 rounded border-none cursor-pointer bg-transparent p-0" 
                />
              </div>
            </div>
          </div>

          {/* Right side: Preview & Download */}
          <div className="flex-1 flex flex-col min-w-0 max-w-[400px]">
            <div className="flex items-center justify-end mb-3 h-8 gap-3">
              <button
                onClick={() => setText('')}
                disabled={!text}
                className="text-sm text-[#3b6de3] hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
              >
                重置内容
              </button>
              <div className="w-px h-4 bg-gray-200"></div>
              <button
                onClick={download}
                disabled={!dataUrl || busy}
                className="text-sm text-[#3b6de3] hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
              >
                下载图片
              </button>
            </div>
            
            <div className="flex-1 min-h-[400px] border border-gray-200 bg-[#f8fafc] rounded flex items-center justify-center p-8 relative">
              {dataUrl ? (
                <div className="bg-white p-4 shadow-sm border border-gray-100 rounded">
                  <img src={dataUrl} alt="qrcode" className="w-[240px] h-[240px] object-contain" />
                </div>
              ) : (
                <div className="text-sm text-gray-400">
                  {text.trim() ? (busy ? '生成中...' : '生成失败') : '输入内容即可自动生成'}
                </div>
              )}
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 text-center">
            {error}
          </div>
        ) : null}
      </div>
    </ToolPageTemplate>
  )
}

export default QrcodeGen

