import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

const groups: Array<{ name: string; items: string[] }> = [
  { name: '开心', items: ['(＾▽＾)', '(≧∇≦)ﾉ', 'ヾ(＾-＾)ノ', '(๑˃̵ᴗ˂̵)و', '(•‿•)'] },
  { name: '难过', items: ['(T_T)', '(；＿；)', '(╥﹏╥)', '(ಥ﹏ಥ)', '(；へ：)'] },
  { name: '生气', items: ['(╬▔皿▔)╯', '(＃｀皿´)', '(ง •̀_•́)ง', '(ಠ益ಠ)', '(╯°□°）╯︵ ┻━┻'] },
  { name: '惊讶', items: ['(⊙_⊙)', '(O_O)', '(ﾟoﾟ)', 'Σ(ﾟДﾟ)', '(・o・)'] },
  { name: '可爱', items: ['(｡•̀ᴗ-)✧', '(｡♥‿♥｡)', '(๑•̀ㅂ•́)و✧', '(=^･ω･^=)', '(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧'] },
  { name: '无语', items: ['(¬_¬)', '(￣_￣)', '(；一_一)', '( •_•)', '(￢_￢)'] },
  { name: '点赞', items: ['(👍 ᐛ)', '(ง •̀_•́)ง', '(๑•̀ㅂ•́)و✧', '＼(＾▽＾)／', '(☞ﾟヮﾟ)☞'] },
]

const EmojiTool: React.FC = () => {
  const tool = getToolById('emoji')
  const [q, setQ] = useState('')

  if (!tool) return null

  const list = useMemo(() => {
    const all = groups.flatMap(g => g.items.map(it => ({ group: g.name, text: it })))
    if (!q.trim()) return all
    const kw = q.trim()
    return all.filter(x => x.group.includes(kw) || x.text.includes(kw))
  }, [q])

  const copy = async (t: string) => {
    await navigator.clipboard.writeText(t)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm text-gray-600">搜索（按分类或表情内容）</div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="例如：开心"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {list.map((x, idx) => (
            <button
              key={`${x.group}-${idx}`}
              type="button"
              onClick={() => copy(x.text)}
              className="p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition text-center"
              title={`点击复制｜${x.group}`}
            >
              <div className="text-xl">{x.text}</div>
              <div className="mt-1 text-xs text-gray-500">{x.group}</div>
            </button>
          ))}
        </div>

        <div className="text-sm text-gray-500">
          点击任意表情即可复制到剪贴板
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default EmojiTool

