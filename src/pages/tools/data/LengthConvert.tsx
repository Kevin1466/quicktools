import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

type Unit = 'mm' | 'cm' | 'm' | 'km' | 'in' | 'ft' | 'yd' | 'mi'

const units: Array<{ key: Unit; name: string; toMeter: number }> = [
  { key: 'mm', name: '毫米 mm', toMeter: 0.001 },
  { key: 'cm', name: '厘米 cm', toMeter: 0.01 },
  { key: 'm', name: '米 m', toMeter: 1 },
  { key: 'km', name: '千米 km', toMeter: 1000 },
  { key: 'in', name: '英寸 in', toMeter: 0.0254 },
  { key: 'ft', name: '英尺 ft', toMeter: 0.3048 },
  { key: 'yd', name: '码 yd', toMeter: 0.9144 },
  { key: 'mi', name: '英里 mi', toMeter: 1609.344 },
]

const format = (n: number) => {
  if (!Number.isFinite(n)) return ''
  return String(Number(n.toFixed(10))).replace(/\.0+$/, '')
}

const LengthConvert: React.FC = () => {
  const tool = getToolById('lengthconvert')
  const [input, setInput] = useState('1')
  const [from, setFrom] = useState<Unit>('m')

  if (!tool) return null

  const computed = useMemo(() => {
    const v = Number(input)
    if (!Number.isFinite(v)) return { ok: false as const, base: 0, values: [] as Array<{ unit: Unit; text: string }> }
    const fromUnit = units.find(u => u.key === from)
    if (!fromUnit) return { ok: false as const, base: 0, values: [] }
    const meters = v * fromUnit.toMeter
    return {
      ok: true as const,
      base: meters,
      values: units.map(u => ({ unit: u.key, text: format(meters / u.toMeter) })),
    }
  }, [input, from])

  const copyAll = async () => {
    if (!computed.ok) return
    const lines = units.map(u => {
      const v = computed.values.find(x => x.unit === u.key)?.text ?? ''
      return `${u.name}: ${v}`
    })
    await navigator.clipboard.writeText(lines.join('\n'))
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">输入</div>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="请输入数值"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">单位</div>
            <select
              value={from}
              onChange={e => setFrom(e.target.value as Unit)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
            >
              {units.map(u => (
                <option key={u.key} value={u.key}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!computed.ok && input.trim() && <div className="text-sm text-red-600">输入不是有效数字</div>}

        {computed.ok && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">换算结果</div>
              <ActionButton variant="secondary" size="sm" onClick={copyAll}>
                复制全部
              </ActionButton>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {units.map(u => {
                const v = computed.values.find(x => x.unit === u.key)?.text ?? ''
                return (
                  <div key={u.key} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                    <div className="text-sm text-gray-700">{u.name}</div>
                    <div className="font-mono text-sm text-gray-900">{v}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default LengthConvert
