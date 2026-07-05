import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

const commonPasswords = new Set([
  '123456',
  '12345678',
  '123456789',
  'password',
  '12345',
  '123123',
  'qwerty',
  'abc123',
  '111111',
  '1234567',
  'iloveyou',
  'admin',
  'welcome',
  'letmein',
  'monkey',
  'dragon',
  'football',
  'princess',
  'sunshine',
  'login',
])

const hasSeq = (s: string) => {
  const lower = s.toLowerCase()
  const seqs = ['abcdefghijklmnopqrstuvwxyz', 'qwertyuiopasdfghjklzxcvbnm', '0123456789']
  for (const seq of seqs) {
    for (let i = 0; i <= seq.length - 4; i++) {
      const sub = seq.slice(i, i + 4)
      if (lower.includes(sub)) return true
      if (lower.includes(sub.split('').reverse().join(''))) return true
    }
  }
  return false
}

const scorePassword = (pwd: string) => {
  const len = pwd.length
  const hasLower = /[a-z]/.test(pwd)
  const hasUpper = /[A-Z]/.test(pwd)
  const hasDigit = /\d/.test(pwd)
  const hasSymbol = /[^a-zA-Z0-9]/.test(pwd)

  const pool = (hasLower ? 26 : 0) + (hasUpper ? 26 : 0) + (hasDigit ? 10 : 0) + (hasSymbol ? 33 : 0)
  const entropy = pool > 0 ? Math.log2(pool) * len : 0

  const repeated = /^(.)\1+$/.test(pwd)
  const weakCommon = commonPasswords.has(pwd.toLowerCase())
  const sequential = hasSeq(pwd)

  let score = 0
  score += Math.min(40, len * 3)
  score += hasLower ? 10 : 0
  score += hasUpper ? 10 : 0
  score += hasDigit ? 10 : 0
  score += hasSymbol ? 10 : 0
  score += Math.min(20, Math.floor(entropy / 5))

  if (repeated) score -= 30
  if (weakCommon) score -= 40
  if (sequential) score -= 20

  score = Math.max(0, Math.min(100, score))

  let level: '弱' | '中' | '强' | '很强' = '弱'
  if (score >= 80) level = '很强'
  else if (score >= 60) level = '强'
  else if (score >= 40) level = '中'

  const problems: string[] = []
  if (len < 8) problems.push('长度小于 8')
  if (!(hasLower || hasUpper)) problems.push('缺少字母')
  if (!hasDigit) problems.push('缺少数字')
  if (!hasSymbol) problems.push('缺少符号')
  if (repeated) problems.push('全部由同一字符重复组成')
  if (weakCommon) problems.push('常见弱口令')
  if (sequential) problems.push('包含连续/键盘序列')

  return { len, pool, entropy, score, level, hasLower, hasUpper, hasDigit, hasSymbol, problems }
}

const PasswordCheckTool: React.FC = () => {
  const tool = getToolById('password-check')
  const [pwd, setPwd] = useState('')
  const [show, setShow] = useState(false)

  if (!tool) return null

  const r = useMemo(() => scorePassword(pwd), [pwd])

  const color =
    r.level === '很强'
      ? 'bg-green-500'
      : r.level === '强'
        ? 'bg-emerald-500'
        : r.level === '中'
          ? 'bg-yellow-500'
          : 'bg-red-500'

  const copy = async () => {
    await navigator.clipboard.writeText(
      JSON.stringify(
        {
          length: r.len,
          charsetPool: r.pool,
          entropyBits: Number(r.entropy.toFixed(2)),
          score: r.score,
          level: r.level,
          problems: r.problems,
        },
        null,
        2
      )
    )
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm text-gray-600">密码</div>
          <div className="flex gap-3">
            <input
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              type={show ? 'text' : 'password'}
              placeholder="输入要检测的密码（本地计算，不上传）"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] font-mono"
            />
            <ActionButton variant="secondary" onClick={() => setShow(s => !s)}>
              {show ? '隐藏' : '显示'}
            </ActionButton>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-gray-100 bg-gray-50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">强度</div>
            <div className="text-sm font-medium text-gray-900">{pwd ? r.level : '--'}</div>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
            <div className={`h-full ${color}`} style={{ width: `${pwd ? r.score : 0}%` }} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border border-gray-200 bg-white">
              <div className="text-xs text-gray-500">长度</div>
              <div className="mt-1 font-mono text-lg text-gray-900">{r.len}</div>
            </div>
            <div className="p-3 rounded-lg border border-gray-200 bg-white">
              <div className="text-xs text-gray-500">字符池</div>
              <div className="mt-1 font-mono text-lg text-gray-900">{r.pool || 0}</div>
            </div>
            <div className="p-3 rounded-lg border border-gray-200 bg-white">
              <div className="text-xs text-gray-500">熵(估算)</div>
              <div className="mt-1 font-mono text-lg text-gray-900">{pwd ? r.entropy.toFixed(1) : '0.0'}</div>
            </div>
            <div className="p-3 rounded-lg border border-gray-200 bg-white">
              <div className="text-xs text-gray-500">评分</div>
              <div className="mt-1 font-mono text-lg text-gray-900">{pwd ? r.score : 0}</div>
            </div>
          </div>

          {pwd && r.problems.length > 0 ? (
            <div className="space-y-2">
              <div className="text-sm text-gray-700 font-medium">风险提示</div>
              <div className="flex flex-wrap gap-2">
                {r.problems.map((p, idx) => (
                  <span key={idx} className="px-2 py-1 text-xs rounded-full border bg-white text-gray-700 border-gray-200">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <ActionButton variant="secondary" onClick={copy} disabled={!pwd}>
            复制报告
          </ActionButton>
          <ActionButton variant="secondary" onClick={() => setPwd('')}>
            清空
          </ActionButton>
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default PasswordCheckTool

