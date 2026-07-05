import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Image, 
  FileText, 
  FileCode, 
  ScanEye, 
  Smile, 
  Code, 
  GraduationCap, 
  Sparkles 
} from 'lucide-react'
import type { Tool, TagType, StatusType } from '@/types'
import Tag from './Tag'

interface ToolCardProps {
  tool: Tool
}

const iconMap: Record<string, React.ReactNode> = {
  'img': <Image size={24} />,
  'pdf': <FileText size={24} />,
  'doc': <FileCode size={24} />,
  'ocr': <ScanEye size={24} />,
  'life': <Smile size={24} />,
  'develop': <Code size={24} />,
  'education': <GraduationCap size={24} />,
  'ai': <Sparkles size={24} />,
  'text': <FileText size={24} />,
  'data': <Code size={24} />,
  'video': <Image size={24} />,
}

const bgColorMap: Record<string, string> = {
  'img': 'bg-blue-50 text-blue-500',
  'pdf': 'bg-red-50 text-red-500',
  'doc': 'bg-indigo-50 text-indigo-500',
  'ocr': 'bg-green-50 text-green-500',
  'life': 'bg-orange-50 text-orange-500',
  'develop': 'bg-gray-100 text-gray-700',
  'education': 'bg-purple-50 text-purple-500',
  'ai': 'bg-gradient-to-br from-purple-500 to-pink-500 text-white',
  'text': 'bg-teal-50 text-teal-500',
  'data': 'bg-cyan-50 text-cyan-500',
  'video': 'bg-pink-50 text-pink-500',
}

const statusConfig: Record<StatusType, { bg: string; label: string }> = {
  'done': { bg: 'bg-green-500', label: '开发完成' },
  'doing': { bg: 'bg-blue-500', label: '开发中' },
  'todo': { bg: 'bg-gray-400', label: '未开发' },
}

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const [logoError, setLogoError] = useState(false)
  const logoPath = tool.logoLocalPath ? `/${tool.logoLocalPath}` : null
  const showLogo = logoPath && !logoError

  const renderIcon = () => {
    return iconMap[tool.category] || <Image size={24} />
  }

  return (
    <Link
      to={tool.route}
      className="group bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#d9e6ff] transition-all duration-200 cursor-pointer flex gap-4"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${
        showLogo ? 'bg-transparent' : bgColorMap[tool.category] || 'bg-gray-100 text-gray-700'
      }`}>
        {showLogo ? (
          <img 
            src={logoPath} 
            alt={tool.name} 
            className="w-full h-full object-contain"
            onError={() => setLogoError(true)}
          />
        ) : (
          renderIcon()
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-medium text-gray-900 mb-1 truncate">
          {tool.name}
        </h3>
        <p className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed">
          {tool.description}
        </p>
      </div>
    </Link>
  )
}

export default ToolCard
