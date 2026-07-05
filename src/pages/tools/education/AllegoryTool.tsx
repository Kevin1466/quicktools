import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'
import { xiehouyu } from '@/data/educationDatasets'

const normalize = (s: string) => s.trim().replace(/\s+/g, '')

const AllegoryTool: React.FC = () => {
  const tool = getToolById('allegory')
  const [query, setQuery] = useState('')

  if (!tool) return null

  const result = useMemo(() => {
    const q = normalize(query)
    if (!q) return xiehouyu
    return xiehouyu.filter(item => normalize(item.riddle).includes(q) || normalize(item.answer).includes(q))
  }, [query])

  const copy = async () => {
    const text = result.map(item => `${item.riddle} —— ${item.answer}`).join('\n')
    await navigator.clipboard.writeText(text)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm text-gray-600">关键词</div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例如：泥菩萨 / 一清二白"
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
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {result.map(item => (
                <div key={`${item.riddle}-${item.answer}`} className="px-4 py-3">
                  <div className="text-sm text-gray-900">{item.riddle}</div>
                  <div className="mt-1 text-sm text-gray-600">—— {item.answer}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default AllegoryTool

