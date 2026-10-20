import { useState, useEffect } from 'react';
import ToolPageTemplate from '@/components/common/ToolPageTemplate';
import { getToolById } from '@/data/toolsFromJson';

const TimestampConvert: React.FC = () => {
  const tool = getToolById('timestamp');
  const [timestamp, setTimestamp] = useState<string>(Math.floor(Date.now() / 1000).toString());
  const [dateTime, setDateTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [weekday, setWeekday] = useState<string>('');
  const [isoString, setIsoString] = useState<string>('');
  const [utcString, setUtcString] = useState<string>('');

  useEffect(() => {
    const ts = parseInt(timestamp, 10);
    if (!isNaN(ts) && ts > 0) {
      const date = new Date(ts * 1000);
      
      // 本地时间
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      setDateTime(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
      setDate(`${year}-${month}-${day}`);
      setTime(`${hours}:${minutes}:${seconds}`);
      
      // 星期
      const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      setWeekday(weekdays[date.getDay()]);
      
      // ISO 格式
      setIsoString(date.toISOString());
      
      // UTC 格式
      setUtcString(date.toUTCString());
    }
  }, [timestamp]);

  // 获取当前时间戳
  const handleGetCurrent = () => {
    setTimestamp(Math.floor(Date.now() / 1000).toString());
  };

  if (!tool) return null;

  return (
    <ToolPageTemplate tool={tool}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">时间戳转换</h2>
          
          {/* 时间戳输入 */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <label className="text-sm font-medium text-gray-700 w-20">时间戳</label>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3b6de3] focus:border-transparent"
                  placeholder="输入 Unix 时间戳（秒）"
                />
                <button
                  onClick={handleGetCurrent}
                  className="px-4 py-2 bg-[#3b6de3] text-white rounded-lg hover:bg-[#2a5bc7] transition-colors"
                >
                  获取当前
                </button>
              </div>
            </div>
          </div>

          {/* 转换结果 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 本地时间 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <div className="text-sm text-gray-600 mb-2">本地时间</div>
              <div className="text-2xl font-bold text-gray-900">{dateTime || '-'}</div>
              <div className="flex gap-4 mt-3 text-sm text-gray-600">
                <span>{date}</span>
                <span>{time}</span>
                <span className="font-medium text-[#3b6de3]">{weekday}</span>
              </div>
            </div>

            {/* UTC时间 */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
              <div className="text-sm text-gray-600 mb-2">UTC 时间</div>
              <div className="text-xl font-bold text-gray-900">{utcString || '-'}</div>
              <div className="mt-3 text-sm text-gray-600">
                <span className="font-mono text-xs break-all">{isoString}</span>
              </div>
            </div>
          </div>

          {/* 说明 */}
          <div className="mt-8 bg-gray-50 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">关于时间戳</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Unix 时间戳是指从 1970年1月1日 00:00:00 UTC 到当前时间的总秒数</li>
              <li>• 该工具支持秒级时间戳，JavaScript 中 Date.now() 返回的是毫秒，需要除以 1000</li>
              <li>• 时间戳与时区无关，同一时刻全球各地的时间戳值相同</li>
            </ul>
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  );
};

export default TimestampConvert;