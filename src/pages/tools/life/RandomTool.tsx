import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

const randInt = (min: number, max: number) => {
  const a = Math.ceil(min)
  const b = Math.floor(max)
  const r = crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32
  return Math.floor(r * (b - a + 1)) + a
}

const randChoice = <T,>(arr: T[]) => arr[randInt(0, arr.length - 1)]

const RandomTool: React.FC = () => {
  const tool = getToolById('random')
  const [min, setMin] = useState('1')
  const [max, setMax] = useState('100')
  const [count, setCount] = useState(10)
  const [unique, setUnique] = useState(true)

  const [itemsText, setItemsText] = useState('A\nB\nC\nD\n')
  const [pickCount, setPickCount] = useState(1)

  const [seed, setSeed] = useState(0)

  if (!tool) return null

  const numbers = useMemo(() => {
    seed
    const a = Number(min)
    const b = Number(max)
    const n = Math.max(1, Math.min(200, Math.floor(count)))
    if (!Number.isFinite(a) || !Number.isFinite(b)) return { ok: false as const, list: [] as number[], error: '请输入有效范围' }
    const lo = Math.min(a, b)
    const hi = Math.max(a, b)
    if (unique && hi - lo + 1 < n) return { ok: false as const, list: [] as number[], error: '范围不足以生成不重复结果' }
    const out: number[] = []
    const seen = new Set<number>()
    while (out.length < n) {
      const v = randInt(lo, hi)
      if (unique) {
        if (seen.has(v)) continue
        seen.add(v)
      }
      out.push(v)
    }
    return { ok: true as const, list: out, error: '' }
  }, [min, max, count, unique, seed])

  const picks = useMemo(() => {
    seed
    const list = itemsText
      .split(/\r\n|\r|\n/)
      .map(s => s.trim())
      .filter(Boolean)
    const n = Math.max(1, Math.min(50, Math.floor(pickCount)))
    if (!list.length) return []
    const out: string[] = []
    const pool = [...list]
    while (out.length < n && pool.length) {
      const item = randChoice(pool)
      out.push(item)
      const idx = pool.indexOf(item)
      pool.splice(idx, 1)
    }
    return out
  }, [itemsText, pickCount, seed])

  const copy = async (text: string) => {
    if (!text) return
    await navigator.clipboard.writeText(text)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-8">
        <div className="p-5 rounded-xl border border-gray-100 bg-gray-50 space-y-4">
          <div className="text-sm text-gray-700 font-medium">随机整数</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">最小值</div>
              <input
                value={min}
                onChange={(e) => setMin(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
              />
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">最大值</div>
              <input
                value={max}
                onChange={(e) => setMax(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
              />
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">数量</div>
              <input
                type="number"
                value={count}
                min={1}
                max={200}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 pb-2">
              <input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)} className="h-4 w-4" />
              <span>不重复</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ActionButton onClick={() => setSeed(s => s + 1)}>生成</ActionButton>
            <ActionButton
              variant="secondary"
              onClick={() => copy(numbers.ok ? numbers.list.join(', ') : '')}
              disabled={!numbers.ok || numbers.list.length === 0}
            >
              复制
            </ActionButton>
            {!numbers.ok && <div className="text-sm text-red-600">{numbers.error}</div>}
          </div>
          {numbers.ok && (
            <div className="font-mono text-sm text-gray-900 break-all">{numbers.list.join(', ')}</div>
          )}
        </div>

        <div className="p-5 rounded-xl border border-gray-100 bg-gray-50 space-y-4">
          <div className="text-sm text-gray-700 font-medium">随机抽取</div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">候选项（每行一项）</div>
              <textarea
                value={itemsText}
                onChange={(e) => setItemsText(e.target.value)}
                className="w-full min-h-[180px] p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] resize-y"
              />
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">抽取数量</div>
              <input
                type="number"
                value={pickCount}
                min={1}
                max={50}
                onChange={(e) => setPickCount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
              />
              <ActionButton onClick={() => setSeed(s => s + 1)} disabled={!itemsText.trim()}>
                抽取
              </ActionButton>
              <ActionButton variant="secondary" onClick={() => copy(picks.join('\n'))} disabled={!picks.length}>
                复制
              </ActionButton>
            </div>
          </div>
          {picks.length ? (
            <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-1">
              {picks.map((p, idx) => (
                <div key={idx} className="text-sm text-gray-900">{p}</div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default RandomTool
