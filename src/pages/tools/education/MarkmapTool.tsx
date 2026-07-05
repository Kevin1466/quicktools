import { useEffect, useMemo, useRef, useState } from 'react'
import { Transformer } from 'markmap-lib'
import { Markmap } from 'markmap-view'
import { saveAs } from 'file-saver'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

const transformer = new Transformer()

const defaultText = `# 便捷思维导图

## 快速开始
- 支持 Markdown
- 自动生成思维导图
- 支持导出 SVG

## 示例
- 一级
  - 二级
    - 三级
`

const MarkmapTool: React.FC = () => {
  const tool = getToolById('markmap')
  const [text, setText] = useState(defaultText)
  const [error, setError] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const mmRef = useRef<Markmap | null>(null)

  if (!tool) return null

  const md = useMemo(() => text, [text])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    if (!mmRef.current) {
      mmRef.current = Markmap.create(svg)
    }
    try {
      const { root } = transformer.transform(md)
      mmRef.current.setData(root)
      mmRef.current.fit()
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '渲染失败')
    }
  }, [md])

  const downloadSvg = async () => {
    const svg = svgRef.current
    if (!svg) return
    const clone = svg.cloneNode(true) as SVGSVGElement
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    const source = new XMLSerializer().serializeToString(clone)
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
    saveAs(blob, 'mindmap.svg')
  }

  const reset = () => setText(defaultText)

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Markdown 内容</div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="输入 Markdown，将自动生成思维导图"
              className="w-full min-h-[420px] p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] resize-y font-mono text-sm"
            />
            <div className="flex flex-wrap items-center gap-3">
              <ActionButton variant="secondary" onClick={reset}>
                重置示例
              </ActionButton>
              <ActionButton variant="secondary" onClick={downloadSvg}>
                导出SVG
              </ActionButton>
            </div>
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
          </div>

          <div className="space-y-2">
            <div className="text-sm text-gray-600">预览</div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 overflow-auto">
              <svg ref={svgRef} className="w-[1200px] h-[720px]" />
            </div>
            <div className="text-xs text-gray-500">提示：内容较多时可在预览区域滚动查看</div>
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default MarkmapTool

