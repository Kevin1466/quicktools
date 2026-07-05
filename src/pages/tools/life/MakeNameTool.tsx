import { useState } from 'react'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'

const poetryData: Record<string, string[]> = {
  '诗经': [
    '静姝', '清漪', '思成', '云舒', '景行', '雅南',
    '嘉禾', '维桢', '其琛', '景云', '雪霏', '嘉卉'
  ],
  '楚辞': [
    '灵均', '正则', '沅有', '湘灵', '逸飞', '扶摇',
    '云旗', '怀瑾', '握瑜', '佩玖', '琼瑶', '昭质'
  ],
  '唐诗': [
    '晴川', '疏影', '月明', '星河', '清辉', '云帆',
    '海日', '江春', '潮平', '风正', '花重', '锦官'
  ],
  '宋词': [
    '晓风', '残月', '清秋', '梧桐', '细雨', '闲花',
    '疏星', '淡月', '微云', '疏雨', '晚风', '新晴'
  ],
}

const MakeNameTool: React.FC = () => {
  const tool = getToolById('makename')
  const [surname, setSurname] = useState('')
  const [source, setSource] = useState<string>('诗经')
  const [generatedNames, setGeneratedNames] = useState<string[]>([])

  if (!tool) return null

  const sources = Object.keys(poetryData)

  const handleGenerate = () => {
    if (!surname) return
    
    const names = poetryData[source]
    const randomNames: string[] = []
    
    for (let i = 0; i < 6; i++) {
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
          <div className="text-sm text-gray-600 mb-3">选择诗词来源</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {sources.map((s) => (
              <button
                key={s}
                onClick={() => setSource(s)}
                className={`px-4 py-3 rounded-lg border transition-colors text-sm ${
                  source === s
                    ? 'border-[#3b6de3] bg-[#3b6de3] text-white'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <ActionButton onClick={handleGenerate} disabled={!surname}>
          开始取名
        </ActionButton>

        {generatedNames.length > 0 && (
          <div className="p-6 rounded-xl border border-gray-100 bg-gray-50">
            <div className="text-lg font-semibold text-gray-900 mb-4">推荐名字</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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

export default MakeNameTool
