import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

const provinceMap: Record<string, string> = {
  '京': '北京',
  '津': '天津',
  '沪': '上海',
  '渝': '重庆',
  '冀': '河北',
  '豫': '河南',
  '云': '云南',
  '辽': '辽宁',
  '黑': '黑龙江',
  '湘': '湖南',
  '皖': '安徽',
  '鲁': '山东',
  '新': '新疆',
  '苏': '江苏',
  '浙': '浙江',
  '赣': '江西',
  '鄂': '湖北',
  '桂': '广西',
  '甘': '甘肃',
  '晋': '山西',
  '蒙': '内蒙古',
  '陕': '陕西',
  '吉': '吉林',
  '闽': '福建',
  '贵': '贵州',
  '粤': '广东',
  '青': '青海',
  '藏': '西藏',
  '川': '四川',
  '宁': '宁夏',
  '琼': '海南',
  '港': '香港',
  '澳': '澳门',
  '台': '台湾',
}

const normalize = (s: string) => s.trim().toUpperCase()

const CarNumberTool: React.FC = () => {
  const tool = getToolById('carnumber')
  const [plate, setPlate] = useState('粤B12345')

  if (!tool) return null

  const result = useMemo(() => {
    const p = normalize(plate)
    if (!p) return { ok: false as const, msg: '请输入车牌号' }
    const first = p[0]
    const province = provinceMap[first]
    if (!province) return { ok: false as const, msg: '无法识别省份简称' }
    const city = p[1] ? p[1] : ''
    return { ok: true as const, province, city }
  }, [plate])

  const copy = async () => {
    if (!result.ok) return
    await navigator.clipboard.writeText(`${result.province}${result.city ? ` ${result.city}` : ''}`)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm text-gray-600">车牌号</div>
          <input
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            placeholder="例如：粤B12345"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
          />
        </div>

        {result.ok ? (
          <div className="p-6 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-gray-600">归属地（省份简称）</div>
              <div className="mt-2 text-3xl font-semibold text-gray-900">{result.province}</div>
              {result.city && <div className="mt-1 text-sm text-gray-600">代码：{result.city}</div>}
            </div>
            <ActionButton variant="secondary" onClick={copy}>
              复制
            </ActionButton>
          </div>
        ) : (
          <div className="text-sm text-red-600">{result.msg}</div>
        )}

        <div className="text-xs text-gray-500">本工具仅根据车牌首字省份简称推断，不含市级代码详细映射</div>
      </div>
    </ToolPageTemplate>
  )
}

export default CarNumberTool
