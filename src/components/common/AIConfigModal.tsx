import { useState, useEffect } from 'react'
import { useAIConfigContext } from '@/contexts/AIConfigContext'
import { X, Eye, EyeOff, Sparkles, Brain, ScanLine, Trash2, Save, AlertCircle } from 'lucide-react'

interface AIConfigModalProps {
  isOpen: boolean
  onClose: () => void
}

const AIConfigModal: React.FC<AIConfigModalProps> = ({ isOpen, onClose }) => {
  const { config, updateConfig, hasConfig } = useAIConfigContext()

  const [localVolc, setLocalVolc] = useState(config.volc)
  const [localSilicon, setLocalSilicon] = useState(config.silicon)
  const [showApiKey, setShowApiKey] = useState<'volc' | 'silicon' | null>(null)
  const [activeTab, setActiveTab] = useState<'volc' | 'silicon'>('volc')

  useEffect(() => {
    if (isOpen) {
      setLocalVolc(config.volc)
      setLocalSilicon(config.silicon)
    }
  }, [isOpen, config])

  if (!isOpen) return null

  const handleSave = () => {
    updateConfig({
      volc: localVolc,
      silicon: localSilicon,
    })
    onClose()
  }

  const handleClear = () => {
    const clearedConfig = {
      volc: {
        apiKey: '',
        baseUrl: import.meta.env.VITE_VOLC_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3',
        modelText: import.meta.env.VITE_VOLC_MODEL_TEXT || 'dove-stone/doubao-seed-2-0-lite-260428',
        modelVision: import.meta.env.VITE_VOLC_MODEL_VISION || 'dove-stone/doubao-seed-1-6-vision-250815',
        modelImage: import.meta.env.VITE_VOLC_MODEL_IMAGE || 'dove-stone/doubao-seedream-5-0-260128',
      },
      silicon: {
        apiKey: '',
        baseUrl: import.meta.env.VITE_SILICON_BASE_URL || 'https://api.siliconflow.cn/v1',
        modelOcr: import.meta.env.VITE_SILICON_MODEL_OCR || 'PaddlePaddle/PaddleOCR-VL-1.5',
      },
    }
    setLocalVolc(clearedConfig.volc)
    setLocalSilicon(clearedConfig.silicon)
    updateConfig(clearedConfig)
  }

  const InputField = ({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
    isPassword = false,
    showPassword,
    onTogglePassword,
  }: {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    type?: string
    isPassword?: boolean
    showPassword?: boolean
    onTogglePassword?: () => void
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative group">
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-[#3b6de3]/30 focus:border-[#3b6de3]
                     transition-all duration-200 placeholder:text-gray-400
                     group-hover:border-gray-300/80"
        />
        {isPassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 
                       hover:text-gray-600 hover:bg-gray-100/80 rounded-lg transition-all"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 毛玻璃背景 */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-gray-900/40 via-gray-800/30 to-gray-900/40 
                   backdrop-blur-md transition-all duration-300"
        onClick={onClose}
      />
      
      {/* 对话框容器 */}
      <div className="relative w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* 发光边框效果 */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-[#3b6de3]/30 via-purple-500/20 to-[#3b6de3]/30 
                        rounded-2xl blur-[1px]" />
        
        {/* 主内容区 */}
        <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl
                        border border-white/50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100/80">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#3b6de3] to-purple-600 rounded-xl blur-sm opacity-60" />
                <div className="relative p-2.5 bg-gradient-to-br from-[#3b6de3] to-purple-600 rounded-xl">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">AI 模型配置</h2>
                <p className="text-xs text-gray-500 mt-0.5">配置外部 AI 服务以启用智能功能</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 
                         rounded-xl transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab 切换 */}
          <div className="px-6 pt-4">
            <div className="flex gap-1 p-1 bg-gray-100/80 rounded-xl">
              <button
                onClick={() => setActiveTab('volc')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${activeTab === 'volc' 
                    ? 'bg-white text-[#3b6de3] shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200/50'}`}
              >
                <Brain className="w-4 h-4" />
                火山引擎
              </button>
              <button
                onClick={() => setActiveTab('silicon')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${activeTab === 'silicon' 
                    ? 'bg-white text-purple-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200/50'}`}
              >
                <ScanLine className="w-4 h-4" />
                硅基流动
              </button>
            </div>
          </div>

          {/* 内容区 */}
          <div className="px-6 py-5 max-h-[50vh] overflow-y-auto">
            {activeTab === 'volc' ? (
              <div className="space-y-5">
                <InputField
                  label="API Key"
                  value={localVolc.apiKey}
                  onChange={(v) => setLocalVolc({ ...localVolc, apiKey: v })}
                  placeholder="请输入火山引擎 API Key"
                  isPassword
                  showPassword={showApiKey === 'volc'}
                  onTogglePassword={() => setShowApiKey(showApiKey === 'volc' ? null : 'volc')}
                />
                <InputField
                  label="Base URL"
                  value={localVolc.baseUrl}
                  onChange={(v) => setLocalVolc({ ...localVolc, baseUrl: v })}
                  placeholder="https://ark.cn-beijing.volces.com/api/v3"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField
                    label="文本对话模型"
                    value={localVolc.modelText}
                    onChange={(v) => setLocalVolc({ ...localVolc, modelText: v })}
                    placeholder="dove-stone/..."
                  />
                  <InputField
                    label="视觉理解模型"
                    value={localVolc.modelVision}
                    onChange={(v) => setLocalVolc({ ...localVolc, modelVision: v })}
                    placeholder="dove-stone/..."
                  />
                  <InputField
                    label="图片生成模型"
                    value={localVolc.modelImage}
                    onChange={(v) => setLocalVolc({ ...localVolc, modelImage: v })}
                    placeholder="dove-stone/..."
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <InputField
                  label="API Key"
                  value={localSilicon.apiKey}
                  onChange={(v) => setLocalSilicon({ ...localSilicon, apiKey: v })}
                  placeholder="请输入硅基流动 API Key"
                  isPassword
                  showPassword={showApiKey === 'silicon'}
                  onTogglePassword={() => setShowApiKey(showApiKey === 'silicon' ? null : 'silicon')}
                />
                <InputField
                  label="Base URL"
                  value={localSilicon.baseUrl}
                  onChange={(v) => setLocalSilicon({ ...localSilicon, baseUrl: v })}
                  placeholder="https://api.siliconflow.cn/v1"
                />
                <InputField
                  label="OCR 模型"
                  value={localSilicon.modelOcr}
                  onChange={(v) => setLocalSilicon({ ...localSilicon, modelOcr: v })}
                  placeholder="PaddlePaddle/PaddleOCR-VL-1.5"
                />
              </div>
            )}
          </div>

          {/* 底部信息 */}
          <div className="px-6 pb-4">
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 
                            rounded-xl border border-blue-100/50">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-700 mb-1">配置说明</p>
                <p>配置信息将保存在浏览器本地存储中，不会上传到服务器。</p>
                <p className="mt-0.5">不同功能会使用不同的服务提供商配置。</p>
              </div>
            </div>

            {hasConfig && (
              <div className="flex items-center justify-center gap-2 mt-4 text-green-600 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>AI 服务已配置，可以正常使用</span>
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 
                         rounded-xl transition-all duration-200 text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              清除配置
            </button>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl 
                           transition-all duration-200 text-sm font-medium"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#3b6de3] to-[#5b7de3]
                           text-white rounded-xl hover:from-[#2a52c2] hover:to-[#4a6bc2]
                           transition-all duration-200 text-sm font-medium shadow-lg shadow-blue-500/25"
              >
                <Save className="w-4 h-4" />
                保存配置
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIConfigModal
