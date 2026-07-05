import { useState, useMemo } from 'react'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'

type CompareMode = 'text' | 'paragraph' | 'css' | 'sentence' | 'line' | 'code' | 'strict-code'

interface DiffLine {
  type: 'equal' | 'add' | 'remove'
  content: string
}

const compareModes: { id: CompareMode; name: string }[] = [
  { id: 'text', name: '文本比较' },
  { id: 'paragraph', name: '段落比较' },
  { id: 'css', name: 'CSS语法比较' },
  { id: 'sentence', name: '句子比较' },
  { id: 'line', name: '行比较' },
  { id: 'code', name: '代码比较' },
  { id: 'strict-code', name: '严谨代码比较' },
]

const splitTextByMode = (text: string, mode: CompareMode): string[] => {
  if (!text) return []
  
  switch (mode) {
    case 'line':
    case 'code':
    case 'strict-code':
      return text.split('\n')
    case 'paragraph':
      return text.split(/\n\s*\n/)
    case 'sentence':
      return text.split(/([。！？.!?]+)/).filter(s => s.trim())
    case 'css':
      return text.split(/([{};])/).filter(s => s.trim())
    default:
      return text.split('')
  }
}

const computeDiff = (oldLines: string[], newLines: string[]): DiffLine[] => {
  const m = oldLines.length
  const n = newLines.length
  
  if (m === 0) {
    return newLines.map(content => ({ type: 'add' as const, content }))
  }
  if (n === 0) {
    return oldLines.map(content => ({ type: 'remove' as const, content }))
  }
  
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))
  
  for (let i = 0; i <= m; i++) {
    dp[i][0] = i
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j
  }
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1)
      }
    }
  }
  
  const result: DiffLine[] = []
  let i = m
  let j = n
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.unshift({ type: 'equal', content: oldLines[i - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] <= dp[i - 1][j])) {
      result.unshift({ type: 'add', content: newLines[j - 1] })
      j--
    } else {
      result.unshift({ type: 'remove', content: oldLines[i - 1] })
      i--
    }
  }
  
  return result
}

const TextDiff: React.FC = () => {
  const tool = getToolById('textdiff')
  const [text1, setText1] = useState('')
  const [text2, setText2] = useState('')
  const [compareMode, setCompareMode] = useState<CompareMode>('text')
  const [diffResult, setDiffResult] = useState<DiffLine[]>([])
  const [hasCompared, setHasCompared] = useState(false)

  const handleCompare = () => {
    if (!text1.trim() && !text2.trim()) {
      alert('请输入要比较的文本')
      return
    }
    
    const lines1 = splitTextByMode(text1, compareMode)
    const lines2 = splitTextByMode(text2, compareMode)
    
    const diff = computeDiff(lines1, lines2)
    setDiffResult(diff)
    setHasCompared(true)
  }

  const handleClear = () => {
    setText1('')
    setText2('')
    setDiffResult([])
    setHasCompared(false)
  }

  const joinLines = (lines: string[], mode: CompareMode): string => {
    switch (mode) {
      case 'line':
      case 'code':
      case 'strict-code':
        return lines.join('\n')
      case 'paragraph':
        return lines.join('\n\n')
      case 'sentence':
      case 'css':
      default:
        return lines.join('')
    }
  }

  if (!tool) {
    return <div className="p-8 text-center">工具不存在</div>
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {compareModes.map(mode => (
            <button
              key={mode.id}
              onClick={() => setCompareMode(mode.id)}
              className={`px-4 py-2 text-sm rounded-lg transition ${
                compareMode === mode.id
                  ? 'bg-[#3b6de3] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mode.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">请输入文本</label>
            <textarea
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              placeholder="请输入文本"
              className="w-full h-48 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">请输入需要对比的文本</label>
            <textarea
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              placeholder="请输入需要对比的文本"
              className="w-full h-48 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleCompare}
            disabled={!text1.trim() && !text2.trim()}
            className="px-6 py-2.5 bg-[#3b6de3] text-white rounded-lg hover:bg-[#2a52c2] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            开始对比
          </button>

          <button
            onClick={handleClear}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            清空
          </button>
        </div>

        {hasCompared && diffResult.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">对比结果</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex gap-2 p-3 bg-gray-50 border-b border-gray-200">
                <span className="flex items-center gap-1 text-sm">
                  <span className="w-4 h-4 bg-red-100 rounded"></span>
                  <span className="text-gray-600">删除</span>
                </span>
                <span className="flex items-center gap-1 text-sm">
                  <span className="w-4 h-4 bg-green-100 rounded"></span>
                  <span className="text-gray-600">新增</span>
                </span>
                <span className="flex items-center gap-1 text-sm">
                  <span className="w-4 h-4 bg-white border border-gray-300 rounded"></span>
                  <span className="text-gray-600">相同</span>
                </span>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto font-mono text-sm whitespace-pre-wrap">
                {diffResult.map((line, index) => (
                  <div
                    key={index}
                    className={`px-2 py-1 rounded ${
                      line.type === 'remove'
                        ? 'bg-red-50 text-red-700 line-through'
                        : line.type === 'add'
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-700'
                    }`}
                  >
                    <span className="inline-block w-4 mr-2 text-gray-400">
                      {line.type === 'remove' ? '-' : line.type === 'add' ? '+' : ' '}
                    </span>
                    {line.content}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default TextDiff
