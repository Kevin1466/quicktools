import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

type Tab = 'diff' | 'add' | 'weekday'

const pad = (n: number) => String(n).padStart(2, '0')

const formatDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const toLocalDate = (dateStr: string) => {
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2]) - 1
  const da = Number(m[3])
  const d = new Date(y, mo, da)
  if (Number.isNaN(d.getTime())) return null
  return d
}

const dayStartMs = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

const DateCal: React.FC = () => {
  const tool = getToolById('datecal')
  const [tab, setTab] = useState<Tab>('diff')

  const today = useMemo(() => formatDate(new Date()), [])
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)

  const [baseDate, setBaseDate] = useState(today)
  const [deltaDays, setDeltaDays] = useState('1')

  const [weekdayDate, setWeekdayDate] = useState(today)

  if (!tool) return null

  const diffResult = useMemo(() => {
    const s = toLocalDate(startDate)
    const e = toLocalDate(endDate)
    if (!s || !e) return { ok: false as const, days: 0 }
    const days = Math.round((dayStartMs(e) - dayStartMs(s)) / 86400000)
    return { ok: true as const, days }
  }, [startDate, endDate])

  const addResult = useMemo(() => {
    const b = toLocalDate(baseDate)
    const n = Number(deltaDays)
    if (!b || !Number.isFinite(n)) return { ok: false as const, out: '' }
    const out = new Date(b.getFullYear(), b.getMonth(), b.getDate() + Math.trunc(n))
    return { ok: true as const, out: formatDate(out) }
  }, [baseDate, deltaDays])

  const weekdayResult = useMemo(() => {
    const d = toLocalDate(weekdayDate)
    if (!d) return { ok: false as const, text: '' }
    const map = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    return { ok: true as const, text: map[d.getDay()] }
  }, [weekdayDate])

  const copy = async (text: string) => {
    if (!text) return
    await navigator.clipboard.writeText(text)
  }

  const tabBtn = (key: Tab, label: string) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      className={`px-4 py-2 rounded-lg text-sm transition ${
        tab === key
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
          {tabBtn('diff', '日期差')}
          {tabBtn('add', '日期加减')}
          {tabBtn('weekday', '星期几')}
        </div>

        {tab === 'diff' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">开始日期</div>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">结束日期</div>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                />
              </div>
            </div>

            {diffResult.ok ? (
              <div className="p-6 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-600">相差天数（结束 - 开始）</div>
                  <div className="mt-2 text-3xl font-semibold text-gray-900 font-mono">{diffResult.days}</div>
                </div>
                <ActionButton variant="secondary" onClick={() => copy(String(diffResult.days))}>
                  复制
                </ActionButton>
              </div>
            ) : (
              <div className="text-sm text-red-600">请输入有效日期</div>
            )}
          </div>
        )}

        {tab === 'add' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">基准日期</div>
                <input
                  type="date"
                  value={baseDate}
                  onChange={e => setBaseDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">加/减天数（可为负数）</div>
                <input
                  value={deltaDays}
                  onChange={e => setDeltaDays(e.target.value)}
                  placeholder="例如：7 或 -30"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
                />
              </div>
            </div>

            {addResult.ok ? (
              <div className="p-6 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-600">结果日期</div>
                  <div className="mt-2 text-3xl font-semibold text-gray-900 font-mono">{addResult.out}</div>
                </div>
                <ActionButton variant="secondary" onClick={() => copy(addResult.out)}>
                  复制
                </ActionButton>
              </div>
            ) : (
              <div className="text-sm text-red-600">请输入有效日期与天数</div>
            )}
          </div>
        )}

        {tab === 'weekday' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">选择日期</div>
              <input
                type="date"
                value={weekdayDate}
                onChange={e => setWeekdayDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
              />
            </div>

            {weekdayResult.ok ? (
              <div className="p-6 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-600">结果</div>
                  <div className="mt-2 text-3xl font-semibold text-gray-900">{weekdayResult.text}</div>
                </div>
                <ActionButton variant="secondary" onClick={() => copy(weekdayResult.text)}>
                  复制
                </ActionButton>
              </div>
            ) : (
              <div className="text-sm text-red-600">请输入有效日期</div>
            )}
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default DateCal
