import { useState } from 'react'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'

const phoneAreaData: Record<string, { code: string; cities: string[] }> = {
  '华北地区': {
    code: '010/022/0311',
    cities: ['北京 010', '天津 022', '石家庄 0311', '太原 0351', '呼和浩特 0471']
  },
  '华东地区': {
    code: '021/025/0571',
    cities: ['上海 021', '南京 025', '杭州 0571', '合肥 0551', '福州 0591', '南昌 0791']
  },
  '华南地区': {
    code: '020/0755/0771',
    cities: ['广州 020', '深圳 0755', '南宁 0771', '海口 0898', '珠海 0756']
  },
  '华中地区': {
    code: '027/0731/0371',
    cities: ['武汉 027', '长沙 0731', '郑州 0371']
  },
  '西南地区': {
    code: '023/028/0851',
    cities: ['重庆 023', '成都 028', '贵阳 0851', '昆明 0871']
  },
  '西北地区': {
    code: '029/0931/0951',
    cities: ['西安 029', '兰州 0931', '银川 0951', '西宁 0971', '乌鲁木齐 0991']
  },
  '东北地区': {
    code: '024/0431/0451',
    cities: ['沈阳 024', '长春 0431', '哈尔滨 0451', '大连 0411']
  },
}

const PhoneNumberTool: React.FC = () => {
  const tool = getToolById('phonenumber')
  const [selectedRegion, setSelectedRegion] = useState<string>('')

  if (!tool) return null

  const regions = Object.keys(phoneAreaData)

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div>
          <div className="text-sm text-gray-600 mb-3">选择地区</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-3 rounded-lg border transition-colors text-sm ${
                  selectedRegion === region
                    ? 'border-[#3b6de3] bg-[#3b6de3] text-white'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {selectedRegion && phoneAreaData[selectedRegion] && (
          <div className="p-6 rounded-xl border border-gray-100 bg-gray-50">
            <div className="text-lg font-semibold text-gray-900 mb-4">
              {selectedRegion}电话区号
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {phoneAreaData[selectedRegion].cities.map((cityInfo, index) => (
                <div key={index} className="p-4 bg-white rounded-lg border border-gray-100">
                  <div className="text-sm text-gray-700">{cityInfo}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default PhoneNumberTool
