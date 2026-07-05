import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import FileUploader from '@/components/common/FileUploader'
import { getToolById } from '@/data/toolsFromJson'

const toHex = (bytes: Uint8Array) => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')

const leftRotate = (x: number, c: number) => (x << c) | (x >>> (32 - c))

const md5Bytes = (data: Uint8Array) => {
  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ]

  const K = new Uint32Array(64)
  for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32)

  const bitLen = data.length * 8
  const withOne = data.length + 1
  const padLen = (withOne % 64 <= 56 ? 56 : 120) - (withOne % 64)
  const totalLen = data.length + 1 + padLen + 8
  const buf = new Uint8Array(totalLen)
  buf.set(data, 0)
  buf[data.length] = 0x80

  const view = new DataView(buf.buffer)
  view.setUint32(totalLen - 8, bitLen >>> 0, true)
  view.setUint32(totalLen - 4, Math.floor(bitLen / 2 ** 32) >>> 0, true)

  let a0 = 0x67452301
  let b0 = 0xefcdab89
  let c0 = 0x98badcfe
  let d0 = 0x10325476

  const M = new Uint32Array(16)

  for (let offset = 0; offset < buf.length; offset += 64) {
    for (let i = 0; i < 16; i++) {
      M[i] = view.getUint32(offset + i * 4, true)
    }

    let A = a0
    let B = b0
    let C = c0
    let D = d0

    for (let i = 0; i < 64; i++) {
      let F = 0
      let g = 0
      if (i < 16) {
        F = (B & C) | (~B & D)
        g = i
      } else if (i < 32) {
        F = (D & B) | (~D & C)
        g = (5 * i + 1) % 16
      } else if (i < 48) {
        F = B ^ C ^ D
        g = (3 * i + 5) % 16
      } else {
        F = C ^ (B | ~D)
        g = (7 * i) % 16
      }

      const tmp = D
      D = C
      C = B
      const sum = (A + F + K[i] + M[g]) >>> 0
      B = (B + leftRotate(sum, s[i])) >>> 0
      A = tmp
    }

    a0 = (a0 + A) >>> 0
    b0 = (b0 + B) >>> 0
    c0 = (c0 + C) >>> 0
    d0 = (d0 + D) >>> 0
  }

  const out = new Uint8Array(16)
  const outView = new DataView(out.buffer)
  outView.setUint32(0, a0, true)
  outView.setUint32(4, b0, true)
  outView.setUint32(8, c0, true)
  outView.setUint32(12, d0, true)
  return out
}

const md5String = (text: string) => md5Bytes(new TextEncoder().encode(text))

const Md5Tool: React.FC = () => {
  const tool = getToolById('md5')
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileHash, setFileHash] = useState('')
  const [busy, setBusy] = useState(false)

  if (!tool) return null

  const textHash = useMemo(() => {
    if (!text) return ''
    return toHex(md5String(text))
  }, [text])

  const onFileSelect = async (f: File) => {
    setFile(f)
    setFileHash('')
    setBusy(true)
    try {
      const buf = await f.arrayBuffer()
      const h = toHex(md5Bytes(new Uint8Array(buf)))
      setFileHash(h)
    } finally {
      setBusy(false)
    }
  }

  const copy = async (v: string) => {
    if (!v) return
    await navigator.clipboard.writeText(v)
  }

  const clearText = () => {
    setText('')
  }

  const clearFile = () => {
    setFile(null)
    setFileHash('')
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 文本 MD5 区域 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="space-y-4">
            <div className="text-sm text-gray-600">文本</div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[160px] p-4 rounded-lg border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] resize-y font-mono text-sm bg-gray-50"
              placeholder="输入文本后自动计算 MD5"
            />
            
            {textHash && (
              <div className="p-4 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                <div className="font-mono text-sm text-gray-900 break-all flex-1">{textHash}</div>
                <div className="flex items-center gap-2">
                  <ActionButton size="sm" variant="secondary" onClick={() => copy(textHash)}>
                    复制
                  </ActionButton>
                  <ActionButton size="sm" variant="secondary" onClick={clearText}>
                    清空
                  </ActionButton>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 文件 MD5 区域 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="space-y-4">
            <div className="text-sm text-gray-600">文件</div>
            
            {!file ? (
              <FileUploader onFileSelect={onFileSelect} accept="*/*" placeholder="点击或拖拽文件到此处（本地计算 MD5）" />
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#3b6de3] bg-opacity-10 rounded-lg flex items-center justify-center text-[#3b6de3]">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 truncate max-w-xs">{file.name}</h3>
                      <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button onClick={clearFile} className="text-gray-400 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {(busy || fileHash) && (
                  <div className="p-4 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                    <div className="font-mono text-sm text-gray-900 break-all flex-1">{busy ? '计算中…' : fileHash}</div>
                    <ActionButton size="sm" variant="secondary" onClick={() => copy(fileHash)} disabled={!fileHash || busy}>
                      复制
                    </ActionButton>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default Md5Tool
