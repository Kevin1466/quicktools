import { useMemo, useState } from 'react'
import type { Tool } from '@/types'
import ActionButton from '@/components/common/ActionButton'

type LifeToolType = 'whattoeat' | 'random' | 'bloodtype' | 'led' | 'emoji' | 'nickname' | 'poetry'

const getToolType = (tool: Tool): LifeToolType => {
  const id = tool.id.toLowerCase()
  if (id.includes('whattoeat') || id.includes('eat') || id.includes('吃什么')) return 'whattoeat'
  if (id.includes('random') || id.includes('随机数')) return 'random'
  if (id.includes('blood') || id.includes('血型')) return 'bloodtype'
  if (id.includes('led') || id.includes('弹幕')) return 'led'
  if (id.includes('emoji') || id.includes('颜艺') || id.includes('颜文字')) return 'emoji'
  if (id.includes('nick') || id.includes('name') || id.includes('取名') || id.includes('网名')) return 'nickname'
  if (id.includes('poetry') || id.includes('poem') || id.includes('诗词') || id.includes('古诗')) return 'poetry'
  return 'whattoeat'
}

// 今天吃什么数据
const foodOptions = [
  '火锅', '烧烤', '寿司', '拉面', '披萨', '汉堡', '炸鸡', '麻辣烫',
  '炒饭', '饺子', '面条', '米线', '盖浇饭', '沙拉', '三明治', '粥',
  '烤鱼', '烤肉', '小龙虾', '牛排', '日料', '韩料', '泰餐', '越南粉'
]

// 血型遗传规律
const bloodTypeRules: Record<string, string[]> = {
  'A+A': ['A', 'O'],
  'A+B': ['A', 'B', 'AB', 'O'],
  'A+AB': ['A', 'B', 'AB'],
  'A+O': ['A', 'O'],
  'B+B': ['B', 'O'],
  'B+AB': ['A', 'B', 'AB'],
  'B+O': ['B', 'O'],
  'AB+AB': ['A', 'B', 'AB'],
  'AB+O': ['A', 'B'],
  'O+O': ['O'],
}

// 古诗词数据（简化版）
const poetryLines = [
  '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
  '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',
  '白日依山尽，黄河入海流。欲穷千里目，更上一层楼。',
  '千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。',
  '红豆生南国，春来发几枝。愿君多采撷，此物最相思。',
  '空山不见人，但闻人语响。返景入深林，复照青苔上。',
  '危楼高百尺，手可摘星辰。不敢高声语，恐惊天上人。',
]

// 颜文字数据
const kaomojiList = [
  '(｡♥‿♥｡)', '(◕‿◕✿)', '(｡◕‿◕｡)', 'ʕ•ᴥ•ʔ', '(╯°□°）╯︵ ┻━┻',
  '¯\\_(ツ)_/¯', '( ͡° ͜ʖ ͡°)', '(✿◠‿◠)', 'ʕ•́ᴥ•̀ʔ', '(´･ω･`)',
  '(◡‿◡✿)', '(｡･ω･｡)ﾉ♡', 'ヽ(✿ﾟ▽ﾟ)ノ', '(っ˘ω˘ς )', '♪(┌・。・)┌',
]

const LifeWorkbench: React.FC<{ tool: Tool }> = ({ tool }) => {
  const toolType = useMemo(() => getToolType(tool), [tool])

  // 今天吃什么状态
  const [foodResult, setFoodResult] = useState('')
  const [isSpinning, setIsSpinning] = useState(false)

  // 随机数状态
  const [minNum, setMinNum] = useState('1')
  const [maxNum, setMaxNum] = useState('100')
  const [randomResult, setRandomResult] = useState('')

  // 血型状态
  const [parent1, setParent1] = useState('A')
  const [parent2, setParent2] = useState('B')
  const [bloodResult, setBloodResult] = useState<string[]>([])

  // LED弹幕状态
  const [ledText, setLedText] = useState('')
  const [ledColor, setLedColor] = useState('#ff0000')
  const [ledSpeed, setLedSpeed] = useState(3)
  const [isLedRunning, setIsLedRunning] = useState(false)

  // 颜文字状态
  const [copiedKaomoji, setCopiedKaomoji] = useState('')

  // 古诗词状态
  const [currentPoem, setCurrentPoem] = useState('')

  // 网名生成状态
  const [nicknameStyle, setNicknameStyle] = useState('cute')
  const [generatedNickname, setGeneratedNickname] = useState('')

  const handleWhatToEat = () => {
    setIsSpinning(true)
    let count = 0
    const interval = setInterval(() => {
      setFoodResult(foodOptions[Math.floor(Math.random() * foodOptions.length)])
      count++
      if (count >= 20) {
        clearInterval(interval)
        setIsSpinning(false)
      }
    }, 50)
  }

  const handleRandom = () => {
    const min = parseInt(minNum) || 1
    const max = parseInt(maxNum) || 100
    if (min >= max) {
      setRandomResult('最小值必须小于最大值')
      return
    }
    const result = Math.floor(Math.random() * (max - min + 1)) + min
    setRandomResult(String(result))
  }

  const handleBloodType = () => {
    const key = `${parent1}+${parent2}`
    const result = bloodTypeRules[key] || ['无法确定']
    setBloodResult(result)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKaomoji(text)
      setTimeout(() => setCopiedKaomoji(''), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const generateNickname = () => {
    const prefixes: Record<string, string[]> = {
      cute: ['小', '软', '甜', '萌', '呆', '笨', '懒', '馋'],
      cool: ['冷', '傲', '狂', '霸', '绝', '影', '夜', '冥'],
      funny: ['傻', '憨', '逗', '皮', '闹', '疯', '癫', '怪'],
      elegant: ['清', '雅', '静', '淡', '素', '婉', '柔', '娴'],
    }
    const suffixes: Record<string, string[]> = {
      cute: ['猫', '熊', '兔', '鹿', '狗', '猪', '鸟', '鱼'],
      cool: ['狼', '龙', '虎', '鹰', '蛇', '豹', '蝎', '鸦'],
      funny: ['瓜', '豆', '球', '蛋', '饼', '包', '糕', '糖'],
      elegant: ['莲', '兰', '菊', '竹', '梅', '松', '荷', '桂'],
    }
    const prefix = prefixes[nicknameStyle][Math.floor(Math.random() * prefixes[nicknameStyle].length)]
    const suffix = suffixes[nicknameStyle][Math.floor(Math.random() * suffixes[nicknameStyle].length)]
    setGeneratedNickname(prefix + suffix)
  }

  const handleNewPoem = () => {
    setCurrentPoem(poetryLines[Math.floor(Math.random() * poetryLines.length)])
  }

  const renderContent = () => {
    switch (toolType) {
      case 'whattoeat':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`text-4xl font-bold mb-4 ${isSpinning ? 'text-[#3b6de3] animate-pulse' : 'text-gray-800'}`}>
                {foodResult || '点击开始'}
              </div>
              <ActionButton onClick={handleWhatToEat} loading={isSpinning} disabled={isSpinning}>
                {isSpinning ? '选择中...' : '今天吃什么'}
              </ActionButton>
            </div>
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="text-sm text-gray-600 mb-2">可选美食</div>
              <div className="flex flex-wrap gap-2">
                {foodOptions.map(food => (
                  <span key={food} className="px-2 py-1 bg-white rounded text-xs text-gray-600">{food}</span>
                ))}
              </div>
            </div>
          </div>
        )

      case 'random':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">最小值</div>
                <input
                  type="number"
                  value={minNum}
                  onChange={e => setMinNum(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">最大值</div>
                <input
                  type="number"
                  value={maxNum}
                  onChange={e => setMaxNum(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
                />
              </div>
            </div>
            <ActionButton onClick={handleRandom}>生成随机数</ActionButton>
            {randomResult && (
              <div className="p-6 rounded-xl border border-gray-100 bg-gray-50 text-center">
                <div className="text-sm text-gray-600 mb-2">随机结果</div>
                <div className="text-5xl font-bold text-[#3b6de3]">{randomResult}</div>
              </div>
            )}
          </div>
        )

      case 'bloodtype':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">父亲血型</div>
                <select
                  value={parent1}
                  onChange={e => setParent1(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                >
                  {['A', 'B', 'AB', 'O'].map(t => <option key={t} value={t}>{t}型</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">母亲血型</div>
                <select
                  value={parent2}
                  onChange={e => setParent2(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                >
                  {['A', 'B', 'AB', 'O'].map(t => <option key={t} value={t}>{t}型</option>)}
                </select>
              </div>
            </div>
            <ActionButton onClick={handleBloodType}>查询子女可能血型</ActionButton>
            {bloodResult.length > 0 && (
              <div className="p-6 rounded-xl border border-gray-100 bg-gray-50">
                <div className="text-sm text-gray-600 mb-3">子女可能的血型</div>
                <div className="flex flex-wrap gap-3">
                  {bloodResult.map(blood => (
                    <span key={blood} className="px-4 py-2 bg-[#3b6de3] text-white rounded-lg text-lg font-medium">
                      {blood}型
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="text-sm text-gray-600 mb-2">血型遗传规律表</div>
              <div className="text-xs text-gray-500 space-y-1">
                <div>• A + A → A, O</div>
                <div>• A + B → A, B, AB, O</div>
                <div>• A + AB → A, B, AB</div>
                <div>• A + O → A, O</div>
                <div>• B + B → B, O</div>
                <div>• B + AB → A, B, AB</div>
                <div>• B + O → B, O</div>
                <div>• AB + AB → A, B, AB</div>
                <div>• AB + O → A, B</div>
                <div>• O + O → O</div>
              </div>
            </div>
          </div>
        )

      case 'led':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">弹幕文字</div>
              <input
                type="text"
                value={ledText}
                onChange={e => setLedText(e.target.value)}
                placeholder="输入要显示的文字"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">颜色</div>
                <input
                  type="color"
                  value={ledColor}
                  onChange={e => setLedColor(e.target.value)}
                  className="w-full h-10 rounded-xl border border-gray-200 cursor-pointer"
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">速度: {ledSpeed}s</div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={ledSpeed}
                  onChange={e => setLedSpeed(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            <ActionButton onClick={() => setIsLedRunning(!isLedRunning)}>
              {isLedRunning ? '停止' : '开始滚动'}
            </ActionButton>
            <div className="overflow-hidden rounded-xl bg-black p-4" style={{ height: '80px' }}>
              {isLedRunning && ledText ? (
                <div
                  className="whitespace-nowrap text-4xl font-bold"
                  style={{
                    color: ledColor,
                    animation: `scroll ${ledSpeed}s linear infinite`,
                  }}
                >
                  {ledText}
                </div>
              ) : (
                <div className="text-gray-600 text-center text-xl">{ledText || '等待开始...'}</div>
              )}
            </div>
            <style>{`
              @keyframes scroll {
                from { transform: translateX(100%); }
                to { transform: translateX(-100%); }
              }
            `}</style>
          </div>
        )

      case 'emoji':
        return (
          <div className="space-y-6">
            <div className="text-sm text-gray-600">点击颜文字即可复制</div>
            <div className="flex flex-wrap gap-2">
              {kaomojiList.map((kaomoji, index) => (
                <button
                  key={index}
                  onClick={() => copyToClipboard(kaomoji)}
                  className={`px-3 py-2 rounded-lg border transition ${
                    copiedKaomoji === kaomoji
                      ? 'bg-green-50 border-green-300 text-green-700'
                      : 'bg-white border-gray-200 hover:border-[#3b6de3] hover:text-[#3b6de3]'
                  }`}
                  title={kaomoji}
                >
                  <span className="text-lg">{kaomoji}</span>
                  {copiedKaomoji === kaomoji && <span className="ml-2 text-xs">已复制!</span>}
                </button>
              ))}
            </div>
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="text-sm text-gray-600 mb-2">更多颜文字分类</div>
              <div className="flex flex-wrap gap-2">
                {['开心', '难过', '生气', '惊讶', '爱心', '可爱', '酷'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white rounded-full text-sm text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )

      case 'poetry':
        return (
          <div className="space-y-6">
            <ActionButton onClick={handleNewPoem}>随机一首</ActionButton>
            {currentPoem && (
              <div className="p-6 rounded-xl border border-gray-100 bg-gray-50">
                <div className="text-lg text-gray-800 leading-relaxed whitespace-pre-line font-serif">
                  {currentPoem}
                </div>
              </div>
            )}
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="text-sm text-gray-600 mb-2">古诗词取名灵感</div>
              <div className="text-xs text-gray-500 space-y-1">
                <div>• 从诗句中提取意境优美的字词</div>
                <div>• 适合人名、公司名、项目名等</div>
                <div>• 点击下方按钮获取随机诗句</div>
              </div>
            </div>
          </div>
        )

      case 'nickname':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">风格</div>
              <select
                value={nicknameStyle}
                onChange={e => setNicknameStyle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
              >
                <option value="cute">可爱风</option>
                <option value="cool">酷炫风</option>
                <option value="funny">搞笑风</option>
                <option value="elegant">优雅风</option>
              </select>
            </div>
            <ActionButton onClick={generateNickname}>生成网名</ActionButton>
            {generatedNickname && (
              <div className="p-6 rounded-xl border border-gray-100 bg-gray-50 text-center">
                <div className="text-sm text-gray-600 mb-2">生成的网名</div>
                <div className="text-3xl font-bold text-[#3b6de3]">{generatedNickname}</div>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-gray-100 bg-gray-50">
              <div className="text-gray-800">该工具正在开发中...</div>
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

export default LifeWorkbench