import { Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Header: React.FC = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="h-16 fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50 shadow-sm">
      <div className="flex items-center justify-between px-6 h-full max-w-[1440px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">百</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">百宝箱</h1>
            <p className="text-xs text-gray-500">在线实用工具聚合平台</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-[480px] mx-8">
          <div className="flex items-center h-10 bg-[#f5f7fa] rounded-full px-4 gap-2 border border-transparent focus-within:border-[#3b6de3] focus-within:bg-white transition-all">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索工具..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400"
            />
          </div>
        </form>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            <span className="text-[#3b6de3] font-medium">370,683,035</span>
            <span className="ml-1">人次使用</span>
          </div>
          <button className="px-4 py-2 bg-[#ff6b35] text-white text-sm rounded-lg hover:bg-[#ff5a23] transition">
            权益卡
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
