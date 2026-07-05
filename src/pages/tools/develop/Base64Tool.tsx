import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

type Mode = 'encode' | 'decode'

const Base64Tool: React.FC = () => {
  const tool = getToolById('base64')
  const [mode, setMode] = useState<Mode>('encode')
  const [input, setInput] = useState('')
  const [fileBase64, setFileBase64] = useState('')

  if (!tool) return null

  const output = useMemo(() => {
    if (!input.trim()) return ''
    try {
      if (mode === 'encode') {
        return btoa(unescape(encodeURIComponent(input)))
      }
      return decodeURIComponent(escape(atob(input.trim())))
    } catch {
      return ''
    }
  }, [input, mode])

  const copy = async (text: string) => {
    if (!text) return
    await navigator.clipboard.writeText(text)
  }

  const onFileSelect = async (file: File) => {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => reject(new Error('read_error'))
      reader.readAsDataURL(file)
    })
    setFileBase64(base64)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('encode')}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              mode === 'encode'
                ? 'bg-[#eef4ff] text-[#3b6de3] font-medium'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            编码
          </button>
          <button
            type="button"
            onClick={() => setMode('decode')}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              mode === 'decode'
                ? 'bg-[#eef4ff] text-[#3b6de3] font-medium'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            解码
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-2">输入</div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={mode === 'encode' ? '输入文本，生成 Base64' : '输入 Base64，解码为文本'}
              className="w-full min-h-[220px] p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] resize-y"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">输出</div>
              <ActionButton size="sm" variant="secondary" onClick={() => copy(output)} disabled={!output}>
                复制
              </ActionButton>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="输出结果"
              className="w-full min-h-[220px] p-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 resize-y"
            />
            {input.trim() && !output && (
              <div className="mt-2 text-xs text-red-600">输入内容无法{mode === 'encode' ? '编码' : '解码'}</div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-600 mb-3">文件转 Base64（DataURL）</div>
          <FileUploader onFileSelect={onFileSelect} accept="*/*" placeholder="点击选择文件，生成 Base64 DataURL" />
          {fileBase64 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">结果</div>
                <ActionButton size="sm" variant="secondary" onClick={() => copy(fileBase64)}>
                  复制
                </ActionButton>
              </div>
              <textarea
                value={fileBase64}
                readOnly
                className="w-full min-h-[160px] p-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 resize-y"
              />
            </div>
          )}
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default Base64Tool
