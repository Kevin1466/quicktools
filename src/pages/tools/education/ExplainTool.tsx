import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'
import { glossary } from '@/data/educationDatasets'

const normalize = (s: string) => s.trim().toLowerCase()

const ExplainTool: React.FC = () => {
  const tool = getToolById('explain')
  const [query, setQuery] = useState('')

  if (!tool) return null

  const results = useMemo(() => {
    const q = normalize(query)
    if (!q) return glossary
    return glossary.filter(item => normalize(item.term).includes(q) || normalize(item.definition).includes(q))
  }, [query])

  const copy = async () => {
    const text = results.map(item => `${item.term}：${item.definition}`).join('\n')
    await navigator.clipboard.writeText(text)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm text-gray-600">词语/术语</div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例如：JSON / HTTPS / 正则"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
          />
        </div>

        <div className="flex items-center gap-3">
          <ActionButton variant="secondary" onClick={copy} disabled={results.length === 0}>
            复制结果
          </ActionButton>
          <div className="text-sm text-gray-600">共 {results.length} 条</div>
        </div>

        {results.length === 0 ? (
          <div className="text-sm text-gray-500">没有匹配结果</div>
        ) : (
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {results.map(item => (
                <div key={item.term} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-semibold text-gray-900">{item.term}</div>
                    <ActionButton variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(`${item.term}：${item.definition}`)}>
                      复制
                    </ActionButton>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 leading-relaxed">{item.definition}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default ExplainTool

