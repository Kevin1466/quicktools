import { useState } from 'react'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import { simplifiedToTraditional, traditionalToSimplified } from '@/utils/chineseConverter'
import { useAIConfigContext } from '@/contexts/AIConfigContext'
import { callSiliconFlowText } from '@/utils/aiService'

const ChineseConverter: React.FC = () => {
  const tool = getToolById('chinese')
  const { config, hasConfig, openModal } = useAIConfigContext()

  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [useAI, setUseAI] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSimplifiedToTraditional = async () => {
    if (!inputText.trim()) return

    if (!useAI) {
      const result = simplifiedToTraditional(inputText)
      setOutputText(result)
      return
    }

    if (!hasConfig) {
      openModal()
      return
    }

    setIsLoading(true)
    try {
      const prompt = `请将以下简体中文转换为繁体中文。要求：根据上下文准确转换（例如：“头发”应转为“頭髮”，“发现”应转为“發現”）。只输出转换后的纯净文本，不要任何多余解释：\n${inputText}`
      const result = await callSiliconFlowText([{ role: 'user', content: prompt }], config)
      setOutputText(result)
    } catch (error) {
      console.error('AI 简转繁失败:', error)
      alert('AI 转换失败: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTraditionalToSimplified = async () => {
    if (!inputText.trim()) return

    if (!useAI) {
      const result = traditionalToSimplified(inputText)
      setOutputText(result)
      return
    }

    if (!hasConfig) {
      openModal()
      return
    }

    setIsLoading(true)
    try {
      const prompt = `请将以下繁体中文转换为简体中文。要求：根据上下文准确转换。只输出转换后的纯净文本，不要任何多余解释：\n${inputText}`
      const result = await callSiliconFlowText([{ role: 'user', content: prompt }], config)
      setOutputText(result)
    } catch (error) {
      console.error('AI 繁转简失败:', error)
      alert('AI 转换失败: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
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
        <div className="flex items-center justify-end gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              className="w-4 h-4 text-[#3b6de3] rounded border-gray-300 focus:ring-[#3b6de3]"
            />
            <span className="text-sm font-medium text-gray-700">使用硅基流动 AI 大模型增强转换</span>
          </label>
          {useAI && !hasConfig && (
            <button onClick={openModal} className="text-sm text-[#3b6de3] hover:underline">
              配置 API
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">输入文本</label>
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
          <button
            onClick={handleSimplifiedToTraditional}
            disabled={!inputText.trim() || isLoading}
            className="px-6 py-2.5 bg-[#3b6de3] text-white rounded-lg hover:bg-[#2a52c2] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            简体转繁体
          </button>

          <button
            onClick={handleTraditionalToSimplified}
            disabled={!inputText.trim() || isLoading}
            className="px-6 py-2.5 bg-[#3b6de3] text-white rounded-lg hover:bg-[#2a52c2] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            繁体转简体
          </button>

          {outputText && (
            <button
              onClick={handleCopy}
              className="px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
            >
              复制结果
            </button>
          )}

          <button
            onClick={handleClear}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            清空
          </button>
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default ChineseConverter
