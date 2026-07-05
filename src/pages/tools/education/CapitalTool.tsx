import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'
import { countryCapitals } from '@/data/educationDatasets'

const normalize = (s: string) => s.trim().replace(/\s+/g, '')

const CapitalTool: React.FC = () => {
  const tool = getToolById('capital')
  const [query, setQuery] = useState('中国')

  if (!tool) return null

  const matches = useMemo(() => {
    const q = normalize(query)
    if (!q) return []
    return countryCapitals.filter(item => normalize(item.country).includes(q)).slice(0, 20)
  }, [query])

  const top = matches[0]

  const copy = async () => {
    if (!top) return
    await navigator.clipboard.writeText(`${top.country}：${top.capital}`)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm text-gray-600">国家/地区</div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="例如：中国 / 日本 / 英国"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
          />
        </div>

        {top ? (
          <div className="p-6 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-gray-600">首都</div>
              <div className="mt-2 text-3xl font-semibold text-gray-900">{top.capital}</div>
              <div className="mt-1 text-sm text-gray-600">{top.country}</div>
            </div>
            <ActionButton variant="secondary" onClick={copy}>
              复制
            </ActionButton>
          </div>
        ) : (
          <div className="text-sm text-gray-500">没有匹配结果</div>
        )}

        {matches.length > 1 ? (
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 text-xs text-gray-600">更多匹配</div>
            <div className="divide-y divide-gray-100">
              {matches.slice(1).map((item) => (
                <button
                  key={item.country}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition"
                  onClick={() => setQuery(item.country)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm text-gray-900">{item.country}</div>
                    <div className="text-sm text-gray-600">{item.capital}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </ToolPageTemplate>
  )
}

export default CapitalTool

