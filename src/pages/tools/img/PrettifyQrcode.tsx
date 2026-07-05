import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'
import { downloadFile, readFileAsDataURL } from '@/utils/fileUtils'

const PrettifyQrcode: React.FC = () => {
  const tool = getToolById('prettify-qrcode')
  const [text, setText] = useState('https://tool.browser.qq.com/')
  const [fg, setFg] = useState('#111827')
  const [bg, setBg] = useState('#ffffff')
  const [size, setSize] = useState(420)
  const [margin, setMargin] = useState(2)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null)
  const [logoScale, setLogoScale] = useState(22)
  const [dataUrl, setDataUrl] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!tool) return null

  const opt = useMemo(() => {
    const w = Math.max(200, Math.min(1024, Number(size) || 420))
    const m = Math.max(0, Math.min(20, Number(margin) || 2))
    const ls = Math.max(10, Math.min(35, Number(logoScale) || 22))
    return { w, m, ls }
  }, [size, margin, logoScale])

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
        const base = await QRCode.toDataURL(t, {
          width: opt.w,
          margin: opt.m,
          errorCorrectionLevel: logoDataUrl ? 'H' : 'M',
          color: { dark: fg, light: bg },
        })

        if (!logoDataUrl) {
          setDataUrl(base)
          return
        }

        const canvas = document.createElement('canvas')
        canvas.width = opt.w
        canvas.height = opt.w
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          setDataUrl(base)
          return
        }

        const qrImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = base
        })
        ctx.drawImage(qrImg, 0, 0, opt.w, opt.w)

        const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = logoDataUrl
        })

        const side = Math.floor((opt.w * opt.ls) / 100)
        const x = Math.floor((opt.w - side) / 2)
        const y = Math.floor((opt.w - side) / 2)
        const r = Math.floor(side * 0.16)

        ctx.save()
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.moveTo(x + r, y)
        ctx.arcTo(x + side, y, x + side, y + side, r)
        ctx.arcTo(x + side, y + side, x, y + side, r)
        ctx.arcTo(x, y + side, x, y, r)
        ctx.arcTo(x, y, x + side, y, r)
        ctx.closePath()
        ctx.fill()
        ctx.clip()
        ctx.drawImage(logoImg, x, y, side, side)
        ctx.restore()

        setDataUrl(canvas.toDataURL('image/png'))
      } catch (e) {
        setError(e instanceof Error ? e.message : '生成失败')
        setDataUrl('')
      } finally {
        setBusy(false)
      }
    }
    run()
  }, [text, fg, bg, opt.w, opt.m, opt.ls, logoDataUrl])

  const onLogoSelect = async (f: File) => {
    if (!f.type.startsWith('image/')) return
    setLogoFile(f)
    const url = await readFileAsDataURL(f)
    setLogoDataUrl(url)
  }

  const clearLogo = () => {
    setLogoFile(null)
    setLogoDataUrl(null)
  }

  const download = async () => {
    if (!dataUrl) return
    const blob = await (await fetch(dataUrl)).blob()
    downloadFile(blob, 'prettify-qrcode.png')
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
                className="w-full h-[180px] p-4 bg-transparent outline-none resize-none text-sm text-gray-700 leading-relaxed"
                placeholder="请输入文本、网址等内容生成二维码"
              />
              <div className="absolute bottom-3 right-4 text-xs text-gray-400">
                {text.length} 字符
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-[#f6f7fb] px-4 py-2 rounded">
                <span className="text-sm text-gray-500 w-12">尺寸</span>
                <select
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="flex-1 outline-none text-sm text-gray-700 bg-transparent cursor-pointer"
                >
                  <option value={200}>200px</option>
                  <option value={420}>420px</option>
                  <option value={600}>600px</option>
                  <option value={800}>800px</option>
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

            <div className="border border-gray-200 rounded p-4 bg-[#f8fafc] space-y-3">
              <div className="text-sm font-medium text-gray-700">Logo 徽标设置</div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && onLogoSelect(e.target.files[0])}
                    className="hidden"
                    id="qrcode-logo-upload"
                  />
                  <label htmlFor="qrcode-logo-upload" className="flex items-center justify-center px-4 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition">
                    {logoFile ? '更换 Logo' : '上传 Logo'}
                  </label>
                </div>
                {logoFile && (
                  <button
                    onClick={() => {
                      setLogoFile(null)
                      setLogoDataUrl(null)
                    }}
                    className="text-sm text-red-500 hover:underline"
                  >
                    移除
                  </button>
                )}
              </div>
              {logoFile && (
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded border border-gray-200 mt-2">
                  <span className="text-sm text-gray-500 w-16">Logo 大小</span>
                  <input
                    type="range"
                    min={10}
                    max={35}
                    value={logoScale}
                    onChange={(e) => setLogoScale(Number(e.target.value))}
                    className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-gray-500 w-8">{logoScale}%</span>
                </div>
              )}
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

export default PrettifyQrcode

