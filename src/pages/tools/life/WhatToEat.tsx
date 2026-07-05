import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

const defaultFoods = [
  '火锅',
  '烧烤',
  '麻辣烫',
  '螺蛳粉',
  '拉面',
  '盖浇饭',
  '炒饭',
  '饺子',
  '米线',
  '寿司',
  '披萨',
  '汉堡',
  '沙拉',
  '烤鱼',
  '小龙虾',
  '酸菜鱼',
  '牛肉面',
  '炸鸡',
  '粥',
  '轻食',
]

const WhatToEat: React.FC = () => {
  const tool = getToolById('whattoeat')
  const [foodsText, setFoodsText] = useState(defaultFoods.join('\n'))
  const [seed, setSeed] = useState(0)

  if (!tool) return null

  const foods = useMemo(() => {
    return foodsText
      .split(/\r\n|\r|\n/)
      .map(s => s.trim())
      .filter(Boolean)
  }, [foodsText])

  const pick = useMemo(() => {
    seed
    if (!foods.length) return ''
    const idx = crypto.getRandomValues(new Uint32Array(1))[0] % foods.length
    return foods[idx]
  }, [foods, seed])

  const copy = async () => {
    if (!pick) return
    await navigator.clipboard.writeText(pick)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="p-6 rounded-xl border border-gray-100 bg-gray-50">
          <div className="text-sm text-gray-600">今天吃</div>
          <div className="mt-3 text-4xl font-semibold text-gray-900">{pick || '--'}</div>
          <div className="mt-4 flex flex-wrap gap-3">
            <ActionButton onClick={() => setSeed(s => s + 1)} disabled={!foods.length}>
              随机一下
            </ActionButton>
            <ActionButton variant="secondary" onClick={copy} disabled={!pick}>
              复制
            </ActionButton>
          </div>
          {!foods.length && <div className="mt-3 text-sm text-red-600">请先填写候选菜单</div>}
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-600">候选菜单（每行一项）</div>
          <textarea
            value={foodsText}
            onChange={(e) => setFoodsText(e.target.value)}
            className="w-full min-h-[220px] p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] resize-y"
          />
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default WhatToEat
