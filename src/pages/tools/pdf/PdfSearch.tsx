import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { PdfInfoCard, PdfTwoColumn } from '@/components/pdf/PdfToolUI'
import { getToolById } from '@/data/toolsFromJson'

const PdfSearch: React.FC = () => {
  const tool = getToolById('pdf-search')
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  if (!tool) return null

  const hasQuery = useMemo(() => query.trim().length > 0, [query])

  const run = () => {
    const q = query.trim()
    if (!q) {
      setError('请输入关键词')
      return
    }
    setError('')
    const fullQuery = `filetype:pdf ${q}`
    const url = `https://www.sogou.com/web?query=${encodeURIComponent(fullQuery)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <PdfTwoColumn
          left={
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-6">
                  <div className="w-16 text-right">
                    <span className="text-gray-600">关键词</span>
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="输入关键词"
                      className="w-full max-w-2xl h-11 px-4 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') run()
                      }}
                    />
                    <ActionButton onClick={run} disabled={!hasQuery}>
                      搜索
                    </ActionButton>
                  </div>
                </div>
              </div>

              {error ? <div className="text-sm text-red-600">{error}</div> : null}
            </div>
          }
          right={
            <div className="space-y-4">
              <PdfInfoCard title="说明">
                <div className="space-y-2 text-sm text-gray-600">
                  <div>将在新标签页打开搜狗搜索结果</div>
                  <div className="font-mono text-gray-700">filetype:pdf</div>
                </div>
              </PdfInfoCard>
              <div className="text-sm text-gray-500 leading-relaxed">该工具不上传你的文件，只做公开搜索跳转。</div>
            </div>
          }
        />
      </div>
    </ToolPageTemplate>
  )
}

export default PdfSearch
