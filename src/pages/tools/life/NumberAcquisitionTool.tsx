import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

const unique = (arr: string[]) => Array.from(new Set(arr))

const NumberAcquisitionTool: React.FC = () => {
  const tool = getToolById('number-acquisition')
  const [text, setText] = useState('')

  if (!tool) return null

  const result = useMemo(() => {
    const phone = unique((text.match(/(?:\+?86[-\s]?)?1[3-9]\d{9}/g) || []).map(s => s.replace(/[-\s]/g, '').replace(/^86/, '')))
    const digits = unique((text.match(/\d{8,20}/g) || []).map(s => s))
    const possibleTracking = digits.filter(d => !phone.includes(d) && d.length >= 10)
    return { phone, digits, possibleTracking }
  }, [text])

  const copy = async (v: string[]) => {
    if (!v.length) return
    await navigator.clipboard.writeText(v.join('\n'))
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm text-gray-600">粘贴文本</div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="粘贴快递短信/订单信息/聊天记录等"
            className="w-full min-h-[220px] p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] resize-y"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 font-medium">手机号</div>
              <ActionButton size="sm" variant="secondary" onClick={() => copy(result.phone)} disabled={!result.phone.length}>
                复制
              </ActionButton>
            </div>
            {result.phone.length ? (
              <div className="space-y-1">
                {result.phone.map(p => (
                  <div key={p} className="font-mono text-sm text-gray-900">{p}</div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">未识别</div>
            )}
          </div>

          <div className="p-5 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 font-medium">疑似快递单号</div>
              <ActionButton size="sm" variant="secondary" onClick={() => copy(result.possibleTracking)} disabled={!result.possibleTracking.length}>
                复制
              </ActionButton>
            </div>
            {result.possibleTracking.length ? (
              <div className="space-y-1">
                {result.possibleTracking.slice(0, 20).map(p => (
                  <div key={p} className="font-mono text-sm text-gray-900">{p}</div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">未识别</div>
            )}
          </div>

          <div className="p-5 rounded-xl border border-gray-100 bg-gray-50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 font-medium">所有数字段</div>
              <ActionButton size="sm" variant="secondary" onClick={() => copy(result.digits)} disabled={!result.digits.length}>
                复制
              </ActionButton>
            </div>
            {result.digits.length ? (
              <div className="space-y-1">
                {result.digits.slice(0, 20).map(p => (
                  <div key={p} className="font-mono text-sm text-gray-900">{p}</div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">未识别</div>
            )}
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default NumberAcquisitionTool

