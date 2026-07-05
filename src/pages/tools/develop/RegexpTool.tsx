import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'
import { useAIConfigContext } from '@/contexts/AIConfigContext'
import { callSiliconFlowText } from '@/utils/aiService'

const regexShortcuts = [
  { label: '中文字符串', pattern: '[\\u4e00-\\u9fa5]' },
  { label: '双字节字符', pattern: '[^\\x00-\\xff]' },
  { label: '空白行', pattern: '\\n\\s*\\r' },
  { label: 'Email地址', pattern: "[\\w!#$%&'*+/=?^_`{|}~-]+(?:\\.[\\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\\w](?:[\\w-]*[\\w])?\\.)+[\\w](?:[\\w-]*[\\w])?" },
  { label: '网址URL', pattern: '[a-zA-z]+://[^\\s]*' },
  { label: '国内手机', pattern: '1[3-9]\\d{9}' },
  { label: 'QQ号', pattern: '[1-9][0-9]{4,}' },
  { label: '邮政编码', pattern: '[1-9]\\d{5}(?!\\d)' },
  { label: '身份证号码', pattern: '(\\d{6})(\\d{4})(\\d{2})(\\d{2})(\\d{3})([0-9]|X)' },
  { label: '用户名', pattern: '[a-zA-Z][a-zA-Z0-9_]{4,15}' },
  { label: '正整数', pattern: '[1-9]\\d*' },
  { label: '负整数', pattern: '-[1-9]\\d*' },
]

const RegexpTool: React.FC = () => {
  const tool = getToolById('regexp')
  const { config, hasConfig, openModal } = useAIConfigContext()
  
  const [pattern, setPattern] = useState('')
  const [activeShortcutIndex, setActiveShortcutIndex] = useState<number | null>(null)
  const [isGlobal, setIsGlobal] = useState(true)
  const [isIgnoreCase, setIsIgnoreCase] = useState(false)
  const [text, setText] = useState('')
  
  const [isExplaining, setIsExplaining] = useState(false)
  const [explanation, setExplanation] = useState('')

  if (!tool) return null

  // 实时匹配逻辑，摒弃了“校验按钮”，输入即校验
  const result = useMemo(() => {
    if (!pattern || !text) return ''
    
    try {
      let flags = ''
      if (isGlobal) flags += 'g'
      if (isIgnoreCase) flags += 'i'
      
      const re = new RegExp(pattern, flags)
      const matches: string[] = []
      
      if (isGlobal) {
        let m: RegExpExecArray | null
        let safetyCounter = 0
        while ((m = re.exec(text)) !== null) {
          matches.push(m[0])
          if (m[0] === '') re.lastIndex++
          safetyCounter++
          if (safetyCounter > 10000) break // 防止死循环
        }
      } else {
        const m = re.exec(text)
        if (m) matches.push(m[0])
      }
      
      return matches.length > 0 
        ? `共找到 ${matches.length} 处匹配：\n\n` + matches.join('\n')
        : '没有匹配到任何结果。'
    } catch (e) {
      // 错误时不抛出红色异常，而是保持高冷
      return '正则表达式语法错误或不完整。'
    }
  }, [pattern, isGlobal, isIgnoreCase, text])

  const handleShortcutClick = (p: string, idx: number) => {
    setPattern(p)
    setActiveShortcutIndex(idx)
  }

  const handleExplain = async () => {
    if (!pattern) return
    if (!hasConfig) {
      openModal()
      return
    }

    setIsExplaining(true)
    setExplanation('')
    
    try {
      const prompt = `你是一个正则表达式专家。请用通俗易懂的中文解释以下正则表达式的含义，结构清晰，分条列出：\n\n\`${pattern}\``
      
      const aiResponse = await callSiliconFlowText(
        [
          { role: 'system', content: '你是一个正则表达式专家。' },
          { role: 'user', content: prompt }
        ],
        config,
        {
          model: 'Qwen/Qwen2.5-7B-Instruct'
        }
      )
      
      setExplanation(aiResponse)
    } catch (err) {
      setExplanation('AI 解释失败，请检查网络或 API 配置。')
    } finally {
      setIsExplaining(false)
    }
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 快捷模式按钮区 (懒人小抄) */}
        <div className="flex flex-wrap gap-2">
          {regexShortcuts.map((sc, idx) => (
            <button
              key={idx}
              onClick={() => handleShortcutClick(sc.pattern, idx)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors cursor-pointer ${
                activeShortcutIndex === idx
                  ? 'bg-[#3b6de3] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-[#3b6de3] hover:text-white'
              }`}
            >
              {sc.label}
            </button>
          ))}
        </div>

        {/* 正则表达式输入区 */}
        <div className="space-y-3 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="font-medium text-gray-900">正则表达式</div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                <input
                  type="checkbox"
                  checked={isGlobal}
                  onChange={(e) => setIsGlobal(e.target.checked)}
                  className="w-4 h-4 text-[#3b6de3] rounded border-gray-300 focus:ring-[#3b6de3]"
                />
                全局搜索 (g)
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                <input
                  type="checkbox"
                  checked={isIgnoreCase}
                  onChange={(e) => setIsIgnoreCase(e.target.checked)}
                  className="w-4 h-4 text-[#3b6de3] rounded border-gray-300 focus:ring-[#3b6de3]"
                />
                忽略大小写 (i)
              </label>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-4 top-3 text-gray-400 font-mono text-lg">/</span>
              <input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="w-full pl-8 pr-8 py-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono text-gray-800 cursor-text"
                placeholder="在此输入正则表达式..."
              />
              <span className="absolute right-4 top-3 text-gray-400 font-mono text-lg">/</span>
            </div>
            <ActionButton onClick={handleExplain} loading={isExplaining} disabled={!pattern}>
              ✨ AI 解释
            </ActionButton>
          </div>
          
          {/* AI 解释结果区 */}
          {explanation && (
            <div className="p-4 mt-2 bg-blue-50/50 border border-blue-100 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
              {explanation}
            </div>
          )}
        </div>

        {/* 核心工作区：左右分割 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="font-medium text-gray-900 px-1">请输入要验证的文本</div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-[320px] p-4 bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] resize-none font-mono text-sm text-gray-800 cursor-text"
              placeholder="在此粘贴或输入需要匹配的源文本，右侧将实时显示匹配结果..."
            />
          </div>
          <div className="space-y-2">
            <div className="font-medium text-gray-900 px-1">匹配结果</div>
            <textarea
              readOnly
              value={result}
              className="w-full h-[320px] p-4 bg-gray-50 rounded-xl border border-gray-200 focus:outline-none resize-none font-mono text-sm text-gray-600 cursor-text"
              placeholder="匹配结果将在此显示..."
            />
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default RegexpTool
