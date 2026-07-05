import { useRef, useState, useMemo } from 'react'
import { FileDown, Loader2, Plus, Trash2, X } from 'lucide-react'
import { formatFileSize, getFileNameWithoutExtension, downloadFile } from '@/utils/fileUtils'
import { convertImageFormat, getImageInfo } from '@/utils/imageUtils'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'

type Target = 'image/png' | 'image/jpeg' | 'image/webp'

const label: Record<Target, string> = {
  'image/png': 'PNG',
  'image/jpeg': 'JPG',
  'image/webp': 'WEBP',
}

interface ConvertedImage {
  file: File
  originalSize: string
  originalSizeBytes: number
  convertedSize: string
  convertedSizeBytes: number
  convertedBlob: Blob | null
  status: 'ready' | 'processing' | 'completed' | 'error'
  targetExt: string
}

const ImgConvert: React.FC = () => {
  const tool = getToolById('imgconvert')
  const [selectedFiles, setSelectedFiles] = useState<ConvertedImage[]>([])
  const [target, setTarget] = useState<Target>('image/jpeg')
  const [quality, setQuality] = useState(0.9)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!tool) return null

  const targetExt = useMemo(() => {
    if (target === 'image/png') return 'png'
    if (target === 'image/jpeg') return 'jpg'
    return 'webp'
  }, [target])

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件')
      return
    }

    setError('')
    const imageInfo = await getImageInfo(file)

    const newImage: ConvertedImage = {
      file,
      originalSize: imageInfo.formattedSize,
      originalSizeBytes: file.size,
      convertedSize: '',
      convertedSizeBytes: 0,
      convertedBlob: null,
      status: 'ready',
      targetExt: '',
    }

    setSelectedFiles(prev => [...prev, newImage])
  }

  const handleFilesSelect = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      await handleFileSelect(files[i])
    }
  }

  const convertSingleImage = async (item: ConvertedImage): Promise<ConvertedImage> => {
    try {
      const blob = await convertImageFormat(item.file, target, quality)
      return {
        ...item,
        convertedBlob: blob,
        convertedSize: formatFileSize(blob.size),
        convertedSizeBytes: blob.size,
        status: 'completed',
        targetExt: targetExt,
      }
    } catch (e) {
      return { ...item, status: 'error' }
    }
  }

  const handleConvert = async () => {
    if (selectedFiles.length === 0) return

    setIsProcessing(true)
    setError('')

    const updatedFiles = [...selectedFiles]
    for (let i = 0; i < updatedFiles.length; i++) {
      if (updatedFiles[i].status === 'completed' && updatedFiles[i].targetExt === targetExt) {
        continue
      }
      
      setSelectedFiles(prev => {
        const next = [...prev]
        next[i] = { ...next[i], status: 'processing' }
        return next
      })

      const result = await convertSingleImage(updatedFiles[i])
      
      setSelectedFiles(prev => {
        const next = [...prev]
        next[i] = result
        return next
      })
    }

    setIsProcessing(false)
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleReset = () => {
    setSelectedFiles([])
    setError('')
  }

  const handleDownload = (item: ConvertedImage) => {
    if (!item.convertedBlob) return
    const name = `${getFileNameWithoutExtension(item.file.name)}.${item.targetExt}`
    downloadFile(item.convertedBlob, name)
  }

  const handleDownloadAll = () => {
    selectedFiles.forEach(item => {
      if (item.status === 'completed' && item.convertedBlob) {
        handleDownload(item)
      }
    })
  }

  const hasCompleted = selectedFiles.some(f => f.status === 'completed')
  const allProcessed = selectedFiles.length > 0 && selectedFiles.every(f => f.status === 'completed' && f.targetExt === targetExt)

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
            {Object.keys(label).map(k => (
              <button
                key={k}
                type="button"
                onClick={() => setTarget(k as Target)}
                className={`rounded px-4 py-2 text-sm transition border ${
                  target === k
                    ? 'border-[#3b6de3] text-[#3b6de3] bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-[#3b6de3]'
                }`}
              >
                转为 {label[k as Target]}
              </button>
            ))}
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
                </div>
                <div className="w-20 text-sm text-gray-500 shrink-0">{item.originalSize}</div>
                
                {['ready', 'processing', 'error'].includes(item.status) && (
                  <div className={`w-24 text-sm shrink-0 ${item.status === 'error' ? 'text-red-500' : 'text-gray-400'}`}>
                    {item.status === 'ready' && 'ready'}
                    {item.status === 'processing' && 'processing...'}
                    {item.status === 'error' && 'error'}
                  </div>
                )}
                
                {item.status === 'completed' && (
                  <>
                    <div className="w-12 text-gray-400 shrink-0">-&gt;</div>
                    <div className="w-16 text-sm text-gray-900 shrink-0 uppercase">{item.targetExt}</div>
                    <div className="w-20 text-sm text-[#55adf0] font-medium shrink-0">
                      {item.convertedSize}
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
              onClick={handleConvert}
              disabled={isProcessing || allProcessed}
              className="ml-3 px-4 py-1.5 rounded bg-[#3b6de3] text-white hover:bg-[#2a52c2] transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? '转换中...' : '开始转换'}
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
                <span className="text-gray-500">目标格式:</span>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value as Target)}
                  className="outline-none text-gray-700 bg-transparent cursor-pointer font-medium"
                  disabled={isProcessing}
                >
                  {Object.keys(label).map(k => (
                    <option key={k} value={k}>
                      {label[k as Target]}
                    </option>
                  ))}
                </select>
              </div>
              {(target === 'image/jpeg' || target === 'image/webp') && (
                <div className="flex items-center gap-2 text-sm border-l pl-4 border-gray-200">
                  <span className="text-gray-500">质量:</span>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="outline-none text-gray-700 bg-transparent cursor-pointer font-medium"
                    disabled={isProcessing}
                  >
                    <option value={1}>100%</option>
                    <option value={0.9}>90%</option>
                    <option value={0.8}>80%</option>
                    <option value={0.6}>60%</option>
                  </select>
                </div>
              )}
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

export default ImgConvert
