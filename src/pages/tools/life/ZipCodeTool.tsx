import { useState } from 'react'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'

const zipCodeData: Record<string, { city: string; code: string; districts: Record<string, string> }> = {
  '北京': {
    city: '北京',
    code: '010',
    districts: {
      '东城区': '100010',
      '西城区': '100032',
      '朝阳区': '100020',
      '海淀区': '100080',
      '丰台区': '100071',
      '石景山区': '100043',
    }
  },
  '上海': {
    city: '上海',
    code: '021',
    districts: {
      '黄浦区': '200001',
      '徐汇区': '200030',
      '长宁区': '200050',
      '静安区': '200040',
      '普陀区': '200333',
      '虹口区': '200080',
    }
  },
  '广东': {
    city: '广东',
    code: '020',
    districts: {
      '广州市': '510000',
      '深圳市': '518000',
      '珠海市': '519000',
      '佛山市': '528000',
      '东莞市': '523000',
      '中山市': '528400',
    }
  },
}

const ZipCodeTool: React.FC = () => {
  const tool = getToolById('zipcode')
  const [selectedProvince, setSelectedProvince] = useState<string>('')

  if (!tool) return null

  const provinces = Object.keys(zipCodeData)

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div>
          <div className="text-sm text-gray-600 mb-3">选择省份/直辖市</div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {provinces.map((province) => (
              <button
                key={province}
                onClick={() => setSelectedProvince(province)}
                className={`px-4 py-3 rounded-lg border transition-colors text-sm ${
                  selectedProvince === province
                    ? 'border-[#3b6de3] bg-[#3b6de3] text-white'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {province}
              </button>
            ))}
          </div>
        </div>

        {selectedProvince && zipCodeData[selectedProvince] && (
          <div className="p-6 rounded-xl border border-gray-100 bg-gray-50">
            <div className="text-lg font-semibold text-gray-900 mb-4">
              {zipCodeData[selectedProvince].city}邮编查询
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(zipCodeData[selectedProvince].districts).map(([district, code]) => (
                <div key={district} className="p-4 bg-white rounded-lg border border-gray-100">
                  <div className="text-sm text-gray-600">{district}</div>
                  <div className="text-xl font-bold text-[#3b6de3] mt-1">{code}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default ZipCodeTool
