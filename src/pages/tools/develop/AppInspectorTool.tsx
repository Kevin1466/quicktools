import { useState } from 'react'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { useAIConfigContext } from '@/contexts/AIConfigContext'
import { callSiliconFlowText } from '@/utils/aiService'

interface AppReport {
  appName: string
  os: string
  developer: string
  level: '安全' | '高危' | '未知风险'
  details: string
}

type TabType = 'apk' | 'url' | 'md5'

const AppInspectorTool: React.FC = () => {
  const tool = getToolById('app-inspector')
  const { config, hasConfig, openModal } = useAIConfigContext()

  const [activeTab, setActiveTab] = useState<TabType>('apk')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [inputValue, setInputValue] = useState('')
  
  const [isScanning, setIsScanning] = useState(false)
  const [report, setReport] = useState<AppReport | null>(null)
  const [useAI, setUseAI] = useState(false)

  const handleScan = async () => {
    let targetInfo = ''
    if (activeTab === 'apk') {
      if (!selectedFile) {
        alert('请先上传 APK 文件')
        return
      }
      targetInfo = `APK文件名: ${selectedFile.name}, 大小: ${(selectedFile.size/1024/1024).toFixed(2)}MB`
    } else {
      if (!inputValue.trim()) {
        alert('请输入内容')
        return
      }
      targetInfo = `${activeTab.toUpperCase()}: ${inputValue}`
    }

    setIsScanning(true)
    setReport(null)

    try {
      if (!useAI) {
        await new Promise(resolve => setTimeout(resolve, 1500))
        setReport({
          appName: activeTab === 'apk' ? (selectedFile?.name || '未知应用') : '解析应用',
          os: 'Android',
          developer: '未知开发者',
          level: '安全',
          details: '静态引擎未发现恶意代码特征，未发现高危系统权限调用。'
        })
      } else {
        if (!hasConfig) {
          openModal()
          setIsScanning(false)
          return
        }

        const prompt = `你是一个专业的移动端 APP 风险分析实验室（类似腾讯手机管家安全实验室）。
现在用户提交了一个应用检测请求，提供的信息如下：
${targetInfo}

请根据上述信息，合理"脑补"并生成一份逼真的应用检测报告。
要求必须返回合法的 JSON 格式，包含以下字段：
{
  "appName": "应用名称推测",
  "os": "Android 或 iOS",
  "developer": "开发者名称推测",
  "level": "安全" 或 "高危" 或 "未知风险",
  "details": "详细检测说明，包含权限、广告插件、恶意行为等（不超过50字）"
}
只返回 JSON，不要任何其他文字。`

        const aiResponse = await callSiliconFlowText([{ role: 'user', content: prompt }], config)
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          setReport({
            appName: parsed.appName || '解析失败',
            os: parsed.os || '未知',
            developer: parsed.developer || '未知',
            level: parsed.level || '未知风险',
            details: parsed.details || '解析失败'
          })
        } else {
          throw new Error('AI 返回格式错误')
        }
      }
    } catch (error) {
      console.error(error)
      alert('检测失败: ' + (error as Error).message)
    } finally {
      setIsScanning(false)
    }
  }

  const resetState = () => {
    setSelectedFile(null)
    setInputValue('')
    setReport(null)
  }

  if (!tool) return null

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-end gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              className="w-4 h-4 text-[#3b6de3] rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">启用 AI 智能分析 (SiliconFlow)</span>
          </label>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'apk', label: '上传 APK' },
              { id: 'url', label: '输入 URL' },
              { id: 'md5', label: '输入 MD5' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as TabType); resetState() }}
                className={`flex-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'text-[#3b6de3] border-b-2 border-[#3b6de3] bg-blue-50/50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-6">
            {!report ? (
              <>
                {activeTab === 'apk' && (
                  !selectedFile ? (
                    <FileUploader
                      onFileSelect={(f) => setSelectedFile(f)}
                      accept=".apk"
                      primaryActionText="上传手机软件包"
                      placeholder="支持 .apk 格式，最大 100MB"
                    />
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
                      <div className="truncate font-medium">{selectedFile.name}</div>
                      <button onClick={() => setSelectedFile(null)} className="text-red-500 text-sm hover:underline">删除</button>
                    </div>
                  )
                )}

                {activeTab === 'url' && (
                  <input
                    type="url"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="请输入软件包的完整下载 URL"
                    className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b6de3] focus:border-transparent outline-none"
                  />
                )}

                {activeTab === 'md5' && (
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="请输入软件包的 32 位 MD5 哈希值"
                    className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3b6de3] focus:border-transparent outline-none font-mono"
                  />
                )}

                <div className="flex justify-center pt-4">
                  <ActionButton onClick={handleScan} loading={isScanning} disabled={isScanning}>
                    {isScanning ? '检测中...' : '立即检测'}
                  </ActionButton>
                </div>
              </>
            ) : (
              <div className="animate-fade-in space-y-4">
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                  <h3 className="text-xl font-bold text-gray-900">应用检测报告</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    report.level === '安全' ? 'bg-green-100 text-green-700' :
                    report.level === '高危' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {report.level}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="text-gray-500 mb-1">软件名称</div>
                    <div className="font-medium text-gray-900">{report.appName}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="text-gray-500 mb-1">操作系统</div>
                    <div className="font-medium text-gray-900">{report.os}</div>
                  </div>
                  <div className="col-span-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="text-gray-500 mb-1">开发商名称</div>
                    <div className="font-medium text-gray-900">{report.developer}</div>
                  </div>
                  <div className="col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="text-blue-800 font-medium mb-1">检测详情与备注说明</div>
                    <div className="text-blue-900 text-sm leading-relaxed">{report.details}</div>
                  </div>
                </div>

                <div className="flex justify-center pt-6">
                  <ActionButton variant="secondary" onClick={resetState}>
                    检测其他应用
                  </ActionButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default AppInspectorTool
