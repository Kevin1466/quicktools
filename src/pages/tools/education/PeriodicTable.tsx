import { useEffect, useMemo, useRef, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import { getToolById } from '@/data/toolsFromJson'

type Cell =
  | { kind: 'blank'; span: number }
  | { kind: 'label'; tone: 'metal' | 'nonmetal'; lines: string[] }
  | {
      kind: 'element'
      tone: 'metal' | 'nonmetal'
      z: number
      symbol: string
      zh: string
      pinyin?: string
      weight?: string
    }

const rows: Cell[][] = [
  [
    { kind: 'element', tone: 'nonmetal', z: 1, symbol: 'H', zh: '氢', pinyin: 'qīng', weight: '1.0079' },
    { kind: 'blank', span: 16 },
    { kind: 'element', tone: 'nonmetal', z: 2, symbol: 'He', zh: '氦', pinyin: 'hài', weight: '4.003' },
  ],
  [
    { kind: 'element', tone: 'metal', z: 3, symbol: 'Li', zh: '锂', pinyin: 'lǐ', weight: '6.941' },
    { kind: 'element', tone: 'metal', z: 4, symbol: 'Be', zh: '铍', pinyin: 'pí', weight: '9.012' },
    { kind: 'blank', span: 10 },
    { kind: 'element', tone: 'nonmetal', z: 5, symbol: 'B', zh: '硼', pinyin: 'péng', weight: '10.811' },
    { kind: 'element', tone: 'nonmetal', z: 6, symbol: 'C', zh: '碳', pinyin: 'tàn', weight: '12.011' },
    { kind: 'element', tone: 'nonmetal', z: 7, symbol: 'N', zh: '氮', pinyin: 'dàn', weight: '14.007' },
    { kind: 'element', tone: 'nonmetal', z: 8, symbol: 'O', zh: '氧', pinyin: 'yǎng', weight: '15.999' },
    { kind: 'element', tone: 'nonmetal', z: 9, symbol: 'F', zh: '氟', pinyin: 'fú', weight: '18.998' },
    { kind: 'element', tone: 'nonmetal', z: 10, symbol: 'Ne', zh: '氖', pinyin: 'nǎi', weight: '20.180' },
  ],
  [
    { kind: 'element', tone: 'metal', z: 11, symbol: 'Na', zh: '钠', pinyin: 'nà', weight: '22.990' },
    { kind: 'element', tone: 'metal', z: 12, symbol: 'Mg', zh: '镁', pinyin: 'měi', weight: '24.305' },
    { kind: 'blank', span: 10 },
    { kind: 'element', tone: 'metal', z: 13, symbol: 'Al', zh: '铝', pinyin: 'lǚ', weight: '26.982' },
    { kind: 'element', tone: 'nonmetal', z: 14, symbol: 'Si', zh: '硅', pinyin: 'guī', weight: '28.086' },
    { kind: 'element', tone: 'nonmetal', z: 15, symbol: 'P', zh: '磷', pinyin: 'lín', weight: '30.974' },
    { kind: 'element', tone: 'nonmetal', z: 16, symbol: 'S', zh: '硫', pinyin: 'liú', weight: '32.066' },
    { kind: 'element', tone: 'nonmetal', z: 17, symbol: 'Cl', zh: '氯', pinyin: 'lǜ', weight: '35.453' },
    { kind: 'element', tone: 'nonmetal', z: 18, symbol: 'Ar', zh: '氩', pinyin: 'yà', weight: '39.948' },
  ],
  [
    { kind: 'element', tone: 'metal', z: 19, symbol: 'K', zh: '钾', pinyin: 'jiǎ', weight: '39.098' },
    { kind: 'element', tone: 'metal', z: 20, symbol: 'Ca', zh: '钙', pinyin: 'gài', weight: '40.08' },
    { kind: 'element', tone: 'metal', z: 21, symbol: 'Sc', zh: '钪', pinyin: 'kàng', weight: '44.956' },
    { kind: 'element', tone: 'metal', z: 22, symbol: 'Ti', zh: '钛', pinyin: 'tài', weight: '47.88' },
    { kind: 'element', tone: 'metal', z: 23, symbol: 'V', zh: '钒', pinyin: 'fán', weight: '50.942' },
    { kind: 'element', tone: 'metal', z: 24, symbol: 'Cr', zh: '铬', pinyin: 'gè', weight: '51.996' },
    { kind: 'element', tone: 'metal', z: 25, symbol: 'Mn', zh: '锰', pinyin: 'měng', weight: '54.938' },
    { kind: 'element', tone: 'metal', z: 26, symbol: 'Fe', zh: '铁', pinyin: 'tiě', weight: '55.847' },
    { kind: 'element', tone: 'metal', z: 27, symbol: 'Co', zh: '钴', pinyin: 'gǔ', weight: '58.933' },
    { kind: 'element', tone: 'metal', z: 28, symbol: 'Ni', zh: '镍', pinyin: 'niè', weight: '58.69' },
    { kind: 'element', tone: 'metal', z: 29, symbol: 'Cu', zh: '铜', pinyin: 'tóng', weight: '63.546' },
    { kind: 'element', tone: 'metal', z: 30, symbol: 'Zn', zh: '锌', pinyin: 'xīn', weight: '65.39' },
    { kind: 'element', tone: 'metal', z: 31, symbol: 'Ga', zh: '镓', pinyin: 'jiā', weight: '69.723' },
    { kind: 'element', tone: 'metal', z: 32, symbol: 'Ge', zh: '锗', pinyin: 'zhě', weight: '72.61' },
    { kind: 'element', tone: 'nonmetal', z: 33, symbol: 'As', zh: '砷', pinyin: 'shēn', weight: '74.922' },
    { kind: 'element', tone: 'nonmetal', z: 34, symbol: 'Se', zh: '硒', pinyin: 'xī', weight: '78.96' },
    { kind: 'element', tone: 'nonmetal', z: 35, symbol: 'Br', zh: '溴', pinyin: 'xiù', weight: '79.904' },
    { kind: 'element', tone: 'nonmetal', z: 36, symbol: 'Kr', zh: '氪', pinyin: 'kè', weight: '83.80' },
  ],
  [
    { kind: 'element', tone: 'metal', z: 37, symbol: 'Rb', zh: '铷', pinyin: 'rú', weight: '85.47' },
    { kind: 'element', tone: 'metal', z: 38, symbol: 'Sr', zh: '锶', pinyin: 'sī', weight: '87.62' },
    { kind: 'element', tone: 'metal', z: 39, symbol: 'Y', zh: '钇', pinyin: 'yǐ', weight: '88.906' },
    { kind: 'element', tone: 'metal', z: 40, symbol: 'Zr', zh: '锆', pinyin: 'gào', weight: '91.224' },
    { kind: 'element', tone: 'metal', z: 41, symbol: 'Nb', zh: '铌', pinyin: 'ní', weight: '92.906' },
    { kind: 'element', tone: 'metal', z: 42, symbol: 'Mo', zh: '钼', pinyin: 'mù', weight: '95.95' },
    { kind: 'element', tone: 'metal', z: 43, symbol: 'Tc', zh: '锝', pinyin: 'dé', weight: '(98)' },
    { kind: 'element', tone: 'metal', z: 44, symbol: 'Ru', zh: '钌', pinyin: 'liǎo', weight: '101.07' },
    { kind: 'element', tone: 'metal', z: 45, symbol: 'Rh', zh: '铑', pinyin: 'lǎo', weight: '102.91' },
    { kind: 'element', tone: 'metal', z: 46, symbol: 'Pd', zh: '钯', pinyin: 'bǎ', weight: '106.42' },
    { kind: 'element', tone: 'metal', z: 47, symbol: 'Ag', zh: '银', pinyin: 'yín', weight: '107.87' },
    { kind: 'element', tone: 'metal', z: 48, symbol: 'Cd', zh: '镉', pinyin: 'gé', weight: '112.41' },
    { kind: 'element', tone: 'metal', z: 49, symbol: 'In', zh: '铟', pinyin: 'yīn', weight: '114.82' },
    { kind: 'element', tone: 'metal', z: 50, symbol: 'Sn', zh: '锡', pinyin: 'xī', weight: '118.17' },
    { kind: 'element', tone: 'metal', z: 51, symbol: 'Sb', zh: '锑', pinyin: 'tī', weight: '121.75' },
    { kind: 'element', tone: 'nonmetal', z: 52, symbol: 'Te', zh: '碲', pinyin: 'dì', weight: '127.60' },
    { kind: 'element', tone: 'nonmetal', z: 53, symbol: 'I', zh: '碘', pinyin: 'diǎn', weight: '126.90' },
    { kind: 'element', tone: 'nonmetal', z: 54, symbol: 'Xe', zh: '氙', pinyin: 'xiān', weight: '131.29' },
  ],
  [
    { kind: 'element', tone: 'metal', z: 55, symbol: 'Cs', zh: '铯', pinyin: 'sè', weight: '132.90' },
    { kind: 'element', tone: 'metal', z: 56, symbol: 'Ba', zh: '钡', pinyin: 'bèi', weight: '137.33' },
    { kind: 'label', tone: 'metal', lines: ['57-71', '镧系'] },
    { kind: 'element', tone: 'metal', z: 72, symbol: 'Hf', zh: '铪', pinyin: 'hā', weight: '178.49' },
    { kind: 'element', tone: 'metal', z: 73, symbol: 'Ta', zh: '钽', pinyin: 'tǎn', weight: '180.95' },
    { kind: 'element', tone: 'metal', z: 74, symbol: 'W', zh: '钨', pinyin: 'wū', weight: '183.85' },
    { kind: 'element', tone: 'metal', z: 75, symbol: 'Re', zh: '铼', pinyin: 'lái', weight: '186.21' },
    { kind: 'element', tone: 'metal', z: 76, symbol: 'Os', zh: '锇', pinyin: 'é', weight: '190.2' },
    { kind: 'element', tone: 'metal', z: 77, symbol: 'Ir', zh: '铱', pinyin: 'yī', weight: '192.22' },
    { kind: 'element', tone: 'metal', z: 78, symbol: 'Pt', zh: '铂', pinyin: 'bó', weight: '195.08' },
    { kind: 'element', tone: 'metal', z: 79, symbol: 'Au', zh: '金', pinyin: 'jīn', weight: '196.97' },
    { kind: 'element', tone: 'metal', z: 80, symbol: 'Hg', zh: '汞', pinyin: 'gǒng', weight: '200.59' },
    { kind: 'element', tone: 'metal', z: 81, symbol: 'Tl', zh: '铊', pinyin: 'tā', weight: '204.38' },
    { kind: 'element', tone: 'metal', z: 82, symbol: 'Pb', zh: '铅', pinyin: 'qiān', weight: '207.2' },
    { kind: 'element', tone: 'metal', z: 83, symbol: 'Bi', zh: '铋', pinyin: 'bì', weight: '208.98' },
    { kind: 'element', tone: 'metal', z: 84, symbol: 'Po', zh: '钋', pinyin: 'pō', weight: '(209)' },
    { kind: 'element', tone: 'nonmetal', z: 85, symbol: 'At', zh: '砹', pinyin: 'ài', weight: '(210)' },
    { kind: 'element', tone: 'nonmetal', z: 86, symbol: 'Rn', zh: '氡', pinyin: 'dōng', weight: '(222)' },
  ],
  [
    { kind: 'element', tone: 'metal', z: 87, symbol: 'Fr', zh: '钫', pinyin: 'fāng', weight: '(223)' },
    { kind: 'element', tone: 'metal', z: 88, symbol: 'Ra', zh: '镭', pinyin: 'léi', weight: '(226)' },
    { kind: 'label', tone: 'metal', lines: ['89-103', '锕系'] },
    { kind: 'element', tone: 'metal', z: 104, symbol: 'Rf', zh: '𬬻', pinyin: 'lú', weight: '(265)' },
    { kind: 'element', tone: 'metal', z: 105, symbol: 'Db', zh: '𬭊', pinyin: 'dù', weight: '(268)' },
    { kind: 'element', tone: 'metal', z: 106, symbol: 'Sg', zh: '𬭳', pinyin: 'xǐ', weight: '(271)' },
    { kind: 'element', tone: 'metal', z: 107, symbol: 'Bh', zh: '𬭛', pinyin: 'bō', weight: '(270)' },
    { kind: 'element', tone: 'metal', z: 108, symbol: 'Hs', zh: '𬭶', pinyin: 'hēi', weight: '(277)' },
    { kind: 'element', tone: 'metal', z: 109, symbol: 'Mt', zh: '鿏', pinyin: 'mài', weight: '(276)' },
    { kind: 'element', tone: 'metal', z: 110, symbol: 'Ds', zh: '𫟼', pinyin: 'dá', weight: '(281)' },
    { kind: 'element', tone: 'metal', z: 111, symbol: 'Rg', zh: '𬬭', pinyin: 'lún', weight: '(280)' },
    { kind: 'element', tone: 'metal', z: 112, symbol: 'Cn', zh: '鎶', weight: '(285)' },
    { kind: 'element', tone: 'metal', z: 113, symbol: 'Nh', zh: '鉨', weight: '(284)' },
    { kind: 'element', tone: 'metal', z: 114, symbol: 'Fl', zh: '鈇', weight: '(289)' },
    { kind: 'element', tone: 'metal', z: 115, symbol: 'Mc', zh: '镆', weight: '(288)' },
    { kind: 'element', tone: 'metal', z: 116, symbol: 'Lv', zh: '鉝', weight: '(293)' },
    { kind: 'element', tone: 'nonmetal', z: 117, symbol: 'Ts', zh: '石田', weight: '(294)' },
    { kind: 'element', tone: 'nonmetal', z: 118, symbol: 'Og', zh: '气奥', weight: '(294)' },
  ],
  [{ kind: 'blank', span: 18 }],
  [
    { kind: 'label', tone: 'metal', lines: [''] },
    { kind: 'label', tone: 'metal', lines: ['镧系'] },
    { kind: 'element', tone: 'metal', z: 57, symbol: 'La', zh: '镧', pinyin: 'lán', weight: '138.91' },
    { kind: 'element', tone: 'metal', z: 58, symbol: 'Ce', zh: '铈', pinyin: 'shì', weight: '140.12' },
    { kind: 'element', tone: 'metal', z: 59, symbol: 'Pr', zh: '镨', pinyin: 'pǔ', weight: '140.91' },
    { kind: 'element', tone: 'metal', z: 60, symbol: 'Nd', zh: '钕', pinyin: 'nǚ', weight: '144.24' },
    { kind: 'element', tone: 'metal', z: 61, symbol: 'Pm', zh: '钷', pinyin: 'pǒ', weight: '(145)' },
    { kind: 'element', tone: 'metal', z: 62, symbol: 'Sm', zh: '钐', pinyin: 'shān', weight: '150.36' },
    { kind: 'element', tone: 'metal', z: 63, symbol: 'Eu', zh: '铕', pinyin: 'yǒu', weight: '151.96' },
    { kind: 'element', tone: 'metal', z: 64, symbol: 'Gd', zh: '钆', pinyin: 'gá', weight: '157.25' },
    { kind: 'element', tone: 'metal', z: 65, symbol: 'Tb', zh: '铽', pinyin: 'tè', weight: '158.92' },
    { kind: 'element', tone: 'metal', z: 66, symbol: 'Dy', zh: '镝', pinyin: 'dī', weight: '162.50' },
    { kind: 'element', tone: 'metal', z: 67, symbol: 'Ho', zh: '钬', pinyin: 'huǒ', weight: '164.93' },
    { kind: 'element', tone: 'metal', z: 68, symbol: 'Er', zh: '铒', pinyin: 'ěr', weight: '167.26' },
    { kind: 'element', tone: 'metal', z: 69, symbol: 'Tm', zh: '铥', pinyin: 'diū', weight: '168.93' },
    { kind: 'element', tone: 'metal', z: 70, symbol: 'Yb', zh: '镱', pinyin: 'yì', weight: '173.04' },
    { kind: 'element', tone: 'metal', z: 71, symbol: 'Lu', zh: '镥', pinyin: 'lǔ', weight: '174.97' },
    { kind: 'label', tone: 'metal', lines: [''] },
  ],
  [
    { kind: 'label', tone: 'metal', lines: [''] },
    { kind: 'label', tone: 'metal', lines: ['锕系'] },
    { kind: 'element', tone: 'metal', z: 89, symbol: 'Ac', zh: '锕', pinyin: 'ā', weight: '(227)' },
    { kind: 'element', tone: 'metal', z: 90, symbol: 'Th', zh: '钍', pinyin: 'tǔ', weight: '232.04' },
    { kind: 'element', tone: 'metal', z: 91, symbol: 'Pa', zh: '镤', pinyin: 'pú', weight: '231' },
    { kind: 'element', tone: 'metal', z: 92, symbol: 'U', zh: '铀', pinyin: 'yóu', weight: '238.03' },
    { kind: 'element', tone: 'metal', z: 93, symbol: 'Np', zh: '镎', pinyin: 'ná', weight: '(237)' },
    { kind: 'element', tone: 'metal', z: 94, symbol: 'Pu', zh: '钚', pinyin: 'bù', weight: '(244)' },
    { kind: 'element', tone: 'metal', z: 95, symbol: 'Am', zh: '镅', pinyin: 'méi', weight: '(243)' },
    { kind: 'element', tone: 'metal', z: 96, symbol: 'Cm', zh: '锔', pinyin: 'jú', weight: '(247)' },
    { kind: 'element', tone: 'metal', z: 97, symbol: 'Bk', zh: '锫', pinyin: 'péi', weight: '(247)' },
    { kind: 'element', tone: 'metal', z: 98, symbol: 'Cf', zh: '锎', pinyin: 'kāi', weight: '(251)' },
    { kind: 'element', tone: 'metal', z: 99, symbol: 'Es', zh: '锿', pinyin: 'āi', weight: '(252)' },
    { kind: 'element', tone: 'metal', z: 100, symbol: 'Fm', zh: '镄', pinyin: 'fèi', weight: '(257)' },
    { kind: 'element', tone: 'metal', z: 101, symbol: 'Md', zh: '钔', pinyin: 'mén', weight: '(258)' },
    { kind: 'element', tone: 'metal', z: 102, symbol: 'No', zh: '锘', pinyin: 'nuò', weight: '(259)' },
    { kind: 'element', tone: 'metal', z: 103, symbol: 'Lr', zh: '铹', pinyin: 'láo', weight: '(262)' },
    { kind: 'label', tone: 'metal', lines: [''] },
  ],
]

const allElements = rows
  .flat()
  .filter((c): c is Extract<Cell, { kind: 'element' }> => c.kind === 'element')

const PeriodicTable: React.FC = () => {
  const tool = getToolById('periodic')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Extract<Cell, { kind: 'element' }> | null>(null)
  const cellRefs = useRef(new Map<number, HTMLTableCellElement | null>())

  const normalizedQuery = query.trim().toLowerCase()

  const matchedZs = useMemo(() => {
    if (!normalizedQuery) return []
    return allElements
      .filter(e => {
        if (String(e.z) === normalizedQuery) return true
        if (e.symbol.toLowerCase().includes(normalizedQuery)) return true
        if (e.zh.includes(normalizedQuery)) return true
        return false
      })
      .map(e => e.z)
  }, [normalizedQuery])

  const scrollToFirstMatch = () => {
    const z = matchedZs[0]
    if (!z) return
    const el = cellRefs.current.get(z)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }

  useEffect(() => {
    if (!selected) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selected])

  if (!tool) return null

  const tdTone = (tone: 'metal' | 'nonmetal') => {
    if (tone === 'nonmetal') return 'bg-emerald-600 text-white'
    return 'bg-emerald-100 text-gray-800'
  }

  const renderCell = (cell: Cell, rowIndex: number, cellIndex: number) => {
    if (cell.kind === 'blank') {
      return (
        <td
          key={`${rowIndex}-${cellIndex}`}
          colSpan={cell.span}
          className="p-0"
        />
      )
    }

    const base =
      'min-w-[72px] h-[72px] md:min-w-[84px] md:h-[84px] p-1 md:p-2 text-center align-middle rounded-sm border border-white/80'

    if (cell.kind === 'label') {
      return (
        <td
          key={`${rowIndex}-${cellIndex}`}
          className={`${base} ${tdTone(cell.tone)} font-medium text-sm leading-tight`}
        >
          {cell.lines.map((line, i) => (
            <div key={i}>{line || '\u00A0'}</div>
          ))}
        </td>
      )
    }

    const isMatched = normalizedQuery ? matchedZs.includes(cell.z) : false

    return (
      <td
        key={`${rowIndex}-${cellIndex}`}
        ref={(el) => {
          cellRefs.current.set(cell.z, el)
        }}
        className={[
          base,
          tdTone(cell.tone),
          'cursor-pointer hover:brightness-95 active:brightness-90 transition',
          isMatched ? 'ring-2 ring-yellow-300 ring-offset-1 ring-offset-white' : '',
        ].join(' ')}
        onClick={() => setSelected(cell)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setSelected(cell)
        }}
        aria-label={`${cell.z} ${cell.zh} ${cell.symbol} ${cell.weight || ''}`}
      >
        <div className="text-[10px] leading-none opacity-90">{cell.z}</div>
        <div className="mt-1 text-lg font-bold leading-none">{cell.symbol}</div>
        <div className="mt-1 text-[12px] leading-none">
          <ruby>
            {cell.zh}
            {cell.pinyin ? <rt className="text-[10px] opacity-90">{cell.pinyin}</rt> : null}
          </ruby>
        </div>
        <div className="mt-1 text-[10px] leading-none opacity-90">{cell.weight || '\u00A0'}</div>
      </td>
    )
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-1">搜索元素（序号 / 符号 / 中文名）</div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') scrollToFirstMatch()
              }}
              placeholder="例如：8 / O / 氧"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
            />
          </div>
          <button
            type="button"
            onClick={scrollToFirstMatch}
            disabled={matchedZs.length === 0}
            className="h-[42px] px-4 rounded-lg bg-[#3b6de3] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#2a52c2] transition"
          >
            定位
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-separate border-spacing-1">
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => renderCell(cell, rowIndex, cellIndex))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center font-bold text-emerald-700">
                  {selected.symbol}
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{selected.zh}</div>
                  {selected.pinyin ? <div className="text-sm text-gray-500">{selected.pinyin}</div> : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="text-xs text-gray-500">原子序数</div>
                  <div className="mt-1 font-mono text-xl text-gray-900">{selected.z}</div>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="text-xs text-gray-500">元素符号</div>
                  <div className="mt-1 font-mono text-xl text-gray-900">{selected.symbol}</div>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 col-span-2">
                  <div className="text-xs text-gray-500">相对原子质量</div>
                  <div className="mt-1 font-mono text-xl text-gray-900">{selected.weight || '-'}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                更详细字段（电子排布/熔点/沸点等）可在后续版本补齐。
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </ToolPageTemplate>
  )
}

export default PeriodicTable
