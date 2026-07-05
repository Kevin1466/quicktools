const chineseToMarsEntries: Array<[string, string]> = [
  ['我', '莪'],
  ['你', '伱'],
  ['他', '牠'],
  ['她', '牠'],
  ['它', '牠'],
  ['是', '媞'],
  ['的', 'の'],
  ['了', 'ㄋ'],
  ['在', '洅'],
  ['有', '宥'],
  ['这', '這'],
  ['那', '哪'],
  ['和', '啝'],
  ['就', '勼'],
  ['都', '嘟'],
  ['说', '説'],
  ['要', '喓'],
  ['会', '會'],
  ['爱', '愛'],
  ['梦', '夢'],
  ['国', '國'],
  ['学', '學'],
  ['简', '簡'],
  ['繁', '繁'],
  ['体', '體'],
]

const chineseToMarsMap = Object.fromEntries(chineseToMarsEntries) as Record<string, string>
const marsToChineseMap = Object.fromEntries(
  chineseToMarsEntries.map(([zh, mars]) => [mars, zh])
) as Record<string, string>

export const chineseToMars = (text: string) => {
  return Array.from(text)
    .map(ch => chineseToMarsMap[ch] ?? ch)
    .join('')
}

export const marsToChinese = (text: string) => {
  return Array.from(text)
    .map(ch => marsToChineseMap[ch] ?? ch)
    .join('')
}

