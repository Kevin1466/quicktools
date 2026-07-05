import { useEffect, useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import { getToolById } from '@/data/toolsFromJson'
import { downloadFile, getFileNameWithoutExtension, readFileAsDataURL } from '@/utils/fileUtils'

type PendantStyle = 'ring' | 'double-ring' | 'ribbon' | 'star'

const styles: Array<{ key: PendantStyle; name: string }> = [
  { key: 'ring', name: '圆环' },
  { key: 'double-ring', name: '双圆环' },
  { key: 'ribbon', name: '丝带' },
  { key: 'star', name: '星芒' },
]

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, Number(n) || 0))

const AvatarPendant: React.FC = () => {
  const tool = getToolById('avatar-pendant')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [out, setOut] = useState<Blob | null>(null)
  const [outUrl, setOutUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [style, setStyle] = useState<PendantStyle>('ring')
  const [size, setSize] = useState(512)
  const [ringColor, setRingColor] = useState('#3b6de3')
  const [accentColor, setAccentColor] = useState('#ffffff')
  const [thickness, setThickness] = useState(28)
  const [shadow, setShadow] = useState(true)
  const [label, setLabel] = useState('')

  if (!tool) return null

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      if (outUrl) URL.revokeObjectURL(outUrl)
    }
  }, [previewUrl, outUrl])

  const opt = useMemo(() => {
    return {
      size: clamp(size, 256, 1024),
      thickness: clamp(thickness, 8, 80),
    }
  }, [size, thickness])

  const onFileSelect = (f: File) => {
    if (!f.type.startsWith('image/')) return
    setFile(f)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(f))
    setOut(null)
    if (outUrl) URL.revokeObjectURL(outUrl)
    setOutUrl(null)
  }

  const render = async () => {
    if (!file) return
    setBusy(true)
    try {
      const dataUrl = await readFileAsDataURL(file)
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image()
        i.onload = () => resolve(i)
        i.onerror = reject
        i.src = dataUrl
      })

      const canvas = document.createElement('canvas')
      canvas.width = opt.size
      canvas.height = opt.size
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      const r = canvas.width / 2

      const sx = Math.floor((img.width - Math.min(img.width, img.height)) / 2)
      const sy = Math.floor((img.height - Math.min(img.width, img.height)) / 2)
      const sw = Math.min(img.width, img.height)
      const sh = sw

      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, r - opt.thickness - 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(img, sx, sy, sw, sh, opt.thickness + 2, opt.thickness + 2, canvas.width - (opt.thickness + 2) * 2, canvas.height - (opt.thickness + 2) * 2)
      ctx.restore()

      if (shadow) {
        ctx.save()
        ctx.globalAlpha = 0.22
        ctx.filter = 'blur(10px)'
        ctx.fillStyle = '#000000'
        ctx.beginPath()
        ctx.arc(cx, cy + 8, r - 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      const drawRing = (radius: number, color: string, w: number) => {
        ctx.save()
        ctx.strokeStyle = color
        ctx.lineWidth = w
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }

      if (style === 'ring') {
        drawRing(r - opt.thickness / 2, ringColor, opt.thickness)
      }

      if (style === 'double-ring') {
        const gap = Math.max(6, Math.floor(opt.thickness * 0.22))
        const w = Math.max(6, Math.floor(opt.thickness * 0.55))
        drawRing(r - w / 2 - 2, ringColor, w)
        drawRing(r - w - gap - w / 2 - 2, accentColor, w)
      }

      if (style === 'star') {
        drawRing(r - opt.thickness / 2, ringColor, opt.thickness)
        const spikes = 16
        ctx.save()
        ctx.strokeStyle = accentColor
        ctx.lineWidth = Math.max(2, Math.floor(opt.thickness * 0.16))
        for (let i = 0; i < spikes; i++) {
          const a = (i / spikes) * Math.PI * 2
          const x1 = cx + Math.cos(a) * (r - opt.thickness - 10)
          const y1 = cy + Math.sin(a) * (r - opt.thickness - 10)
          const x2 = cx + Math.cos(a) * (r - 6)
          const y2 = cy + Math.sin(a) * (r - 6)
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
        }
        ctx.restore()
      }

      if (style === 'ribbon') {
        drawRing(r - opt.thickness / 2, ringColor, opt.thickness)
        const bandH = Math.floor(canvas.height * 0.22)
        const bandY = canvas.height - bandH - Math.floor(canvas.height * 0.06)
        const bandW = Math.floor(canvas.width * 0.74)
        const bandX = Math.floor((canvas.width - bandW) / 2)
        const radius = Math.floor(bandH * 0.24)
        ctx.save()
        ctx.fillStyle = ringColor
        ctx.beginPath()
        ctx.moveTo(bandX + radius, bandY)
        ctx.arcTo(bandX + bandW, bandY, bandX + bandW, bandY + bandH, radius)
        ctx.arcTo(bandX + bandW, bandY + bandH, bandX, bandY + bandH, radius)
        ctx.arcTo(bandX, bandY + bandH, bandX, bandY, radius)
        ctx.arcTo(bandX, bandY, bandX + bandW, bandY, radius)
        ctx.closePath()
        ctx.fill()
        ctx.restore()

        if (label.trim()) {
          ctx.save()
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = accentColor
          ctx.strokeStyle = '#000000'
          ctx.lineJoin = 'round'
          ctx.lineWidth = 6
          const fontSize = Math.floor(bandH * 0.44)
          ctx.font = `900 ${fontSize}px "Microsoft YaHei","PingFang SC",system-ui,sans-serif`
          const t = label.trim().slice(0, 10)
          ctx.strokeText(t, cx, bandY + bandH / 2)
          ctx.fillText(t, cx, bandY + bandH / 2)
          ctx.restore()
        }
      }

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(b => resolve(b), 'image/png'))
      if (!blob) return
      setOut(blob)
      if (outUrl) URL.revokeObjectURL(outUrl)
      setOutUrl(URL.createObjectURL(blob))
    } finally {
      setBusy(false)
    }
  }

  const download = () => {
    if (!file || !out) return
    downloadFile(out, `${getFileNameWithoutExtension(file.name)}_pendant.png`)
  }

  return (
    <ToolPageTemplate tool={tool}>
      {!file ? (
        <FileUploader onFileSelect={onFileSelect} accept="image/*" placeholder="上传头像图片，生成挂饰效果（本地处理）" />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left side: Input & Options */}
            <div className="w-full lg:w-[400px] shrink-0 space-y-4">
              <div className="p-5 rounded-xl border border-gray-100 bg-gray-50 space-y-4">
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">样式</div>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value as PendantStyle)}
                    className="w-full px-4 py-3 rounded border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                  >
                    {styles.map(s => (
                      <option key={s.key} value={s.key}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">尺寸</div>
                    <input
                      type="number"
                      value={size}
                      onChange={(e) => setSize(Number(e.target.value))}
                      min={256}
                      max={1024}
                      className="w-full px-4 py-3 rounded border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">边框粗细</div>
                    <input
                      type="number"
                      value={thickness}
                      onChange={(e) => setThickness(Number(e.target.value))}
                      min={8}
                      max={80}
                      className="w-full px-4 py-3 rounded border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">主色</div>
                    <input value={ringColor} onChange={(e) => setRingColor(e.target.value)} type="color" className="w-full h-12 rounded border border-gray-200 bg-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">强调色</div>
                    <input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} type="color" className="w-full h-12 rounded border border-gray-200 bg-white" />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={shadow} onChange={(e) => setShadow(e.target.checked)} />
                  阴影
                </label>

                {style === 'ribbon' ? (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">丝带文字（可选）</div>
                    <input
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="最多10字"
                      className="w-full px-4 py-3 rounded border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                    />
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={render}
                  disabled={busy}
                  className="w-full py-2.5 rounded bg-[#3b6de3] text-white hover:bg-[#2a52c2] transition text-sm font-medium disabled:opacity-50"
                >
                  {busy ? '处理中...' : '生成挂饰'}
                </button>
                <button
                  onClick={download}
                  disabled={!out}
                  className="w-full py-2.5 rounded border border-[#3b6de3] text-[#3b6de3] hover:bg-blue-50 transition text-sm disabled:opacity-50 disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent"
                >
                  下载图片
                </button>
                <button
                  onClick={() => setFile(null)}
                  disabled={busy}
                  className="w-full py-2.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm disabled:opacity-50"
                >
                  重新选择图片
                </button>
              </div>
            </div>

            {/* Right side: Preview */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-1 border border-gray-200 bg-[#f8fafc] rounded p-6 flex flex-col items-center justify-center min-h-[500px]">
                {outUrl ? (
                  <img src={outUrl} alt="output" className="max-w-full max-h-[500px] object-contain" />
                ) : previewUrl ? (
                  <img src={previewUrl} alt="preview" className="max-w-full max-h-[500px] object-contain opacity-50" />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </ToolPageTemplate>
  )
}

export default AvatarPendant
