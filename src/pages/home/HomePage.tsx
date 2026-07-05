import { getHotTools, getNewTools, getToolsByCategory, getCategories } from '@/data/toolsFromJson'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import HotTools from './components/HotTools'
import NewTools from './components/NewTools'
import CategoryTools from './components/CategoryTools'

const HomePage: React.FC = () => {
  const hotTools = getHotTools()
  const newTools = getNewTools()
  const categories = getCategories()

  return (
    <div className="space-y-8">
      <HotTools tools={hotTools} />
      <NewTools tools={newTools} />
      
      {categories.map((category) => {
        const categoryTools = getToolsByCategory(category.id)
        if (categoryTools.length === 0) return null
        
        return (
          <CategoryTools
            key={category.id}
            categoryId={category.id}
            categoryName={category.name}
            tools={categoryTools}
            maxShow={8}
          />
        )
      })}
    </div>
  )
}

export default HomePage
