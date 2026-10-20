import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

type Unit = 'C' | 'F' | 'K'

const toCelsius = (value: number, unit: Unit) => {
  if (unit === 'C') return value
  if (unit === 'F') return (value - 32) * (5 / 9)
  return value - 273.15
}

const fromCelsius = (c: number, unit: Unit) => {
  if (unit === 'C') return c
  if (unit === 'F') return c * (9 / 5) + 32
  return c + 273.15
}

const format = (n: number) => {
  if (!Number.isFinite(n)) return ''
  return String(Number(n.toFixed(6))).replace(/\.0+$/, '')
}

const TemperatureTrans: React.FC = () => {
  const tool = getToolById('temperaturetrans')
  const [input, setInput] = useState('0')
  const [from, setFrom] = useState<Unit>('C')
  const [to, setTo] = useState<Unit>('F')

  if (!tool) return null

  const result = useMemo(() => {
    const v = Number(input)
    if (!Number.isFinite(v)) return { ok: false as const, value: '' }
    const c = toCelsius(v, from)
    const out = fromCelsius(c, to)
    return { ok: true as const, value: format(out) }
  }, [input, from, to])

  const swap = () => {
    setFrom(to)
    setTo(from)
  }

  const copy = async () => {
    if (!result.ok || !result.value) return
    await navigator.clipboard.writeText(result.value)
  }

  const unitLabel = (u: Unit) => {
    if (u === 'C') return '摄氏 °C'
    if (u === 'F') return '华氏 °F'
    return '开尔文 K'
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-end">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">输入</div>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="请输入温度数值"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
            />
            <select
              value={from}
              onChange={e => setFrom(e.target.value as Unit)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
            >
              <option value="C">{unitLabel('C')}</option>
              <option value="F">{unitLabel('F')}</option>
              <option value="K">{unitLabel('K')}</option>
            </select>
          </div>

          <div className="flex justify-center md:pb-6">
            <ActionButton variant="secondary" onClick={swap}>
              交换
            </ActionButton>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-gray-600">输出</div>
            <input
              value={result.ok ? result.value : ''}
              readOnly
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 font-mono"
            />
            <div className="flex gap-3">
              <select
                value={to}
                onChange={e => setTo(e.target.value as Unit)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
              >
                <option value="C">{unitLabel('C')}</option>
                <option value="F">{unitLabel('F')}</option>
                <option value="K">{unitLabel('K')}</option>
              </select>
              <ActionButton variant="secondary" onClick={copy} disabled={!result.ok || !result.value}>
                复制
              </ActionButton>
            </div>
          </div>
        </div>

        {!result.ok && input.trim() && <div className="text-sm text-red-600">输入不是有效数字</div>}
      </div>
    </ToolPageTemplate>
  )
}

export default TemperatureTrans
