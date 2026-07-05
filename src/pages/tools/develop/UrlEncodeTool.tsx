import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

type Mode = 'encode' | 'decode'

const UrlEncodeTool: React.FC = () => {
  const tool = getToolById('urlencode')
  const [mode, setMode] = useState<Mode>('encode')
  const [input, setInput] = useState('')

  if (!tool) return null

  const output = useMemo(() => {
    if (!input.trim()) return ''
    try {
      return mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input)
    } catch {
      return ''
    }
  }, [input, mode])

  const copy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('encode')}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              mode === 'encode'
                ? 'bg-[#eef4ff] text-[#3b6de3] font-medium'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            编码
          </button>
          <button
            type="button"
            onClick={() => setMode('decode')}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              mode === 'decode'
                ? 'bg-[#eef4ff] text-[#3b6de3] font-medium'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            解码
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-2">输入</div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={mode === 'encode' ? '输入文本，生成 URL 编码' : '输入 URL 编码，解码为文本'}
              className="w-full min-h-[240px] p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] resize-y"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">输出</div>
              <ActionButton size="sm" variant="secondary" onClick={copy} disabled={!output}>
                复制
              </ActionButton>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="输出结果"
              className="w-full min-h-[240px] p-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 resize-y"
            />
            {input.trim() && !output && (
              <div className="mt-2 text-xs text-red-600">输入内容无法{mode === 'encode' ? '编码' : '解码'}</div>
            )}
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default UrlEncodeTool
