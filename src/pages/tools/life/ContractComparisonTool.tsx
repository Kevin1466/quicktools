import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

type DiffLine = { type: 'equal' | 'add' | 'remove'; content: string }

const computeDiff = (a: string[], b: string[]) => {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1]
      else dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1)
    }
  }
  const out: DiffLine[] = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      out.unshift({ type: 'equal', content: a[i - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] <= dp[i - 1][j])) {
      out.unshift({ type: 'add', content: b[j - 1] })
      j--
    } else {
      out.unshift({ type: 'remove', content: a[i - 1] })
      i--
    }
  }
  return out
}

const normalize = (t: string) =>
  t
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(s => s.trimEnd())

const ContractComparisonTool: React.FC = () => {
  const tool = getToolById('contract-comparison')
  const [left, setLeft] = useState('')
  const [right, setRight] = useState('')
  const [show, setShow] = useState(false)

  if (!tool) return null

  const diff = useMemo(() => {
    if (!show) return []
    return computeDiff(normalize(left), normalize(right))
  }, [left, right, show])

  const stats = useMemo(() => {
    const add = diff.filter(d => d.type === 'add').length
    const remove = diff.filter(d => d.type === 'remove').length
    return { add, remove }
  }, [diff])

  const copy = async () => {
    const text = diff.map(d => `${d.type === 'add' ? '+' : d.type === 'remove' ? '-' : ' '} ${d.content}`).join('\n')
    await navigator.clipboard.writeText(text)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">合同A</div>
            <textarea
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              className="w-full min-h-[260px] p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] resize-y"
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">合同B</div>
            <textarea
              value={right}
              onChange={(e) => setRight(e.target.value)}
              className="w-full min-h-[260px] p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] resize-y"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ActionButton onClick={() => setShow(true)} disabled={!left.trim() && !right.trim()}>
            开始对比
          </ActionButton>
          <ActionButton variant="secondary" onClick={() => { setLeft(''); setRight(''); setShow(false) }}>
            清空
          </ActionButton>
          <ActionButton variant="secondary" onClick={copy} disabled={!diff.length}>
            复制diff
          </ActionButton>
          {show && (
            <div className="text-sm text-gray-600">
              新增：<span className="font-mono">{stats.add}</span>｜删除：<span className="font-mono">{stats.remove}</span>
            </div>
          )}
        </div>

        {show && (
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="max-h-[520px] overflow-auto">
              {diff.map((d, idx) => (
                <div
                  key={idx}
                  className={`px-4 py-2 font-mono text-sm whitespace-pre-wrap break-words ${
                    d.type === 'add'
                      ? 'bg-green-50 text-green-800'
                      : d.type === 'remove'
                        ? 'bg-red-50 text-red-800'
                        : 'bg-white text-gray-800'
                  }`}
                >
                  {d.type === 'add' ? '+ ' : d.type === 'remove' ? '- ' : '  '}
                  {d.content || ' '}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default ContractComparisonTool

