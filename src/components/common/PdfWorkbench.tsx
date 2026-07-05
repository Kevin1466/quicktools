import { useState } from 'react'
import type { Tool } from '@/types'
import ActionButton from '@/components/common/ActionButton'
import FileUploader from '@/components/common/FileUploader'

type PdfToolType = 
  | 'pdf-merge' | 'pdf-split' | 'pdf-compress' | 'pdf-watermark' 
  | 'pdf-to-word' | 'pdf-to-excel' | 'pdf-to-ppt' | 'pdf-to-image'
  | 'pdf-encrypt' | 'pdf-sign' | 'pdf-page-number' | 'pdf-rotate'

const getToolType = (tool: Tool): PdfToolType => {
  const id = tool.id.toLowerCase()
  if (id.includes('merge')) return 'pdf-merge'
  if (id.includes('split')) return 'pdf-split'
  if (id.includes('compress') || id.includes('slim')) return 'pdf-compress'
  if (id.includes('watermark')) return 'pdf-watermark'
  if (id.includes('word') || id.includes('doc')) return 'pdf-to-word'
  if (id.includes('excel')) return 'pdf-to-excel'
  if (id.includes('ppt') || id.includes('powerpoint')) return 'pdf-to-ppt'
  if (id.includes('image') || id.includes('png') || id.includes('jpg')) return 'pdf-to-image'
  if (id.includes('encrypt') || id.includes('protect')) return 'pdf-encrypt'
  if (id.includes('sign')) return 'pdf-sign'
  if (id.includes('page-number')) return 'pdf-page-number'
  if (id.includes('rotate')) return 'pdf-rotate'
  return 'pdf-merge'
}

const PdfWorkbench: React.FC<{ tool: Tool }> = ({ tool }) => {
  const toolType = getToolType(tool)
  
  const [files, setFiles] = useState<File[]>([])
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  
  // PDF 水印/加密相关
  const [watermarkText, setWatermarkText] = useState('')
  const [password, setPassword] = useState('')
  
  // 页面范围相关（拆分、旋转等）
  const [pageRange, setPageRange] = useState('')

  const handleFilesSelect = (files: FileList) => {
    const newFiles = Array.from(files)
    const pdfFiles = newFiles.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))
    if (pdfFiles.length !== newFiles.length) {
      alert('请选择 PDF 文件')
    }
    setFiles(prev => [...prev, ...pdfFiles])
    setResult(null)
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const showUnsupported = async () => {
    if (files.length === 0) {
      alert('请先上传 PDF 文件')
      return
    }

    setResult({
      success: false,
      message:
        '该工具需要真实的 PDF 解析/渲染能力（或服务端处理）。当前版本不提供“模拟处理/虚假下载”。请使用已实现的专用工具页面，或接入后端后再启用。'
    })
  }

  const getToolTitle = () => {
    const titles: Record<PdfToolType, string> = {
      'pdf-merge': 'PDF 合并',
      'pdf-split': 'PDF 拆分',
      'pdf-compress': 'PDF 压缩',
      'pdf-watermark': 'PDF 水印',
      'pdf-to-word': 'PDF 转 Word',
      'pdf-to-excel': 'PDF 转 Excel',
      'pdf-to-ppt': 'PDF 转 PPT',
      'pdf-to-image': 'PDF 转图片',
      'pdf-encrypt': 'PDF 加密',
      'pdf-sign': 'PDF 签名',
      'pdf-page-number': 'PDF 页码',
      'pdf-rotate': 'PDF 旋转'
    }
    return titles[toolType] || 'PDF 工具'
  }

  const getToolDescription = () => {
    const descriptions: Record<PdfToolType, string> = {
      'pdf-merge': '将多个 PDF 文件合并为一个文件',
      'pdf-split': '将 PDF 文件拆分为多个文件',
      'pdf-compress': '压缩 PDF 文件大小，减少存储空间',
      'pdf-watermark': '为 PDF 文件添加水印',
      'pdf-to-word': '将 PDF 文件转换为 Word 文档',
      'pdf-to-excel': '将 PDF 文件转换为 Excel 表格',
      'pdf-to-ppt': '将 PDF 文件转换为 PPT 演示文稿',
      'pdf-to-image': '将 PDF 文件转换为图片',
      'pdf-encrypt': '为 PDF 文件添加密码保护',
      'pdf-sign': '为 PDF 文件添加电子签名',
      'pdf-page-number': '为 PDF 文件添加页码',
      'pdf-rotate': '旋转 PDF 页面方向'
    }
    return descriptions[toolType] || 'PDF 处理工具'
  }

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
        <div className="font-medium text-gray-900 mb-1">{getToolTitle()}</div>
        <div className="text-sm text-gray-600">{getToolDescription()}</div>
      </div>

      <FileUploader
        onFilesSelect={handleFilesSelect}
        accept=".pdf,application/pdf"
        placeholder="点击或拖拽 PDF 文件到此处"
        multiple
      />

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">已选择的文件</div>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <div className="font-medium text-gray-900">{file.name}</div>
                    <div className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  移除
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 特殊功能输入 */}
      {(toolType === 'pdf-watermark' || toolType === 'pdf-encrypt') && (
        <div className="space-y-4">
          {toolType === 'pdf-watermark' && (
            <div className="space-y-2">
              <label className="text-sm text-gray-600">水印文字</label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="请输入水印文字"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3]"
              />
            </div>
          )}
          {toolType === 'pdf-encrypt' && (
            <div className="space-y-2">
              <label className="text-sm text-gray-600">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入 PDF 密码"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3]"
              />
            </div>
          )}
        </div>
      )}

      {(toolType === 'pdf-split' || toolType === 'pdf-rotate') && (
        <div className="space-y-2">
          <label className="text-sm text-gray-600">页面范围（如：1-5,8,11-13）</label>
          <input
            type="text"
            value={pageRange}
            onChange={(e) => setPageRange(e.target.value)}
            placeholder="请输入页面范围"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3]"
          />
        </div>
      )}

      <ActionButton 
        onClick={showUnsupported}
        disabled={files.length === 0}
      >
        查看说明
      </ActionButton>

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

export default PdfWorkbench
