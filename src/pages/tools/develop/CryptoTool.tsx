import { useMemo, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'

const b64FromBytes = (bytes: Uint8Array) => {
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
  return btoa(s)
}

const bytesFromB64 = (b64: string) => {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

const deriveKey = async (password: string, salt: Uint8Array) => {
  const baseKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as unknown as BufferSource, iterations: 120000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

type Pack = { v: 1; alg: 'AES-256-GCM'; salt: string; iv: string; data: string }

const packToString = (p: Pack) => JSON.stringify(p)
const tryParsePack = (s: string): Pack | null => {
  try {
    const o = JSON.parse(s) as Pack
    if (!o || o.v !== 1 || o.alg !== 'AES-256-GCM') return null
    if (!o.salt || !o.iv || !o.data) return null
    return o
  } catch {
    return null
  }
}

const CryptoTool: React.FC = () => {
  const tool = getToolById('crypto')
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt')
  const [password, setPassword] = useState('')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!tool) return null

  const canRun = useMemo(() => !!password.trim() && !!input.trim(), [password, input])

  const run = async () => {
    if (!canRun) return
    setBusy(true)
    setError('')
    try {
      if (mode === 'encrypt') {
        const salt = crypto.getRandomValues(new Uint8Array(16))
        const iv = crypto.getRandomValues(new Uint8Array(12))
        const key = await deriveKey(password, salt)
        const data = new TextEncoder().encode(input)
        const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)
        const pack: Pack = {
          v: 1,
          alg: 'AES-256-GCM',
          salt: b64FromBytes(salt),
          iv: b64FromBytes(iv),
          data: b64FromBytes(new Uint8Array(encrypted)),
        }
        setOutput(packToString(pack))
      } else {
        const parsed = tryParsePack(input)
        if (!parsed) {
          setError('解密输入应为加密输出的 JSON 包')
          setOutput('')
          return
        }
        const salt = bytesFromB64(parsed.salt)
        const iv = bytesFromB64(parsed.iv)
        const data = bytesFromB64(parsed.data)
        const key = await deriveKey(password, salt)
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
        setOutput(new TextDecoder().decode(decrypted))
      }
    } catch {
      setError('处理失败，请检查密码或输入格式')
      setOutput('')
    } finally {
      setBusy(false)
    }
  }

  const copy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('encrypt')}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              mode === 'encrypt'
                ? 'bg-[#eef4ff] text-[#3b6de3] font-medium'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            加密
          </button>
          <button
            type="button"
            onClick={() => setMode('decrypt')}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              mode === 'decrypt'
                ? 'bg-[#eef4ff] text-[#3b6de3] font-medium'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            解密
          </button>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-600">密码</div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="请输入密码（本地派生密钥，不上传）"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">{mode === 'encrypt' ? '明文' : '密文包(JSON)'}</div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full min-h-[260px] p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] resize-y font-mono text-sm"
              placeholder={mode === 'encrypt' ? '输入要加密的文本' : '粘贴加密输出的 JSON 包'}
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">{mode === 'encrypt' ? '密文包(JSON)' : '明文'}</div>
            <textarea
              value={output}
              readOnly
              className="w-full min-h-[260px] p-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 resize-y font-mono text-sm"
              placeholder="输出"
            />
          </div>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="flex flex-wrap items-center gap-3">
          <ActionButton onClick={run} loading={busy} disabled={!canRun || busy}>
            开始{mode === 'encrypt' ? '加密' : '解密'}
          </ActionButton>
          <ActionButton variant="secondary" onClick={copy} disabled={!output}>
            复制输出
          </ActionButton>
          <ActionButton
            variant="secondary"
            onClick={() => {
              setInput('')
              setOutput('')
              setError('')
            }}
          >
            清空
          </ActionButton>
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default CryptoTool
