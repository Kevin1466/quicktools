import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { useAIConfigContext } from '@/contexts/AIConfigContext'
import { extractTableData } from '@/utils/aiService'

const TableRecognize: React.FC = () => {
  const tool = getToolById('table-recognize')
  const { config, hasConfig, openModal } = useAIConfigContext()
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [tableData, setTableData] = useState<string[][] | null>(null)
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
    setTableData(null)
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

      const result = await extractTableData(base64Str, config)
      if (!result || result.length === 0) {
        throw new Error('未能从图片中提取到有效的表格数据')
      }
      setTableData(result)
    } catch (err) {
      console.error(err)
      setError((err as Error).message || '提取失败，请重试')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadExcel = () => {
    if (!tableData || tableData.length === 0) return
    
    const worksheet = XLSX.utils.aoa_to_sheet(tableData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    
    const originalName = selectedFile?.name.replace(/\.[^/.]+$/, '') || 'table'
    XLSX.writeFile(workbook, `${originalName}_recognized.xlsx`)
  }

  const handleReset = () => {
    setSelectedFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl('')
    setTableData(null)
    setError('')
  }

  if (!tool) return null

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="flex items-center justify-end gap-4 mb-4">
          {!hasConfig && (
            <button onClick={openModal} className="text-sm text-[#3b6de3] hover:underline">
              配置 API 以使用 AI 识别能力
            </button>
          )}
        </div>

        {!selectedFile ? (
          <div className="max-w-2xl mx-auto space-y-4">
            <FileUploader
              onFileSelect={handleFileSelect}
              accept="image/*"
              placeholder="将表格图片拖拽到此处"
              primaryActionText="点击上传图片"
            />
            {error && <div className="text-sm text-red-600 text-center">{error}</div>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="text-sm font-medium text-gray-700">原始图片</div>
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center min-h-[300px]">
                <img src={previewUrl} alt="Preview" className="max-w-full max-h-[500px] object-contain" />
              </div>
              <div className="flex gap-3">
                <ActionButton onClick={handleProcess} loading={isProcessing} disabled={isProcessing || !!tableData}>
                  {tableData ? '识别完成' : '开始提取表格'}
                </ActionButton>
                <ActionButton variant="secondary" onClick={handleReset} disabled={isProcessing}>
                  重新上传
                </ActionButton>
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">识别结果预览</div>
                {tableData && (
                  <button
                    onClick={handleDownloadExcel}
                    className="text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                  >
                    导出为 Excel
                  </button>
                )}
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-auto bg-white h-[300px] md:h-[500px]">
                {!tableData ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    {isProcessing ? '正在利用 AI 分析表格结构...' : '等待识别...'}
                  </div>
                ) : (
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <tbody className="divide-y divide-gray-200">
                      {tableData.map((row, i) => (
                        <tr key={i} className="divide-x divide-gray-200">
                          {row.map((cell, j) => (
                            <td key={j} className="px-4 py-2 border-b border-gray-200 text-gray-700">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default TableRecognize
