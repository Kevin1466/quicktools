import { useState } from 'react'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { useAIConfigContext } from '@/contexts/AIConfigContext'
import { performOCR } from '@/utils/aiService'

const WordScan: React.FC = () => {
  const tool = getToolById('word-scan')
  const { config, hasConfig, openModal } = useAIConfigContext()
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [scannedText, setScannedText] = useState<string>('')
  const [error, setError] = useState('')

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请选择有效的图片文件')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('图片大小不能超过10MB')
      return
    }
    
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setScannedText('')
    setError('')
  }

  const handleProcess = async () => {
    if (!selectedFile) return
    if (!hasConfig) {
      openModal()
      return
    }

    setIsProcessing(true)
    setError('')
    
    try {
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
      })
      reader.readAsDataURL(selectedFile)
      const base64Str = await base64Promise

      const result = await performOCR(base64Str, config)
      if (!result) {
        throw new Error('未能从图片中提取到文字')
      }
      setScannedText(result)
    } catch (err) {
      console.error(err)
      setError((err as Error).message || '扫描失败，请重试')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadWord = () => {
    if (!scannedText) return
    
    // Create a simple HTML-based doc format
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'></head>
      <body>
        ${scannedText.split('\\n').map(line => '<p>' + line + '</p>').join('')}
      </body>
      </html>
    `
    const blob = new Blob([content], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    const originalName = selectedFile?.name.replace(/\.[^/.]+$/, '') || 'scanned_document'
    link.download = originalName + '.doc'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setSelectedFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl('')
    setScannedText('')
    setError('')
  }

  if (!tool) return null

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="flex items-center justify-end gap-4 mb-4">
          {!hasConfig && (
            <button onClick={openModal} className="text-sm text-[#3b6de3] hover:underline">
              配置 API 以使用 AI 文档扫描
            </button>
          )}
        </div>

        {!selectedFile ? (
          <div className="max-w-2xl mx-auto space-y-4">
            <FileUploader
              onFileSelect={handleFileSelect}
              accept="image/*"
              placeholder="将文档图片拖拽到此处"
              primaryActionText="点击上传文档图片"
            />
            {error && <div className="text-sm text-red-600 text-center">{error}</div>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="text-sm font-medium text-gray-700">原始文档图片</div>
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center min-h-[300px]">
                <img src={previewUrl} alt="Preview" className="max-w-full max-h-[500px] object-contain" />
              </div>
              <div className="flex gap-3">
                <ActionButton onClick={handleProcess} loading={isProcessing} disabled={isProcessing || !!scannedText}>
                  {scannedText ? '扫描完成' : '开始扫描文档'}
                </ActionButton>
                <ActionButton variant="secondary" onClick={handleReset} disabled={isProcessing}>
                  重新上传
                </ActionButton>
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">扫描结果</div>
                {scannedText && (
                  <button
                    onClick={handleDownloadWord}
                    className="text-sm px-3 py-1 bg-[#3b6de3] text-white rounded hover:bg-[#2a52c2] transition"
                  >
                    导出为 Word
                  </button>
                )}
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                <textarea
                  className="w-full h-[300px] md:h-[500px] p-4 resize-none focus:outline-none focus:ring-1 focus:ring-[#3b6de3]"
                  value={scannedText}
                  onChange={(e) => setScannedText(e.target.value)}
                  readOnly={!scannedText}
                  placeholder={isProcessing ? '正在利用 AI 扫描文档...' : '扫描结果将显示在这里，您可以进行二次编辑。'}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default WordScan
