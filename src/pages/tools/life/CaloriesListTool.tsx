import { useState } from 'react'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'

interface FoodItem {
  name: string
  calories: number
  protein: number
  fat: number
  carbs: number
}

const caloriesData: Record<string, FoodItem[]> = {
  '主食类': [
    { name: '米饭', calories: 116, protein: 2.6, fat: 0.3, carbs: 25.6 },
    { name: '面条', calories: 284, protein: 8.5, fat: 1.6, carbs: 61.9 },
    { name: '馒头', calories: 221, protein: 7.0, fat: 1.1, carbs: 45.7 },
    { name: '面包', calories: 312, protein: 8.3, fat: 5.1, carbs: 58.6 },
    { name: '饺子', calories: 240, protein: 10.5, fat: 16.0, carbs: 18.0 },
  ],
  '蔬菜类': [
    { name: '白菜', calories: 17, protein: 1.5, fat: 0.1, carbs: 3.2 },
    { name: '菠菜', calories: 24, protein: 2.6, fat: 0.3, carbs: 4.5 },
    { name: '西红柿', calories: 20, protein: 0.9, fat: 0.2, carbs: 4.0 },
    { name: '黄瓜', calories: 16, protein: 0.8, fat: 0.2, carbs: 2.9 },
    { name: '胡萝卜', calories: 41, protein: 1.0, fat: 0.2, carbs: 8.8 },
  ],
  '肉类': [
    { name: '猪肉', calories: 395, protein: 13.2, fat: 37.0, carbs: 2.4 },
    { name: '牛肉', calories: 125, protein: 22.3, fat: 4.2, carbs: 0.0 },
    { name: '鸡肉', calories: 167, protein: 19.3, fat: 9.4, carbs: 1.3 },
    { name: '鱼肉', calories: 105, protein: 20.0, fat: 3.0, carbs: 0.0 },
    { name: '羊肉', calories: 203, protein: 19.0, fat: 14.1, carbs: 0.0 },
  ],
  '水果类': [
    { name: '苹果', calories: 52, protein: 0.2, fat: 0.2, carbs: 13.8 },
    { name: '香蕉', calories: 93, protein: 1.4, fat: 0.2, carbs: 22.0 },
    { name: '橙子', calories: 47, protein: 0.8, fat: 0.2, carbs: 11.1 },
    { name: '葡萄', calories: 44, protein: 0.4, fat: 0.2, carbs: 10.3 },
    { name: '西瓜', calories: 26, protein: 0.6, fat: 0.1, carbs: 5.8 },
  ],
  '蛋奶类': [
    { name: '牛奶', calories: 54, protein: 3.0, fat: 3.2, carbs: 3.4 },
    { name: '鸡蛋', calories: 144, protein: 12.8, fat: 9.9, carbs: 1.5 },
    { name: '酸奶', calories: 72, protein: 2.5, fat: 2.7, carbs: 9.3 },
    { name: '奶酪', calories: 328, protein: 25.7, fat: 23.5, carbs: 3.5 },
  ],
}

const CaloriesListTool: React.FC = () => {
  const tool = getToolById('calories_list')
  const [selectedCategory, setSelectedCategory] = useState<string>('主食类')

  if (!tool) return null

  const categories = Object.keys(caloriesData)

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div>
          <div className="text-sm text-gray-600 mb-3">选择食物类别</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-3 rounded-lg border transition-colors text-sm ${
                  selectedCategory === category
                    ? 'border-[#3b6de3] bg-[#3b6de3] text-white'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {selectedCategory && caloriesData[selectedCategory] && (
          <div className="p-6 rounded-xl border border-gray-100 bg-gray-50">
            <div className="text-lg font-semibold text-gray-900 mb-4">
              {selectedCategory}食物热量表 (每100克)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white">
                    <th className="px-4 py-3 text-left font-medium text-gray-700 rounded-tl-lg">
                      食物名称
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">
                      热量 (kcal)
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">
                      蛋白质 (g)
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">
                      脂肪 (g)
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 rounded-tr-lg">
                      碳水 (g)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {caloriesData[selectedCategory].map((food, index) => (
                    <tr key={index} className="bg-white">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {food.name}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{food.calories}</td>
                      <td className="px-4 py-3 text-gray-700">{food.protein}</td>
                      <td className="px-4 py-3 text-gray-700">{food.fat}</td>
                      <td className="px-4 py-3 text-gray-700">{food.carbs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default CaloriesListTool
