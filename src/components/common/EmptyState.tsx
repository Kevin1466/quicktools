import { SearchX } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-gray-300 mb-4">
        {icon || <SearchX size={64} />}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  )
}

export default EmptyState
