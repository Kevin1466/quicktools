import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

type Unit = 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB'
type Base = 1000 | 1024

const units: Array<{ key: Unit; name: string; power: number }> = [
  { key: 'B', name: 'B', power: 0 },
  { key: 'KB', name: 'KB', power: 1 },
  { key: 'MB', name: 'MB', power: 2 },
  { key: 'GB', name: 'GB', power: 3 },
  { key: 'TB', name: 'TB', power: 4 },
  { key: 'PB', name: 'PB', power: 5 },
]

const format = (n: number) => {
  if (!Number.isFinite(n)) return ''
  if (Math.abs(n) >= 1e15) return n.toExponential(6)
  return String(Number(n.toFixed(10))).replace(/\.0+$/, '')
}

const ByteCal: React.FC = () => {
  const tool = getToolById('byte-cal')
  const [input, setInput] = useState('1')
  const [from, setFrom] = useState<Unit>('MB')
  const [base, setBase] = useState<Base>(1024)

  if (!tool) return null

  const computed = useMemo(() => {
    const v = Number(input)
    if (!Number.isFinite(v)) return { ok: false as const, bytes: 0, values: [] as Array<{ unit: Unit; text: string }> }
    const fromUnit = units.find(u => u.key === from)
    if (!fromUnit) return { ok: false as const, bytes: 0, values: [] }
    const bytes = v * Math.pow(base, fromUnit.power)
    return {
      ok: true as const,
      bytes,
      values: units.map(u => ({ unit: u.key, text: format(bytes / Math.pow(base, u.power)) })),
    }
  }, [input, from, base])

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
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_220px] gap-4">
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
          <div className="space-y-2">
            <div className="text-sm text-gray-600">进制</div>
            <select
              value={base}
              onChange={e => setBase(Number(e.target.value) as Base)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
            >
              <option value={1024}>1024（KiB/MiB 习惯）</option>
              <option value={1000}>1000（SI 标准）</option>
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

export default ByteCal
