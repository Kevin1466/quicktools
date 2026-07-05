import { Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface SearchBarProps {
  className?: string
  placeholder?: string
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  className = '',
  placeholder = '搜索工具...'
}) => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className={`w-full ${className}`}>
      <div className="flex items-center h-11 bg-[#f5f7fa] rounded-full px-4 gap-2 border border-transparent focus-within:border-[#3b6de3] focus-within:bg-white transition-all">
        <Search size={18} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400"
        />
      </div>
    </form>
  )
}

export default SearchBar
