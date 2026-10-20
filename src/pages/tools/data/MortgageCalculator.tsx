import { useState, useEffect } from 'react';
import ToolPageTemplate from '@/components/common/ToolPageTemplate';
import { getToolById } from '@/data/toolsFromJson';

const MortgageCalculator: React.FC = () => {
  const tool = getToolById('mortgage');
  const [loanAmount, setLoanAmount] = useState<string>('100');
  const [loanTerm, setLoanTerm] = useState<string>('30');
  const [interestRate, setInterestRate] = useState<string>('3.8');
  const [repaymentMethod, setRepaymentMethod] = useState<'equal-payment' | 'equal-principal'>('equal-payment');
  
  const [result, setResult] = useState<{
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
    monthlyData: { month: number; payment: number; principal: number; interest: number; balance: number }[];
  } | null>(null);

  useEffect(() => {
    const principal = parseFloat(loanAmount) * 10000;
    const years = parseInt(loanTerm);
    const months = years * 12;
    const annualRate = parseFloat(interestRate) / 100;
    const monthlyRate = annualRate / 12;

    if (principal > 0 && months > 0 && monthlyRate >= 0) {
      let monthlyPayment = 0;
      let totalPayment = 0;
      let totalInterest = 0;
      const monthlyData: { month: number; payment: number; principal: number; interest: number; balance: number }[] = [];

      if (repaymentMethod === 'equal-payment') {
        // 等额本息
        monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        totalPayment = monthlyPayment * months;
        totalInterest = totalPayment - principal;

        let balance = principal;
        for (let i = 1; i <= months; i++) {
          const interest = balance * monthlyRate;
          const principalPaid = monthlyPayment - interest;
          balance -= principalPaid;
          monthlyData.push({
            month: i,
            payment: monthlyPayment,
            principal: principalPaid,
            interest,
            balance: Math.max(0, balance)
          });
        }
      } else {
        // 等额本金
        const monthlyPrincipal = principal / months;
        let balance = principal;
        
        for (let i = 1; i <= months; i++) {
          const interest = balance * monthlyRate;
          const payment = monthlyPrincipal + interest;
          balance -= monthlyPrincipal;
          
          if (i === 1) monthlyPayment = payment;
          totalPayment += payment;
          totalInterest += interest;
          
          monthlyData.push({
            month: i,
            payment,
            principal: monthlyPrincipal,
            interest,
            balance: Math.max(0, balance)
          });
        }
      }

      setResult({ monthlyPayment, totalPayment, totalInterest, monthlyData });
    }
  }, [loanAmount, loanTerm, interestRate, repaymentMethod]);

  if (!tool) return null;

  return (
    <ToolPageTemplate tool={tool}>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">房贷计算器</h2>

          {/* 输入参数 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">贷款金额</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3]"
                  min="1"
                />
                <span className="text-gray-500 w-12">万元</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">贷款年限</label>
              <select
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3]"
              >
                <option value="5">5年（60期）</option>
                <option value="10">10年（120期）</option>
                <option value="15">15年（180期）</option>
                <option value="20">20年（240期）</option>
                <option value="25">25年（300期）</option>
                <option value="30">30年（360期）</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">年利率</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3]"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <span className="text-gray-500 w-12">%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">还款方式</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={repaymentMethod === 'equal-payment'}
                    onChange={() => setRepaymentMethod('equal-payment')}
                    className="text-[#3b6de3]"
                  />
                  <span className="text-sm">等额本息</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={repaymentMethod === 'equal-principal'}
                    onChange={() => setRepaymentMethod('equal-principal')}
                    className="text-[#3b6de3]"
                  />
                  <span className="text-sm">等额本金</span>
                </label>
              </div>
            </div>
          </div>

          {/* 计算结果 */}
          {result && (
            <div>
              {/* 汇总 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">贷款总额</div>
                    <div className="text-xl font-bold text-gray-900">
                      {(parseFloat(loanAmount)).toFixed(0)}万
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">{repaymentMethod === 'equal-payment' ? '每月还款' : '首月还款'}</div>
                    <div className="text-xl font-bold text-[#3b6de3]">
                      ¥{Math.round(result.monthlyPayment).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">支付利息</div>
                    <div className="text-xl font-bold text-orange-600">
                      ¥{(result.totalInterest / 10000).toFixed(2)}万
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">还款总额</div>
                    <div className="text-xl font-bold text-green-600">
                      ¥{(result.totalPayment / 10000).toFixed(2)}万
                    </div>
                  </div>
                </div>
              </div>

              {/* 还款计划表 */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">还款计划表（前12个月）</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-gray-600 font-medium">期数</th>
                        <th className="px-4 py-3 text-right text-gray-600 font-medium">月供</th>
                        <th className="px-4 py-3 text-right text-gray-600 font-medium">本金</th>
                        <th className="px-4 py-3 text-right text-gray-600 font-medium">利息</th>
                        <th className="px-4 py-3 text-right text-gray-600 font-medium">剩余本金</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.monthlyData.slice(0, 12).map((data) => (
                        <tr key={data.month} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-900">第 {data.month} 期</td>
                          <td className="px-4 py-3 text-right text-gray-900">
                            ¥{Math.round(data.payment).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right text-green-600">
                            ¥{Math.round(data.principal).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right text-orange-600">
                            ¥{Math.round(data.interest).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">
                            ¥{Math.round(data.balance).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {result.monthlyData.length > 12 && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    共 {result.monthlyData.length} 期，仅显示前 12 期
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolPageTemplate>
  );
};

export default MortgageCalculator;