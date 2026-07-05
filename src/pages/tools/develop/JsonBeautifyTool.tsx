import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

const JsonBeautifyTool: React.FC = () => {
  const tool = getToolById('jsonbeautify')
  const [input, setInput] = useState('')
  const [indent, setIndent] = useState(2)

  if (!tool) return null

  const result = useMemo(() => {
    if (!input.trim()) return { ok: false as const, error: '', formatted: '' }
    try {
      const value = JSON.parse(input)
      return { ok: true as const, error: '', formatted: JSON.stringify(value, null, indent) }
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : 'JSON 解析失败', formatted: '' }
    }
  }, [input, indent])

  const copy = async () => {
    if (!result.formatted) return
    await navigator.clipboard.writeText(result.formatted)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <span>缩进</span>
            <select
              value={indent}
              onChange={e => setIndent(Number(e.target.value))}
              className="px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
            </select>
          </label>
          <ActionButton variant="secondary" onClick={copy} disabled={!result.ok}>
            复制结果
          </ActionButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-2">输入 JSON</div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder='例如：{"a":1,"b":[1,2,3]}'
              className="w-full min-h-[320px] p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] resize-y font-mono text-sm"
            />
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">格式化结果</div>
            {input.trim() && !result.ok ? (
              <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700 whitespace-pre-wrap">
                {result.error}
              </div>
            ) : (
              <textarea
                value={result.formatted}
                readOnly
                placeholder="输出结果"
                className="w-full min-h-[320px] p-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 resize-y font-mono text-sm"
              />
            )}
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default JsonBeautifyTool
