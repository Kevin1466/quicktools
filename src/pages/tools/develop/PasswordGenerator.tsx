import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

const lower = 'abcdefghijklmnopqrstuvwxyz'
const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const digits = '0123456789'
const symbols = '!@#$%^&*()-_=+[]{};:,.?/|~'

const pick = (alphabet: string, n: number) => {
  const bytes = crypto.getRandomValues(new Uint32Array(n))
  return Array.from(bytes, b => alphabet[b % alphabet.length]).join('')
}

const shuffle = (s: string) => {
  const arr = s.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1)
    const t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
  }
  return arr.join('')
}

const PasswordGenerator: React.FC = () => {
  const tool = getToolById('pwdgenerator')
  const [len, setLen] = useState(16)
  const [count, setCount] = useState(10)
  const [useLower, setUseLower] = useState(true)
  const [useUpper, setUseUpper] = useState(true)
  const [useDigits, setUseDigits] = useState(true)
  const [useSymbols, setUseSymbols] = useState(false)
  const [seed, setSeed] = useState(0)

  if (!tool) return null

  const passwords = useMemo(() => {
    seed
    const n = Math.max(1, Math.min(200, Math.floor(count)))
    const L = Math.max(4, Math.min(128, Math.floor(len)))
    const pools: string[] = []
    if (useLower) pools.push(lower)
    if (useUpper) pools.push(upper)
    if (useDigits) pools.push(digits)
    if (useSymbols) pools.push(symbols)
    const alphabet = pools.join('')
    if (!alphabet) return []
    const must = pools.map(p => pick(p, 1)).join('')
    return Array.from({ length: n }, () => {
      const rest = pick(alphabet, Math.max(0, L - must.length))
      return shuffle(must + rest)
    })
  }, [len, count, useLower, useUpper, useDigits, useSymbols, seed])

  const copyAll = async () => {
    await navigator.clipboard.writeText(passwords.join('\n'))
  }

  const copyOne = async (p: string) => {
    await navigator.clipboard.writeText(p)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <span>长度</span>
            <input
              type="number"
              min={4}
              max={128}
              value={len}
              onChange={(e) => setLen(Number(e.target.value))}
              className="w-28 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <span>数量</span>
            <input
              type="number"
              min={1}
              max={200}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-28 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={useLower} onChange={(e) => setUseLower(e.target.checked)} className="h-4 w-4" />
            <span>a-z</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={useUpper} onChange={(e) => setUseUpper(e.target.checked)} className="h-4 w-4" />
            <span>A-Z</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={useDigits} onChange={(e) => setUseDigits(e.target.checked)} className="h-4 w-4" />
            <span>0-9</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} className="h-4 w-4" />
            <span>符号</span>
          </label>

          <ActionButton onClick={() => setSeed(s => s + 1)} disabled={!useLower && !useUpper && !useDigits && !useSymbols}>
            生成
          </ActionButton>
          <ActionButton variant="secondary" onClick={copyAll} disabled={!passwords.length}>
            复制全部
          </ActionButton>
        </div>

        {!passwords.length && <div className="text-sm text-red-600">至少选择一种字符集</div>}

        {!!passwords.length && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {passwords.map((p, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                <div className="font-mono text-sm text-gray-900 break-all">{p}</div>
                <ActionButton size="sm" variant="secondary" onClick={() => copyOne(p)}>
                  复制
                </ActionButton>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default PasswordGenerator
