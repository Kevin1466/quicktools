import { useState, useCallback } from 'react'
import { Search, Trash2, RotateCcw } from 'lucide-react'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'

const garbageData: Record<string, { category: string; description: string }> = {
  '纸巾': { category: 'other', description: '使用过的纸巾属于其他垃圾' },
  '卫生纸': { category: 'other', description: '卫生纸遇水即溶，属于其他垃圾' },
  '尿不湿': { category: 'other', description: '尿不湿属于其他垃圾' },
  '外卖盒': { category: 'other', description: '污染的外卖盒属于其他垃圾' },
  '塑料袋': { category: 'other', description: '一次性塑料袋属于其他垃圾' },
  '烟蒂': { category: 'other', description: '烟蒂属于其他垃圾' },
  '陶瓷': { category: 'other', description: '陶瓷制品属于其他垃圾' },
  '大骨头': { category: 'other', description: '大骨头难以腐烂，属于其他垃圾' },
  '贝壳': { category: 'other', description: '贝壳属于其他垃圾' },

  '剩饭': { category: 'kitchen', description: '剩饭剩菜属于厨余垃圾' },
  '剩菜': { category: 'kitchen', description: '剩菜属于厨余垃圾' },
  '菜叶': { category: 'kitchen', description: '菜叶属于厨余垃圾' },
  '果皮': { category: 'kitchen', description: '果皮属于厨余垃圾' },
  '蛋壳': { category: 'kitchen', description: '蛋壳属于厨余垃圾' },
  '鱼骨': { category: 'kitchen', description: '鱼骨属于厨余垃圾' },
  '鸡骨': { category: 'kitchen', description: '鸡骨属于厨余垃圾' },
  '茶渣': { category: 'kitchen', description: '茶渣属于厨余垃圾' },
  '咖啡渣': { category: 'kitchen', description: '咖啡渣属于厨余垃圾' },

  '废纸': { category: 'recyclable', description: '未污染的废纸属于可回收物' },
  '纸箱': { category: 'recyclable', description: '纸箱属于可回收物' },
  '塑料瓶': { category: 'recyclable', description: '清洁的塑料瓶属于可回收物' },
  '玻璃瓶': { category: 'recyclable', description: '玻璃瓶属于可回收物' },
  '易拉罐': { category: 'recyclable', description: '易拉罐属于可回收物' },
  '金属': { category: 'recyclable', description: '金属制品属于可回收物' },
  '旧衣服': { category: 'recyclable', description: '清洁的旧衣服属于可回收物' },
  '报纸': { category: 'recyclable', description: '报纸属于可回收物' },
  '书本': { category: 'recyclable', description: '书本属于可回收物' },

  '电池': { category: 'hazardous', description: '废电池属于有害垃圾' },
  '灯管': { category: 'hazardous', description: '废灯管属于有害垃圾' },
  '药品': { category: 'hazardous', description: '过期药品属于有害垃圾' },
  '油漆': { category: 'hazardous', description: '废油漆属于有害垃圾' },
  '温度计': { category: 'hazardous', description: '水银温度计属于有害垃圾' },
  '杀虫剂': { category: 'hazardous', description: '杀虫剂属于有害垃圾' },
  '消毒剂': { category: 'hazardous', description: '消毒剂属于有害垃圾' },
}

const categoryInfo: Record<string, { name: string; color: string; bgColor: string; description: string }> = {
  kitchen: {
    name: '厨余垃圾',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: '易腐烂的生物质生活废弃物'
  },
  recyclable: {
    name: '可回收物',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: '适宜回收和资源利用的废弃物'
  },
  hazardous: {
    name: '有害垃圾',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: '对人体健康或自然环境造成直接或潜在危害的废弃物'
  },
  other: {
    name: '其他垃圾',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    description: '除上述垃圾之外的其他生活垃圾'
  }
}

const GarbageSort: React.FC = () => {
  const tool = getToolById('garbage-sort')
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<{
    name: string
    category: string
    description: string
  } | null>(null)
  const [history, setHistory] = useState<Array<{
    name: string
    category: string
  }>>([])

  const handleSearch = useCallback(() => {
    if (!query.trim()) return
    
    const normalizedQuery = query.trim()
    const match = garbageData[normalizedQuery]
    
    if (match) {
      setResult({
        name: normalizedQuery,
        category: match.category,
        description: match.description
      })
      
      setHistory(prev => {
        const newHistory = [{
          name: normalizedQuery,
          category: match.category
        }, ...prev.filter(item => item.name !== normalizedQuery)]
        return newHistory.slice(0, 10)
      })
    } else {
      setResult({
        name: normalizedQuery,
        category: 'other',
        description: '未找到该物品的分类信息，默认归类为其他垃圾'
      })
    }
  }, [query])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleClear = () => {
    setQuery('')
    setResult(null)
  }

  const handleHistoryClick = (name: string) => {
    setQuery(name)
    const match = garbageData[name]
    if (match) {
      setResult({
        name,
        category: match.category,
        description: match.description
      })
    }
  }

  if (!tool) {
    return <div className="p-8 text-center">工具不存在</div>
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入垃圾名称，如：纸巾、电池、剩饭..."
              className="w-full px-4 py-3 pr-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
          <ActionButton onClick={handleSearch} leftIcon={<Search size={18} />}>
            查询
          </ActionButton>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {Object.entries(categoryInfo).map(([key, info]) => (
            <div
              key={key}
              className={`${info.bgColor} rounded-lg p-4 text-center cursor-pointer hover:shadow-sm transition`}
              onClick={() => {
                const items = Object.entries(garbageData).find(([_, v]) => v.category === key)
                if (items) {
                  setQuery(items[0])
                }
              }}
            >
              <p className={`font-medium ${info.color}`}>{info.name}</p>
              <p className="text-xs text-gray-500 mt-1">{info.description}</p>
            </div>
          ))}
        </div>

        {result && (
          <div className={`${categoryInfo[result.category].bgColor} rounded-lg p-6`}>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 ${categoryInfo[result.category].bgColor} rounded-xl flex items-center justify-center border-2 border-current ${categoryInfo[result.category].color}`}>
                <span className="text-2xl font-bold">
                  {result.category === 'kitchen' ? '🍎' :
                   result.category === 'recyclable' ? '♻️' :
                   result.category === 'hazardous' ? '⚠️' : '🗑️'}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  "{result.name}" 是
                  <span className={`ml-2 ${categoryInfo[result.category].color}`}>
                    {categoryInfo[result.category].name}
                  </span>
                </h3>
                <p className="text-gray-600 mt-1">{result.description}</p>
              </div>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">历史查询</h4>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition"
                >
                  <RotateCcw size={14} />
                  清空
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(item.name)}
                  className={`px-3 py-1.5 text-sm rounded-full ${categoryInfo[item.category].bgColor} ${categoryInfo[item.category].color} hover:opacity-80 transition`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">热门搜索</h4>
          <div className="flex flex-wrap gap-2">
            {['纸巾', '电池', '剩饭', '塑料瓶', '蛋壳', '烟蒂', '纸箱', '玻璃瓶'].map((item) => (
              <button
                key={item}
                onClick={() => {
                  setQuery(item)
                  const match = garbageData[item]
                  if (match) {
                    setResult({
                      name: item,
                      category: match.category,
                      description: match.description
                    })
                  }
                }}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default GarbageSort
