import { useMemo, useState } from 'react'
import type { Tool } from '@/types'
import ActionButton from '@/components/common/ActionButton'

type EduToolType = 
  | 'relatives' | 'wordcount' | 'dynasties' | 'capitals' 
  | 'idiom' | 'periodic' | 'radical' | 'xiehouyu'
  | 'explain' | 'chengyu' | 'pronunciation'

const getToolType = (tool: Tool): EduToolType => {
  const id = tool.id.toLowerCase()
  if (id.includes('relatives') || id.includes('亲戚')) return 'relatives'
  if (id.includes('wordcount') || id.includes('字数')) return 'wordcount'
  if (id.includes('dynasties') || id.includes('朝代')) return 'dynasties'
  if (id.includes('capital') || id.includes('首都')) return 'capitals'
  if (id.includes('jielong') || id.includes('接龙')) return 'idiom'
  if (id.includes('periodic') || id.includes('元素')) return 'periodic'
  if (id.includes('radical') || id.includes('偏旁')) return 'radical'
  if (id.includes('xiehouyu') || id.includes('歇后语')) return 'xiehouyu'
  if (id.includes('explain') || id.includes('注解')) return 'explain'
  if (id.includes('chengyu') || id.includes('成语')) return 'chengyu'
  if (id.includes('fayin') || id.includes('发音')) return 'pronunciation'
  return 'wordcount'
}

// 亲戚关系数据
const relativesData: Record<string, string> = {
  'father': '爸爸',
  'mother': '妈妈',
  'father-father': '爷爷',
  'father-mother': '奶奶',
  'mother-father': '外公',
  'mother-mother': '外婆',
  'father-brother': '伯伯/叔叔',
  'father-sister': '姑姑',
  'mother-brother': '舅舅',
  'mother-sister': '姨妈',
}

// 历史朝代数据
const dynastiesData = [
  { name: '夏朝', period: '约前2070-前1600', capital: '阳城' },
  { name: '商朝', period: '约前1600-前1046', capital: '亳/殷' },
  { name: '周朝', period: '前1046-前256', capital: '镐京/洛邑' },
  { name: '秦朝', period: '前221-前206', capital: '咸阳' },
  { name: '汉朝', period: '前206-220', capital: '长安/洛阳' },
  { name: '三国', period: '220-280', capital: '洛阳/成都/建业' },
  { name: '晋朝', period: '265-420', capital: '洛阳/建康' },
  { name: '南北朝', period: '420-589', capital: '建康/平城' },
  { name: '隋朝', period: '581-618', capital: '大兴' },
  { name: '唐朝', period: '618-907', capital: '长安' },
  { name: '五代十国', period: '907-960', capital: '开封/杭州' },
  { name: '宋朝', period: '960-1279', capital: '开封/临安' },
  { name: '元朝', period: '1271-1368', capital: '大都' },
  { name: '明朝', period: '1368-1644', capital: '南京/北京' },
  { name: '清朝', period: '1644-1912', capital: '北京' },
]

// 各国首都数据
const capitalsData = [
  { country: '中国', capital: '北京' },
  { country: '美国', capital: '华盛顿' },
  { country: '日本', capital: '东京' },
  { country: '韩国', capital: '首尔' },
  { country: '英国', capital: '伦敦' },
  { country: '法国', capital: '巴黎' },
  { country: '德国', capital: '柏林' },
  { country: '俄罗斯', capital: '莫斯科' },
  { country: '印度', capital: '新德里' },
  { country: '巴西', capital: '巴西利亚' },
  { country: '加拿大', capital: '渥太华' },
  { country: '澳大利亚', capital: '堪培拉' },
  { country: '意大利', capital: '罗马' },
  { country: '西班牙', capital: '马德里' },
  { country: '埃及', capital: '开罗' },
  { country: '泰国', capital: '曼谷' },
]

// 成语数据
const chengyuData = [
  { word: '画蛇添足', meaning: '比喻做了多余的事，反而坏事' },
  { word: '守株待兔', meaning: '比喻不主动努力，而存侥幸心理，希望得到意外收获' },
  { word: '亡羊补牢', meaning: '比喻出了问题以后想办法补救，可以防止继续受损失' },
  { word: '掩耳盗铃', meaning: '比喻自己欺骗自己，明明掩盖不住的事情偏要设法掩盖' },
  { word: '买椟还珠', meaning: '比喻没有眼力，取舍不当' },
  { word: '叶公好龙', meaning: '比喻口头上说爱好某事物，实际上并不真爱好' },
  { word: '刻舟求剑', meaning: '比喻不懂事物已发展变化而仍静止地看问题' },
  { word: '滥竽充数', meaning: '比喻无本领的冒充有本领，次货冒充好货' },
]

// 歇后语数据
const xiehouyuData = [
  { front: '竹篮打水', back: '一场空' },
  { front: '丈二和尚', back: '摸不着头脑' },
  { front: '泥菩萨过江', back: '自身难保' },
  { front: '骑驴看唱本', back: '走着瞧' },
  { front: '狗拿耗子', back: '多管闲事' },
  { front: '肉包子打狗', back: '有去无回' },
  { front: '黄鼠狼给鸡拜年', back: '没安好心' },
  { front: '哑巴吃黄连', back: '有苦说不出' },
  { front: '小葱拌豆腐', back: '一清二白' },
  { front: '姜太公钓鱼', back: '愿者上钩' },
]

// 元素周期表数据（部分）
const periodicData = [
  { number: 1, symbol: 'H', name: '氢', mass: '1.008' },
  { number: 2, symbol: 'He', name: '氦', mass: '4.003' },
  { number: 3, symbol: 'Li', name: '锂', mass: '6.941' },
  { number: 4, symbol: 'Be', name: '铍', mass: '9.012' },
  { number: 5, symbol: 'B', name: '硼', mass: '10.81' },
  { number: 6, symbol: 'C', name: '碳', mass: '12.01' },
  { number: 7, symbol: 'N', name: '氮', mass: '14.01' },
  { number: 8, symbol: 'O', name: '氧', mass: '16.00' },
  { number: 9, symbol: 'F', name: '氟', mass: '19.00' },
  { number: 10, symbol: 'Ne', name: '氖', mass: '20.18' },
  { number: 11, symbol: 'Na', name: '钠', mass: '22.99' },
  { number: 12, symbol: 'Mg', name: '镁', mass: '24.31' },
  { number: 13, symbol: 'Al', name: '铝', mass: '26.98' },
  { number: 14, symbol: 'Si', name: '硅', mass: '28.09' },
  { number: 15, symbol: 'P', name: '磷', mass: '30.97' },
  { number: 16, symbol: 'S', name: '硫', mass: '32.07' },
  { number: 17, symbol: 'Cl', name: '氯', mass: '35.45' },
  { number: 18, symbol: 'Ar', name: '氩', mass: '39.95' },
  { number: 19, symbol: 'K', name: '钾', mass: '39.10' },
  { number: 20, symbol: 'Ca', name: '钙', mass: '40.08' },
]

const EducationWorkbench: React.FC<{ tool: Tool }> = ({ tool }) => {
  const toolType = useMemo(() => getToolType(tool), [tool])

  // 字数计算状态
  const [text, setText] = useState('')
  const stats = useMemo(() => {
    const chars = text.length
    const lines = text.split('\n').length
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length
    const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length
    return { chars, lines, words, chinese }
  }, [text])

  // 亲戚关系状态
  const [relPath, setRelPath] = useState<string[]>([])
  const relResult = useMemo(() => {
    if (relPath.length === 0) return ''
    const key = relPath.join('-')
    return relativesData[key] || '未知关系'
  }, [relPath])

  // 朝代/首都查询状态
  const [searchQuery, setSearchQuery] = useState('')
  const dynastiesResult = useMemo(() => {
    if (!searchQuery) return dynastiesData
    return dynastiesData.filter(d => 
      d.name.includes(searchQuery) || d.period.includes(searchQuery)
    )
  }, [searchQuery])
  const capitalsResult = useMemo(() => {
    if (!searchQuery) return capitalsData
    return capitalsData.filter(c => 
      c.country.includes(searchQuery) || c.capital.includes(searchQuery)
    )
  }, [searchQuery])

  // 成语/歇后语状态
  const [idiomQuery, setIdiomQuery] = useState('')
  const chengyuResult = useMemo(() => {
    if (!idiomQuery) return chengyuData.slice(0, 5)
    return chengyuData.filter(c => c.word.includes(idiomQuery))
  }, [idiomQuery])
  const xiehouyuResult = useMemo(() => {
    if (!idiomQuery) return xiehouyuData.slice(0, 5)
    return xiehouyuData.filter(x => x.front.includes(idiomQuery))
  }, [idiomQuery])

  // 元素周期表状态
  const [elementFilter, setElementFilter] = useState('')
  const elementsResult = useMemo(() => {
    if (!elementFilter) return periodicData
    return periodicData.filter(e => 
      e.name.includes(elementFilter) || 
      e.symbol.toLowerCase() === elementFilter.toLowerCase() ||
      String(e.number) === elementFilter
    )
  }, [elementFilter])

  // 发音状态
  const [pronounceText, setPronounceText] = useState('')
  const handlePronounce = () => {
    if (!pronounceText) return
    const utterance = new SpeechSynthesisUtterance(pronounceText)
    utterance.lang = 'zh-CN'
    speechSynthesis.speak(utterance)
  }

  const renderContent = () => {
    switch (toolType) {
      case 'wordcount':
        return (
          <div className="space-y-4">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="输入文本..."
              className="w-full h-40 p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] resize-none"
            />
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 text-center">
                <div className="text-2xl font-bold text-[#3b6de3]">{stats.chars}</div>
                <div className="text-sm text-gray-600">字符数</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 text-center">
                <div className="text-2xl font-bold text-[#3b6de3]">{stats.chinese}</div>
                <div className="text-sm text-gray-600">中文字</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 text-center">
                <div className="text-2xl font-bold text-[#3b6de3]">{stats.words}</div>
                <div className="text-sm text-gray-600">单词数</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 text-center">
                <div className="text-2xl font-bold text-[#3b6de3]">{stats.lines}</div>
                <div className="text-sm text-gray-600">行数</div>
              </div>
            </div>
          </div>
        )

      case 'dynasties':
        return (
          <div className="space-y-4">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索朝代名称或时期..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3]"
            />
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {dynastiesResult.map(d => (
                <div key={d.name} className="p-4 rounded-xl border border-gray-100 hover:border-[#3b6de3] transition">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">{d.name}</span>
                    <span className="text-sm text-gray-500">{d.period}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">都城: {d.capital}</div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'capitals':
        return (
          <div className="space-y-4">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索国家或首都..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3]"
            />
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {capitalsResult.map(c => (
                <div key={c.country} className="p-4 rounded-xl border border-gray-100 hover:border-[#3b6de3] transition">
                  <div className="font-medium">{c.country}</div>
                  <div className="text-[#3b6de3]">{c.capital}</div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'periodic':
        return (
          <div className="space-y-4">
            <input
              type="text"
              value={elementFilter}
              onChange={e => setElementFilter(e.target.value)}
              placeholder="搜索元素名称、符号或原子序数..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3]"
            />
            <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto">
              {elementsResult.map(e => (
                <div key={e.number} className="p-3 rounded-xl border border-gray-100 hover:border-[#3b6de3] transition text-center">
                  <div className="text-xs text-gray-500">{e.number}</div>
                  <div className="text-xl font-bold text-[#3b6de3]">{e.symbol}</div>
                  <div className="text-sm">{e.name}</div>
                  <div className="text-xs text-gray-500">{e.mass}</div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'chengyu':
      case 'idiom':
        return (
          <div className="space-y-4">
            <input
              type="text"
              value={idiomQuery}
              onChange={e => setIdiomQuery(e.target.value)}
              placeholder="搜索成语..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3]"
            />
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {chengyuResult.map(c => (
                <div key={c.word} className="p-4 rounded-xl border border-gray-100 hover:border-[#3b6de3] transition">
                  <div className="text-lg font-medium text-[#3b6de3]">{c.word}</div>
                  <div className="text-sm text-gray-600 mt-1">{c.meaning}</div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'xiehouyu':
        return (
          <div className="space-y-4">
            <input
              type="text"
              value={idiomQuery}
              onChange={e => setIdiomQuery(e.target.value)}
              placeholder="搜索歇后语..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3]"
            />
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {xiehouyuResult.map(x => (
                <div key={x.front} className="p-4 rounded-xl border border-gray-100 hover:border-[#3b6de3] transition">
                  <div className="text-gray-800">{x.front}</div>
                  <div className="text-[#3b6de3] font-medium mt-1">—— {x.back}</div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'pronunciation':
        return (
          <div className="space-y-4">
            <textarea
              value={pronounceText}
              onChange={e => setPronounceText(e.target.value)}
              placeholder="输入要朗读的文字..."
              className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] resize-none"
            />
            <ActionButton onClick={handlePronounce}>朗读</ActionButton>
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="text-sm text-gray-600 mb-2">使用说明</div>
              <div className="text-xs text-gray-500 space-y-1">
                <div>• 输入文字后点击"朗读"按钮</div>
                <div>• 支持中英文朗读</div>
                <div>• 使用浏览器内置语音合成技术</div>
              </div>
            </div>
          </div>
        )

      case 'relatives':
      default:
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="text-sm text-gray-600 mb-2">亲戚关系查询</div>
              <div className="text-xs text-gray-500">
                选择关系链来查询对应的称呼
              </div>
            </div>
            <div className="space-y-2">
              {Object.entries(relativesData).slice(0, 8).map(([key, value]) => (
                <div key={key} className="p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-600">{key.replace(/-/g, '的')}</span>
                  <span className="font-medium text-[#3b6de3]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  )
}

export default EducationWorkbench