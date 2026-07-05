import { Tool } from '@/types'
import ToolGrid from '@/components/common/ToolGrid'

interface AllToolsProps {
  tools: Tool[]
}

const AllTools: React.FC<AllToolsProps> = ({ tools }) => {
  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-4">全部工具</h2>
      <ToolGrid tools={tools} />
    </section>
  )
}

export default AllTools
