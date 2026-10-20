import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

const getLevel = (bmi: number) => {
  if (bmi < 18.5) return { label: '偏瘦', color: 'text-blue-700 bg-blue-50 border-blue-100' }
  if (bmi < 24) return { label: '正常', color: 'text-green-700 bg-green-50 border-green-100' }
  if (bmi < 28) return { label: '超重', color: 'text-yellow-700 bg-yellow-50 border-yellow-100' }
  return { label: '肥胖', color: 'text-red-700 bg-red-50 border-red-100' }
}

const BmiTool: React.FC = () => {
  const tool = getToolById('bmi')
  const [heightCm, setHeightCm] = useState('170')
  const [weightKg, setWeightKg] = useState('65')

  if (!tool) return null

  const result = useMemo(() => {
    const h = Number(heightCm)
    const w = Number(weightKg)
    if (!Number.isFinite(h) || !Number.isFinite(w) || h <= 0 || w <= 0) {
      return { ok: false as const, bmi: 0, level: null as ReturnType<typeof getLevel> | null }
    }
    const m = h / 100
    const bmi = w / (m * m)
    return { ok: true as const, bmi, level: getLevel(bmi) }
  }, [heightCm, weightKg])

  const copy = async () => {
    if (!result.ok) return
    await navigator.clipboard.writeText(result.bmi.toFixed(2))
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">身高（cm）</div>
            <input
              value={heightCm}
              onChange={e => setHeightCm(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">体重（kg）</div>
            <input
              value={weightKg}
              onChange={e => setWeightKg(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
            />
          </div>
        </div>

        {!result.ok && (heightCm.trim() || weightKg.trim()) && (
          <div className="text-sm text-red-600">请输入有效的身高/体重（大于 0）</div>
        )}

        {result.ok && result.level && (
          <div className="p-6 rounded-xl border border-gray-100 bg-gray-50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">BMI</div>
              <ActionButton size="sm" variant="secondary" onClick={copy}>
                复制
              </ActionButton>
            </div>
            <div className="flex items-end gap-4">
              <div className="text-4xl font-semibold text-gray-900 font-mono">{result.bmi.toFixed(2)}</div>
              <div className={`px-3 py-1 rounded-full border text-sm font-medium ${result.level.color}`}>
                {result.level.label}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              参考区间：偏瘦 &lt; 18.5｜正常 18.5–23.9｜超重 24–27.9｜肥胖 ≥ 28
            </div>
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default BmiTool
