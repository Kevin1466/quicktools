type RecognizeOptions = {
  lang?: string
  onProgress?: (progress: number) => void
}

let workerPromise: Promise<any> | null = null
let currentLang: string | null = null
let progressHandler: ((progress: number) => void) | null = null

const getWorker = async () => {
  if (workerPromise) return workerPromise
  workerPromise = (async () => {
    const mod = await import('tesseract.js')
    const createWorker = (mod as any).createWorker as (opts?: any) => Promise<any> | any
    const worker = await createWorker({
      logger: (m: any) => {
        const p = typeof m?.progress === 'number' ? m.progress : null
        if (p !== null && progressHandler) progressHandler(p)
      },
    })
    if (typeof worker.load === 'function') await worker.load()
    return worker
  })()
  return workerPromise
}

const ensureLanguage = async (worker: any, lang: string) => {
  if (currentLang === lang) return
  if (typeof worker.loadLanguage === 'function') await worker.loadLanguage(lang)
  if (typeof worker.initialize === 'function') await worker.initialize(lang)
  else if (typeof worker.reinitialize === 'function') await worker.reinitialize(lang)
  currentLang = lang
}

export const ocrUtils = {
  recognizeText: async (imageFile: File, options?: RecognizeOptions): Promise<string> => {
    const lang = options?.lang || 'chi_sim'
    const worker = await getWorker()
    progressHandler = options?.onProgress || null
    try {
      await ensureLanguage(worker, lang)
      const result = await worker.recognize(imageFile)
      return result?.data?.text || ''
    } finally {
      progressHandler = null
    }
  },

  recognizeIdCard: async (imageFile: File): Promise<{
    name?: string
    idNumber?: string
    birthDate?: string
    gender?: string
    ethnicity?: string
    address?: string
    issuingAuthority?: string
    validPeriod?: string
  }> => {
    console.warn('ID card OCR requires specific OCR model or API')
    return {}
  },

  recognizeBankCard: async (imageFile: File): Promise<{
    cardNumber?: string
    bankName?: string
    cardType?: string
    validFrom?: string
    validUntil?: string
  }> => {
    console.warn('Bank card OCR requires specific OCR model or API')
    return {}
  },

  recognizeBusinessCard: async (imageFile: File): Promise<{
    name?: string
    company?: string
    position?: string
    phone?: string
    email?: string
    website?: string
    address?: string
  }> => {
    console.warn('Business card OCR requires specific OCR model or API')
    return {}
  },

  recognizeReceipt: async (imageFile: File): Promise<{
    merchantName?: string
    date?: string
    totalAmount?: string
    items?: Array<{
      name: string
      price: string
      quantity: string
    }>
    paymentMethod?: string
  }> => {
    console.warn('Receipt OCR requires specific OCR model or API')
    return {}
  },

  enhanceImage: async (imageFile: File): Promise<Blob> => {
    return imageFile
  }
}

export default ocrUtils
