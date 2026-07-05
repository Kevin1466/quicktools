import { useEffect, useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { useAIConfigContext } from '@/contexts/AIConfigContext'
import { getToolById } from '@/data/toolsFromJson'
import { downloadFile, formatFileSize, readFileAsDataURL } from '@/utils/fileUtils'
import { performOCR } from '@/utils/aiService'

const ImgToText: React.FC = () => {
  const tool = getToolById('img-2-text')
  const { config, openModal } = useAIConfigContext()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [language, setLanguage] = useState<'auto' | 'zh' | 'en'>('auto')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  if (!tool) return null

  const hasOcrConfig = useMemo(
    () => !!(config.silicon.apiKey && config.silicon.apiKey.trim()),
    [config.silicon.apiKey]
  )

  const currentStep = useMemo(() => {
    if (text) return 3
    if (file) return 2
    return 1
  }, [file, text])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const onFileSelect = (f: File) => {
    if (!f.type.startsWith('image/')) return
    setFile(f)
    setError('')
    setText('')
    setCopied(false)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(f))
  }

  const convert = async () => {
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
      const result = await performOCR(dataUrl, config, {
        language:
          language === 'auto'
            ? undefined
            : language === 'zh'
              ? '中文'
              : '英文',
      })
      setText(result.trim())
      if (!result.trim()) {
        setError('未识别到可提取文字，请尝试更清晰的图片')
      }
    } catch (err) {
      setError((err as Error).message || '提取文字失败')
    } finally {
      setBusy(false)
    }
  }

  const copy = async () => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
  }

  const download = () => {
    if (!text || !file) return
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    downloadFile(blob, `${file.name.replace(/\.[^.]+$/, '')}_ocr.txt`)
  }

  const reselect = () => {
    setFile(null)
    setText('')
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
                id="ocr-upload"
              />
              <label htmlFor="ocr-upload" className="mx-auto flex w-32 h-10 items-center justify-center bg-[#3b6de3] text-white rounded cursor-pointer hover:bg-[#2a52c2] transition font-medium text-sm">
                选择文件
              </label>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => setLanguage('auto')}
              className={`rounded px-4 py-2 text-sm transition border ${
                language === 'auto'
                  ? 'border-[#3b6de3] text-[#3b6de3] bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-[#3b6de3]'
              }`}
            >
              自动识别
            </button>
            <button
              type="button"
              onClick={() => setLanguage('zh')}
              className={`rounded px-4 py-2 text-sm transition border ${
                language === 'zh'
                  ? 'border-[#3b6de3] text-[#3b6de3] bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-[#3b6de3]'
              }`}
            >
              中文优先
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`rounded px-4 py-2 text-sm transition border ${
                language === 'en'
                  ? 'border-[#3b6de3] text-[#3b6de3] bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-[#3b6de3]'
              }`}
            >
              英文优先
            </button>
            {!hasOcrConfig ? (
              <button
                type="button"
                onClick={openModal}
                className="rounded border border-[#c9d8ff] px-4 py-2 text-sm text-[#3b6de3] hover:bg-[#eef4ff]"
              >
                配置 OCR
              </button>
            ) : null}
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

            {/* Right side: OCR Result */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center justify-end mb-3 h-8 gap-3">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'auto' | 'zh' | 'en')}
                  className="outline-none text-sm text-gray-700 bg-transparent cursor-pointer"
                  disabled={busy}
                >
                  <option value="auto">自动识别</option>
                  <option value="zh">中文优先</option>
                  <option value="en">英文优先</option>
                </select>
                <div className="w-px h-4 bg-gray-200"></div>
                <button
                  onClick={copy}
                  disabled={!text || busy}
                  className="text-sm text-[#3b6de3] hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                >
                  {copied ? '已复制' : '复制文字'}
                </button>
                <button
                  onClick={download}
                  disabled={!text || busy}
                  className="text-sm text-[#3b6de3] hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                >
                  下载结果
                </button>
              </div>
              <div className="flex-1 min-h-[400px] border border-gray-200 bg-white rounded overflow-hidden">
                <textarea
                  className="w-full h-full p-4 resize-none outline-none text-sm text-gray-700 leading-relaxed"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={busy ? '正在提取文字，请稍候...' : '点击“提取文字”后，识别结果将显示在这里'}
                  readOnly={busy}
                />
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
              onClick={convert}
              disabled={busy}
              className="px-6 py-2 rounded bg-[#3b6de3] text-white hover:bg-[#2a52c2] transition text-sm disabled:opacity-50"
            >
              {busy ? '提取中...' : text ? '重新提取' : '提取文字'}
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

export default ImgToText
