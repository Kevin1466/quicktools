import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'
import { universities } from '@/data/educationDatasets'

const normalize = (s: string) => s.trim().replace(/\s+/g, '')

const SchoolTool: React.FC = () => {
  const tool = getToolById('school')
  const [query, setQuery] = useState('')

  if (!tool) return null

  const result = useMemo(() => {
    const q = normalize(query)
    if (!q) return universities
    return universities.filter(name => normalize(name).includes(q))
  }, [query])

  const copy = async () => {
    await navigator.clipboard.writeText(result.join('\n'))
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm text-gray-600">学校名称关键词</div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例如：北京 / 理工 / 财经"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
          />
        </div>

        <div className="flex items-center gap-3">
          <ActionButton variant="secondary" onClick={copy} disabled={result.length === 0}>
            复制结果
          </ActionButton>
          <div className="text-sm text-gray-600">共 {result.length} 条</div>
        </div>

        {result.length === 0 ? (
          <div className="text-sm text-gray-500">没有匹配结果</div>
        ) : (
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {result.slice(0, 200).map((name) => (
                <div key={name} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="text-sm text-gray-900">{name}</div>
                  <ActionButton variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(name)}>
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

export default SchoolTool

