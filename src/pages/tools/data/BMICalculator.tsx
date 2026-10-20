import { useState, useEffect } from 'react';
import ToolPageTemplate from '@/components/common/ToolPageTemplate';
import { getToolById } from '@/data/toolsFromJson';

const BMICalculator: React.FC = () => {
  const tool = getToolById('bmi');
  const [height, setHeight] = useState<string>('170');
  const [weight, setWeight] = useState<string>('65');
  const [bmi, setBmi] = useState<number>(0);
  const [category, setCategory] = useState<string>('');
  const [categoryColor, setCategoryColor] = useState<string>('');

  useEffect(() => {
    const h = parseFloat(height) / 100; // 转换为米
    const w = parseFloat(weight);
    if (h > 0 && w > 0) {
      const bmiValue = w / (h * h);
      setBmi(parseFloat(bmiValue.toFixed(1)));
      
      // 判断BMI分类
      if (bmiValue < 18.5) {
        setCategory('偏瘦');
        setCategoryColor('text-blue-500');
      } else if (bmiValue < 24) {
        setCategory('正常');
        setCategoryColor('text-green-500');
      } else if (bmiValue < 28) {
        setCategory('偏胖');
        setCategoryColor('text-orange-500');
      } else {
        setCategory('肥胖');
        setCategoryColor('text-red-500');
      }
    }
  }, [height, weight]);

  if (!tool) return null;

  return (
    <ToolPageTemplate tool={tool}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">BMI 计算器</h2>
          
          <div className="space-y-6">
            {/* 身高 */}
            <div className="flex items-center gap-4">
              <label className="w-24 text-sm font-medium text-gray-700">身高</label>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3] focus:border-transparent"
                  placeholder="输入身高"
                  min="1"
                />
                <span className="text-sm text-gray-500 w-12">厘米</span>
              </div>
            </div>

            {/* 体重 */}
            <div className="flex items-center gap-4">
              <label className="w-24 text-sm font-medium text-gray-700">体重</label>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3] focus:border-transparent"
                  placeholder="输入体重"
                  min="1"
                />
                <span className="text-sm text-gray-500 w-12">千克</span>
              </div>
            </div>
          </div>

          {/* BMI 结果 */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">您的 BMI 指数</div>
              <div className="text-5xl font-bold text-gray-900 mb-2">{bmi}</div>
              <div className={`text-lg font-medium ${categoryColor}`}>{category}</div>
            </div>
          </div>

          {/* BMI 参考标准 */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-sm font-medium text-blue-700">偏瘦</div>
              <div className="text-xs text-blue-600 mt-1">&lt; 18.5</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-sm font-medium text-green-700">正常</div>
              <div className="text-xs text-green-600 mt-1">18.5 - 23.9</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-sm font-medium text-orange-700">偏胖</div>
              <div className="text-xs text-orange-600 mt-1">24 - 27.9</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-sm font-medium text-red-700">肥胖</div>
              <div className="text-xs text-red-600 mt-1">≥ 28</div>
            </div>
          </div>

          {/* 说明 */}
          <div className="mt-6 text-xs text-gray-500">
            <p>BMI（身体质量指数）是国际上常用的衡量人体胖瘦程度的标准。计算公式为：体重（kg）÷ 身高²（m²）</p>
            <p className="mt-1">注：BMI 仅作为参考，实际健康状况还需结合体脂率、腰围等其他指标综合判断。</p>
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  );
};

export default BMICalculator;