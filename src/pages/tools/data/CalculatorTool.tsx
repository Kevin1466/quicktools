import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

type Token =
  | { type: 'number'; value: number }
  | { type: 'op'; value: string }
  | { type: 'lparen' }
  | { type: 'rparen' }
  | { type: 'ident'; value: string }
  | { type: 'comma' }

const isDigit = (c: string) => c >= '0' && c <= '9'

const tokenize = (input: string): Token[] => {
  const s = input.replace(/\s+/g, '')
  const tokens: Token[] = []
  let i = 0
  while (i < s.length) {
    const ch = s[i]
    if (isDigit(ch) || ch === '.') {
      let j = i + 1
      while (j < s.length && (isDigit(s[j]) || s[j] === '.')) j++
      const num = Number(s.slice(i, j))
      if (!Number.isFinite(num)) throw new Error('number')
      tokens.push({ type: 'number', value: num })
      i = j
      continue
    }
    if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_') {
      let j = i + 1
      while (
        j < s.length &&
        ((s[j] >= 'a' && s[j] <= 'z') ||
          (s[j] >= 'A' && s[j] <= 'Z') ||
          (s[j] >= '0' && s[j] <= '9') ||
          s[j] === '_')
      )
        j++
      tokens.push({ type: 'ident', value: s.slice(i, j) })
      i = j
      continue
    }
    if (ch === '(') {
      tokens.push({ type: 'lparen' })
      i++
      continue
    }
    if (ch === ')') {
      tokens.push({ type: 'rparen' })
      i++
      continue
    }
    if (ch === ',') {
      tokens.push({ type: 'comma' })
      i++
      continue
    }
    const ops = ['+', '-', '*', '/', '%', '^']
    if (ops.includes(ch)) {
      tokens.push({ type: 'op', value: ch })
      i++
      continue
    }
    throw new Error('char')
  }
  return tokens
}

const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2, '^': 3, 'u-': 4 }
const rightAssoc = new Set(['^', 'u-'])

const toRpn = (tokens: Token[]): Token[] => {
  const output: Token[] = []
  const stack: Token[] = []
  let prev: Token | null = null

  for (const t of tokens) {
    if (t.type === 'number') {
      output.push(t)
      prev = t
      continue
    }
    if (t.type === 'ident') {
      stack.push(t)
      prev = t
      continue
    }
    if (t.type === 'comma') {
      while (stack.length && stack[stack.length - 1].type !== 'lparen') {
        output.push(stack.pop() as Token)
      }
      if (!stack.length) throw new Error('comma')
      prev = t
      continue
    }
    if (t.type === 'op') {
      const isUnary =
        t.value === '-' &&
        (!prev || prev.type === 'op' || prev.type === 'lparen' || prev.type === 'comma')
      const op = isUnary ? 'u-' : t.value
      while (stack.length) {
        const top = stack[stack.length - 1]
        if (top.type !== 'op') break
        const p1 = precedence[op]
        const p2 = precedence[top.value]
        if (p2 > p1 || (p2 === p1 && !rightAssoc.has(op))) {
          output.push(stack.pop() as Token)
        } else {
          break
        }
      }
      stack.push({ type: 'op', value: op })
      prev = t
      continue
    }
    if (t.type === 'lparen') {
      stack.push(t)
      prev = t
      continue
    }
    if (t.type === 'rparen') {
      while (stack.length && stack[stack.length - 1].type !== 'lparen') {
        output.push(stack.pop() as Token)
      }
      if (!stack.length) throw new Error('paren')
      stack.pop()
      if (stack.length && stack[stack.length - 1].type === 'ident') {
        output.push(stack.pop() as Token)
      }
      prev = t
      continue
    }
  }

  while (stack.length) {
    const t = stack.pop() as Token
    if (t.type === 'lparen' || t.type === 'rparen') throw new Error('paren')
    output.push(t)
  }
  return output
}

const fn1: Record<string, (a: number) => number> = {
  sin: (a) => Math.sin(a),
  cos: (a) => Math.cos(a),
  tan: (a) => Math.tan(a),
  asin: (a) => Math.asin(a),
  acos: (a) => Math.acos(a),
  atan: (a) => Math.atan(a),
  sqrt: (a) => Math.sqrt(a),
  abs: (a) => Math.abs(a),
  ln: (a) => Math.log(a),
  log: (a) => Math.log10(a),
  exp: (a) => Math.exp(a),
}

const fn2: Record<string, (a: number, b: number) => number> = {
  pow: (a, b) => Math.pow(a, b),
  max: (a, b) => Math.max(a, b),
  min: (a, b) => Math.min(a, b),
}

const evalRpn = (rpn: Token[]): number => {
  const stack: number[] = []
  for (const t of rpn) {
    if (t.type === 'number') {
      stack.push(t.value)
      continue
    }
    if (t.type === 'op') {
      if (t.value === 'u-') {
        const a = stack.pop()
        if (a === undefined) throw new Error('op')
        stack.push(-a)
        continue
      }
      const b = stack.pop()
      const a = stack.pop()
      if (a === undefined || b === undefined) throw new Error('op')
      if (t.value === '+') stack.push(a + b)
      else if (t.value === '-') stack.push(a - b)
      else if (t.value === '*') stack.push(a * b)
      else if (t.value === '/') stack.push(a / b)
      else if (t.value === '%') stack.push(a % b)
      else if (t.value === '^') stack.push(Math.pow(a, b))
      else throw new Error('op')
      continue
    }
    if (t.type === 'ident') {
      const name = t.value
      if (name === 'pi') {
        stack.push(Math.PI)
        continue
      }
      if (name === 'e') {
        stack.push(Math.E)
        continue
      }
      if (fn1[name]) {
        const a = stack.pop()
        if (a === undefined) throw new Error('fn')
        stack.push(fn1[name](a))
        continue
      }
      if (fn2[name]) {
        const b = stack.pop()
        const a = stack.pop()
        if (a === undefined || b === undefined) throw new Error('fn')
        stack.push(fn2[name](a, b))
        continue
      }
      throw new Error('fn')
    }
    throw new Error('token')
  }
  if (stack.length !== 1) throw new Error('expr')
  return stack[0]
}

const format = (n: number) => {
  if (!Number.isFinite(n)) return String(n)
  const s = n.toPrecision(12)
  return String(Number(s))
}

const buttons: Array<{ label: string; value: string; type?: 'clear' | 'back' | 'eval' }> = [
  { label: 'C', value: '', type: 'clear' },
  { label: '⌫', value: '', type: 'back' },
  { label: '(', value: '(' },
  { label: ')', value: ')' },
  { label: '7', value: '7' },
  { label: '8', value: '8' },
  { label: '9', value: '9' },
  { label: '÷', value: '/' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '×', value: '*' },
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '−', value: '-' },
  { label: '0', value: '0' },
  { label: '.', value: '.' },
  { label: '+', value: '+' },
  { label: '=', value: '', type: 'eval' },
]

const CalculatorTool: React.FC = () => {
  const tool = getToolById('calculator')
  const [expr, setExpr] = useState('1+1')
  const [last, setLast] = useState('')

  if (!tool) return null

  const computed = useMemo(() => {
    if (!expr.trim()) return { ok: false as const, value: '', error: '' }
    try {
      const tokens = tokenize(expr)
      const rpn = toRpn(tokens)
      const val = evalRpn(rpn)
      return { ok: true as const, value: format(val), error: '' }
    } catch {
      return { ok: false as const, value: '', error: '表达式无法解析' }
    }
  }, [expr])

  const insert = (v: string) => setExpr((prev) => prev + v)

  const handleButton = (b: typeof buttons[number]) => {
    if (b.type === 'clear') {
      setExpr('')
      setLast('')
      return
    }
    if (b.type === 'back') {
      setExpr((prev) => prev.slice(0, -1))
      return
    }
    if (b.type === 'eval') {
      if (computed.ok) {
        setLast(expr)
        setExpr(computed.value)
      }
      return
    }
    insert(b.value)
  }

  const copy = async () => {
    if (!computed.ok || !computed.value) return
    await navigator.clipboard.writeText(computed.value)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-5">
        <div className="p-5 rounded-xl border border-gray-100 bg-gray-50">
          {last && <div className="text-xs text-gray-500 mb-2 font-mono">{last}</div>}
          <input
            value={expr}
            onChange={e => setExpr(e.target.value)}
            placeholder="输入表达式，例如：sin(0.5)+pow(2,3)"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
          />
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-sm text-gray-600">结果</div>
            <div className="flex items-center gap-2">
              <div className="font-mono text-lg text-gray-900">{computed.ok ? computed.value : '--'}</div>
              <ActionButton size="sm" variant="secondary" onClick={copy} disabled={!computed.ok}>
                复制
              </ActionButton>
            </div>
          </div>
          {!computed.ok && expr.trim() && <div className="mt-2 text-xs text-red-600">{computed.error}</div>}
          <div className="mt-3 text-xs text-gray-500">
            支持：+ - * / % ^ ( )，常量 pi/e，函数 sin/cos/tan/asin/acos/atan/sqrt/abs/ln/log/exp/pow/max/min
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 max-w-md">
          {buttons.map(b => (
            <button
              key={b.label}
              type="button"
              onClick={() => handleButton(b)}
              className={`h-12 rounded-xl border transition text-sm font-medium ${
                b.type === 'eval'
                  ? 'bg-[#3b6de3] text-white border-[#3b6de3] hover:bg-[#2a52c2]'
                  : b.type === 'clear'
                    ? 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
                    : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default CalculatorTool
