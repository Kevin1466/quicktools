import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'
import { radicals } from '@/data/educationDatasets'

const RadicalTool: React.FC = () => {
  const tool = getToolById('radical')
  const [text, setText] = useState('江河湖海')

  if (!tool) return null

  const result = useMemo(() => {
    const chars = Array.from(text.trim())
    if (chars.length === 0) return []
    return chars.map((ch) => {
      const hit = radicals.find(r => r.char === ch)
      return hit
        ? { char: ch, radical: hit.radical, note: hit.note }
        : { char: ch, radical: '未知', note: '未收录' }
    })
  }, [text])

  const copy = async () => {
    const out = result.map(r => `${r.char}：${r.radical}${r.note ? `（${r.note}）` : ''}`).join('\n')
    await navigator.clipboard.writeText(out)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm text-gray-600">输入汉字（支持多个）</div>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="例如：明晴好你"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
          />
        </div>

        <div className="flex items-center gap-3">
          <ActionButton variant="secondary" onClick={copy} disabled={result.length === 0}>
            复制结果
          </ActionButton>
          <div className="text-sm text-gray-600">共 {result.length} 个</div>
        </div>

        {result.length === 0 ? (
          <div className="text-sm text-gray-500">请输入汉字</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {result.map((r) => (
              <div key={r.char} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-xl">
                    {r.char}
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">偏旁</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900">{r.radical}</div>
                    <div className="text-xs text-gray-500">{r.note}</div>
                  </div>
                </div>
                <ActionButton variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(`${r.char}：${r.radical}`)}>
                  复制
                </ActionButton>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default RadicalTool

