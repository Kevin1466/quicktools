import { useState } from 'react'
import type { Tool } from '@/types'
import ActionButton from '@/components/common/ActionButton'
import { Download, Chrome, Puzzle, Shield, Trash2, Star, Clock } from 'lucide-react'

const BrowserPluginWorkbench: React.FC<{ tool: Tool }> = ({ tool }) => {
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const getToolType = (tool: Tool) => {
    const name = tool.name.toLowerCase()
    const id = tool.id.toLowerCase()
    
    if (name.includes('广告') || name.includes('ad') || id.includes('ad')) return 'ad-blocker'
    if (name.includes('翻译') || name.includes('translate')) return 'translator'
    if (name.includes('密码') || name.includes('password') || name.includes('pass')) return 'password'
    if (name.includes('视频') || name.includes('video')) return 'video-helper'
    if (name.includes('下载') || name.includes('download')) return 'downloader'
    if (name.includes('笔记') || name.includes('note')) return 'note'
    if (name.includes('截图') || name.includes('screen')) return 'screenshot'
    if (name.includes('书签') || name.includes('bookmark')) return 'bookmark'
    
    return 'general'
  }

  const toolType = getToolType(tool)

  const getToolTitle = () => {
    const titles: Record<string, string> = {
      'ad-blocker': '广告拦截插件',
      'translator': '翻译插件',
      'password': '密码管理插件',
      'video-helper': '视频助手插件',
      'downloader': '下载插件',
      'note': '笔记插件',
      'screenshot': '截图插件',
      'bookmark': '书签插件',
      'general': '浏览器插件'
    }
    return titles[toolType] || tool.name
  }

  const getToolDescription = () => {
    const descriptions: Record<string, string> = {
      'ad-blocker': '拦截网页广告，提升浏览体验',
      'translator': '网页翻译、划词翻译，支持多语言',
      'password': '安全存储密码，自动填充登录信息',
      'video-helper': '视频下载、倍速播放、画中画模式',
      'downloader': '批量下载图片、视频、文档等资源',
      'note': '网页高亮批注、笔记同步、剪藏收藏',
      'screenshot': '网页截图、区域截图、滚动长截图',
      'bookmark': '智能书签管理、标签分类、快速检索',
      'general': '增强浏览器功能，提升上网效率'
    }
    return descriptions[toolType] || tool.toolIntroUsage || '浏览器扩展插件'
  }

  const getIcon = () => {
    switch (toolType) {
      case 'ad-blocker': return <Shield className="w-6 h-6 text-green-600" />
      case 'translator': return <Star className="w-6 h-6 text-blue-600" />
      case 'password': return <Shield className="w-6 h-6 text-purple-600" />
      case 'downloader': return <Download className="w-6 h-6 text-orange-600" />
      case 'bookmark': return <Clock className="w-6 h-6 text-pink-600" />
      default: return <Puzzle className="w-6 h-6 text-[#3b6de3]" />
    }
  }

  const handleInstall = async () => {
    setProcessing(true)
    
    // 模拟安装过程
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setResult({
      success: true,
      message: '插件安装成功！请在浏览器扩展管理页面启用该插件。'
    })
    setProcessing(false)
  }

  const handleDownloadCRX = () => {
    alert('下载CRX安装包功能：实际应用中会提供 .crx 文件下载，用户可拖拽到浏览器扩展页面安装。')
  }

  return (
    <div className="space-y-6">
      {/* 插件信息卡片 */}
      <div className="p-6 rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-white shadow-sm border border-gray-100">
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">{getToolTitle()}</h3>
            <p className="text-sm text-gray-500 mt-1">{getToolDescription()}</p>
            
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Chrome className="w-3 h-3" />
                Chrome 兼容
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                安全认证
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                4.8 评分
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 功能特性 */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: Shield, title: '隐私保护', desc: '数据本地处理' },
          { icon: Trash2, title: '无广告', desc: '纯净使用体验' },
          { icon: Clock, title: '自动更新', desc: '保持最新版本' },
          { icon: Star, title: '高评分', desc: '用户一致好评' },
        ].map((feature, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
            <feature.icon className="w-5 h-5 text-[#3b6de3] mb-2" />
            <div className="font-medium text-sm text-gray-900">{feature.title}</div>
            <div className="text-xs text-gray-500 mt-0.5">{feature.desc}</div>
          </div>
        ))}
      </div>

      {/* 安装按钮 */}
      <div className="space-y-3">
        <ActionButton 
          onClick={handleInstall}
          loading={processing}
          disabled={processing}
        >
          {processing ? '安装中...' : '一键安装到浏览器'}
        </ActionButton>
        
        <button
          onClick={handleDownloadCRX}
          className="w-full py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm"
        >
          下载 .crx 安装包（离线安装）
        </button>
      </div>

      {/* 结果提示 */}
      {result && (
        <div className={`p-4 rounded-xl border ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-center gap-3">
            <span className={`text-2xl ${result.success ? 'text-green-600' : 'text-red-600'}`}>
              {result.success ? '✓' : '✗'}
            </span>
            <div className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              {result.message}
            </div>
          </div>
        </div>
      )}

      {/* 安装说明 */}
      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
        <h4 className="font-medium text-gray-900 mb-2 text-sm">安装说明</h4>
        <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
          <li>点击"一键安装"按钮，浏览器会弹出安装确认对话框</li>
          <li>或者下载 .crx 文件后，打开浏览器扩展管理页面 (chrome://extensions/)</li>
          <li>开启"开发者模式"，将 .crx 文件拖拽到页面中完成安装</li>
        </ol>
      </div>
    </div>
  )
}

export default BrowserPluginWorkbench
