import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

const JsonCheckTool: React.FC = () => {
  const tool = getToolById('jsoncheck')
  const [input, setInput] = useState('')

  if (!tool) return null

  const result = useMemo(() => {
    if (!input.trim()) return { ok: false as const, error: '', formatted: '' }
    try {
      const value = JSON.parse(input)
      return { ok: true as const, error: '', formatted: JSON.stringify(value, null, 2) }
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : 'JSON 解析失败', formatted: '' }
    }
  }, [input])

  const copy = async () => {
    if (!result.formatted) return
    await navigator.clipboard.writeText(result.formatted)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
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
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">校验结果</div>
              <ActionButton size="sm" variant="secondary" onClick={copy} disabled={!result.ok}>
                复制格式化结果
              </ActionButton>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                result.ok ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              {input.trim() ? (
                result.ok ? (
                  <div className="text-sm text-green-700 font-medium">JSON 合法</div>
                ) : (
                  <div className="text-sm text-red-700 font-medium">JSON 不合法</div>
                )
              ) : (
                <div className="text-sm text-gray-500">请输入 JSON 进行校验</div>
              )}

              {!result.ok && result.error && (
                <div className="mt-2 text-xs text-red-600 whitespace-pre-wrap">{result.error}</div>
              )}
            </div>

            {result.ok && (
              <pre className="mt-4 w-full overflow-auto p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800">
                {result.formatted}
              </pre>
            )}
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default JsonCheckTool
