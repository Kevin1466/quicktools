import { useMemo, useState } from 'react'
import type { Tool } from '@/types'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { ocrUtils } from '@/utils/ocrUtils'

const AutoWorkbench: React.FC<{ tool: Tool }> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [text, setText] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const kind = useMemo(() => {
    if (tool.category === 'pdf' || tool.category === 'doc') return 'file-convert'
    if (tool.category === 'video') return 'video'
    if (tool.category === 'img') {
      if (tool.id.includes('ocr') || tool.name.includes('识别') || tool.name.includes('提取文字')) return 'ocr'
      if (tool.id.includes('qrcode') || tool.name.includes('二维码')) return 'qrcode'
      return 'image'
    }
    if (tool.category === 'text' || tool.category === 'develop') return 'text'
    if (tool.category === 'education' || tool.category === 'life') return 'form'
    return 'generic'
  }, [tool.category, tool.id, tool.name])

  const multiFile = useMemo(() => {
    if (tool.id.includes('merge')) return true
    if (tool.name.includes('合并')) return true
    return false
  }, [tool.id, tool.name])

  const fileAccept = useMemo(() => {
    if (tool.category === 'pdf') return 'application/pdf'
    if (tool.category === 'video') return 'video/*'
    if (tool.category === 'img') return 'image/*'
    if (tool.category === 'doc') return '*/*'
    return '*/*'
  }, [tool.category])

  const handleFileSelect = (f: File) => {
    if (multiFile) {
      setFiles(prev => [...prev, f])
      return
    }
    setFile(f)
    setText('')
    setError('')
    setProgress(0)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(f))
  }

  const reset = () => {
    setFile(null)
    setFiles([])
    setText('')
    setError('')
    setProgress(0)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
  }

  if (kind === 'file-convert') {
    return (
      <div className="space-y-5">
        {!multiFile ? (
          <FileUploader
            onFileSelect={handleFileSelect}
            accept={fileAccept}
            placeholder={tool.category === 'pdf' ? '点击或拖拽文件到此处（PDF）' : '点击或拖拽文件到此处'}
          />
        ) : (
          <div className="space-y-3">
            <FileUploader onFileSelect={handleFileSelect} accept={fileAccept} placeholder="点击或拖拽多个文件到此处" />
            {files.length ? (
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-2">
                <div className="text-sm text-gray-600">已添加文件</div>
                <div className="space-y-1">
                  {files.map((f, idx) => (
                    <div key={idx} className="text-sm text-gray-900 truncate">{f.name}</div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <ActionButton disabled>
            开始处理
          </ActionButton>
          <ActionButton variant="secondary" onClick={reset}>
            清空
          </ActionButton>
        </div>

        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-600">
          该工具的处理逻辑需要进一步对接能力（可能是本地解析/后端服务/第三方接口），当前先提供统一的操作面板框架。
        </div>
      </div>
    )
  }

  if (kind === 'ocr') {
    const canRun = !!file && !busy
    const run = async () => {
      if (!file || busy) return
      setBusy(true)
      setError('')
      setText('')
      setProgress(0)
      try {
        const lang = tool.name.includes('英语') ? 'eng' : 'chi_sim'
        const out = await ocrUtils.recognizeText(file, {
          lang,
          onProgress: (p) => setProgress(p),
        })
        setText((out || '').trim())
      } catch {
        setError('识别失败，请更换更清晰的图片或稍后重试')
      } finally {
        setBusy(false)
      }
    }

    const copy = async () => {
      if (!text) return
      await navigator.clipboard.writeText(text)
    }

    return (
      <div className="space-y-5">
        <FileUploader onFileSelect={handleFileSelect} accept="image/*" placeholder="上传图片后进行本地识别（不上传）" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
            <div className="text-sm text-gray-600">原图</div>
            <div className="mt-3 text-sm text-gray-500">{file ? file.name : '未选择'}</div>
            {previewUrl ? (
              <img src={previewUrl} alt="preview" className="mt-3 w-full max-h-[360px] object-contain rounded-lg bg-white" />
            ) : null}
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">识别结果</div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="点击“开始识别”输出文本"
              className="w-full min-h-[220px] p-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 resize-y"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <ActionButton onClick={run} disabled={!canRun} loading={busy}>开始识别</ActionButton>
          <ActionButton variant="secondary" onClick={copy} disabled={!text}>复制</ActionButton>
          <ActionButton variant="secondary" onClick={reset}>清空</ActionButton>
        </div>
        {busy ? (
          <div className="text-sm text-gray-600">
            识别中… {Math.round(progress * 100)}%
          </div>
        ) : null}
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
      </div>
    )
  }

  if (kind === 'image' || kind === 'qrcode') {
    return (
      <div className="space-y-5">
        <FileUploader onFileSelect={handleFileSelect} accept="image/*" placeholder="上传图片（开发中）" />
        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
          <div className="text-sm text-gray-600">已选择</div>
          <div className="mt-2 text-sm text-gray-900 truncate">{file ? file.name : '未选择'}</div>
        </div>
        <div className="flex flex-wrap gap-3">
          <ActionButton disabled>开始处理</ActionButton>
          <ActionButton variant="secondary" onClick={reset}>清空</ActionButton>
        </div>
      </div>
    )
  }

  if (kind === 'video') {
    return (
      <div className="space-y-5">
        <div className="p-6 rounded-xl border border-gray-100 bg-gray-50">
          <div className="text-sm text-gray-600">视频工具操作区</div>
          <div className="mt-2 text-sm text-gray-500">该分类工具可能需要浏览器媒体能力或本地转码能力，当前先提供框架。</div>
        </div>
        <div className="flex flex-wrap gap-3">
          <ActionButton disabled>开始</ActionButton>
          <ActionButton variant="secondary" onClick={reset}>清空</ActionButton>
        </div>
      </div>
    )
  }

  if (kind === 'text' || kind === 'form') {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-2">输入</div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="输入内容（开发中）"
              className="w-full min-h-[220px] p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] resize-y"
            />
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-2">输出</div>
            <textarea
              value=""
              readOnly
              placeholder="输出结果（开发中）"
              className="w-full min-h-[220px] p-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 resize-y"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <ActionButton disabled>开始处理</ActionButton>
          <ActionButton variant="secondary" onClick={reset}>清空</ActionButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="p-6 rounded-xl border border-dashed border-gray-200 bg-white">
        <div className="text-sm text-gray-500">工具操作区（开发中）</div>
      </div>
    </div>
  )
}

export default AutoWorkbench
