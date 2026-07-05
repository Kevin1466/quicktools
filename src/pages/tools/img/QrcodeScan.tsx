import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'
import { readFileAsDataURL } from '@/utils/fileUtils'

type DetectResult = {
  rawValue: string
  format?: string
}

const QrcodeScan: React.FC = () => {
  const tool = getToolById('qrcode-scan')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [results, setResults] = useState<DetectResult[]>([])
  const [error, setError] = useState('')

  if (!tool) return null

  const supported = useMemo(() => 'BarcodeDetector' in window, [])

  const onFileSelect = (f: File) => {
    if (!f.type.startsWith('image/')) return
    setFile(f)
    setResults([])
    setError('')
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(f))
  }

  const scan = async () => {
    if (!file) return
    if (!supported) {
      setError('当前浏览器不支持 BarcodeDetector，建议使用 Chromium 内核浏览器或后续接入识别服务。')
      return
    }
    setBusy(true)
    setError('')
    try {
      const dataUrl = await readFileAsDataURL(file)
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = reject
        image.src = dataUrl
      })

      const bitmap = await createImageBitmap(img)
      const detector = new (window as unknown as { BarcodeDetector: new (o?: unknown) => { detect: (i: ImageBitmap) => Promise<unknown[]> } }).BarcodeDetector({
        formats: ['qr_code'],
      })
      const codes = await detector.detect(bitmap)
      const out = (codes as Array<{ rawValue?: string; format?: string }>).map(c => ({
        rawValue: c.rawValue || '',
        format: c.format,
      }))
      setResults(out.filter(r => r.rawValue))
      if (!out.length) setError('未识别到二维码')
    } catch {
      setError('识别失败')
    } finally {
      setBusy(false)
    }
  }

  const copy = async (text: string) => {
    if (!text) return
    await navigator.clipboard.writeText(text)
  }

  const open = (text: string) => {
    try {
      const url = new URL(text)
      window.open(url.toString(), '_blank', 'noreferrer')
    } catch {}
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
                id="qrcode-scan-upload"
              />
              <label htmlFor="qrcode-scan-upload" className="mx-auto flex w-32 h-10 items-center justify-center bg-[#3b6de3] text-white rounded cursor-pointer hover:bg-[#2a52c2] transition font-medium text-sm">
                点击上传文件
              </label>
            </div>
          </div>
          
          {!supported && (
            <div className="rounded border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700 text-center">
              当前浏览器不支持本地识别 (BarcodeDetector)，建议使用 Chromium 内核浏览器。
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left side: Original Image Preview */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center justify-between mb-3 h-8">
                <div className="text-sm font-medium text-gray-900 truncate pr-4">{file.name}</div>
              </div>
              <div className="flex-1 min-h-[400px] border border-gray-200 bg-[#f6f7fb] rounded flex items-center justify-center p-4">
                {previewUrl && <img src={previewUrl} alt="preview" className="max-w-full max-h-[500px] object-contain" />}
              </div>
            </div>

            {/* Right side: Recognition Results */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center justify-between mb-3 h-8">
                <div className="text-sm font-medium text-gray-900">识别结果</div>
              </div>
              
              <div className="flex-1 border border-gray-200 bg-[#f8fafc] rounded p-6">
                {error ? (
                  <div className="text-sm text-red-600 bg-red-50 p-4 rounded border border-red-100">{error}</div>
                ) : results.length > 0 ? (
                  <div className="space-y-4">
                    {results.map((r, idx) => (
                      <div key={idx} className="bg-white p-4 border border-gray-200 rounded shadow-sm">
                        <div className="text-sm text-gray-800 break-all mb-4 whitespace-pre-wrap">
                          {r.rawValue}
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                          {r.rawValue.startsWith('http') && (
                            <button
                              onClick={() => open(r.rawValue)}
                              className="text-sm text-[#3b6de3] hover:underline"
                            >
                              打开链接
                            </button>
                          )}
                          <button
                            onClick={() => copy(r.rawValue)}
                            className="text-sm text-[#3b6de3] hover:underline"
                          >
                            复制结果
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-gray-400">
                    点击下方“二维码识别”按钮开始识别
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setFile(null)}
              className="px-6 py-2 rounded border border-[#3b6de3] text-[#3b6de3] hover:bg-blue-50 transition text-sm"
              disabled={busy}
            >
              重新选择
            </button>
            <button
              onClick={scan}
              disabled={busy || !supported}
              className="px-6 py-2 rounded bg-[#3b6de3] text-white hover:bg-[#2a52c2] transition text-sm disabled:opacity-50"
            >
              {busy ? '识别中...' : '二维码识别'}
            </button>
          </div>
        </div>
      )}
    </ToolPageTemplate>
  )
}

export default QrcodeScan
