import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

type ABO = 'A' | 'B' | 'AB' | 'O'
type Rh = '+' | '-'

const aboGenotypes: Record<ABO, string[]> = {
  A: ['AA', 'AO'],
  B: ['BB', 'BO'],
  AB: ['AB'],
  O: ['OO'],
}

const rhGenotypes: Record<Rh, string[]> = {
  '+': ['++', '+-'],
  '-': ['--'],
}

const allelePairs = (g: string) => [g[0], g[1]] as const

const aboFromAlleles = (a: string, b: string): ABO => {
  const s = [a, b].sort().join('')
  if (s === 'AA' || s === 'AO') return 'A'
  if (s === 'BB' || s === 'BO') return 'B'
  if (s === 'AB') return 'AB'
  return 'O'
}

const rhFromAlleles = (a: string, b: string): Rh => {
  return a === '+' || b === '+' ? '+' : '-'
}

const BloodTypeTool: React.FC = () => {
  const tool = getToolById('bloodtype')
  const [p1Abo, setP1Abo] = useState<ABO>('A')
  const [p2Abo, setP2Abo] = useState<ABO>('B')
  const [p1Rh, setP1Rh] = useState<Rh>('+')
  const [p2Rh, setP2Rh] = useState<Rh>('+')

  if (!tool) return null

  const result = useMemo(() => {
    const aboSet = new Set<ABO>()
    for (const g1 of aboGenotypes[p1Abo]) {
      for (const g2 of aboGenotypes[p2Abo]) {
        const [a1, a2] = allelePairs(g1)
        const [b1, b2] = allelePairs(g2)
        const alleles1 = [a1, a2]
        const alleles2 = [b1, b2]
        for (const x of alleles1) {
          for (const y of alleles2) {
            aboSet.add(aboFromAlleles(x, y))
          }
        }
      }
    }

    const rhSet = new Set<Rh>()
    for (const g1 of rhGenotypes[p1Rh]) {
      for (const g2 of rhGenotypes[p2Rh]) {
        const [a1, a2] = allelePairs(g1)
        const [b1, b2] = allelePairs(g2)
        for (const x of [a1, a2]) {
          for (const y of [b1, b2]) {
            rhSet.add(rhFromAlleles(x, y))
          }
        }
      }
    }

    const aboList = Array.from(aboSet).sort((a, b) => (a === 'O' ? 4 : a === 'A' ? 1 : a === 'B' ? 2 : 3) - (b === 'O' ? 4 : b === 'A' ? 1 : b === 'B' ? 2 : 3))
    const rhList = Array.from(rhSet).sort()
    const combos = aboList.flatMap(a => rhList.map(r => `${a}${r}`))
    return { aboList, rhList, combos }
  }, [p1Abo, p2Abo, p1Rh, p2Rh])

  const copy = async () => {
    await navigator.clipboard.writeText(result.combos.join(', '))
  }

  const aboSelect = (v: ABO, on: (v: ABO) => void) => (
    <select
      value={v}
      onChange={(e) => on(e.target.value as ABO)}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
    >
      <option value="A">A</option>
      <option value="B">B</option>
      <option value="AB">AB</option>
      <option value="O">O</option>
    </select>
  )

  const rhSelect = (v: Rh, on: (v: Rh) => void) => (
    <select
      value={v}
      onChange={(e) => on(e.target.value as Rh)}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
    >
      <option value="+">Rh+</option>
      <option value="-">Rh-</option>
    </select>
  )

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
            <div className="text-sm text-gray-700 font-medium">父/母 1</div>
            <div className="grid grid-cols-2 gap-3">
              {aboSelect(p1Abo, setP1Abo)}
              {rhSelect(p1Rh, setP1Rh)}
            </div>
          </div>
          <div className="p-5 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
            <div className="text-sm text-gray-700 font-medium">父/母 2</div>
            <div className="grid grid-cols-2 gap-3">
              {aboSelect(p2Abo, setP2Abo)}
              {rhSelect(p2Rh, setP2Rh)}
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-gray-600">子代可能血型（ABO+Rh）</div>
            <ActionButton size="sm" variant="secondary" onClick={copy}>
              复制
            </ActionButton>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.combos.map(x => (
              <span key={x} className="px-3 py-1 rounded-full border bg-white text-gray-800 border-gray-200 text-sm font-mono">
                {x}
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-500">本工具按遗传基因型枚举计算，仅用于科普参考</div>
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default BloodTypeTool

