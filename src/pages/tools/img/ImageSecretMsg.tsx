import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import { getToolById } from '@/data/toolsFromJson'
import { downloadFile, getFileNameWithoutExtension, readFileAsDataURL } from '@/utils/fileUtils'

const bytesToBits = (bytes: Uint8Array) => {
  const bits: number[] = []
  for (const b of bytes) {
    for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1)
  }
  return bits
}

const bitsToBytes = (bits: number[]) => {
  const len = Math.floor(bits.length / 8)
  const out = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    let b = 0
    for (let j = 0; j < 8; j++) b = (b << 1) | (bits[i * 8 + j] & 1)
    out[i] = b
  }
  return out
}

const u32ToBytes = (n: number) => {
  const out = new Uint8Array(4)
  out[0] = (n >>> 24) & 0xff
  out[1] = (n >>> 16) & 0xff
  out[2] = (n >>> 8) & 0xff
  out[3] = n & 0xff
  return out
}

const bytesToU32 = (b: Uint8Array) => ((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0

const ImageSecretMsg: React.FC = () => {
  const tool = getToolById('image-secret-msg')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [message, setMessage] = useState('hello')
  const [decoded, setDecoded] = useState('')
  const [busy, setBusy] = useState(false)
  const [out, setOut] = useState<Blob | null>(null)
  const [outUrl, setOutUrl] = useState<string | null>(null)
  const [error, setError] = useState('')

  if (!tool) return null

  const onFileSelect = (f: File) => {
    if (!f.type.startsWith('image/')) return
    setFile(f)
    setOut(null)
    setDecoded('')
    setError('')
    if (outUrl) URL.revokeObjectURL(outUrl)
    setOutUrl(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(f))
  }

  const encode = async () => {
    if (!file) return
    setBusy(true)
    setError('')
    setDecoded('')
    try {
      const dataUrl = await readFileAsDataURL(file)
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image()
        i.onload = () => resolve(i)
        i.onerror = reject
        i.src = dataUrl
      })
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      const msgBytes = new TextEncoder().encode(message)
      const header = u32ToBytes(msgBytes.length)
      const bits = [...bytesToBits(header), ...bytesToBits(msgBytes)]
      const capacityBits = img.width * img.height * 3
      if (bits.length > capacityBits) {
        setError('图片容量不足')
        return
      }

      let bitIdx = 0
      for (let i = 0; i < data.length && bitIdx < bits.length; i += 4) {
        for (let c = 0; c < 3 && bitIdx < bits.length; c++) {
          data[i + c] = (data[i + c] & 0xfe) | bits[bitIdx]
          bitIdx++
        }
      }

      ctx.putImageData(imageData, 0, 0)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(b => resolve(b), 'image/png'))
      if (!blob) return
      setOut(blob)
      if (outUrl) URL.revokeObjectURL(outUrl)
      setOutUrl(URL.createObjectURL(blob))
    } finally {
      setBusy(false)
    }
  }

  const decode = async () => {
    if (!file) return
    setBusy(true)
    setError('')
    setOut(null)
    setDecoded('')
    try {
      const dataUrl = await readFileAsDataURL(file)
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image()
        i.onload = () => resolve(i)
        i.onerror = reject
        i.src = dataUrl
      })
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      const bits: number[] = []
      for (let i = 0; i < data.length; i += 4) {
        bits.push(data[i] & 1, data[i + 1] & 1, data[i + 2] & 1)
      }

      const lenBytes = bitsToBytes(bits.slice(0, 32))
      const len = bytesToU32(lenBytes)
      const totalBits = 32 + len * 8
      if (len === 0 || totalBits > bits.length) {
        setError('未检测到有效消息')
        return
      }
      const msgBytes = bitsToBytes(bits.slice(32, totalBits))
      setDecoded(new TextDecoder().decode(msgBytes))
    } finally {
      setBusy(false)
    }
  }

  const run = async () => {
    if (mode === 'encode') await encode()
    else await decode()
  }

  const download = () => {
    if (!file || !out) return
    downloadFile(out, `${getFileNameWithoutExtension(file.name)}_secret.png`)
  }

  const copyDecoded = async () => {
    if (!decoded) return
    await navigator.clipboard.writeText(decoded)
  }

  return (
    <ToolPageTemplate tool={tool}>
      {!file ? (
        <FileUploader onFileSelect={onFileSelect} accept="image/*" placeholder="上传图片（PNG/JPG/WEBP）" />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left side: Input & Options */}
            <div className="w-full lg:w-[400px] shrink-0 space-y-4">
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setMode('encode')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                    mode === 'encode'
                      ? 'bg-white text-[#3b6de3] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  写入消息
                </button>
                <button
                  type="button"
                  onClick={() => setMode('decode')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                    mode === 'decode'
                      ? 'bg-white text-[#3b6de3] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  读取消息
                </button>
              </div>

              <div className="p-5 rounded-xl border border-gray-100 bg-gray-50 space-y-4">
                {mode === 'encode' ? (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">消息</div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full min-h-[200px] p-4 rounded border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] resize-y"
                      placeholder="输入要写入的文本"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">读取结果</div>
                    <textarea
                      value={decoded}
                      readOnly
                      className="w-full min-h-[200px] p-4 rounded border border-gray-200 bg-white text-gray-800 resize-y"
                      placeholder="读取到的消息"
                    />
                    <button
                      onClick={copyDecoded}
                      disabled={!decoded}
                      className="w-full py-2.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm disabled:opacity-50"
                    >
                      复制结果
                    </button>
                  </div>
                )}
                {error && <div className="text-sm text-red-600">{error}</div>}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={run}
                  disabled={busy}
                  className="w-full py-2.5 rounded bg-[#3b6de3] text-white hover:bg-[#2a52c2] transition text-sm font-medium disabled:opacity-50"
                >
                  {busy ? '处理中...' : mode === 'encode' ? '写入消息' : '读取消息'}
                </button>
                {mode === 'encode' && (
                  <button
                    onClick={download}
                    disabled={!out}
                    className="w-full py-2.5 rounded border border-[#3b6de3] text-[#3b6de3] hover:bg-blue-50 transition text-sm disabled:opacity-50 disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent"
                  >
                    下载图片
                  </button>
                )}
                <button
                  onClick={() => setFile(null)}
                  disabled={busy}
                  className="w-full py-2.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm disabled:opacity-50"
                >
                  重新选择图片
                </button>
              </div>

              <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded text-blue-800">
                LSB隐写：使用像素RGB最低位存储数据；输出为PNG以减少压缩损伤。容量仅与图片分辨率有关。
              </div>
            </div>

            {/* Right side: Preview */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-1 border border-gray-200 bg-[#f8fafc] rounded p-6 flex flex-col items-center justify-center min-h-[500px]">
                {outUrl ? (
                  <img src={outUrl} alt="output" className="max-w-full max-h-[500px] object-contain" />
                ) : previewUrl ? (
                  <img src={previewUrl} alt="preview" className="max-w-full max-h-[500px] object-contain opacity-50" />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </ToolPageTemplate>
  )
}

export default ImageSecretMsg
