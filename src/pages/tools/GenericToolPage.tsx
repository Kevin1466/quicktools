import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import AutoWorkbench from '@/components/common/AutoWorkbench'
import LifeWorkbench from '@/components/common/LifeWorkbench'
import EducationWorkbench from '@/components/common/EducationWorkbench'
import DocWorkbench from '@/components/common/DocWorkbench'
import VideoWorkbench from '@/components/common/VideoWorkbench'
import PdfWorkbench from '@/components/common/PdfWorkbench'
import ImgWorkbench from '@/components/common/ImgWorkbench'
import BrowserPluginWorkbench from '@/components/common/BrowserPluginWorkbench'
import type { Tool } from '@/types'
import { useAIConfigContext } from '@/contexts/AIConfigContext'

const statusText: Record<Tool['status'], string> = {
  done: '开发完成',
  doing: '开发中',
  todo: '未开发',
}

const GenericToolPage: React.FC<{ tool: Tool }> = ({ tool }) => {
  const { openModal } = useAIConfigContext()

  const isDoing = tool.status === 'doing'
  const isTodo = tool.status === 'todo'

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">状态</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              tool.status === 'done'
                ? 'bg-green-50 text-green-700'
                : tool.status === 'doing'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
            }`}
          >
            {statusText[tool.status]}
          </span>
        </div>

        {(isDoing || isTodo) && (
          <div className="p-6 rounded-xl border border-gray-100 bg-[#f6f7fb]">
            <div className="text-gray-800 font-medium">
              {isDoing ? '该工具正在升级中（可能需要配置外部接口/模型）。' : null}
              {isTodo ? '该工具即将上线，敬请期待。' : null}
            </div>
            {isDoing && (
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openModal}
                  className="px-4 py-2 bg-[#3b6de3] text-white text-sm rounded-lg hover:bg-[#2a52c2] transition"
                >
                  AI模型配置
                </button>
              </div>
            )}
          </div>
        )}

        {tool.category === 'life' ? (
          <LifeWorkbench tool={tool} />
        ) : tool.category === 'education' ? (
          <EducationWorkbench tool={tool} />
        ) : tool.category === 'doc' ? (
          <DocWorkbench tool={tool} />
        ) : tool.category === 'video' ? (
          <VideoWorkbench tool={tool} />
        ) : tool.category === 'pdf' ? (
          <PdfWorkbench tool={tool} />
        ) : tool.category === 'img' ? (
          <ImgWorkbench tool={tool} />
        ) : tool.category === 'pc_plugin' ? (
          <BrowserPluginWorkbench tool={tool} />
        ) : (
          <AutoWorkbench tool={tool} />
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default GenericToolPage
