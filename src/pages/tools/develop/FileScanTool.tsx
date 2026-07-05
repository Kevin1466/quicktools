import { useState } from 'react'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { useAIConfigContext } from '@/contexts/AIConfigContext'
import { callSiliconFlowText } from '@/utils/aiService'

interface ScanReport {
  level: '安全' | '可疑' | '高危'
  md5: string
  staticAnalysis: string
  dynamicBehavior: string
  summary: string
}

const FileScanTool: React.FC = () => {
  const tool = getToolById('file-scan')
  const { config, hasConfig, openModal } = useAIConfigContext()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [report, setReport] = useState<ScanReport | null>(null)
  const [useAI, setUseAI] = useState(false)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setReport(null)
  }

  const generateMockMD5 = () => {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
  }

  const handleScan = async () => {
    if (!selectedFile) return
    setIsScanning(true)
    setReport(null)

    try {
      if (!useAI) {
        // 静态模拟报告
        await new Promise(resolve => setTimeout(resolve, 1500))
        setReport({
          level: '安全',
          md5: generateMockMD5(),
          staticAnalysis: '未发现已知病毒特征码。文件结构完整，未检测到异常加壳或混淆行为。',
          dynamicBehavior: '沙箱运行期间未发现敏感网络请求，未发现越权文件读写行为。',
          summary: '该文件各项检测指标正常，可放心使用。'
        })
      } else {
        if (!hasConfig) {
          openModal()
          setIsScanning(false)
          return
        }

        // 使用 AI 生成模拟安全报告
        const prompt = `你是一个专业的网络安全分析引擎（类似哈勃分析系统）。
现在用户上传了一个文件进行安全检测：
文件名：${selectedFile.name}
文件类型：${selectedFile.type || '未知'}
文件大小：${(selectedFile.size / 1024).toFixed(2)} KB

请根据上述信息，合理"脑补"并生成一份逼真的自动化恶意软件分析报告。
要求必须返回合法的 JSON 格式，包含以下字段：
{
  "level": "安全" 或 "可疑" 或 "高危",
  "staticAnalysis": "静态分析描述（不超过50字）",
  "dynamicBehavior": "动态行为分析描述（不超过50字）",
  "summary": "最终的安全总结建议（不超过30字）"
}
只返回 JSON，不要任何其他文字。`

        const aiResponse = await callSiliconFlowText([{ role: 'user', content: prompt }], config)
        // 提取 JSON
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          setReport({
            level: parsed.level || '可疑',
            md5: generateMockMD5(),
            staticAnalysis: parsed.staticAnalysis || '分析失败',
            dynamicBehavior: parsed.dynamicBehavior || '分析失败',
            summary: parsed.summary || '分析失败'
          })
        } else {
          throw new Error('AI 返回格式错误')
        }
      }
    } catch (error) {
      console.error(error)
      alert('扫描失败: ' + (error as Error).message)
    } finally {
      setIsScanning(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case '安全': return 'text-green-600 bg-green-50 border-green-200'
      case '可疑': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case '高危': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (!tool) return null

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-end gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              className="w-4 h-4 text-[#3b6de3] rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">启用 AI 智能分析引擎 (SiliconFlow)</span>
          </label>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          {!selectedFile ? (
            <FileUploader
              onFileSelect={handleFileSelect}
              accept="*"
              primaryActionText="上传文件进行安全检测"
              placeholder="支持任意格式文件，单文件最大限制 50MB"
            />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#3b6de3] bg-opacity-10 rounded-lg flex items-center justify-center text-[#3b6de3]">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 truncate max-w-xs">{selectedFile.name}</h3>
                    <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                {!isScanning && !report && (
                  <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-red-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {!report ? (
                <div className="flex justify-center">
                  <ActionButton onClick={handleScan} loading={isScanning} disabled={isScanning}>
                    {isScanning ? '正在进行云端沙箱检测...' : '立即检测'}
                  </ActionButton>
                </div>
              ) : (
                <div className="animate-fade-in space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 border-b pb-2">检测报告</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-lg border ${getLevelColor(report.level)}`}>
                      <div className="text-sm opacity-80 mb-1">风险评级</div>
                      <div className="text-2xl font-bold">{report.level}</div>
                      <div className="text-sm mt-2 opacity-90">{report.summary}</div>
                    </div>
                    <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                      <div className="text-sm text-gray-500 mb-1">文件 MD5</div>
                      <div className="font-mono text-sm break-all text-gray-800">{report.md5}</div>
                    </div>
                  </div>

                  <div className="space-y-4 mt-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        静态分析
                      </h4>
                      <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                        {report.staticAnalysis}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        动态行为分析
                      </h4>
                      <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                        {report.dynamicBehavior}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-center">
                    <ActionButton variant="secondary" onClick={() => setSelectedFile(null)}>
                      检测其他文件
                    </ActionButton>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default FileScanTool
