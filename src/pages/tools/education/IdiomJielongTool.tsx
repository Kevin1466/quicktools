import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'
import { idioms } from '@/data/educationDatasets'

const getLastChar = (s: string) => {
  const text = s.trim()
  if (!text) return ''
  return text[text.length - 1]
}

const IdiomJielongTool: React.FC = () => {
  const tool = getToolById('jielong')
  const [input, setInput] = useState('画蛇添足')

  if (!tool) return null

  const last = useMemo(() => getLastChar(input), [input])

  const candidates = useMemo(() => {
    if (!last) return []
    return idioms.filter(i => i.startsWith(last)).slice(0, 30)
  }, [last])

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm text-gray-600">输入成语</div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="例如：画蛇添足"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
          />
        </div>

        {last ? (
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
            <div className="text-xs text-gray-500">接龙起始字</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{last}</div>
          </div>
        ) : null}

        {candidates.length === 0 ? (
          <div className="text-sm text-gray-500">暂无匹配的接龙结果</div>
        ) : (
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 text-xs text-gray-600">可接龙候选（点击复制）</div>
            <div className="divide-y divide-gray-100">
              {candidates.map((i) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="text-sm text-gray-900">{i}</div>
                  <ActionButton variant="secondary" size="sm" onClick={() => copy(i)}>
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

export default IdiomJielongTool

