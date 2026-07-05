import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

const createUuid = () => {
  if (crypto.randomUUID) return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

const UuidTool: React.FC = () => {
  const tool = getToolById('uuid')
  const [count, setCount] = useState(5)
  const [upper, setUpper] = useState(false)
  const [seed, setSeed] = useState(0)

  if (!tool) return null

  const uuids = useMemo(() => {
    const n = Math.max(1, Math.min(200, Number.isFinite(count) ? count : 1))
    const list = Array.from({ length: n }, () => createUuid())
    return upper ? list.map(x => x.toUpperCase()) : list
  }, [count, upper, seed])

  const text = uuids.join('\n')

  const copy = async () => {
    await navigator.clipboard.writeText(text)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <span>数量</span>
            <input
              type="number"
              min={1}
              max={200}
              value={count}
              onChange={e => setCount(Number(e.target.value))}
              className="w-24 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={upper}
              onChange={e => setUpper(e.target.checked)}
              className="h-4 w-4"
            />
            <span>大写</span>
          </label>
          <ActionButton onClick={() => setSeed(s => s + 1)}>生成</ActionButton>
          <ActionButton variant="secondary" onClick={copy}>
            复制
          </ActionButton>
        </div>

        <textarea
          value={text}
          readOnly
          className="w-full min-h-[320px] p-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 resize-y"
        />
      </div>
    </ToolPageTemplate>
  )
}

export default UuidTool
