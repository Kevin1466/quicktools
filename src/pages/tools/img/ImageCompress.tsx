import { useRef, useState } from 'react'
import { FileDown, Loader2, Plus, Sparkles, Trash2, Upload, X } from 'lucide-react'
import { useAIConfigContext } from '@/contexts/AIConfigContext'
import { formatFileSize } from '@/utils/fileUtils'
import { compressImage, getImageInfo } from '@/utils/imageUtils'
import { recommendImageCompression } from '@/utils/aiService'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'

interface CompressedImage {
  file: File
  originalSize: string
  originalSizeBytes: number
  compressedSize: string
  compressedSizeBytes: number
  compressedBlob: Blob
  previewUrl: string
  compressedPreviewUrl: string
  width: number
  height: number
  status: 'ready' | 'processing' | 'completed' | 'error' | 'skipped'
  isActuallyCompressed: boolean
  strategyNote: string
}

type CompressMode = 'ai' | 'standard'

const ImageCompress: React.FC = () => {
  const tool = getToolById('image-compress')
  const { config, hasConfig, openModal } = useAIConfigContext()
  const [selectedFiles, setSelectedFiles] = useState<CompressedImage[]>([])
  const [compressMode, setCompressMode] = useState<CompressMode>('ai')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      return
    }

    setError('')
    const imageInfo = await getImageInfo(file)
    const previewUrl = URL.createObjectURL(file)

    const newImage: CompressedImage = {
      file,
      originalSize: imageInfo.formattedSize,
      originalSizeBytes: file.size,
      compressedSize: '',
      compressedSizeBytes: 0,
      compressedBlob: new Blob(),
      previewUrl,
      compressedPreviewUrl: '',
      width: imageInfo.width,
      height: imageInfo.height,
      status: 'ready',
      isActuallyCompressed: false,
      strategyNote: '',
    }

    setSelectedFiles(prev => [...prev, newImage])
  }

  const handleFilesSelect = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      await handleFileSelect(files[i])
    }
  }

  const compressSingleImage = async (item: CompressedImage): Promise<CompressedImage> => {
    try {
      let quality = 0.8
      let maxWidth = item.width
      let maxHeight = item.height
      let strategyNote = '使用标准压缩策略'

      if (compressMode === 'ai') {
        const recommendation = await recommendImageCompression(
          {
            fileName: item.file.name,
            type: item.file.type,
            sizeBytes: item.originalSizeBytes,
            width: item.width,
            height: item.height,
          },
          config
        )
        quality = recommendation.quality
        maxWidth = recommendation.maxWidth ?? item.width
        maxHeight = recommendation.maxHeight ?? item.height
        strategyNote = recommendation.reason
      }

      const result = await compressImage(item.file, quality, maxWidth, maxHeight)
      
      const isActuallyCompressed = result.size < item.originalSizeBytes
      
      if (isActuallyCompressed) {
        const compressedPreviewUrl = URL.createObjectURL(result)
        return {
          ...item,
          compressedBlob: result,
          compressedSize: formatFileSize(result.size),
          compressedSizeBytes: result.size,
          compressedPreviewUrl,
          status: 'completed',
          isActuallyCompressed: true,
          strategyNote,
        }
      } else {
        return {
          ...item,
          compressedBlob: result,
          compressedSize: formatFileSize(result.size),
          compressedSizeBytes: result.size,
          status: 'skipped',
          isActuallyCompressed: false,
          strategyNote,
        }
      }
    } catch (err) {
      return {
        ...item,
        status: 'error',
        isActuallyCompressed: false,
        strategyNote: (err as Error).message || '处理失败',
      }
    }
  }

  const handleCompress = async () => {
    if (selectedFiles.length === 0) return
    if (compressMode === 'ai' && !hasConfig) {
      openModal()
      return
    }
    
    setIsProcessing(true)
    setError('')
    
    setSelectedFiles(prev => prev.map(item => ({ ...item, status: 'processing' })))
    
    try {
      const updatedFiles = [...selectedFiles]
      
      for (let i = 0; i < updatedFiles.length; i++) {
        const result = await compressSingleImage(updatedFiles[i])
        updatedFiles[i] = result
        
        setSelectedFiles([...updatedFiles])
      }
    } catch (error) {
      console.error('Compression error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = (item: CompressedImage) => {
    if (!item.isActuallyCompressed) return
    if (!item.compressedBlob || item.compressedBlob.size === 0) return
    
    const url = URL.createObjectURL(item.compressedBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `compressed_${item.file.name}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleDownloadAll = () => {
    const compressedFiles = selectedFiles.filter(f => f.status === 'completed' && f.isActuallyCompressed)
    compressedFiles.forEach(item => handleDownload(item))
  }

  const handleRemoveFile = (index: number) => {
    const item = selectedFiles[index]
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
    if (item.compressedPreviewUrl) URL.revokeObjectURL(item.compressedPreviewUrl)
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleReset = () => {
    selectedFiles.forEach(item => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
      if (item.compressedPreviewUrl) URL.revokeObjectURL(item.compressedPreviewUrl)
    })
    setSelectedFiles([])
    setError('')
  }

  const hasCompleted = selectedFiles.some(f => f.status === 'completed' && f.isActuallyCompressed)
  const allProcessed = selectedFiles.every(f => ['completed', 'skipped', 'error'].includes(f.status))

  const getStatusLabel = (status: string, isActuallyCompressed: boolean) => {
    if (status === 'skipped') return '无需压缩'
    switch (status) {
      case 'ready': return '待处理'
      case 'processing': return '处理中'
      case 'completed': return '已完成'
      case 'error': return '失败'
      default: return '待处理'
    }
  }

  const getStatusColor = (status: string, isActuallyCompressed: boolean) => {
    if (status === 'skipped') return 'bg-gray-400'
    switch (status) {
      case 'ready': return 'bg-blue-500'
      case 'processing': return 'bg-yellow-500'
      case 'completed': return isActuallyCompressed ? 'bg-green-500' : 'bg-gray-400'
      case 'error': return 'bg-red-500'
      default: return 'bg-blue-500'
    }
  }

  if (!tool) {
    return <div className="p-8 text-center">工具不存在</div>
  }

  return (
    <ToolPageTemplate tool={tool}>
      {selectedFiles.length === 0 ? (
        <div className="space-y-6">
          <div className="relative">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-[8px] border border-dashed border-[#c0ccda] bg-[#fafafa] py-20 text-center cursor-pointer hover:border-[#3b6de3] transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && handleFilesSelect(e.target.files)}
                className="hidden"
              />
              <div className="mx-auto flex w-32 h-10 items-center justify-center bg-[#3b6de3] text-white rounded cursor-pointer hover:bg-[#2a52c2] transition font-medium text-sm">
                点击上传文件
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => setCompressMode('ai')}
              className={`rounded px-4 py-2 text-sm transition border ${
                compressMode === 'ai'
                  ? 'border-[#3b6de3] text-[#3b6de3] bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-[#3b6de3]'
              }`}
            >
              AI 智能压缩
            </button>
            <button
              type="button"
              onClick={() => setCompressMode('standard')}
              className={`rounded px-4 py-2 text-sm transition border ${
                compressMode === 'standard'
                  ? 'border-[#3b6de3] text-[#3b6de3] bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-[#3b6de3]'
              }`}
            >
              标准压缩
            </button>
            {compressMode === 'ai' && !hasConfig ? (
              <button
                type="button"
                onClick={openModal}
                className="rounded border border-[#c9d8ff] px-4 py-2 text-sm text-[#3b6de3] hover:bg-[#eef4ff]"
              >
                配置 AI
              </button>
            ) : null}
          </div>

          {error ? (
            <div className="rounded border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 text-center">
              {error}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded border border-gray-200">
            {selectedFiles.map((item, index) => (
              <div 
                key={index}
                className="flex items-center px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="truncate text-sm text-gray-900">{item.file.name}</div>
                  {item.strategyNote && compressMode === 'ai' && (
                    <div className="text-xs text-blue-500 mt-0.5 truncate" title={item.strategyNote}>{item.strategyNote}</div>
                  )}
                </div>
                <div className="w-20 text-sm text-gray-500 shrink-0">{item.originalSize}</div>
                
                {['ready', 'processing', 'error'].includes(item.status) && (
                  <div className={`w-24 text-sm shrink-0 ${item.status === 'error' ? 'text-red-500' : 'text-gray-400'}`}>
                    {item.status === 'ready' && 'ready'}
                    {item.status === 'processing' && 'processing...'}
                    {item.status === 'error' && 'error'}
                  </div>
                )}
                
                {item.status === 'skipped' && (
                  <div className="w-48 text-sm text-gray-400 shrink-0">无需压缩</div>
                )}
                
                {(item.status === 'completed' && item.isActuallyCompressed) && (
                  <>
                    <div className="w-12 text-gray-400 shrink-0">-&gt;</div>
                    <div className="w-20 text-sm text-gray-900 shrink-0">{item.compressedSize}</div>
                    <div className="w-16 text-sm text-[#55adf0] font-medium shrink-0">
                      {Math.round((1 - item.compressedSizeBytes / item.originalSizeBytes) * 100)}%
                    </div>
                    <div className="w-10 flex justify-end shrink-0">
                      <button
                        onClick={() => handleDownload(item)}
                        className="text-[#55adf0] hover:opacity-80 transition"
                        title="下载"
                      >
                        <FileDown size={24} />
                      </button>
                    </div>
                  </>
                )}
                
                <div className="w-10 flex justify-end shrink-0">
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="text-gray-400 hover:text-red-500 transition"
                    title="移除"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-1 cursor-pointer text-[#3b6de3] text-sm hover:opacity-80 transition">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFilesSelect(e.target.files)}
              />
              <Plus size={16} />
              <span>添加图片</span>
            </label>
            
            <button
              onClick={handleReset}
              className="ml-6 px-4 py-1.5 rounded border border-[#3b6de3] text-[#3b6de3] hover:bg-blue-50 transition text-sm"
            >
              清空任务
            </button>
            <button
              onClick={handleCompress}
              disabled={isProcessing || allProcessed}
              className="ml-3 px-4 py-1.5 rounded bg-[#3b6de3] text-white hover:bg-[#2a52c2] transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? '压缩中...' : '开始压缩'}
            </button>

            <div className="ml-auto flex items-center gap-4">
              {hasCompleted && (
                <button
                  onClick={handleDownloadAll}
                  className="text-sm text-[#3b6de3] hover:underline"
                >
                  下载全部
                </button>
              )}
              <div className="flex items-center gap-2 text-sm border-l pl-4 border-gray-200">
                <span className="text-gray-500">模式:</span>
                <select
                  value={compressMode}
                  onChange={(e) => setCompressMode(e.target.value as CompressMode)}
                  className="outline-none text-gray-700 bg-transparent cursor-pointer"
                  disabled={isProcessing}
                >
                  <option value="ai">AI 智能</option>
                  <option value="standard">本地标准</option>
                </select>
              </div>
            </div>
          </div>

          {error ? (
            <div className="rounded border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}
        </div>
      )}
    </ToolPageTemplate>
  )
}

export default ImageCompress
