import { useState } from 'react';
import ToolPageTemplate from '@/components/common/ToolPageTemplate';
import { getToolById } from '@/data/toolsFromJson';

const SocialInsuranceCalculator: React.FC = () => {
  const tool = getToolById('wuxianyijin');
  const [salary, setSalary] = useState<string>('10000');
  const [socialBase, setSocialBase] = useState<string>('10000');
  const [housingBase, setHousingBase] = useState<string>('10000');
  const [includeHousing, setIncludeHousing] = useState<boolean>(true);
  const [housingRate, setHousingRate] = useState<string>('0.12');
  const [result, setResult] = useState<{
    pension: { personal: number; company: number };
    medical: { personal: number; company: number };
    unemployment: { personal: number; company: number };
    injury: { personal: number; company: number };
    maternity: { personal: number; company: number };
    housing: { personal: number; company: number };
    personalTotal: number;
    companyTotal: number;
    grossSalary: number;
    tax: number;
    netSalary: number;
  } | null>(null);

  const calculateTax = (taxableIncome: number): number => {
    if (taxableIncome <= 0) return 0;

    const taxBrackets = [
      { threshold: 3000, rate: 0.03, quick: 0 },
      { threshold: 12000, rate: 0.1, quick: 210 },
      { threshold: 25000, rate: 0.2, quick: 1410 },
      { threshold: 35000, rate: 0.25, quick: 2660 },
      { threshold: 55000, rate: 0.3, quick: 4410 },
      { threshold: 80000, rate: 0.35, quick: 7160 },
      { threshold: Infinity, rate: 0.45, quick: 15160 }
    ];

    for (let i = 0; i < taxBrackets.length; i++) {
      if (taxableIncome <= taxBrackets[i].threshold) {
        return Math.round(taxableIncome * taxBrackets[i].rate - taxBrackets[i].quick);
      }
    }
    return 0;
  };

  const calculate = () => {
    const s = parseFloat(salary);
    const sb = parseFloat(socialBase);
    const hb = parseFloat(housingBase);
    const hr = parseFloat(housingRate);

    // 帮小忙的标准社保公积金缴纳比例
    const pensionPersonal = sb * 0.08;
    const pensionCompany = sb * 0.16;
    const medicalPersonal = sb * 0.02;
    const medicalCompany = sb * 0.09;
    const unemploymentPersonal = sb * 0.01;
    const unemploymentCompany = sb * 0.008;
    const injuryCompany = sb * 0.003;
    const maternityCompany = sb * 0.008;

    let housingPersonal = 0;
    let housingCompany = 0;
    if (includeHousing) {
      housingPersonal = hb * hr;
      housingCompany = hb * hr;
    }

    const personalTotal = pensionPersonal + medicalPersonal + unemploymentPersonal + housingPersonal;
    const companyTotal = pensionCompany + medicalCompany + unemploymentCompany + injuryCompany + maternityCompany + housingCompany;

    const taxableIncome = s - personalTotal - 5000;
    const tax = calculateTax(taxableIncome);

    setResult({
      pension: { personal: pensionPersonal, company: pensionCompany },
      medical: { personal: medicalPersonal, company: medicalCompany },
      unemployment: { personal: unemploymentPersonal, company: unemploymentCompany },
      injury: { personal: 0, company: injuryCompany },
      maternity: { personal: 0, company: maternityCompany },
      housing: { personal: housingPersonal, company: housingCompany },
      personalTotal,
      companyTotal,
      grossSalary: s,
      tax,
      netSalary: s - personalTotal - tax
    });
  };

  if (!tool) return null;

  return (
    <ToolPageTemplate tool={tool}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">五险一金计算器</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">税前月薪</label>
              <input
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3]"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">社保基数</label>
              <input
                type="number"
                value={socialBase}
                onChange={(e) => setSocialBase(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3]"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">公积金基数</label>
              <input
                type="number"
                value={housingBase}
                onChange={(e) => setHousingBase(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3]"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">缴纳公积金</label>
              <select
                value={includeHousing ? 'yes' : 'no'}
                onChange={(e) => setIncludeHousing(e.target.value === 'yes')}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3]"
              >
                <option value="yes">是</option>
                <option value="no">否</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">公积金比例</label>
              <select
                value={housingRate}
                onChange={(e) => setHousingRate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3]"
              >
                <option value="0.05">5%</option>
                <option value="0.07">7%</option>
                <option value="0.08">8%</option>
                <option value="0.10">10%</option>
                <option value="0.12">12%</option>
              </select>
            </div>
          </div>

          <button
            onClick={calculate}
            className="w-full py-3 bg-[#3b6de3] text-white rounded-lg hover:bg-[#2a5bc7] transition-colors font-medium mb-8"
          >
            计算
          </button>

          {result && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
                  <div className="text-sm text-gray-600 mb-1">税前工资</div>
                  <div className="text-2xl font-bold text-gray-900">¥{result.grossSalary.toLocaleString()}</div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 text-center">
                  <div className="text-sm text-gray-600 mb-1">五险一金</div>
                  <div className="text-2xl font-bold text-gray-900">¥{result.personalTotal.toLocaleString()}</div>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 text-center">
                  <div className="text-sm text-gray-600 mb-1">个人所得税</div>
                  <div className="text-2xl font-bold text-gray-900">¥{result.tax.toLocaleString()}</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 text-center">
                <div className="text-lg text-gray-600 mb-2">税后工资</div>
                <div className="text-4xl font-bold text-gray-900">¥{result.netSalary.toLocaleString()}</div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">缴费明细</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">养老保险</span>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        个人: ¥{result.pension.personal.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        单位: ¥{result.pension.company.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">医疗保险</span>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        个人: ¥{result.medical.personal.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        单位: ¥{result.medical.company.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">失业保险</span>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        个人: ¥{result.unemployment.personal.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        单位: ¥{result.unemployment.company.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">工伤保险</span>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">个人: ¥0</div>
                      <div className="text-sm text-gray-500">
                        单位: ¥{result.injury.company.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">生育保险</span>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">个人: ¥0</div>
                      <div className="text-sm text-gray-500">
                        单位: ¥{result.maternity.company.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">住房公积金</span>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        个人: ¥{result.housing.personal.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        单位: ¥{result.housing.company.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-blue-50 rounded-lg px-4">
                    <span className="font-semibold text-gray-900">合计</span>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-700">
                        个人: ¥{result.personalTotal.toLocaleString()}
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        单位: ¥{result.companyTotal.toLocaleString()}
                      </div>
                    </div>
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

export default SocialInsuranceCalculator;
