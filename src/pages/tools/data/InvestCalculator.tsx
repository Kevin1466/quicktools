import { useState } from 'react';
import ToolPageTemplate from '@/components/common/ToolPageTemplate';
import { getToolById } from '@/data/toolsFromJson';

const InvestCalculator: React.FC = () => {
  const tool = getToolById('invest');
  const [principal, setPrincipal] = useState<string>('10000');
  const [rate, setRate] = useState<string>('5');
  const [period, setPeriod] = useState<string>('1');
  const [periodUnit, setPeriodUnit] = useState<string>('year');
  const [result, setResult] = useState<{
    profit: number;
    totalAmount: number;
  } | null>(null);

  const calculate = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    let n = parseFloat(period);
    
    if (periodUnit === 'month') {
      n = n / 12;
    } else if (periodUnit === 'day') {
      n = n / 365;
    }

    const totalAmount = p * Math.pow(1 + r, n);
    const profit = totalAmount - p;

    setResult({
      profit: Math.round(profit),
      totalAmount: Math.round(totalAmount),
    });
  };

  const clear = () => {
    setPrincipal('10000');
    setRate('5');
    setPeriod('1');
    setPeriodUnit('year');
    setResult(null);
  };

  if (!tool) return null;

  return (
    <ToolPageTemplate tool={tool}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">投资收益计算器</h2>

          {/* 输入参数 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">投资本金</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3]"
                  min="0"
                />
                <span className="text-gray-500 w-12">元</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">年化收益率</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3]"
                  min="0"
                  step="0.01"
                />
                <span className="text-gray-500 w-12">%</span>
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">投资期限</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3]"
                    min="0"
                  />
                  <select
                    value={periodUnit}
                    onChange={(e) => setPeriodUnit(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3]"
                  >
                    <option value="year">年</option>
                    <option value="month">月</option>
                    <option value="day">天</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            <button
              onClick={calculate}
              className="flex-1 py-3 bg-[#3b6de3] text-white rounded-lg hover:bg-[#2a5bc7] transition-colors font-medium"
            >
              开始计算
            </button>
            <button
              onClick={clear}
              className="flex-1 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              清空
            </button>
          </div>

          {/* 计算结果 */}
          {result && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-sm text-gray-600 mb-1">投资收益</div>
                  <div className="text-2xl font-bold text-green-600">
                    ¥{result.profit.toLocaleString()} 元
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">本金加收益</div>
                  <div className="text-2xl font-bold text-blue-600">
                    ¥{result.totalAmount.toLocaleString()} 元
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolPageTemplate>
  );
};

export default InvestCalculator;
