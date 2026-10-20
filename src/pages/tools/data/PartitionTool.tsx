import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

type Fs = 'ntfs' | 'fat32' | 'exfat'
type Unit = 'GB' | 'TB'

const format = (n: number) => String(Number(n.toFixed(2)))

const PartitionTool: React.FC = () => {
  const tool = getToolById('partition')
  const [capacity, setCapacity] = useState('512')
  const [unit, setUnit] = useState<Unit>('GB')
  const [fs, setFs] = useState<Fs>('ntfs')

  if (!tool) return null

  const totalGb = useMemo(() => {
    const n = Number(capacity)
    if (!Number.isFinite(n) || n <= 0) return null
    return unit === 'GB' ? n : n * 1024
  }, [capacity, unit])

  const result = useMemo(() => {
    if (totalGb === null) return { ok: false as const, parts: [] as number[], note: '' }

    if (fs === 'ntfs' || fs === 'exfat') {
      return {
        ok: true as const,
        parts: [totalGb],
        note: fs === 'ntfs'
          ? 'NTFS 通常不需要拆分分区限制；可按用途自行规划系统盘/数据盘。'
          : 'exFAT 兼容性较好，适合移动硬盘/跨平台使用；可按用途自行规划。'
      }
    }

    const maxPerPartitionGb = 32
    const count = Math.max(1, Math.ceil(totalGb / maxPerPartitionGb))
    const base = totalGb / count
    const parts = Array.from({ length: count }, () => base)
    return {
      ok: true as const,
      parts,
      note: 'FAT32 在部分系统/工具里存在单分区格式化上限（常见 32GB）。此处按 32GB 上限给出平均拆分建议。'
    }
  }, [totalGb, fs])

  const copy = async () => {
    if (!result.ok) return
    const lines = result.parts.map((p, idx) => `分区${idx + 1}: ${format(p)} GB`)
    await navigator.clipboard.writeText(lines.join('\n'))
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px_200px] gap-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">硬盘容量</div>
            <input
              value={capacity}
              onChange={e => setCapacity(e.target.value)}
              placeholder="例如：512"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">单位</div>
            <select
              value={unit}
              onChange={e => setUnit(e.target.value as Unit)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
            >
              <option value="GB">GB</option>
              <option value="TB">TB</option>
            </select>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">文件系统</div>
            <select
              value={fs}
              onChange={e => setFs(e.target.value as Fs)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
            >
              <option value="ntfs">NTFS</option>
              <option value="exfat">exFAT</option>
              <option value="fat32">FAT32</option>
            </select>
          </div>
        </div>

        {totalGb === null && capacity.trim() && <div className="text-sm text-red-600">请输入有效的容量（大于 0）</div>}

        {result.ok && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">分区建议</div>
              <ActionButton variant="secondary" size="sm" onClick={copy}>
                复制
              </ActionButton>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.parts.map((p, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between">
                  <div className="text-sm text-gray-700">分区 {idx + 1}</div>
                  <div className="font-mono text-sm text-gray-900">{format(p)} GB</div>
                </div>
              ))}
            </div>
            <div className="text-xs text-gray-500">{result.note}</div>
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default PartitionTool
