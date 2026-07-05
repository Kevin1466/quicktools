import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react'

export interface ServiceConfig {
  apiKey: string
  baseUrl: string
}

export interface AIConfig {
  // 火山引擎配置（文本、视觉、图片生成）
  volc: ServiceConfig & {
    modelText: string
    modelVision: string
    modelImage: string
  }
  // 硅基流动配置（OCR）
  silicon: ServiceConfig & {
    modelOcr: string
  }
}

interface AIConfigContextType {
  config: AIConfig
  updateConfig: (config: Partial<AIConfig>) => void
  hasConfig: boolean
  isModalOpen: boolean
  openModal: () => void
  closeModal: () => void
}

const defaultConfig: AIConfig = {
  volc: {
    apiKey: import.meta.env.VITE_VOLC_API_KEY || '',
    baseUrl: import.meta.env.VITE_VOLC_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3',
    modelText: import.meta.env.VITE_VOLC_MODEL_TEXT || 'dove-stone/doubao-seed-2-0-lite-260428',
    modelVision: import.meta.env.VITE_VOLC_MODEL_VISION || 'dove-stone/doubao-seed-1-6-vision-250815',
    modelImage: import.meta.env.VITE_VOLC_MODEL_IMAGE || 'dove-stone/doubao-seedream-5-0-260128',
  },
  silicon: {
    apiKey: import.meta.env.VITE_SILICON_API_KEY || '',
    baseUrl: import.meta.env.VITE_SILICON_BASE_URL || 'https://api.siliconflow.cn/v1',
    modelOcr: import.meta.env.VITE_SILICON_MODEL_OCR || 'PaddlePaddle/PaddleOCR-VL-1.5',
  },
}

const AIConfigContext = createContext<AIConfigContextType | undefined>(undefined)

interface AIConfigProviderProps {
  children: ReactNode
}

export const AIConfigProvider: React.FC<AIConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<AIConfig>(() => {
    const stored = localStorage.getItem('ai_config')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        return {
          volc: { ...defaultConfig.volc, ...(parsed.volc || {}) },
          silicon: { ...defaultConfig.silicon, ...(parsed.silicon || {}) }
        }
      } catch (e) {
        return defaultConfig
      }
    }
    return defaultConfig
  })
  
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('ai_config', JSON.stringify(config))
  }, [config])

  const updateConfig = useCallback((newConfig: Partial<AIConfig>) => {
    setConfig(prev => ({
      volc: { ...prev.volc, ...(newConfig.volc || {}) },
      silicon: { ...prev.silicon, ...(newConfig.silicon || {}) },
    }))
  }, [])

  const hasConfig = !!(
    (config?.volc?.apiKey && config.volc.apiKey.trim()) ||
    (config?.silicon?.apiKey && config.silicon.apiKey.trim())
  )

  const openModal = useCallback(() => setIsModalOpen(true), [])
  const closeModal = useCallback(() => setIsModalOpen(false), [])

  const value: AIConfigContextType = {
    config,
    updateConfig,
    hasConfig,
    isModalOpen,
    openModal,
    closeModal,
  }

  return (
    <AIConfigContext.Provider value={value}>
      {children}
    </AIConfigContext.Provider>
  )
}

export const useAIConfigContext = (): AIConfigContextType => {
  const context = useContext(AIConfigContext)
  if (context === undefined) {
    throw new Error('useAIConfigContext must be used within an AIConfigProvider')
  }
  return context
}

export { AIConfigContext }
