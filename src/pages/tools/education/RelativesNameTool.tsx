import { useMemo, useState } from 'react'
import relationship from 'relationship.js'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import { getToolById } from '@/data/toolsFromJson'

const relationButtons = [
  { label: '父', value: '爸爸' },
  { label: '母', value: '妈妈' },
  { label: '夫', value: '老公' },
  { label: '妻', value: '老婆' },
  { label: '子', value: '儿子' },
  { label: '女', value: '女儿' },
  { label: '兄', value: '哥哥' },
  { label: '弟', value: '弟弟' },
  { label: '姐', value: '姐姐' },
  { label: '妹', value: '妹妹' },
]

const backspace = (text: string) => {
  const t = text.trim()
  if (!t) return ''
  const parts = t.split('的').filter(Boolean)
  parts.pop()
  return parts.join('的')
}

const RelativesNameTool: React.FC = () => {
  const tool = getToolById('relatives-name')
  const [reverse, setReverse] = useState(false)
  const [sex, setSex] = useState<0 | 1>(0)
  const [text, setText] = useState('')

  if (!tool) return null

  const result = useMemo(() => {
    const t = text.trim()
    if (!t) return []
    try {
      return relationship({ text: t, sex, reverse }) as string[]
    } catch {
      return []
    }
  }, [reverse, sex, text])

  const add = (value: string) => {
    const t = text.trim()
    setText(t ? `${t}的${value}` : value)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={reverse}
            onChange={(e) => setReverse(e.target.checked)}
          />
          对方称呼我
        </label>

        <div className="flex items-center gap-6 text-sm text-gray-700">
          <label className="flex items-center gap-2">
            <input type="radio" checked={sex === 0} onChange={() => setSex(0)} />
            我是女的
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={sex === 1} onChange={() => setSex(1)} />
            我是男的
          </label>
        </div>

        <div className="space-y-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="要找的称谓"
            className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
          />
        </div>

        <div className="space-y-3">
          <div className="text-sm text-gray-600">点击添加关系</div>
          <div className="grid grid-cols-6 md:grid-cols-11 gap-2">
            {relationButtons.map((btn) => (
              <button
                key={btn.label}
                type="button"
                onClick={() => add(btn.value)}
                className="h-10 rounded-md bg-[#3b6de3] text-white hover:bg-[#2a52c2] active:bg-[#1f3f9e] transition"
              >
                {btn.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setText(backspace(text))}
              className="h-10 rounded-md bg-[#ff4d4f] text-white hover:bg-[#e43b3d] active:bg-[#c92b2d] transition"
            >
              &lt;
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-6">
          {result.length > 0 ? (
            <div className="space-y-3">
              <div className="text-3xl font-semibold text-gray-900">{result[0]}</div>
              {result.length > 1 ? (
                <div className="flex flex-wrap gap-2">
                  {result.slice(1).map((r) => (
                    <span key={r} className="px-3 py-1 rounded-full bg-white border border-gray-200 text-sm text-gray-700">
                      {r}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-sm text-gray-500">{text.trim() ? '暂无匹配结果' : '结果将在这里显示'}</div>
          )}
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default RelativesNameTool
