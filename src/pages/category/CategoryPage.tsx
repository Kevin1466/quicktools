import { useParams } from 'react-router-dom'
import ToolGrid from '@/components/common/ToolGrid'
import { getCategoryById } from '@/data/categories'
import { getToolsByCategory } from '@/data/toolsFromJson'
import EmptyState from '@/components/common/EmptyState'

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>()
  const category = getCategoryById(categoryId || '')
  const tools = getToolsByCategory(categoryId || 'all')
  const availableTools = tools.filter(tool => tool.status === 'done').length

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">分类不存在</h1>
        <a
          href="/"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          返回首页
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600">{category.description}</p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          共 {tools.length} 个工具，其中 {availableTools} 个已可直接在线使用
        </p>
        <p className="text-sm leading-6 text-gray-600 mt-3">
          本页聚合了与“{category.name}”相关的在线工具，适合快速完成常见的处理、转换、校验或创作任务。
          无需安装软件，打开浏览器即可开始使用。
        </p>
      </div>

      {tools.length > 0 ? (
        <ToolGrid tools={tools} />
      ) : (
        <EmptyState
          title="暂无工具"
          description="该分类下暂无工具"
        />
      )}
    </div>
  )
}

export default CategoryPage
