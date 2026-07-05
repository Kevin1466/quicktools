import { useMemo, useState } from 'react'
import type { Tool } from '@/types'
import ActionButton from '@/components/common/ActionButton'

type ConvertType = 'temperature' | 'length' | 'byte' | 'number' | 'base' | 'bmi' | 'date' | 'timestamp' | 'partition'

interface UnitDef {
  value: string
  label: string
  toBase?: (v: number) => number
  fromBase?: (v: number) => number
}

const unitConfigs: Record<string, UnitDef[]> = {
  temperature: [
    { value: 'C', label: '摄氏度 °C' },
    { value: 'F', label: '华氏度 °F' },
    { value: 'K', label: '开尔文 K' },
  ],
  length: [
    { value: 'm', label: '米 m' },
    { value: 'km', label: '千米 km' },
    { value: 'cm', label: '厘米 cm' },
    { value: 'mm', label: '毫米 mm' },
    { value: 'inch', label: '英寸 in' },
    { value: 'ft', label: '英尺 ft' },
    { value: 'yd', label: '码 yd' },
    { value: 'mi', label: '英里 mi' },
  ],
  byte: [
    { value: 'B', label: '字节 B' },
    { value: 'KB', label: 'KB' },
    { value: 'MB', label: 'MB' },
    { value: 'GB', label: 'GB' },
    { value: 'TB', label: 'TB' },
    { value: 'PB', label: 'PB' },
  ],
}

const getConvertType = (tool: Tool): ConvertType => {
  const id = tool.id.toLowerCase()
  if (id.includes('temperature') || id.includes('temp')) return 'temperature'
  if (id.includes('length') || id.includes('longdu')) return 'length'
  if (id.includes('byte') || id.includes('jieshu') || id.includes('字节')) return 'byte'
  if (id.includes('number') || id.includes('daxie') || id.includes('zhuanhuan')) return 'number'
  if (id.includes('hex') || id.includes('jinzhi')) return 'base'
  if (id.includes('bmi')) return 'bmi'
  if (id.includes('date') || id.includes('riqi')) return 'date'
  if (id.includes('timestamp') || id.includes('shijianchuo')) return 'timestamp'
  if (id.includes('partition') || id.includes('yingpan')) return 'partition'
  return 'temperature'
}

// 温度转换辅助函数
const convertTemperature = (value: number, from: string, to: string): number => {
  if (from === to) return value
  let celsius: number
  // 先转为摄氏度
  if (from === 'C') celsius = value
  else if (from === 'F') celsius = (value - 32) * 5 / 9
  else celsius = value - 273.15
  // 再转为目标单位
  if (to === 'C') return celsius
  if (to === 'F') return celsius * 9 / 5 + 32
  return celsius + 273.15
}

// 长度转换（基准：米）
const lengthToMeters: Record<string, number> = {
  m: 1, km: 1000, cm: 0.01, mm: 0.001,
  inch: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344
}
const convertLength = (value: number, from: string, to: string): number => {
  if (from === to) return value
  const meters = value * lengthToMeters[from]
  return meters / lengthToMeters[to]
}

// 字节转换（基准：字节）
const byteUnits = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
const convertByte = (value: number, from: string, to: string): number => {
  if (from === to) return value
  const fromIdx = byteUnits.indexOf(from)
  const toIdx = byteUnits.indexOf(to)
  const diff = toIdx - fromIdx
  return value * Math.pow(1024, -diff)
}

// 数字转中文大写
const numToChinese = (num: number): string => {
  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const units = ['', '拾', '佰', '仟']
  const bigUnits = ['', '万', '亿']
  if (num === 0) return '零'
  if (num < 0) return '负' + numToChinese(-num)
  let result = ''
  let bigIdx = 0
  let n = Math.floor(num)
  while (n > 0) {
    const part = n % 10000
    if (part > 0) {
      let partStr = ''
      let u = 0
      let p = part
      while (p > 0) {
        const d = p % 10
        if (d > 0) {
          partStr = digits[d] + units[u] + partStr
        } else if (partStr && !partStr.startsWith('零')) {
          partStr = '零' + partStr
        }
        p = Math.floor(p / 10)
        u++
      }
      result = partStr + bigUnits[bigIdx] + result
    }
    n = Math.floor(n / 10000)
    bigIdx++
  }
  return result.replace(/零+/g, '零').replace(/零$/, '')
}

// BMI 计算
const calculateBMI = (height: number, weight: number): { bmi: number, category: string } => {
  const bmi = weight / Math.pow(height / 100, 2)
  let category = ''
  if (bmi < 18.5) category = '偏瘦'
  else if (bmi < 24) category = '正常'
  else if (bmi < 28) category = '偏胖'
  else category = '肥胖'
  return { bmi: Math.round(bmi * 10) / 10, category }
}

const DataWorkbench: React.FC<{ tool: Tool }> = ({ tool }) => {
  const convertType = useMemo(() => getConvertType(tool), [tool])
  const units = unitConfigs[convertType] || []

  // 通用状态
  const [input, setInput] = useState('')
  const [fromUnit, setFromUnit] = useState(units[0]?.value || '')
  const [toUnit, setToUnit] = useState(units[1]?.value || units[0]?.value || '')
  
  // 数字转中文
  const [numInput, setNumInput] = useState('')
  const [chineseResult, setChineseResult] = useState('')
  
  // BMI
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [bmiResult, setBmiResult] = useState<{bmi: number, category: string} | null>(null)
  
  // 时间戳
  const [timestamp, setTimestamp] = useState('')
  const [dateResult, setDateResult] = useState('')
  
  // 日期计算
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [dateDiff, setDateDiff] = useState('')

  const calculate = () => {
    const val = Number(input)
    if (!Number.isFinite(val)) return
    
    switch (convertType) {
      case 'temperature':
        return convertTemperature(val, fromUnit, toUnit)
      case 'length':
        return convertLength(val, fromUnit, toUnit)
      case 'byte':
        return convertByte(val, fromUnit, toUnit)
      default:
        return val
    }
  }

  const result = useMemo(() => {
    if (!input) return ''
    const val = calculate()
    if (val === undefined) return ''
    // 格式化结果
    if (typeof val === 'number') {
      if (Math.abs(val) < 0.000001 || Math.abs(val) > 1000000) return val.toExponential(6)
      return String(Number(val.toFixed(6))).replace(/\.?0+$/, '')
    }
    return String(val)
  }, [input, fromUnit, toUnit, convertType])

  const copy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result)
  }

  const handleNumToChinese = () => {
    const num = Number(numInput)
    if (!Number.isFinite(num)) {
      setChineseResult('请输入有效数字')
      return
    }
    setChineseResult(numToChinese(num))
  }

  const handleBMICalc = () => {
    const h = Number(height)
    const w = Number(weight)
    if (!Number.isFinite(h) || !Number.isFinite(w) || h <= 0 || w <= 0) {
      setBmiResult(null)
      return
    }
    setBmiResult(calculateBMI(h, w))
  }

  const handleTimestampConvert = () => {
    const ts = Number(timestamp)
    if (!Number.isFinite(ts)) {
      setDateResult('请输入有效时间戳')
      return
    }
    // 处理秒和毫秒
    const ms = ts < 10000000000 ? ts * 1000 : ts
    const date = new Date(ms)
    setDateResult(date.toLocaleString('zh-CN'))
  }

  const handleDateDiff = () => {
    if (!startDate || !endDate) {
      setDateDiff('请选择开始和结束日期')
      return
    }
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffMs = end.getTime() - start.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    setDateDiff(`相差 ${diffDays} 天 (${diffHours} 小时 / ${diffMinutes} 分钟)`)
  }

  // 渲染不同转换类型的UI
  const renderConverter = () => {
    if (convertType === 'number') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">输入数字</div>
            <input
              type="number"
              value={numInput}
              onChange={e => setNumInput(e.target.value)}
              placeholder="请输入数字"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
            />
          </div>
          <ActionButton onClick={handleNumToChinese}>转换</ActionButton>
          {chineseResult && (
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="text-sm text-gray-600 mb-2">中文大写</div>
              <div className="text-lg font-medium text-gray-900">{chineseResult}</div>
            </div>
          )}
        </div>
      )
    }

    if (convertType === 'bmi') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">身高 (cm)</div>
              <input
                type="number"
                value={height}
                onChange={e => setHeight(e.target.value)}
                placeholder="如: 170"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
              />
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">体重 (kg)</div>
              <input
                type="number"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="如: 65"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
              />
            </div>
          </div>
          <ActionButton onClick={handleBMICalc}>计算 BMI</ActionButton>
          {bmiResult && (
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-[#3b6de3]">{bmiResult.bmi}</div>
                <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                  {bmiResult.category}
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }

    if (convertType === 'timestamp') {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">时间戳</div>
            <input
              type="number"
              value={timestamp}
              onChange={e => setTimestamp(e.target.value)}
              placeholder="如: 1704067200 或 1704067200000"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
            />
            <div className="text-xs text-gray-500">支持秒或毫秒时间戳</div>
          </div>
          <ActionButton onClick={handleTimestampConvert}>转换</ActionButton>
          {dateResult && (
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="text-sm text-gray-600 mb-1">转换结果</div>
              <div className="text-lg font-medium text-gray-900 font-mono">{dateResult}</div>
            </div>
          )}
        </div>
      )
    }

    if (convertType === 'date') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">开始日期</div>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
              />
            </div>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">结束日期</div>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
              />
            </div>
          </div>
          <ActionButton onClick={handleDateDiff}>计算相差天数</ActionButton>
          {dateDiff && (
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="text-lg font-medium text-gray-900">{dateDiff}</div>
            </div>
          )}
        </div>
      )
    }

    // 默认：带单位的换算（温度、长度、字节等）
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-end">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">输入</div>
            <input
              type="number"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="请输入数值"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
            />
            <select
              value={fromUnit}
              onChange={e => setFromUnit(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
            >
              {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>

          <div className="flex justify-center md:pb-6">
            <ActionButton variant="secondary" onClick={() => {
              const tmp = fromUnit
              setFromUnit(toUnit)
              setToUnit(tmp)
            }}>
              交换
            </ActionButton>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-gray-600">输出</div>
            <input
              value={result}
              readOnly
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 font-mono"
            />
            <select
              value={toUnit}
              onChange={e => setToUnit(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
            >
              {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <ActionButton onClick={copy} disabled={!result}>
            复制结果
          </ActionButton>
          <ActionButton variant="secondary" onClick={() => {
            setInput('')
          }}>
            清空
          </ActionButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {renderConverter()}
    </div>
  )
}

export default DataWorkbench