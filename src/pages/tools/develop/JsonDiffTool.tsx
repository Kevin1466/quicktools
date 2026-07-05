import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

type DiffItem =
  | { type: 'add'; path: string; value: unknown }
  | { type: 'remove'; path: string; value: unknown }
  | { type: 'change'; path: string; from: unknown; to: unknown }

const isPlainObject = (v: unknown): v is Record<string, unknown> => {
  return !!v && typeof v === 'object' && !Array.isArray(v)
}

const diff = (a: unknown, b: unknown, path = ''): DiffItem[] => {
  if (Object.is(a, b)) return []

  if (Array.isArray(a) && Array.isArray(b)) {
    const out: DiffItem[] = []
    const len = Math.max(a.length, b.length)
    for (let i = 0; i < len; i++) {
      const p = `${path}[${i}]`
      if (i >= a.length) out.push({ type: 'add', path: p, value: b[i] })
      else if (i >= b.length) out.push({ type: 'remove', path: p, value: a[i] })
      else out.push(...diff(a[i], b[i], p))
    }
    return out
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    const out: DiffItem[] = []
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    for (const k of Array.from(keys).sort()) {
      const p = path ? `${path}.${k}` : k
      if (!(k in a)) out.push({ type: 'add', path: p, value: b[k] })
      else if (!(k in b)) out.push({ type: 'remove', path: p, value: a[k] })
      else out.push(...diff(a[k], b[k], p))
    }
    return out
  }

  return [{ type: 'change', path: path || '$', from: a, to: b }]
}

const pretty = (v: unknown) => {
  try {
    if (typeof v === 'string') return v
    return JSON.stringify(v, null, 2)
  } catch {
    return String(v)
  }
}

const JsonDiffTool: React.FC = () => {
  const tool = getToolById('jsondiff')
  const [left, setLeft] = useState('{"a":1,"b":2,"c":{"x":1,"y":[1,2]}}')
  const [right, setRight] = useState('{"a":1,"b":3,"c":{"x":2,"y":[1,2,3]}}')

  if (!tool) return null

  const computed = useMemo(() => {
    try {
      const a = left.trim() ? JSON.parse(left) : null
      const b = right.trim() ? JSON.parse(right) : null
      const items = diff(a, b)
      return { ok: true as const, items, error: '' }
    } catch (e) {
      return { ok: false as const, items: [] as DiffItem[], error: e instanceof Error ? e.message : 'JSON解析失败' }
    }
  }, [left, right])

  const copy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(computed.ok ? computed.items : { error: computed.error }, null, 2))
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">JSON A</div>
            <textarea
              value={left}
              onChange={(e) => setLeft(e.target.value)}
              className="w-full min-h-[280px] p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] resize-y font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">JSON B</div>
            <textarea
              value={right}
              onChange={(e) => setRight(e.target.value)}
              className="w-full min-h-[280px] p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] resize-y font-mono text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ActionButton variant="secondary" onClick={copy}>
            复制diff
          </ActionButton>
          {computed.ok ? (
            <div className="text-sm text-gray-600">
              变更数：<span className="font-mono">{computed.items.length}</span>
            </div>
          ) : (
            <div className="text-sm text-red-600">{computed.error}</div>
          )}
        </div>

        {computed.ok && (
          <div className="space-y-3">
            {computed.items.length === 0 ? (
              <div className="p-6 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-600">无差异</div>
            ) : (
              <div className="space-y-2">
                {computed.items.map((it, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-mono text-sm text-gray-900">{it.path}</div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${
                          it.type === 'add'
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : it.type === 'remove'
                              ? 'bg-red-50 text-red-700 border-red-100'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                        }`}
                      >
                        {it.type === 'add' ? '新增' : it.type === 'remove' ? '删除' : '修改'}
                      </span>
                    </div>
                    {it.type === 'change' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <pre className="p-3 rounded-lg border border-gray-200 bg-white text-xs overflow-auto">{pretty(it.from)}</pre>
                        <pre className="p-3 rounded-lg border border-gray-200 bg-white text-xs overflow-auto">{pretty(it.to)}</pre>
                      </div>
                    ) : (
                      <pre className="p-3 rounded-lg border border-gray-200 bg-white text-xs overflow-auto">{pretty(it.value)}</pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default JsonDiffTool

