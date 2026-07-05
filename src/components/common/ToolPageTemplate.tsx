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
  Sparkles,
  Type,
  Calculator,
  Video
} from 'lucide-react'
import type { Tool } from '@/types'
import { getToolsByCategory } from '@/data/toolsFromJson'
import { getCategoryById } from '@/data/categories'
import Tag from './Tag'

const iconMap: Record<string, React.ReactNode> = {
  'img': <Image size={24} />,
  'pdf': <FileText size={24} />,
  'doc': <FileCode size={24} />,
  'ocr': <ScanEye size={24} />,
  'life': <Smile size={24} />,
  'develop': <Code size={24} />,
  'education': <GraduationCap size={24} />,
  'ai': <Sparkles size={24} />,
  'text': <Type size={24} />,
  'data': <Calculator size={24} />,
  'video': <Video size={24} />,
}

const bgColorMap: Record<string, string> = {
  'img': 'from-blue-400 to-blue-500',
  'pdf': 'from-red-400 to-red-500',
  'doc': 'from-indigo-400 to-indigo-500',
  'ocr': 'from-green-400 to-green-500',
  'life': 'from-orange-400 to-orange-500',
  'develop': 'from-gray-400 to-gray-500',
  'education': 'from-purple-400 to-purple-500',
  'ai': 'from-purple-400 to-pink-500',
  'text': 'from-teal-400 to-teal-500',
  'data': 'from-cyan-400 to-cyan-500',
  'video': 'from-pink-400 to-pink-500',
}

interface ToolPageTemplateProps {
  tool: Tool
  children: React.ReactNode
  showIntroSection?: boolean
  showRecommendSection?: boolean
}

const ToolPageTemplate: React.FC<ToolPageTemplateProps> = ({
  tool,
  children,
  showIntroSection = true,
  showRecommendSection = true
}) => {
  const [logoError, setLogoError] = useState(false)
  const logoPath = tool.logoLocalPath ? `/${tool.logoLocalPath}` : null
  const showLogo = logoPath && !logoError

  const category = getCategoryById(tool.category)
  const recommendedTools = getToolsByCategory(tool.category)
    .filter(t => t.id !== tool.id)
    .slice(0, 3)

  const renderIcon = () => {
    return iconMap[tool.category] || <Image size={24} />
  }

  const getBgGradient = () => {
    return bgColorMap[tool.category] || 'from-blue-400 to-blue-500'
  }

  const parseToolIntroUsage = (text: string) => {
    const introEndIndex = text.indexOf('1、')
    if (introEndIndex === -1) {
      return {
        intro: text,
        steps: []
      }
    }
    
    const intro = text.slice(0, introEndIndex).trim()
    const stepsText = text.slice(introEndIndex)
    const stepRegex = /(\d+)[、\.](.+?)(?=\d+[、\.]|$)/gs
    const steps: string[] = []
    let match
    
    while ((match = stepRegex.exec(stepsText)) !== null) {
      steps.push(match[2].trim())
    }
    
    return { intro, steps }
  }

  const toolIntroData = tool.toolIntroUsage 
    ? parseToolIntroUsage(tool.toolIntroUsage)
    : { intro: tool.description, steps: [] }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-[#f6f7fb] rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${getBgGradient()} rounded-xl flex items-center justify-center overflow-hidden`}>
            {showLogo ? (
              <img 
                src={logoPath} 
                alt={tool.name} 
                className="w-full h-full object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="text-white">
                {renderIcon()}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-900">{tool.name}</h1>
            {category && (
              <span className="px-3 py-1 bg-[#eef4ff] text-[#3b6de3] text-xs rounded-full">
                {category.name}
              </span>
            )}
            {tool.tags && tool.tags.length > 0 && (
              <div className="flex gap-1">
                {tool.tags.map((tag, index) => (
                  <Tag key={index} type={tag} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 md:p-8">
          {children}
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {showIntroSection && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">工具介绍及使用方法</h3>
            <div className="text-gray-600 space-y-3">
              {toolIntroData.intro && (
                <p className="text-sm leading-relaxed">
                  {toolIntroData.intro}
                </p>
              )}
              {toolIntroData.steps.length > 0 && (
                <div className="mt-4 space-y-2">
                  <ol className="list-decimal list-inside text-sm space-y-1 text-gray-600">
                    {toolIntroData.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        )}

        {showRecommendSection && recommendedTools.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">更多推荐</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedTools.map((recTool) => (
                <ToolRecommendationCard key={recTool.id} tool={recTool} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface ToolRecommendationCardProps {
  tool: Tool
}

const ToolRecommendationCard: React.FC<ToolRecommendationCardProps> = ({ tool }) => {
  const [logoError, setLogoError] = useState(false)
  const logoPath = tool.logoLocalPath ? `/${tool.logoLocalPath}` : null
  const showLogo = logoPath && !logoError

  const renderIcon = () => {
    return iconMap[tool.category] || <Image size={24} />
  }

  return (
    <Link
      to={tool.route}
      className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100"
    >
      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
        {showLogo ? (
          <img 
            src={logoPath} 
            alt={tool.name} 
            className="w-full h-full object-contain"
            onError={() => setLogoError(true)}
          />
        ) : (
          <div className="text-blue-500">
            {renderIcon()}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-gray-900 truncate">{tool.name}</p>
        <p className="text-sm text-gray-500 truncate">
          {tool.description?.slice(0, 30)}...
        </p>
      </div>
    </Link>
  )
}

export default ToolPageTemplate
