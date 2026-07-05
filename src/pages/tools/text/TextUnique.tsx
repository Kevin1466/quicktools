import { useState } from 'react'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'

const TextUnique: React.FC = () => {
  const tool = getToolById('unique')
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')

  const handleDeduplicate = () => {
    if (!inputText.trim()) return
    
    const lines = inputText.split('\n')
    const seen = new Set<string>()
    const result: string[] = []
    
    for (const line of lines) {
      if (!seen.has(line)) {
        seen.add(line)
        result.push(line)
      }
    }
    
    setOutputText(result.join('\n'))
  }

  const handleClear = () => {
    setInputText('')
    setOutputText('')
  }

  const handleCopy = () => {
    if (!outputText) return
    navigator.clipboard.writeText(outputText)
    alert('已复制到剪贴板')
  }

  if (!tool) {
    return <div className="p-8 text-center">工具不存在</div>
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">请输入待去重的内容</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="请输入待去重的内容"
            className="w-full h-48 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleDeduplicate}
            disabled={!inputText.trim()}
            className="px-6 py-2.5 bg-[#3b6de3] text-white rounded-lg hover:bg-[#2a52c2] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            开始去重
          </button>

          <button
            onClick={handleCopy}
            disabled={!outputText}
            className="px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            复制结果
          </button>

          <button
            onClick={handleClear}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            清除
          </button>
        </div>

        {outputText && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">去重结果</label>
            <textarea
              value={outputText}
              readOnly
              className="w-full h-48 p-4 border border-gray-200 rounded-lg resize-none bg-gray-50"
            />
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default TextUnique
