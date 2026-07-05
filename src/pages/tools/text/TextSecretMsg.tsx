import { useState } from 'react'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'

const ZERO_WIDTH_SPACE = '\u200B'
const ZERO_WIDTH_NON_JOINER = '\u200C'
const ZERO_WIDTH_JOINER = '\u200D'

const charToZeroWidth = (char: string): string => {
  const binary = char.charCodeAt(0).toString(2).padStart(16, '0')
  let result = ''
  for (const bit of binary) {
    if (bit === '0') {
      result += ZERO_WIDTH_SPACE
    } else {
      result += ZERO_WIDTH_NON_JOINER
    }
  }
  return result
}

const zeroWidthToChar = (zeroWidth: string): string => {
  let binary = ''
  for (const char of zeroWidth) {
    if (char === ZERO_WIDTH_SPACE) {
      binary += '0'
    } else if (char === ZERO_WIDTH_NON_JOINER) {
      binary += '1'
    }
  }
  if (binary.length === 16) {
    return String.fromCharCode(parseInt(binary, 2))
  }
  return ''
}

const encodeSecret = (coverText: string, secretText: string): string => {
  if (!secretText) return coverText
  
  let encodedSecret = ''
  for (const char of secretText) {
    encodedSecret += charToZeroWidth(char)
  }
  encodedSecret += ZERO_WIDTH_JOINER
  
  if (coverText.length <= 1) {
    return coverText + encodedSecret
  }
  
  const midpoint = Math.floor(coverText.length / 2)
  return coverText.slice(0, midpoint) + encodedSecret + coverText.slice(midpoint)
}

const decodeSecret = (encodedText: string): string => {
  const zeroWidthChars: string[] = []
  let currentZeroWidth = ''
  
  for (const char of encodedText) {
    if (char === ZERO_WIDTH_SPACE || char === ZERO_WIDTH_NON_JOINER) {
      currentZeroWidth += char
      if (currentZeroWidth.length === 16) {
        zeroWidthChars.push(currentZeroWidth)
        currentZeroWidth = ''
      }
    } else if (char === ZERO_WIDTH_JOINER) {
      break
    }
  }
  
  let result = ''
  for (const zw of zeroWidthChars) {
    const char = zeroWidthToChar(zw)
    if (char) {
      result += char
    }
  }
  
  return result
}

const TextSecretMsg: React.FC = () => {
  const tool = getToolById('text-secret-msg')
  const [activeTab, setActiveTab] = useState<'encode' | 'decode'>('encode')
  
  const [coverText, setCoverText] = useState('')
  const [secretText, setSecretText] = useState('')
  const [encodedResult, setEncodedResult] = useState('')
  
  const [decodeInput, setDecodeInput] = useState('')
  const [decodedResult, setDecodedResult] = useState('')

  const handleEncode = () => {
    if (!coverText.trim() || !secretText.trim()) {
      alert('请输入显示文字和隐藏文字')
      return
    }
    
    const result = encodeSecret(coverText, secretText)
    setEncodedResult(result)
  }

  const handleDecode = () => {
    if (!decodeInput.trim()) {
      alert('请输入要解析的文字')
      return
    }
    
    const result = decodeSecret(decodeInput)
    setDecodedResult(result || '未找到隐藏信息')
  }

  const handleClearEncode = () => {
    setCoverText('')
    setSecretText('')
    setEncodedResult('')
  }

  const handleClearDecode = () => {
    setDecodeInput('')
    setDecodedResult('')
  }

  const handleCopy = (text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  }

  if (!tool) {
    return <div className="p-8 text-center">工具不存在</div>
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('encode')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === 'encode'
                ? 'bg-[#3b6de3] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            生成
          </button>
          <button
            onClick={() => setActiveTab('decode')}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === 'decode'
                ? 'bg-[#3b6de3] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            解析
          </button>
        </div>

        {activeTab === 'encode' ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">请输入显示的文字</label>
              <textarea
                value={coverText}
                onChange={(e) => setCoverText(e.target.value)}
                placeholder="请输入显示的文字"
                className="w-full h-32 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">请输入隐藏的文字</label>
              <textarea
                value={secretText}
                onChange={(e) => setSecretText(e.target.value)}
                placeholder="请输入隐藏的文字"
                className="w-full h-32 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={handleEncode}
                disabled={!coverText.trim() || !secretText.trim()}
                className="px-6 py-2.5 bg-[#3b6de3] text-white rounded-lg hover:bg-[#2a52c2] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                生成
              </button>

              {encodedResult && (
                <button
                  onClick={() => handleCopy(encodedResult)}
                  className="px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
                >
                  复制
                </button>
              )}

              <button
                onClick={handleClearEncode}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                清空
              </button>
            </div>

            {encodedResult && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">生成结果（包含隐藏信息）</label>
                <textarea
                  value={encodedResult}
                  readOnly
                  className="w-full h-32 p-4 border border-gray-200 rounded-lg resize-none bg-gray-50"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">请输入要解析的文字</label>
              <textarea
                value={decodeInput}
                onChange={(e) => setDecodeInput(e.target.value)}
                placeholder="请输入要解析的文字"
                className="w-full h-48 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={handleDecode}
                disabled={!decodeInput.trim()}
                className="px-6 py-2.5 bg-[#3b6de3] text-white rounded-lg hover:bg-[#2a52c2] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                解析
              </button>

              <button
                onClick={handleClearDecode}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                清空
              </button>
            </div>

            {decodedResult && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">解析结果</label>
                <textarea
                  value={decodedResult}
                  readOnly
                  className="w-full h-32 p-4 border border-gray-200 rounded-lg resize-none bg-gray-50"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default TextSecretMsg
