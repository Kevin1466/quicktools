import type { Tool } from '@/types'
import ToolCard from './ToolCard'

interface ToolGridProps {
  tools: Tool[]
}

const ToolGrid: React.FC<ToolGridProps> = ({ tools }) => {
  if (tools.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  )
}

export default ToolGrid
