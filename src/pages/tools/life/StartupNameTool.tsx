import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

const prefix = ['Neo', 'Nova', 'Hyper', 'Cloud', 'Data', 'Meta', 'Bright', 'Swift', 'Zen', 'Pixel', 'Vector', 'Spark', 'Orbit', 'Pulse', 'Echo']
const core = ['Flow', 'Stack', 'Labs', 'Works', 'Base', 'Forge', 'Pilot', 'Wave', 'Link', 'Beam', 'Nest', 'Field', 'Mind', 'Shift', 'Drive']
const suffix = ['', '', '', 'AI', 'HQ', 'One', 'Pro', 'X', 'Hub', 'Now']

const rand = (n: number) => crypto.getRandomValues(new Uint32Array(1))[0] % n

const StartupNameTool: React.FC = () => {
  const tool = getToolById('startupname')
  const [count, setCount] = useState(30)
  const [seed, setSeed] = useState(0)

  if (!tool) return null

  const list = useMemo(() => {
    seed
    const n = Math.max(1, Math.min(200, Math.floor(count)))
    const out: string[] = []
    while (out.length < n) {
      const name = `${prefix[rand(prefix.length)]}${core[rand(core.length)]}${suffix[rand(suffix.length)]}`
      out.push(name)
    }
    return out
  }, [count, seed])

  const copyAll = async () => {
    await navigator.clipboard.writeText(list.join('\n'))
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
            <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="text-sm text-gray-900 font-mono">{n}</div>
            </div>
          ))}
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default StartupNameTool

