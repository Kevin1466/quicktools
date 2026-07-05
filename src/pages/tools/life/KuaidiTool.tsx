import { useState } from 'react'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'

const expressCompanies = [
  { name: '顺丰速运', icon: '🚚' },
  { name: '中通快递', icon: '📦' },
  { name: '圆通速递', icon: '🛺' },
  { name: '申通快递', icon: '🚛' },
  { name: '韵达快递', icon: '🚜' },
  { name: '京东物流', icon: '🏪' },
  { name: '邮政EMS', icon: '📮' },
  { name: '德邦快递', icon: '🚐' },
]

const mockTrackingData = [
  { time: '2026-06-29 14:30:00', status: '快递已签收，签收人：本人', location: '派送站' },
  { time: '2026-06-29 09:00:00', status: '快递正在派送中', location: '派送站' },
  { time: '2026-06-29 06:00:00', status: '快递已到达目的地城市', location: '目的地城市' },
  { time: '2026-06-28 20:00:00', status: '快递在运输途中', location: '中转站' },
  { time: '2026-06-28 12:00:00', status: '快递已发出', location: '发货城市' },
  { time: '2026-06-28 08:00:00', status: '商家已发货', location: '商家仓库' },
]

const KuaidiTool: React.FC = () => {
  const tool = getToolById('kuaidi')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [selectedCompany, setSelectedCompany] = useState(expressCompanies[0])
  const [trackingResult, setTrackingResult] = useState<typeof mockTrackingData | null>(null)
  const [loading, setLoading] = useState(false)

  if (!tool) return null

  const handleQuery = () => {
    if (!trackingNumber) return
    setLoading(true)
    
    setTimeout(() => {
      setTrackingResult(mockTrackingData)
      setLoading(false)
    }, 1000)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div>
          <div className="text-sm text-gray-600 mb-3">选择快递公司</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {expressCompanies.map((company, index) => (
              <button
                key={index}
                onClick={() => setSelectedCompany(company)}
                className={`px-4 py-3 rounded-lg border transition-colors text-sm ${
                  selectedCompany.name === company.name
                    ? 'border-[#3b6de3] bg-[#3b6de3] text-white'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <span className="mr-2">{company.icon}</span>
                {company.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="请输入快递单号"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleQuery()
                }
              }}
            />
          </div>
          <ActionButton onClick={handleQuery} disabled={!trackingNumber || loading}>
            {loading ? '查询中...' : '查询'}
          </ActionButton>
        </div>

        {trackingResult && (
          <div className="p-6 rounded-xl border border-gray-100 bg-gray-50">
            <div className="text-lg font-semibold text-gray-900 mb-4">查询结果</div>
            <div className="relative pl-8 space-y-4">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200"></div>
              {trackingResult.map((item, index) => (
                <div key={index} className="relative">
                  <div
                    className={`absolute -left-5.5 w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-[#3b6de3]' : 'bg-gray-300'
                    }`}
                  ></div>
                  <div className="p-4 bg-white rounded-lg border border-gray-100">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-medium ${
                        index === 0 ? 'text-[#3b6de3]' : 'text-gray-700'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-sm text-gray-500">{item.time}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      📍 {item.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default KuaidiTool
