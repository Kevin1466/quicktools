import { Tool } from '@/types'
import ToolGrid from '@/components/common/ToolGrid'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface NewToolsProps {
  tools: Tool[]
}

const NewTools: React.FC<NewToolsProps> = ({ tools }) => {
  const displayTools = tools.slice(0, 6)

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">最新工具</h2>
        <Link
          to="/category/all"
          className="flex items-center gap-1 text-sm text-[#3b6de3]"
        >
          更多工具
          <ChevronRight size={14} />
        </Link>
      </div>
      <ToolGrid tools={displayTools} />
    </section>
  )
}

export default NewTools
