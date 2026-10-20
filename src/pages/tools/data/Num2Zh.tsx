import { useState, useEffect } from 'react';
import ToolPageTemplate from '@/components/common/ToolPageTemplate';
import { getToolById } from '@/data/toolsFromJson';

// 数字转中文大写
const numberToChinese = (num: number): string => {
  if (num === 0) return '零';
  
  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const units = ['', '拾', '佰', '仟'];
  const bigUnits = ['', '万', '亿', '万亿'];
  
  let result = '';
  let groupIndex = 0;
  
  while (num > 0) {
    const group = num % 10000;
    if (group !== 0) {
      let groupStr = '';
      let temp = group;
      let unitIndex = 0;
      let zeroFlag = false;
      
      while (temp > 0) {
        const digit = temp % 10;
        if (digit === 0) {
          if (!zeroFlag && groupStr !== '') {
            groupStr = digits[0] + groupStr;
            zeroFlag = true;
          }
        } else {
          groupStr = digits[digit] + units[unitIndex] + groupStr;
          zeroFlag = false;
        }
        temp = Math.floor(temp / 10);
        unitIndex++;
      }
      
      result = groupStr + bigUnits[groupIndex] + result;
    } else if (result !== '' && !result.startsWith('零')) {
      result = '零' + result;
    }
    
    num = Math.floor(num / 10000);
    groupIndex++;
  }
  
  // 清理多余的零
  result = result.replace(/零+/g, '零');
  result = result.replace(/零([万亿])/g, '$1');
  result = result.replace(/^零/, '');
  result = result.replace(/零$/, '');
  
  return result || '零';
};

// 数字转中文大写金额
const numberToChineseMoney = (num: number): string => {
  if (num === 0) return '零元整';
  if (num < 0) return '负' + numberToChineseMoney(-num);
  
  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);
  
  let result = numberToChinese(integerPart) + '元';
  
  if (decimalPart === 0) {
    result += '整';
  } else {
    const jiao = Math.floor(decimalPart / 10);
    const fen = decimalPart % 10;
    
    if (jiao > 0) {
      result += numberToChinese(jiao) + '角';
    }
    if (fen > 0) {
      result += numberToChinese(fen) + '分';
    }
  }
  
  return result;
};

const Num2Zh: React.FC = () => {
  const tool = getToolById('num2zh');
  const [input, setInput] = useState<string>('123456789');
  const [chineseNum, setChineseNum] = useState<string>('');
  const [chineseMoney, setChineseMoney] = useState<string>('');

  useEffect(() => {
    const num = parseFloat(input);
    if (!isNaN(num)) {
      setChineseNum(numberToChinese(Math.floor(num)));
      setChineseMoney(numberToChineseMoney(num));
    } else {
      setChineseNum('');
      setChineseMoney('');
    }
  }, [input]);

  if (!tool) return null;

  return (
    <ToolPageTemplate tool={tool}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">数字转中文大写</h2>

          {/* 输入 */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">输入数字</label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3] text-lg"
              placeholder="请输入数字"
            />
          </div>

          {/* 转换结果 */}
          <div className="space-y-6">
            {/* 中文数字 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <div className="text-sm text-gray-600 mb-2">中文大写数字</div>
              <div className="text-3xl font-bold text-gray-900 break-all">{chineseNum || '-'}</div>
            </div>

            {/* 中文金额 */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
              <div className="text-sm text-gray-600 mb-2">中文大写金额</div>
              <div className="text-2xl font-bold text-gray-900 break-all">{chineseMoney || '-'}</div>
            </div>
          </div>

          {/* 常用数字参考 */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-4">常用数字参考</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { num: '0', chinese: '零', money: '零元整' },
                { num: '1', chinese: '壹', money: '壹元整' },
                { num: '10', chinese: '拾', money: '拾元整' },
                { num: '100', chinese: '壹佰', money: '壹佰元整' },
                { num: '1000', chinese: '壹仟', money: '壹仟元整' },
                { num: '10000', chinese: '壹万', money: '壹万元整' },
                { num: '100000000', chinese: '壹亿', money: '壹亿元整' },
                { num: '1688.88', chinese: '壹仟陆佰捌拾捌', money: '壹仟陆佰捌拾捌元捌角捌分' },
              ].map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">{item.num}</div>
                  <div className="text-sm font-medium text-gray-900">{item.chinese}</div>
                  <div className="text-xs text-gray-400 mt-1 truncate">{item.money}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  );
};

export default Num2Zh;