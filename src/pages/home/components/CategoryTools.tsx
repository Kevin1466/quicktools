import { Tool } from '@/types'
import ToolGrid from '@/components/common/ToolGrid'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface CategoryToolsProps {
  categoryId: string
  categoryName: string
  tools: Tool[]
  maxShow?: number
}

const CategoryTools: React.FC<CategoryToolsProps> = ({ 
  categoryId, 
  categoryName, 
  tools, 
  maxShow = 8 
}) => {
  const displayTools = tools.slice(0, maxShow)
  const hasMore = tools.length > maxShow

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">{categoryName}</h2>
        {hasMore && (
          <Link
            to={`/category/${categoryId}`}
            className="flex items-center gap-1 text-sm text-[#3b6de3]"
          >
            更多工具
            <ChevronRight size={14} />
          </Link>
        )}
      </div>
      <ToolGrid tools={displayTools} />
    </section>
  )
}

export default CategoryTools
