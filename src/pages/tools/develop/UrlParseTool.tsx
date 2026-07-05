import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

const UrlParseTool: React.FC = () => {
  const tool = getToolById('urlparse')
  const [input, setInput] = useState('')

  if (!tool) return null

  const result = useMemo(() => {
    if (!input.trim()) return { ok: false as const, error: '', data: null as unknown }
    try {
      const url = new URL(input.trim())
      const params: Array<{ key: string; value: string }> = []
      url.searchParams.forEach((value, key) => params.push({ key, value }))
      return {
        ok: true as const,
        error: '',
        data: {
          href: url.href,
          origin: url.origin,
          protocol: url.protocol,
          username: url.username,
          password: url.password ? '******' : '',
          host: url.host,
          hostname: url.hostname,
          port: url.port,
          pathname: url.pathname,
          search: url.search,
          hash: url.hash,
          params,
        },
      }
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : 'URL 解析失败', data: null }
    }
  }, [input])

  const copy = async () => {
    if (!result.ok || !result.data) return
    await navigator.clipboard.writeText(JSON.stringify(result.data, null, 2))
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <ActionButton variant="secondary" onClick={copy} disabled={!result.ok}>
            复制结果
          </ActionButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-2">输入 URL</div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="例如：https://example.com/path?a=1&b=2#hash"
              className="w-full min-h-[220px] p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] resize-y"
            />
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">解析结果</div>
            {input.trim() && !result.ok ? (
              <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700 whitespace-pre-wrap">
                {result.error}
              </div>
            ) : (
              <pre className="w-full overflow-auto p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 min-h-[220px]">
                {result.ok && result.data ? JSON.stringify(result.data, null, 2) : ''}
              </pre>
            )}
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default UrlParseTool
