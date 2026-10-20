import { Link } from 'react-router-dom'
import { getCategories, getHotTools, getNewTools, tools } from '@/data/toolsFromJson'
import HotTools from './components/HotTools'
import NewTools from './components/NewTools'
import CategoryTools from './components/CategoryTools'

const HomePage: React.FC = () => {
  const hotTools = getHotTools()
  const newTools = getNewTools()
  const categories = getCategories()
  const availableTools = tools.filter(tool => tool.status === 'done').length

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#e5ecff] bg-gradient-to-br from-[#f7f9ff] via-white to-[#f7fbff] p-6 md:p-8">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            百宝箱在线工具箱
          </h1>
          <p className="text-base leading-7 text-gray-600">
            这里收录了图片处理、PDF 转换、开发调试、文本处理、教育学习等常用在线工具。
            当前已上线 {availableTools} 款可直接使用的工具，打开浏览器即可处理日常办公、内容创作和学习任务。
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            {categories
              .filter(category => category.id !== 'all')
              .slice(0, 6)
              .map(category => (
                <Link
                  key={category.id}
                  to={`/category/${category.id}`}
                  className="rounded-full border border-[#d9e6ff] bg-white px-4 py-2 hover:border-[#b9cffd] hover:text-[#2f63df] transition"
                >
                  {category.name} · {category.count}
                </Link>
              ))}
          </div>
        </div>
      </section>

      <HotTools tools={hotTools} />
      <NewTools tools={newTools} />
      
      {categories.map((category) => {
        return (
          <CategoryTools
            key={category.id}
            categoryId={category.id}
            categoryName={category.name}
            tools={tools.filter(tool => tool.category === category.id)}
            maxShow={8}
          />
        )
      })}
    </div>
  )
}

export default HomePage
