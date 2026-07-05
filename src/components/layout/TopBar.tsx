import SearchBar from '@/components/common/SearchBar'
import { useAIConfigContext } from '@/contexts/AIConfigContext'

const TopBar: React.FC = () => {
  const { openModal, hasConfig } = useAIConfigContext()

  return (
    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="h-16 px-6 flex items-center justify-between">
        <div className="flex-1 max-w-xl">
          <SearchBar placeholder="搜索工具..." />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openModal}
            className={`px-4 py-2 text-sm rounded-lg transition border ${
              hasConfig
                ? 'bg-[#eef4ff] text-[#3b6de3] border-[#cfe0ff] hover:bg-[#e4eeff]'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            AI模型配置
          </button>
        </div>
      </div>
    </div>
  )
}

export default TopBar
