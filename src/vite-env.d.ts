/// <reference types="vite/client" />

interface ImportMetaEnv {
  // 火山引擎配置
  readonly VITE_VOLC_API_KEY?: string
  readonly VITE_VOLC_BASE_URL?: string
  readonly VITE_VOLC_MODEL_TEXT?: string
  readonly VITE_VOLC_MODEL_VISION?: string
  readonly VITE_VOLC_MODEL_IMAGE?: string
  // 硅基流动配置
  readonly VITE_SILICON_API_KEY?: string
  readonly VITE_SILICON_BASE_URL?: string
  readonly VITE_SILICON_MODEL_OCR?: string
  // 通用配置
  readonly VITE_GA_ID?: string
  // Umami 统计
  readonly VITE_UMAMI_SRC?: string
  readonly VITE_UMAMI_WEBSITE_ID?: string
  readonly VITE_UMAMI_ENABLED?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
