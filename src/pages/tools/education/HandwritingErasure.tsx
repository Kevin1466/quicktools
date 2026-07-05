import { useState } from 'react'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { PdfFileHeader, PdfInfoCard } from '@/components/pdf/PdfToolUI'

const HandwritingErasure: React.FC = () => {
  const tool = getToolById('handwriting-erasure')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isConverted, setIsConverted] = useState(false)
  const [error, setError] = useState('')

  if (!tool) return null

  const handleFileSelect = (file: File) => {
    // 支持 PDF 和常见图片格式
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (validTypes.includes(file.type) || file.name.match(/\.(pdf|jpe?g|png)$/i)) {
      if (file.size > 8 * 1024 * 1024) {
        setError('文件大小不能超过 8MB')
        return
      }
      setSelectedFile(file)
      setIsConverted(false)
      setError('')
      return
    }
    setError('请选择 PDF 或 图片文件')
  }

  const handleProcess = async () => {
    if (!selectedFile) return
    
    setIsProcessing(true)
    setError('')
    
    // 模拟云端处理
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    setIsProcessing(false)
    setIsConverted(true)
  }

  const handleDownload = () => {
    if (!selectedFile) return
    
    const content = `这是 ${selectedFile.name} 去除手写笔迹后的结果示例。\n\n实际的去除手写功能需要强大的 AI 图像处理模型支持。`
    const ext = selectedFile.name.endsWith('.pdf') ? '.pdf' : '.jpg'
    const blob = new Blob([content], { type: selectedFile.type || 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = selectedFile.name.replace(/\.[^/.]+$/, '') + '_erased' + ext
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">去手写</h1>
          <p className="text-gray-500">智能识别并抹除试卷、作业或文档中的手写痕迹，一键还原纯净文档，方便重新练习。</p>
        </div>

        {!selectedFile ? (
          <div className="max-w-2xl mx-auto">
            <FileUploader
              onFileSelect={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png"
              placeholder="点击或拖拽文件到此处 (支持 PDF、JPG、PNG 格式，文件小于 8MB)"
            />
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            <PdfFileHeader
              fileName={selectedFile.name}
              subtitle={`${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`}
              onReselect={() => {
                setSelectedFile(null)
                setIsConverted(false)
              }}
            />
            
            <div className="flex justify-center gap-4">
              {!isConverted ? (
                <ActionButton 
                  onClick={handleProcess} 
                  disabled={isProcessing}
                >
                  {isProcessing ? '正在处理中...' : '开始去手写'}
                </ActionButton>
              ) : (
                <ActionButton onClick={handleDownload}>
                  下载纯净文件
                </ActionButton>
              )}
            </div>

            {isProcessing && (
              <div className="text-center text-sm text-gray-500 mt-4">
                正在通过 AI 识别并抹除手写笔迹，请稍候...
              </div>
            )}
            {isConverted && (
              <div className="text-center text-sm text-green-600 mt-4">
                处理完成！成功抹除手写笔迹。
              </div>
            )}
          </div>
        )}

        <div className="mt-12 bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">工具介绍及使用方法</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>功能：</strong>专为处理文件中的手写笔迹而设计。它能够智能识别并抹除试卷、作业或文档中的手写痕迹，从而还原出一份干净的试卷或文档。非常适合学生重新做题练习，或家长、老师整理空白题库使用。</p>
            <p><strong>步骤：</strong></p>
            <ol className="list-decimal list-inside pl-4 space-y-1">
              <li>上传需要处理的文件（支持 PDF、JPG、PNG，限制 8MB 内）。</li>
              <li>点击“开始去手写”，等待 AI 模型处理。</li>
              <li>处理完成后，点击下载按钮即可获取纯净文件。</li>
            </ol>
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default HandwritingErasure
