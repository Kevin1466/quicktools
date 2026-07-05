import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

const WordCount: React.FC = () => {
  const tool = getToolById('wordcount')
  const [text, setText] = useState('')

  if (!tool) return null

  const stats = useMemo(() => {
    const chars = text.length
    const charsNoSpace = text.replace(/\s/g, '').length
    const lines = text ? text.split(/\r\n|\r|\n/).length : 0
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const bytes = new Blob([text]).size
    return { chars, charsNoSpace, lines, words, bytes }
  }, [text])

  const copy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(stats, null, 2))
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm text-gray-600">输入文本</div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="请输入或粘贴文本"
            className="w-full min-h-[260px] p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] resize-y"
          />
        </div>

        <div className="flex items-center gap-3">
          <ActionButton variant="secondary" onClick={copy}>
            复制统计
          </ActionButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
            <div className="text-xs text-gray-500">字符数（含空白）</div>
            <div className="mt-1 font-mono text-2xl text-gray-900">{stats.chars}</div>
          </div>
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
            <div className="text-xs text-gray-500">字符数（不含空白）</div>
            <div className="mt-1 font-mono text-2xl text-gray-900">{stats.charsNoSpace}</div>
          </div>
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
            <div className="text-xs text-gray-500">单词数</div>
            <div className="mt-1 font-mono text-2xl text-gray-900">{stats.words}</div>
          </div>
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
            <div className="text-xs text-gray-500">行数</div>
            <div className="mt-1 font-mono text-2xl text-gray-900">{stats.lines}</div>
          </div>
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
            <div className="text-xs text-gray-500">字节数（UTF-8）</div>
            <div className="mt-1 font-mono text-2xl text-gray-900">{stats.bytes}</div>
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default WordCount
