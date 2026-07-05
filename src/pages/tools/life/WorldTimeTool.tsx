import { useEffect, useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

const zones = [
  { id: 'Asia/Shanghai', name: '中国·上海' },
  { id: 'Asia/Tokyo', name: '日本·东京' },
  { id: 'Asia/Singapore', name: '新加坡' },
  { id: 'Asia/Dubai', name: '迪拜' },
  { id: 'Europe/London', name: '英国·伦敦' },
  { id: 'Europe/Paris', name: '法国·巴黎' },
  { id: 'America/New_York', name: '美国·纽约' },
  { id: 'America/Los_Angeles', name: '美国·洛杉矶' },
  { id: 'Australia/Sydney', name: '澳大利亚·悉尼' },
]

const format = (d: Date, timeZone: string) => {
  const dtf = new Intl.DateTimeFormat('zh-CN', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  return dtf.format(d)
}

const WorldTimeTool: React.FC = () => {
  const tool = getToolById('timer')
  const [now, setNow] = useState(() => new Date())

  if (!tool) return null

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const list = useMemo(() => zones.map(z => ({ ...z, text: format(now, z.id) })), [now])

  const copy = async () => {
    const lines = list.map(x => `${x.name}(${x.id}): ${x.text}`)
    await navigator.clipboard.writeText(lines.join('\n'))
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <ActionButton variant="secondary" onClick={copy}>
            复制全部
          </ActionButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.map(z => (
            <div key={z.id} className="p-5 rounded-xl border border-gray-100 bg-gray-50 space-y-1">
              <div className="text-sm text-gray-700 font-medium">{z.name}</div>
              <div className="text-xs text-gray-500 font-mono">{z.id}</div>
              <div className="mt-2 font-mono text-2xl text-gray-900">{z.text}</div>
            </div>
          ))}
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default WorldTimeTool

