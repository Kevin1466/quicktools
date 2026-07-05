import { useState } from 'react'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'

const hospitalData: Record<string, Array<{ name: string; level: string; location: string }>> = {
  '内科': [
    { name: '北京协和医院', level: '三甲', location: '北京市' },
    { name: '北京大学第一医院', level: '三甲', location: '北京市' },
    { name: '上海瑞金医院', level: '三甲', location: '上海市' },
    { name: '中山一院', level: '三甲', location: '广东省广州市' },
  ],
  '外科': [
    { name: '北京301医院', level: '三甲', location: '北京市' },
    { name: '积水潭医院', level: '三甲', location: '北京市' },
    { name: '上海华山医院', level: '三甲', location: '上海市' },
    { name: '中山一院', level: '三甲', location: '广东省广州市' },
  ],
  '儿科': [
    { name: '北京儿童医院', level: '三甲', location: '北京市' },
    { name: '上海儿童医学中心', level: '三甲', location: '上海市' },
    { name: '广州市妇女儿童医疗中心', level: '三甲', location: '广东省广州市' },
  ],
  '妇科': [
    { name: '北京妇产医院', level: '三甲', location: '北京市' },
    { name: '上海第一妇婴保健院', level: '三甲', location: '上海市' },
    { name: '广州市妇女儿童医疗中心', level: '三甲', location: '广东省广州市' },
  ],
  '骨科': [
    { name: '积水潭医院', level: '三甲', location: '北京市' },
    { name: '北京301医院', level: '三甲', location: '北京市' },
    { name: '上海六院', level: '三甲', location: '上海市' },
  ],
  '眼科': [
    { name: '北京同仁医院', level: '三甲', location: '北京市' },
    { name: '中山眼科中心', level: '三甲', location: '广东省广州市' },
    { name: '上海五官科医院', level: '三甲', location: '上海市' },
  ],
  '皮肤科': [
    { name: '上海华山医院', level: '三甲', location: '上海市' },
    { name: '北京协和医院', level: '三甲', location: '北京市' },
  ],
  '口腔科': [
    { name: '北京大学口腔医院', level: '三甲', location: '北京市' },
    { name: '上海第九人民医院', level: '三甲', location: '上海市' },
  ],
}

const HospitalRecommendTool: React.FC = () => {
  const tool = getToolById('hospitalrecommend')
  const [selectedDept, setSelectedDept] = useState<string>('')

  if (!tool) return null

  const departments = Object.keys(hospitalData)

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div>
          <div className="text-sm text-gray-600 mb-3">选择科室</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-4 py-3 rounded-lg border transition-colors text-sm ${
                  selectedDept === dept
                    ? 'border-[#3b6de3] bg-[#3b6de3] text-white'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {selectedDept && hospitalData[selectedDept] && (
          <div className="p-6 rounded-xl border border-gray-100 bg-gray-50">
            <div className="text-lg font-semibold text-gray-900 mb-4">
              {selectedDept}推荐医院
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hospitalData[selectedDept].map((hospital, index) => (
                <div
                  key={index}
                  className="p-4 bg-white rounded-lg border border-gray-100"
                >
                  <div className="text-lg font-bold text-gray-900 mb-2">
                    {hospital.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-[#3b6de3] text-white text-xs rounded-full">
                      {hospital.level}
                    </span>
                    <span className="text-sm text-gray-600">{hospital.location}</span>
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

export default HospitalRecommendTool
