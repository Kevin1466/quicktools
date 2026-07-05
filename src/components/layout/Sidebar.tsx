import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutGrid,
  Image,
  FileText,
  Smile,
  Code,
  GraduationCap,
  MessageSquare,
  HelpCircle,
  Calculator,
  Type,
  FileJson,
  Video,
  Puzzle
} from 'lucide-react'
import { tools } from '@/data/toolsFromJson'
import { useFeedbackContext } from '@/contexts/FeedbackContext'
import { useExchangeContext } from '@/contexts/ExchangeContext'
import { umamiTrackEvent } from '@/utils/umami'

const Sidebar: React.FC = () => {
  const location = useLocation()
  const { openFeedback } = useFeedbackContext()
  const { openExchange } = useExchangeContext()

  const getActiveCategoryId = () => {
    if (location.pathname === '/') return 'all'

    const categoryMatch = location.pathname.match(/^\/category\/([^/]+)$/)
    if (categoryMatch) return categoryMatch[1]

    const toolMatch = location.pathname.match(/^\/tool\/([^/]+)$/)
    if (toolMatch) {
      const tool = tools.find(t => t.id === toolMatch[1])
      return tool?.category
    }

    return undefined
  }

  const activeCategoryId = getActiveCategoryId()

  const navItems: Array<{ id: string; name: string; to: string; icon: React.ReactNode }> = [
    { id: 'all', name: '全部', to: '/', icon: <LayoutGrid size={20} /> },
    { id: 'img', name: '图片工具', to: '/category/img', icon: <Image size={20} /> },
    { id: 'pdf', name: 'PDF转换工具', to: '/category/pdf', icon: <FileText size={20} /> },
    { id: 'data', name: '数据换算工具', to: '/category/data', icon: <Calculator size={20} /> },
    { id: 'life', name: '生活娱乐工具', to: '/category/life', icon: <Smile size={20} /> },
    { id: 'education', name: '教育工具', to: '/category/education', icon: <GraduationCap size={20} /> },
    { id: 'text', name: '文本工具', to: '/category/text', icon: <Type size={20} /> },
    { id: 'doc', name: '文档转换工具', to: '/category/doc', icon: <FileJson size={20} /> },
    { id: 'develop', name: '开发工具', to: '/category/develop', icon: <Code size={20} /> },
    { id: 'video', name: '视频工具', to: '/category/video', icon: <Video size={20} /> },
    { id: 'pc_plugin', name: '浏览器插件', to: '/category/pc_plugin', icon: <Puzzle size={20} /> },
  ]

  return (
    <aside className="w-[220px] fixed left-0 top-0 bottom-0 bg-white border-r border-gray-100 overflow-y-auto scrollbar-hide">
      <div className="py-4 px-4 border-b border-gray-100">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">百</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">百宝箱</h1>
            <p className="text-xs text-gray-500">在线工具箱</p>
          </div>
        </NavLink>
      </div>

      <div className="py-3 px-3 flex flex-col gap-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-base transition-all ${
              activeCategoryId === item.id
                ? 'bg-[#eef4ff] text-[#3b6de3] font-medium'
                : 'text-[#242424] hover:bg-gray-50'
            }`}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}

        <div className="my-2 border-t border-gray-100" />

        <div className="flex flex-col gap-1.5 px-4">
          <button
            onClick={() => {
              umamiTrackEvent('exchange_open')
              openExchange()
            }}
            className="flex items-center gap-2 py-2 text-base text-[#242424] hover:text-[#3b6de3] transition cursor-pointer"
          >
            <MessageSquare size={18} />
            <span>交流</span>
          </button>
          <button
            onClick={() => {
              umamiTrackEvent('feedback_open')
              openFeedback()
            }}
            className="flex items-center gap-2 py-2 text-base text-[#242424] hover:text-[#3b6de3] transition cursor-pointer"
          >
            <HelpCircle size={18} />
            <span>反馈</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
