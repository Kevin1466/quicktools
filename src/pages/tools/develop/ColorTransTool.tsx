import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

const parseHex = (s: string) => {
  const v = s.trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]{6}$/.test(v)) return null
  const r = Number.parseInt(v.slice(0, 2), 16)
  const g = Number.parseInt(v.slice(2, 4), 16)
  const b = Number.parseInt(v.slice(4, 6), 16)
  return { r, g, b }
}

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map(x => clamp(Math.round(x), 0, 255).toString(16).padStart(2, '0')).join('')}`.toUpperCase()

const rgbToHsl = (r: number, g: number, b: number) => {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const d = max - min
  let h = 0
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6
    else if (max === gn) h = (bn - rn) / d + 2
    else h = (rn - gn) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  const l = (max + min) / 2
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  return { h, s, l }
}

const hslToRgb = (h: number, s: number, l: number) => {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let rp = 0, gp = 0, bp = 0
  if (h < 60) [rp, gp, bp] = [c, x, 0]
  else if (h < 120) [rp, gp, bp] = [x, c, 0]
  else if (h < 180) [rp, gp, bp] = [0, c, x]
  else if (h < 240) [rp, gp, bp] = [0, x, c]
  else if (h < 300) [rp, gp, bp] = [x, 0, c]
  else [rp, gp, bp] = [c, 0, x]
  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  }
}

const ColorTransTool: React.FC = () => {
  const tool = getToolById('colortrans')
  const [hex, setHex] = useState('#3B6DE3')
  const [h, setH] = useState(219)
  const [s, setS] = useState(0.73)
  const [l, setL] = useState(0.56)

  if (!tool) return null

  const rgb = useMemo(() => {
    const parsed = parseHex(hex)
    if (parsed) return parsed
    return hslToRgb(h, s, l)
  }, [hex, h, s, l])

  const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb.r, rgb.g, rgb.b])
  const hexFromRgb = useMemo(() => rgbToHex(rgb.r, rgb.g, rgb.b), [rgb.r, rgb.g, rgb.b])

  const syncFromHex = () => {
    const parsed = parseHex(hex)
    if (!parsed) return
    const nhsl = rgbToHsl(parsed.r, parsed.g, parsed.b)
    setH(Math.round(nhsl.h))
    setS(Number(nhsl.s.toFixed(4)))
    setL(Number(nhsl.l.toFixed(4)))
    setHex(rgbToHex(parsed.r, parsed.g, parsed.b))
  }

  const syncFromHsl = () => {
    const nrgb = hslToRgb(h, s, l)
    setHex(rgbToHex(nrgb.r, nrgb.g, nrgb.b))
  }

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl border border-gray-200" style={{ background: hexFromRgb }} />
          <div className="space-y-1">
            <div className="text-sm text-gray-600">HEX</div>
            <div className="font-mono text-lg text-gray-900">{hexFromRgb}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-600">RGB</div>
            <div className="font-mono text-lg text-gray-900">{`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-600">HSL</div>
            <div className="font-mono text-lg text-gray-900">{`hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%)`}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
            <div className="text-sm text-gray-700 font-medium">HEX 输入</div>
            <input
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
              placeholder="#RRGGBB"
            />
            <div className="flex gap-3">
              <ActionButton size="sm" variant="secondary" onClick={syncFromHex}>
                同步到 HSL
              </ActionButton>
              <ActionButton size="sm" variant="secondary" onClick={() => copy(hexFromRgb)}>
                复制 HEX
              </ActionButton>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
            <div className="text-sm text-gray-700 font-medium">HSL 调整</div>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>H</span>
                  <span className="font-mono">{Math.round(h)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={h}
                  onChange={(e) => setH(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>S</span>
                  <span className="font-mono">{Math.round(s * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(s * 100)}
                  onChange={(e) => setS(Number(e.target.value) / 100)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>L</span>
                  <span className="font-mono">{Math.round(l * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(l * 100)}
                  onChange={(e) => setL(Number(e.target.value) / 100)}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <ActionButton size="sm" variant="secondary" onClick={syncFromHsl}>
                同步到 HEX
              </ActionButton>
              <ActionButton size="sm" variant="secondary" onClick={() => copy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}>
                复制 RGB
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default ColorTransTool
