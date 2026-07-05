import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'
import { dynasties } from '@/data/educationDatasets'

const DynastiesTool: React.FC = () => {
  const tool = getToolById('dynasties')
  const [query, setQuery] = useState('')

  if (!tool) return null

  const result = useMemo(() => {
    const q = query.trim()
    if (!q) return dynasties
    const year = Number(q)
    if (!Number.isNaN(year) && q.match(/^[-]?\d+$/)) {
      return dynasties.filter(d => d.start <= year && year <= d.end)
    }
    return dynasties.filter(d => d.name.includes(q))
  }, [query])

  const copy = async () => {
    const text = result
      .map(d => `${d.name}（${d.start} ~ ${d.end}）${d.note ? `：${d.note}` : ''}`)
      .join('\n')
    await navigator.clipboard.writeText(text)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm text-gray-600">朝代名称或年份</div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例如：唐 / 宋 / -221 / 618"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
          />
        </div>

        <div className="flex items-center gap-3">
          <ActionButton variant="secondary" onClick={copy} disabled={result.length === 0}>
            复制结果
          </ActionButton>
        </div>

        {result.length === 0 ? (
          <div className="text-sm text-gray-500">没有匹配结果</div>
        ) : (
          <div className="space-y-3">
            {result.map((d) => (
              <div key={d.name} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-lg font-semibold text-gray-900">{d.name}</div>
                  <div className="font-mono text-sm text-gray-600">{d.start} ~ {d.end}</div>
                </div>
                {d.note ? <div className="mt-2 text-sm text-gray-600">{d.note}</div> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default DynastiesTool

