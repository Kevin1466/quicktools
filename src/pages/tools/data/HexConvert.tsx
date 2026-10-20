import { useState, useEffect } from 'react';
import ToolPageTemplate from '@/components/common/ToolPageTemplate';
import { getToolById } from '@/data/toolsFromJson';

const HexConvert: React.FC = () => {
  const tool = getToolById('hexconvert');
  const [binary, setBinary] = useState<string>('0');
  const [octal, setOctal] = useState<string>('0');
  const [decimal, setDecimal] = useState<string>('0');
  const [hexadecimal, setHexadecimal] = useState<string>('0');
  const [activeInput, setActiveInput] = useState<string>('decimal');

  useEffect(() => {
    if (activeInput === 'decimal') {
      const dec = parseInt(decimal, 10);
      if (!isNaN(dec)) {
        setBinary(dec.toString(2));
        setOctal(dec.toString(8));
        setHexadecimal(dec.toString(16).toUpperCase());
      }
    }
  }, [decimal, activeInput]);

  useEffect(() => {
    if (activeInput === 'binary') {
      const bin = parseInt(binary, 2);
      if (!isNaN(bin)) {
        setDecimal(bin.toString(10));
        setOctal(bin.toString(8));
        setHexadecimal(bin.toString(16).toUpperCase());
      }
    }
  }, [binary, activeInput]);

  useEffect(() => {
    if (activeInput === 'octal') {
      const oct = parseInt(octal, 8);
      if (!isNaN(oct)) {
        setDecimal(oct.toString(10));
        setBinary(oct.toString(2));
        setHexadecimal(oct.toString(16).toUpperCase());
      }
    }
  }, [octal, activeInput]);

  useEffect(() => {
    if (activeInput === 'hexadecimal') {
      const hex = parseInt(hexadecimal, 16);
      if (!isNaN(hex)) {
        setDecimal(hex.toString(10));
        setBinary(hex.toString(2));
        setOctal(hex.toString(8));
      }
    }
  }, [hexadecimal, activeInput]);

  if (!tool) return null;

  return (
    <ToolPageTemplate tool={tool}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">进制转换</h2>
          
          <div className="space-y-6">
            {/* 十进制 */}
            <div className="flex items-center gap-4">
              <label className="w-24 text-sm font-medium text-gray-700">十进制</label>
              <input
                type="text"
                value={decimal}
                onChange={(e) => {
                  setActiveInput('decimal');
                  setDecimal(e.target.value);
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3] focus:border-transparent"
                placeholder="输入十进制数"
              />
            </div>

            {/* 二进制 */}
            <div className="flex items-center gap-4">
              <label className="w-24 text-sm font-medium text-gray-700">二进制</label>
              <input
                type="text"
                value={binary}
                onChange={(e) => {
                  setActiveInput('binary');
                  setBinary(e.target.value);
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3] focus:border-transparent font-mono"
                placeholder="输入二进制数"
              />
            </div>

            {/* 八进制 */}
            <div className="flex items-center gap-4">
              <label className="w-24 text-sm font-medium text-gray-700">八进制</label>
              <input
                type="text"
                value={octal}
                onChange={(e) => {
                  setActiveInput('octal');
                  setOctal(e.target.value);
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3] focus:border-transparent"
                placeholder="输入八进制数"
              />
            </div>

            {/* 十六进制 */}
            <div className="flex items-center gap-4">
              <label className="w-24 text-sm font-medium text-gray-700">十六进制</label>
              <input
                type="text"
                value={hexadecimal}
                onChange={(e) => {
                  setActiveInput('hexadecimal');
                  setHexadecimal(e.target.value.toUpperCase());
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3] focus:border-transparent font-mono"
                placeholder="输入十六进制数"
              />
            </div>
          </div>

          {/* 常用数值参考 */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-4">常用数值参考</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">零</div>
                <div className="text-sm font-medium text-gray-900">0</div>
                <div className="text-xs text-gray-400">0b0 | 0x0</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">一</div>
                <div className="text-sm font-medium text-gray-900">1</div>
                <div className="text-xs text-gray-400">0b1 | 0x1</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">十</div>
                <div className="text-sm font-medium text-gray-900">10</div>
                <div className="text-xs text-gray-400">0b1010 | 0xA</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">一百</div>
                <div className="text-sm font-medium text-gray-900">100</div>
                <div className="text-xs text-gray-400">0b1100100 | 0x64</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  );
};

export default HexConvert;