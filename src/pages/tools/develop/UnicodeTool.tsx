import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

type Mode = 'encode' | 'decode'

const toUnicodeEscapes = (text: string) => {
  let out = ''
  for (const ch of text) {
    const cp = ch.codePointAt(0)
    if (cp === undefined) continue
    if (cp <= 0xffff) {
      out += `\\u${cp.toString(16).padStart(4, '0')}`
    } else {
      const n = cp - 0x10000
      const hi = 0xd800 + (n >> 10)
      const lo = 0xdc00 + (n & 0x3ff)
      out += `\\u${hi.toString(16).padStart(4, '0')}\\u${lo.toString(16).padStart(4, '0')}`
    }
  }
  return out
}

const fromUnicodeEscapes = (text: string) => {
  return text
    .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex: string) => {
      const cp = Number.parseInt(hex, 16)
      if (!Number.isFinite(cp)) return _
      try {
        return String.fromCodePoint(cp)
      } catch {
        return _
      }
    })
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)))
}

const UnicodeTool: React.FC = () => {
  const tool = getToolById('unicode')
  const [mode, setMode] = useState<Mode>('encode')
  const [input, setInput] = useState('')

  if (!tool) return null

  const output = useMemo(() => {
    if (!input.trim()) return ''
    try {
      return mode === 'encode' ? toUnicodeEscapes(input) : fromUnicodeEscapes(input)
    } catch {
      return ''
    }
  }, [input, mode])

  const copy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
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
              placeholder={mode === 'encode' ? '输入文本，生成 Unicode 转义（\\uXXXX）' : '输入 Unicode 转义，解码为文本'}
              className="w-full min-h-[240px] p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] resize-y"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">输出</div>
              <ActionButton size="sm" variant="secondary" onClick={copy} disabled={!output}>
                复制
              </ActionButton>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="输出结果"
              className="w-full min-h-[240px] p-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 resize-y"
            />
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default UnicodeTool
