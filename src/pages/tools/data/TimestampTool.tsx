import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

const toDateTimeLocalValue = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const TimestampTool: React.FC = () => {
  const tool = getToolById('timestamp')
  const [timestampInput, setTimestampInput] = useState('')
  const [dateTimeInput, setDateTimeInput] = useState('')

  if (!tool) return null

  const parsed = useMemo(() => {
    const t = timestampInput.trim()
    if (!t) return { ok: false as const, ms: 0 }
    const n = Number(t)
    if (!Number.isFinite(n)) return { ok: false as const, ms: 0 }
    const ms = t.length <= 10 ? Math.floor(n * 1000) : Math.floor(n)
    const d = new Date(ms)
    if (Number.isNaN(d.getTime())) return { ok: false as const, ms: 0 }
    return { ok: true as const, ms }
  }, [timestampInput])

  const dateFromInput = useMemo(() => {
    if (!dateTimeInput.trim()) return { ok: false as const, ms: 0 }
    const d = new Date(dateTimeInput)
    const ms = d.getTime()
    if (Number.isNaN(ms)) return { ok: false as const, ms: 0 }
    return { ok: true as const, ms }
  }, [dateTimeInput])

  const fromTimestamp = parsed.ok ? new Date(parsed.ms) : null
  const fromDateTime = dateFromInput.ok ? new Date(dateFromInput.ms) : null

  const now = () => {
    const d = new Date()
    setTimestampInput(String(d.getTime()))
    setDateTimeInput(toDateTimeLocalValue(d))
  }

  const copy = async (text: string) => {
    if (!text) return
    await navigator.clipboard.writeText(text)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ActionButton onClick={now}>使用当前时间</ActionButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">时间戳（秒或毫秒）</div>
            <input
              value={timestampInput}
              onChange={e => setTimestampInput(e.target.value)}
              placeholder="例如：1716460000 或 1716460000000"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
            />
            {parsed.ok ? (
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">毫秒</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-900">{String(parsed.ms)}</span>
                    <ActionButton size="sm" variant="secondary" onClick={() => copy(String(parsed.ms))}>
                      复制
                    </ActionButton>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">秒</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-900">{String(Math.floor(parsed.ms / 1000))}</span>
                    <ActionButton size="sm" variant="secondary" onClick={() => copy(String(Math.floor(parsed.ms / 1000)))}>
                      复制
                    </ActionButton>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">本地时间</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-900">{fromTimestamp?.toLocaleString()}</span>
                    <ActionButton size="sm" variant="secondary" onClick={() => copy(fromTimestamp?.toLocaleString() || '')}>
                      复制
                    </ActionButton>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">ISO</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-900">{fromTimestamp?.toISOString()}</span>
                    <ActionButton size="sm" variant="secondary" onClick={() => copy(fromTimestamp?.toISOString() || '')}>
                      复制
                    </ActionButton>
                  </div>
                </div>
              </div>
            ) : (
              timestampInput.trim() && <div className="text-xs text-red-600">时间戳无法解析</div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-sm text-gray-600">日期时间（本地）</div>
            <input
              type="datetime-local"
              step={1}
              value={dateTimeInput}
              onChange={e => setDateTimeInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
            />
            {dateFromInput.ok ? (
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">毫秒时间戳</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-900">{String(dateFromInput.ms)}</span>
                    <ActionButton size="sm" variant="secondary" onClick={() => copy(String(dateFromInput.ms))}>
                      复制
                    </ActionButton>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">秒时间戳</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-900">{String(Math.floor(dateFromInput.ms / 1000))}</span>
                    <ActionButton size="sm" variant="secondary" onClick={() => copy(String(Math.floor(dateFromInput.ms / 1000)))}>
                      复制
                    </ActionButton>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">ISO</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-900">{fromDateTime?.toISOString()}</span>
                    <ActionButton size="sm" variant="secondary" onClick={() => copy(fromDateTime?.toISOString() || '')}>
                      复制
                    </ActionButton>
                  </div>
                </div>
              </div>
            ) : (
              dateTimeInput.trim() && <div className="text-xs text-red-600">日期时间无法解析</div>
            )}
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default TimestampTool
