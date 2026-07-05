import { useMemo } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

const QbtoolLicense: React.FC = () => {
  const tool = getToolById('qbtool-license')

  if (!tool) return null

  const content = useMemo(() => tool.toolIntroUsage || tool.description || '', [tool])

  const copy = async () => {
    if (!content) return
    await navigator.clipboard.writeText(content)
  }

  return (
    <ToolPageTemplate tool={tool} showIntroSection={false} showRecommendSection={false}>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <ActionButton variant="secondary" onClick={copy} disabled={!content}>
            复制全文
          </ActionButton>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{content}</div>
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default QbtoolLicense

