import { useState } from 'react'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'

const engines = [
  { id: 'sogou', name: '搜狗翻译', url: 'https://fanyi.sogou.com/text' },
  { id: 'tencent', name: '腾讯翻译', url: 'https://fanyi.qq.com/' },
  { id: 'youdao', name: '有道翻译', url: 'https://fanyi.youdao.com/' },
  { id: 'bing', name: '微软翻译', url: 'https://cn.bing.com/translator' },
  { id: 'cnki', name: 'CNKI学术翻译', url: 'https://dict.cnki.net/index' },
]

const TranslateTool: React.FC = () => {
  const tool = getToolById('translate')
  const [activeEngine, setActiveEngine] = useState(engines[0])

  if (!tool) return null

  return (
    <ToolPageTemplate tool={tool}>
      <div className="flex flex-col h-[600px] -mx-6 -mt-6 -mb-6">
        {/* 引擎切换栏 */}
        <div className="flex items-center px-6 py-3 bg-white border-b border-gray-200 overflow-x-auto">
          <div className="flex space-x-2">
            {engines.map((engine) => (
              <button
                key={engine.id}
                onClick={() => setActiveEngine(engine)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeEngine.id === engine.id
                    ? 'bg-[#3b6de3] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {engine.name}
              </button>
            ))}
          </div>
        </div>

        {/* iframe 嵌入区域 */}
        <div className="flex-1 w-full bg-gray-50 relative">
          <iframe
            src={activeEngine.url}
            className="absolute inset-0 w-full h-full border-none"
            title={activeEngine.name}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default TranslateTool
