import { useSearchParams } from 'react-router-dom'
import ToolGrid from '@/components/common/ToolGrid'
import { searchTools } from '@/data/toolsFromJson'
import EmptyState from '@/components/common/EmptyState'
import { Search } from 'lucide-react'

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const tools = searchTools(query)

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Search size={24} className="text-gray-500" />
          <h1 className="text-2xl font-bold text-gray-900">
            搜索结果: "{query}"
          </h1>
        </div>
        <p className="text-gray-600">
          共找到 {tools.length} 个相关工具
        </p>
      </div>

      {tools.length > 0 ? (
        <ToolGrid tools={tools} />
      ) : (
        <EmptyState
          title="没有找到相关工具"
          description="换个关键词试试"
        />
      )}
    </div>
  )
}

export default SearchPage
