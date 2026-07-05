import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

const adj = ['清风', '星河', '云朵', '山川', '海盐', '青柠', '薄荷', '冬雪', '夏蝉', '微光', '晚霞', '北岸', '南栀', '小鹿', '暖阳']
const noun = ['旅人', '少年', '回忆', '日记', '信笺', '行者', '观星者', '拾荒者', '梦游者', '纸飞机', '雨季', '月光', '烟火', '棉花糖', '泡泡']

const rand = (n: number) => crypto.getRandomValues(new Uint32Array(1))[0] % n

const NickTool: React.FC = () => {
  const tool = getToolById('nick')
  const [count, setCount] = useState(20)
  const [seed, setSeed] = useState(0)

  if (!tool) return null

  const list = useMemo(() => {
    seed
    const n = Math.max(1, Math.min(200, Math.floor(count)))
    const out: string[] = []
    while (out.length < n) {
      const name = `${adj[rand(adj.length)]}${noun[rand(noun.length)]}${rand(99)}`
      out.push(name)
    }
    return out
  }, [count, seed])

  const copyAll = async () => {
    await navigator.clipboard.writeText(list.join('\n'))
  }

  const copyOne = async (v: string) => {
    await navigator.clipboard.writeText(v)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <span>数量</span>
            <input
              type="number"
              value={count}
              min={1}
              max={200}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-28 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
            />
          </label>
          <ActionButton onClick={() => setSeed(s => s + 1)}>生成</ActionButton>
          <ActionButton variant="secondary" onClick={copyAll} disabled={!list.length}>复制全部</ActionButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.map((n, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
              <div className="text-sm text-gray-900">{n}</div>
              <ActionButton size="sm" variant="secondary" onClick={() => copyOne(n)}>
                复制
              </ActionButton>
            </div>
          ))}
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default NickTool

