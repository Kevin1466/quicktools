import { useState } from 'react';
import ToolPageTemplate from '@/components/common/ToolPageTemplate';
import { getToolById } from '@/data/toolsFromJson';

const DateCalculator: React.FC = () => {
  const tool = getToolById('datecal');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>('');
  const [days, setDays] = useState<string>('7');
  const [calcMode, setCalcMode] = useState<'diff' | 'add' | 'sub'>('diff');
  const [result, setResult] = useState<{
    days: number;
    weeks: number;
    weekdays: number;
    resultDate?: string;
  } | null>(null);

  const calculate = () => {
    const start = new Date(startDate);
    
    if (calcMode === 'diff' && endDate) {
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // 计算工作日（简化版，不考虑节假日）
      let weekdays = 0;
      for (let i = 0; i < diffDays; i++) {
        const day = new Date(start);
        day.setDate(day.getDate() + i);
        const dayOfWeek = day.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          weekdays++;
        }
      }
      
      setResult({
        days: diffDays,
        weeks: Math.floor(diffDays / 7),
        weekdays,
      });
    } else if (calcMode === 'add') {
      const numDays = parseInt(days, 10);
      const resultDate = new Date(start);
      resultDate.setDate(resultDate.getDate() + numDays);
      
      setResult({
        days: numDays,
        weeks: Math.floor(numDays / 7),
        weekdays: 0,
        resultDate: resultDate.toISOString().split('T')[0],
      });
    } else if (calcMode === 'sub') {
      const numDays = parseInt(days, 10);
      const resultDate = new Date(start);
      resultDate.setDate(resultDate.getDate() - numDays);
      
      setResult({
        days: numDays,
        weeks: Math.floor(numDays / 7),
        weekdays: 0,
        resultDate: resultDate.toISOString().split('T')[0],
      });
    }
  };

  if (!tool) return null;

  return (
    <ToolPageTemplate tool={tool}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">日期计算器</h2>

          {/* 计算模式 */}
          <div className="flex gap-4 mb-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={calcMode === 'diff'}
                onChange={() => setCalcMode('diff')}
                className="text-[#3b6de3]"
              />
              <span className="text-sm">计算日期间隔</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={calcMode === 'add'}
                onChange={() => setCalcMode('add')}
                className="text-[#3b6de3]"
              />
              <span className="text-sm">日期往后推算</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={calcMode === 'sub'}
                onChange={() => setCalcMode('sub')}
                className="text-[#3b6de3]"
              />
              <span className="text-sm">日期往前推算</span>
            </label>
          </div>

          {/* 输入区域 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {calcMode === 'diff' ? '开始日期' : '起始日期'}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3]"
              />
            </div>

            {calcMode === 'diff' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">结束日期</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3]"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">天数</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3]"
                    min="1"
                  />
                  <span className="text-gray-500 w-12">天</span>
                </div>
              </div>
            )}
          </div>

          {/* 计算按钮 */}
          <button
            onClick={calculate}
            className="w-full py-3 bg-[#3b6de3] text-white rounded-lg hover:bg-[#2a5bc7] transition-colors font-medium mb-8"
          >
            计算
          </button>

          {/* 结果 */}
          {result && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              {calcMode === 'diff' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">相差天数</div>
                    <div className="text-2xl font-bold text-gray-900">{result.days}天</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">相差周数</div>
                    <div className="text-2xl font-bold text-[#3b6de3]">{result.weeks}周</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">工作日（不含周末）</div>
                    <div className="text-2xl font-bold text-green-600">{result.weekdays}天</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">月份跨度</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.floor(result.days / 30)}个月
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">
                    {calcMode === 'add' ? '推算结果日期' : '往前推算日期'}
                  </div>
                  <div className="text-3xl font-bold text-[#3b6de3] mb-4">{result.resultDate}</div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-gray-500">总天数</div>
                      <div className="text-lg font-semibold">{result.days}天</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">总周数</div>
                      <div className="text-lg font-semibold">{result.weeks}周</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">月份数</div>
                      <div className="text-lg font-semibold">约{Math.floor(result.days / 30)}个月</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ToolPageTemplate>
  );
};

export default DateCalculator;