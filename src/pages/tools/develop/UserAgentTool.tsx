import { useMemo } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

const UserAgentTool: React.FC = () => {
  const tool = getToolById('useragent')

  if (!tool) return null

  const info = useMemo(() => {
    const uaData = (navigator as unknown as { userAgentData?: unknown }).userAgentData
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      userAgentData: uaData,
    }
  }, [])

  const text = JSON.stringify(info, null, 2)

  const copy = async () => {
    await navigator.clipboard.writeText(text)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <ActionButton onClick={copy} variant="secondary">
            复制
          </ActionButton>
        </div>
        <pre className="w-full overflow-auto p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800">
          {text}
        </pre>
      </div>
    </ToolPageTemplate>
  )
}

export default UserAgentTool
