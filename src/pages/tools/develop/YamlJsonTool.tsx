import { useMemo, useState } from 'react'
import * as yaml from 'js-yaml'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

const SAMPLE_YAML = `a: 1
b: true
c:
  - x
  - y
`

const SAMPLE_JSON = `{
  "a": 1,
  "b": true,
  "c": ["x", "y"]
}`

const YamlJsonTool: React.FC = () => {
  const tool = getToolById('yaml-2-json')
  const [mode, setMode] = useState<'yaml2json' | 'json2yaml'>('yaml2json')
  const [input, setInput] = useState(SAMPLE_YAML)
  // 记录用户最后一次“主动编辑过的”内容，避免切模式时被覆盖
  const [userInput, setUserInput] = useState<{ yaml2json: string; json2yaml: string }>({
    yaml2json: SAMPLE_YAML,
    json2yaml: SAMPLE_JSON,
  })

  if (!tool) return null

  const handleModeChange = (newMode: 'yaml2json' | 'json2yaml') => {
    if (newMode === mode) return
    // 把当前 input 保存到对应模式的“用户内容”里
    setUserInput(prev => ({
      ...prev,
      [mode]: input,
    }))
    setMode(newMode)
    // 切换后，文本框切换到目标模式的“用户内容”（首次进入就是示例）
    setInput(userInput[newMode])
  }

  const handleInputChange = (value: string) => {
    setInput(value)
    setUserInput(prev => ({
      ...prev,
      [mode]: value,
    }))
  }

  const computed = useMemo(() => {
    if (!input.trim()) return { output: '', error: '' }
    try {
      if (mode === 'yaml2json') {
        const obj = yaml.load(input)
        return { output: JSON.stringify(obj, null, 2), error: '' }
      }
      const obj = JSON.parse(input)
      return { output: yaml.dump(obj, { indent: 2, lineWidth: -1 }), error: '' }
    } catch (e) {
      return { output: '', error: e instanceof Error ? e.message : '解析失败' }
    }
  }, [input, mode])

  const copy = async () => {
    if (!computed.output) return
    await navigator.clipboard.writeText(computed.output)
  }

  const clearInput = () => {
    handleInputChange('')
  }

  const loadSample = () => {
    const sample = mode === 'yaml2json' ? SAMPLE_YAML : SAMPLE_JSON
    handleInputChange(sample)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleModeChange('yaml2json')}
            className={`px-4 py-2 rounded-md text-sm transition cursor-pointer ${
              mode === 'yaml2json'
                ? 'bg-[#3b6de3] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            YAML → JSON
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('json2yaml')}
            className={`px-4 py-2 rounded-md text-sm transition cursor-pointer ${
              mode === 'json2yaml'
                ? 'bg-[#3b6de3] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            JSON → YAML
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="font-medium text-gray-900">输入</div>
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-full h-[320px] p-4 rounded-lg border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] resize-none font-mono text-sm bg-gray-50 cursor-text"
                placeholder={mode === 'yaml2json' ? '请输入YAML' : '请输入JSON'}
              />
            </div>
            <div className="space-y-2">
              <div className="font-medium text-gray-900">输出</div>
              <textarea
                value={computed.output}
                readOnly
                className="w-full h-[320px] p-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 resize-none font-mono text-sm cursor-text"
                placeholder="输出"
              />
            </div>
          </div>

          {computed.error && (
            <div className="mt-4 p-3 rounded-lg border border-red-200 bg-red-50 text-sm text-red-600">
              {computed.error}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <ActionButton variant="secondary" onClick={copy} disabled={!computed.output}>
              复制
            </ActionButton>
            <ActionButton variant="secondary" onClick={loadSample}>
              示例
            </ActionButton>
            <ActionButton variant="secondary" onClick={clearInput}>
              清空
            </ActionButton>
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default YamlJsonTool
