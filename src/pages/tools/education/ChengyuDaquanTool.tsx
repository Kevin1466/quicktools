import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'
import { idioms } from '@/data/educationDatasets'

const normalize = (s: string) => s.trim()

const ChengyuDaquanTool: React.FC = () => {
  const tool = getToolById('chengyujielong')
  const [query, setQuery] = useState('')

  if (!tool) return null

  const filtered = useMemo(() => {
    const q = normalize(query)
    if (!q) return idioms
    return idioms.filter(i => i.includes(q))
  }, [query])

  const copyAll = async () => {
    await navigator.clipboard.writeText(filtered.join('\n'))
  }

  const pickRandom = () => {
    if (idioms.length === 0) return
    const idx = Math.floor(Math.random() * idioms.length)
    setQuery(idioms[idx])
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm text-gray-600">关键词</div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例如：风 / 一 / 天下"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ActionButton variant="secondary" onClick={copyAll} disabled={filtered.length === 0}>
            复制结果
          </ActionButton>
          <ActionButton variant="secondary" onClick={pickRandom} disabled={idioms.length === 0}>
            随机一个
          </ActionButton>
          <div className="text-sm text-gray-600">共 {filtered.length} 条</div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-sm text-gray-500">没有匹配结果</div>
        ) : (
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {filtered.slice(0, 200).map(i => (
                <div key={i} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="text-sm text-gray-900">{i}</div>
                  <ActionButton variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(i)}>
                    复制
                  </ActionButton>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default ChengyuDaquanTool

