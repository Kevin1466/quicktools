import { useEffect, useMemo, useState } from 'react'
import type { Tool } from '@/types'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { useAIConfigContext } from '@/contexts/AIConfigContext'
import { downloadFile, formatFileSize, readFileAsDataURL } from '@/utils/fileUtils'
import { performStructuredOCR } from '@/utils/aiService'

interface StructuredField {
  key: string
  label: string
  description: string
}

interface StructuredOcrPageProps {
  tool: Tool
  documentName: string
  hintText: string
  fields: StructuredField[]
  extraPrompt?: string
}

const StructuredOcrPage: React.FC<StructuredOcrPageProps> = ({
  tool,
  documentName,
  hintText,
  fields,
  extraPrompt,
}) => {
  const { config, openModal } = useAIConfigContext()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [result, setResult] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const hasOcrConfig = useMemo(
    () => !!(config.silicon.apiKey && config.silicon.apiKey.trim()),
    [config.silicon.apiKey]
  )

  const hasResult = useMemo(
    () => fields.some(field => (result[field.key] || '').trim()),
    [fields, result]
  )

  const currentStep = useMemo(() => {
    if (hasResult) return 3
    if (file) return 2
    return 1
  }, [file, hasResult])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const onFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) return
    setFile(selectedFile)
    setResult({})
    setError('')
    setCopied(false)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(selectedFile))
  }

  const extract = async () => {
    if (!file) return
    if (!hasOcrConfig) {
      openModal()
      return
    }

    setBusy(true)
    setError('')
    setCopied(false)

    try {
      const dataUrl = await readFileAsDataURL(file)
      const extracted = await performStructuredOCR(dataUrl, config, {
        documentName,
        fields,
        extraPrompt,
      })
      setResult(extracted)

      if (!fields.some(field => extracted[field.key]?.trim())) {
        setError(`未识别到有效的${documentName}字段，请尝试更清晰、角度更正的图片`)
      }
    } catch (err) {
      setError((err as Error).message || `${documentName}提取失败`)
    } finally {
      setBusy(false)
    }
  }

  const copy = async () => {
    if (!hasResult) return
    const content = fields
      .map(field => `${field.label}：${result[field.key] || ''}`)
      .join('\n')
    await navigator.clipboard.writeText(content)
    setCopied(true)
  }

  const download = () => {
    if (!hasResult || !file) return
    const structured = fields.reduce<Record<string, string>>((acc, field) => {
      acc[field.label] = result[field.key] || ''
      return acc
    }, {})
    const blob = new Blob([JSON.stringify(structured, null, 2)], {
      type: 'application/json;charset=utf-8',
    })
    downloadFile(blob, `${file.name.replace(/\.[^.]+$/, '')}_${tool.id}.json`)
  }

  const reselect = () => {
    setFile(null)
    setResult({})
    setError('')
    setCopied(false)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
  }

  return (
    <ToolPageTemplate tool={tool}>
      {!file ? (
        <div className="space-y-6">
          <div className="relative">
            <div
              className="rounded-[8px] border border-dashed border-[#c0ccda] bg-[#fafafa] py-20 text-center cursor-pointer hover:border-[#3b6de3] transition-all"
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && onFileSelect(e.target.files[0])}
                className="hidden"
                id="structured-ocr-upload"
              />
              <label htmlFor="structured-ocr-upload" className="mx-auto flex w-32 h-10 items-center justify-center bg-[#3b6de3] text-white rounded cursor-pointer hover:bg-[#2a52c2] transition font-medium text-sm">
                选择文件
              </label>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {!hasOcrConfig ? (
              <button
                type="button"
                onClick={openModal}
                className="rounded border border-[#c9d8ff] px-4 py-2 text-sm text-[#3b6de3] hover:bg-[#eef4ff]"
              >
                配置 OCR
              </button>
            ) : null}
            <div className="text-sm text-gray-500 flex items-center">
              {hintText}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left side: Image Preview */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center justify-between mb-3 h-8">
                <div className="text-sm font-medium text-gray-900 truncate pr-4">{file.name}</div>
                <div className="text-sm text-gray-500 shrink-0">{formatFileSize(file.size)}</div>
              </div>
              <div className="flex-1 min-h-[400px] border border-gray-200 bg-[#f6f7fb] rounded flex items-center justify-center p-4">
                {previewUrl && (
                  <img src={previewUrl} alt="preview" className="max-w-full max-h-[500px] object-contain" />
                )}
              </div>
            </div>

            {/* Right side: Structured Result */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center justify-end mb-3 h-8 gap-3">
                <button
                  onClick={copy}
                  disabled={!hasResult || busy}
                  className="text-sm text-[#3b6de3] hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                >
                  {copied ? '已复制' : '复制结果'}
                </button>
                <div className="w-px h-4 bg-gray-200"></div>
                <button
                  onClick={download}
                  disabled={!hasResult || busy}
                  className="text-sm text-[#3b6de3] hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                >
                  下载 JSON
                </button>
              </div>
              <div className="flex-1 min-h-[400px] border border-gray-200 bg-[#f8fafc] rounded overflow-auto p-4">
                <div className="space-y-3">
                  {fields.map(field => (
                    <div key={field.key} className="rounded border border-gray-200 bg-white px-4 py-3 shadow-sm">
                      <div className="text-xs text-gray-500">{field.label}</div>
                      <div className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-gray-900">
                        {result[field.key] || <span className="text-gray-400">待提取...</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={reselect}
              className="px-6 py-2 rounded border border-[#3b6de3] text-[#3b6de3] hover:bg-blue-50 transition text-sm"
              disabled={busy}
            >
              重新选择
            </button>
            <button
              onClick={extract}
              disabled={busy}
              className="px-6 py-2 rounded bg-[#3b6de3] text-white hover:bg-[#2a52c2] transition text-sm disabled:opacity-50"
            >
              {busy ? '提取中...' : hasResult ? '重新提取' : '开始提取'}
            </button>
          </div>

          {error ? (
            <div className="rounded border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 text-center mt-4">
              {error}
            </div>
          ) : null}
        </div>
      )}
    </ToolPageTemplate>
  )
}

export default StructuredOcrPage
