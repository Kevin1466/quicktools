import { useState, useMemo } from 'react'
import type { Tool } from '@/types'
import ActionButton from '@/components/common/ActionButton'
import FileUploader from '@/components/common/FileUploader'

type DocToolType = 'word2pdf' | 'excel2pdf' | 'ppt2pdf' | 'wordconvert' | 'excelconvert' | 'docslim'

const getToolType = (tool: Tool): DocToolType => {
  const id = tool.id.toLowerCase()
  if (id.includes('word') && id.includes('pdf')) return 'word2pdf'
  if (id.includes('excel') && id.includes('pdf')) return 'excel2pdf'
  if (id.includes('ppt') && id.includes('pdf')) return 'ppt2pdf'
  if (id.includes('word') && id.includes('convert')) return 'wordconvert'
  if (id.includes('excel') && id.includes('convert')) return 'excelconvert'
  if (id.includes('slim') || id.includes('瘦身')) return 'docslim'
  return 'word2pdf'
}

const DocWorkbench: React.FC<{ tool: Tool }> = ({ tool }) => {
  const toolType = useMemo(() => getToolType(tool), [tool])
  
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const getAcceptType = () => {
    switch (toolType) {
      case 'word2pdf':
      case 'wordconvert':
        return '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      case 'excel2pdf':
      case 'excelconvert':
        return '.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      case 'ppt2pdf':
        return '.ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation'
      default:
        return '*/*'
    }
  }

  const getToolDescription = () => {
    switch (toolType) {
      case 'word2pdf': return '将 Word 文档转换为 PDF 格式，保持排版和格式'
      case 'excel2pdf': return '将 Excel 表格转换为 PDF 格式，保留数据和样式'
      case 'ppt2pdf': return '将 PowerPoint 演示文稿转换为 PDF 格式'
      case 'wordconvert': return '将 Word 文档转换为图片或 HTML 格式'
      case 'excelconvert': return '将 Excel 表格转换为图片或 HTML 格式'
      case 'docslim': return '压缩文档中的图片，减小文件大小'
      default: return '文档转换工具'
    }
  }

  const showUnsupported = () => {
    if (!file) return
    setResult({
      success: false,
      message: '该类文档转换通常需要服务端渲染/排版能力。当前版本不提供“模拟转换/虚假下载”。请使用对应工具的已实现页面，或接入后端后再启用。'
    })
  }

  const handleFileSelect = (f: File) => {
    setFile(f)
    setResult(null)
  }

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
        <div className="text-sm text-gray-600">{getToolDescription()}</div>
      </div>

      <FileUploader
        onFileSelect={handleFileSelect}
        accept={getAcceptType()}
        placeholder={`点击或拖拽文件到此处${toolType.includes('pdf') ? '（支持 Word/Excel/PPT）' : ''}`}
      />

      {file && (
        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">{file.name}</div>
              <div className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
            </div>
            <ActionButton
              onClick={showUnsupported}
            >
              查看说明
            </ActionButton>
          </div>
        </div>
      )}

      {result && (
        <div className={`p-4 rounded-xl border ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-center gap-3">
            <span className={`text-2xl ${result.success ? 'text-green-600' : 'text-red-600'}`}>
              {result.success ? '✓' : '✗'}
            </span>
            <div>
              <div className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.message}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocWorkbench
