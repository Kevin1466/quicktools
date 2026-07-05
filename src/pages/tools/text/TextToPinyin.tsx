import { useState, useEffect } from 'react'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import { textToPinyinLocal } from '@/utils/pinyinConverter'
import { useAIConfigContext } from '@/contexts/AIConfigContext'
import { textToPinyin } from '@/utils/aiService'

type PinyinMode = 'tone' | 'no-tone' | 'initial'

const modeOptions: { id: PinyinMode; name: string }[] = [
  { id: 'tone', name: '带声调拼音' },
  { id: 'no-tone', name: '不带声调拼音' },
  { id: 'initial', name: '拼音首字母' },
]

const TextToPinyin: React.FC = () => {
  const tool = getToolById('tta')
  const { config, hasConfig, openModal } = useAIConfigContext()
  
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [mode, setMode] = useState<PinyinMode>('tone')
  const [useAI, setUseAI] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!inputText.trim()) {
      setOutputText('')
      return
    }
    
    if (!useAI) {
      const result = textToPinyinLocal(inputText, mode)
      setOutputText(result)
    }
  }, [inputText, mode, useAI])

  const handleConvertWithAI = async () => {
    if (!inputText.trim()) return
    if (!hasConfig) {
      openModal()
      return
    }
    
    setIsLoading(true)
    try {
      const result = await textToPinyin(inputText, config, mode)
      setOutputText(result)
    } catch (error) {
      console.error('AI 转换失败:', error)
      alert('AI 转换失败: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
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
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex gap-2">
            {modeOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => setMode(opt.id)}
                className={`px-4 py-2 text-sm rounded-lg transition ${
                  mode === opt.id
                    ? 'bg-[#3b6de3] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {opt.name}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#3b6de3] focus:ring-[#3b6de3]"
              />
              <span className="text-sm text-gray-700">使用 AI 增强</span>
            </label>
            
            {useAI && !hasConfig && (
              <button
                onClick={openModal}
                className="text-sm text-[#3b6de3]"
              >
                配置 API
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">请输入文本</label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="请输入文本"
              className="w-full h-48 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">转换结果</label>
            <textarea
              value={outputText}
              readOnly
              placeholder="转换结果将显示在这里"
              className="w-full h-48 p-4 border border-gray-200 rounded-lg resize-none bg-gray-50"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {useAI && (
            <button
              onClick={handleConvertWithAI}
              disabled={!inputText.trim() || isLoading}
              className="px-6 py-2.5 bg-[#3b6de3] text-white rounded-lg hover:bg-[#2a52c2] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {isLoading ? '转换中...' : 'AI 转换'}
            </button>
          )}

          {outputText && (
            <button
              onClick={handleCopy}
              className="px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
            >
              复制结果
            </button>
          )}
        </div>

        {useAI && (
          <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
            <p><strong>AI 增强模式：</strong>使用 AI 可以更准确地处理多音字、复杂句式等场景。需要配置 OpenAI API Key。</p>
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default TextToPinyin
