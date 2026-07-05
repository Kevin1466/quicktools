import { useState } from 'react'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'

const IPLocationTool: React.FC = () => {
  const tool = getToolById('iplocation')
  const [ip, setIp] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    ip: string
    country: string
    region: string
    city: string
    isp: string
  } | null>(null)

  if (!tool) return null

  const handleQuery = () => {
    if (!ip) return
    setLoading(true)
    
    setTimeout(() => {
      setResult({
        ip,
        country: '中国',
        region: '广东省',
        city: '深圳市',
        isp: '中国电信'
      })
      setLoading(false)
    }, 500)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              placeholder="请输入IP地址，如：114.114.114.114"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleQuery()
                }
              }}
            />
          </div>
          <ActionButton onClick={handleQuery} disabled={!ip || loading}>
            {loading ? '查询中...' : '查询'}
          </ActionButton>
        </div>

        {result && (
          <div className="p-6 rounded-xl border border-gray-100 bg-gray-50">
            <div className="text-lg font-semibold text-gray-900 mb-4">查询结果</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-gray-100">
                <div className="text-sm text-gray-600">IP地址</div>
                <div className="text-lg font-bold text-gray-900 mt-1">{result.ip}</div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-100">
                <div className="text-sm text-gray-600">国家</div>
                <div className="text-lg font-bold text-gray-900 mt-1">{result.country}</div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-100">
                <div className="text-sm text-gray-600">地区</div>
                <div className="text-lg font-bold text-gray-900 mt-1">{result.region}</div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-100">
                <div className="text-sm text-gray-600">城市</div>
                <div className="text-lg font-bold text-gray-900 mt-1">{result.city}</div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-100 md:col-span-2">
                <div className="text-sm text-gray-600">ISP</div>
                <div className="text-lg font-bold text-gray-900 mt-1">{result.isp}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default IPLocationTool
