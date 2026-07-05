import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

type Tab = 'expire' | 'remain'

const pad = (n: number) => String(n).padStart(2, '0')
const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const toDate = (s: string) => {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  if (Number.isNaN(d.getTime())) return null
  return d
}

const addMonths = (d: Date, months: number) => {
  const y = d.getFullYear()
  const m = d.getMonth()
  const day = d.getDate()
  const target = new Date(y, m + months, 1)
  const maxDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  target.setDate(Math.min(day, maxDay))
  return target
}

const ShelfLifeTool: React.FC = () => {
  const tool = getToolById('shelflife')
  const today = useMemo(() => fmt(new Date()), [])
  const [tab, setTab] = useState<Tab>('expire')
  const [mfg, setMfg] = useState(today)
  const [lifeValue, setLifeValue] = useState('30')
  const [lifeUnit, setLifeUnit] = useState<'days' | 'months'>('days')
  const [expire, setExpire] = useState(today)

  if (!tool) return null

  const expireResult = useMemo(() => {
    const d = toDate(mfg)
    const n = Number(lifeValue)
    if (!d || !Number.isFinite(n)) return { ok: false as const, out: '', error: '请输入有效日期/保质期' }
    const v = Math.trunc(n)
    const out = lifeUnit === 'days' ? new Date(d.getFullYear(), d.getMonth(), d.getDate() + v) : addMonths(d, v)
    return { ok: true as const, out: fmt(out), error: '' }
  }, [mfg, lifeValue, lifeUnit])

  const remainResult = useMemo(() => {
    const e = toDate(expire)
    if (!e) return { ok: false as const, days: 0, error: '请输入有效到期日' }
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const end = new Date(e.getFullYear(), e.getMonth(), e.getDate())
    const days = Math.round((end.getTime() - start.getTime()) / 86400000)
    return { ok: true as const, days, error: '' }
  }, [expire])

  const copy = async (t: string) => {
    if (!t) return
    await navigator.clipboard.writeText(t)
  }

  const tabBtn = (k: Tab, label: string) => (
    <button
      type="button"
      onClick={() => setTab(k)}
      className={`px-4 py-2 rounded-lg text-sm transition ${
        tab === k
          ? 'bg-[#eef4ff] text-[#3b6de3] font-medium'
          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  )

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          {tabBtn('expire', '计算到期日')}
          {tabBtn('remain', '剩余天数')}
        </div>

        {tab === 'expire' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_200px] gap-4 items-end">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">生产日期</div>
                <input
                  type="date"
                  value={mfg}
                  onChange={(e) => setMfg(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">保质期</div>
                <div className="flex gap-3">
                  <input
                    value={lifeValue}
                    onChange={(e) => setLifeValue(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
                  />
                  <select
                    value={lifeUnit}
                    onChange={(e) => setLifeUnit(e.target.value as 'days' | 'months')}
                    className="w-40 px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                  >
                    <option value="days">天</option>
                    <option value="months">月</option>
                  </select>
                </div>
              </div>
              <ActionButton variant="secondary" onClick={() => copy(expireResult.ok ? expireResult.out : '')} disabled={!expireResult.ok}>
                复制结果
              </ActionButton>
            </div>

            {expireResult.ok ? (
              <div className="p-6 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-gray-600">到期日</div>
                  <div className="mt-2 text-3xl font-semibold text-gray-900 font-mono">{expireResult.out}</div>
                </div>
                <ActionButton onClick={() => setExpire(expireResult.out)} variant="primary">
                  设为到期日
                </ActionButton>
              </div>
            ) : (
              <div className="text-sm text-red-600">{expireResult.error}</div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[240px_200px] gap-4 items-end">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">到期日</div>
                <input
                  type="date"
                  value={expire}
                  onChange={(e) => setExpire(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                />
              </div>
              <ActionButton variant="secondary" onClick={() => copy(String(remainResult.ok ? remainResult.days : ''))} disabled={!remainResult.ok}>
                复制天数
              </ActionButton>
            </div>
            {remainResult.ok ? (
              <div className="p-6 rounded-xl border border-gray-100 bg-gray-50">
                <div className="text-sm text-gray-600">剩余天数（以本地日期计算）</div>
                <div className="mt-2 text-3xl font-semibold text-gray-900 font-mono">{remainResult.days}</div>
              </div>
            ) : (
              <div className="text-sm text-red-600">{remainResult.error}</div>
            )}
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default ShelfLifeTool

