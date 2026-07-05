import { useState } from 'react'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'

const boyNames = [
  '浩宇', '伟泽', '子轩', '哲瀚', '雨泽', '建辉', '致远',
  '俊驰', '烨磊', '晟睿', '天佑', '文昊', '修洁', '黎昕',
  '远航', '旭尧', '鸿涛', '伟祺', '荣轩', '越泽', '瑾瑜',
]

const girlNames = [
  '梦琪', '忆柳', '之桃', '慕青', '问兰', '尔岚', '元香',
  '初夏', '沛菡', '傲珊', '曼文', '乐菱', '痴珊', '恨玉',
  '惜文', '香寒', '新柔', '语蓉', '海安', '夜蓉', '涵柏',
]

const NamingTool: React.FC = () => {
  const tool = getToolById('naming')
  const [surname, setSurname] = useState('')
  const [gender, setGender] = useState<'boy' | 'girl'>('boy')
  const [generatedNames, setGeneratedNames] = useState<string[]>([])

  if (!tool) return null

  const handleGenerate = () => {
    if (!surname) return
    
    const names = gender === 'boy' ? boyNames : girlNames
    const randomNames: string[] = []
    
    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * names.length)
      randomNames.push(surname + names[randomIndex])
    }
    
    setGeneratedNames(randomNames)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div>
          <div className="text-sm text-gray-600 mb-2">输入姓氏</div>
          <input
            type="text"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            placeholder="请输入姓氏，如：李"
            maxLength={2}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
          />
        </div>

        <div>
          <div className="text-sm text-gray-600 mb-3">选择性别</div>
          <div className="flex gap-4">
            <button
              onClick={() => setGender('boy')}
              className={`flex-1 px-4 py-3 rounded-lg border transition-colors text-sm ${
                gender === 'boy'
                  ? 'border-[#3b6de3] bg-[#3b6de3] text-white'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              👦 男孩
            </button>
            <button
              onClick={() => setGender('girl')}
              className={`flex-1 px-4 py-3 rounded-lg border transition-colors text-sm ${
                gender === 'girl'
                  ? 'border-[#3b6de3] bg-[#3b6de3] text-white'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              👧 女孩
            </button>
          </div>
        </div>

        <ActionButton onClick={handleGenerate} disabled={!surname}>
          开始取名
        </ActionButton>

        {generatedNames.length > 0 && (
          <div className="p-6 rounded-xl border border-gray-100 bg-gray-50">
            <div className="text-lg font-semibold text-gray-900 mb-4">推荐名字</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {generatedNames.map((name, index) => (
                <div
                  key={index}
                  className="p-4 bg-white rounded-lg border border-gray-100 text-center"
                >
                  <div className="text-xl font-bold text-gray-900">{name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default NamingTool
