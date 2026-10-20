import { useState, useEffect } from 'react';
import ToolPageTemplate from '@/components/common/ToolPageTemplate';
import { getToolById } from '@/data/toolsFromJson';

const TemperatureConvert: React.FC = () => {
  const tool = getToolById('temperaturetrans');
  const [celsius, setCelsius] = useState<string>('0');
  const [fahrenheit, setFahrenheit] = useState<string>('32');
  const [kelvin, setKelvin] = useState<string>('273.15');

  useEffect(() => {
    // 当摄氏度变化时，更新其他单位
    const c = parseFloat(celsius);
    if (!isNaN(c)) {
      setFahrenheit((c * 9 / 5 + 32).toFixed(2));
      setKelvin((c + 273.15).toFixed(2));
    }
  }, [celsius]);

  const handleCelsiusChange = (value: string) => {
    setCelsius(value);
  };

  const handleFahrenheitChange = (value: string) => {
    setFahrenheit(value);
    const f = parseFloat(value);
    if (!isNaN(f)) {
      const c = (f - 32) * 5 / 9;
      setCelsius(c.toFixed(2));
      setKelvin((c + 273.15).toFixed(2));
    }
  };

  const handleKelvinChange = (value: string) => {
    setKelvin(value);
    const k = parseFloat(value);
    if (!isNaN(k)) {
      const c = k - 273.15;
      setCelsius(c.toFixed(2));
      setFahrenheit((c * 9 / 5 + 32).toFixed(2));
    }
  };

  if (!tool) return null;

  return (
    <ToolPageTemplate tool={tool}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">温度换算</h2>
          
          <div className="space-y-6">
            {/* 摄氏度 */}
            <div className="flex items-center gap-4">
              <label className="w-24 text-sm font-medium text-gray-700">摄氏度 (°C)</label>
              <input
                type="number"
                value={celsius}
                onChange={(e) => handleCelsiusChange(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3] focus:border-transparent"
                placeholder="输入摄氏度"
              />
            </div>

            {/* 华氏度 */}
            <div className="flex items-center gap-4">
              <label className="w-24 text-sm font-medium text-gray-700">华氏度 (°F)</label>
              <input
                type="number"
                value={fahrenheit}
                onChange={(e) => handleFahrenheitChange(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3] focus:border-transparent"
                placeholder="输入华氏度"
              />
            </div>

            {/* 开尔文 */}
            <div className="flex items-center gap-4">
              <label className="w-24 text-sm font-medium text-gray-700">开尔文 (K)</label>
              <input
                type="number"
                value={kelvin}
                onChange={(e) => handleKelvinChange(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3] focus:border-transparent"
                placeholder="输入开尔文"
              />
            </div>
          </div>

          {/* 常用温度参考 */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-4">常用温度参考</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">绝对零度</div>
                <div className="text-sm font-medium text-gray-900">-273.15°C</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">水的冰点</div>
                <div className="text-sm font-medium text-gray-900">0°C</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">人体体温</div>
                <div className="text-sm font-medium text-gray-900">37°C</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">水的沸点</div>
                <div className="text-sm font-medium text-gray-900">100°C</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  );
};

export default TemperatureConvert;