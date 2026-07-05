import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'
import { downloadFile } from '@/utils/fileUtils'

const VisitCard: React.FC = () => {
  const tool = getToolById('visit-card')
  const [name, setName] = useState('')
  const [org, setOrg] = useState('')
  const [title, setTitle] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [url, setUrl] = useState('')
  const [address, setAddress] = useState('')
  const [dataUrl, setDataUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!tool) return null

  const vcard = useMemo(() => {
    const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0']
    if (name.trim()) lines.push(`FN:${name.trim()}`)
    if (org.trim()) lines.push(`ORG:${org.trim()}`)
    if (title.trim()) lines.push(`TITLE:${title.trim()}`)
    if (phone.trim()) lines.push(`TEL;TYPE=CELL:${phone.trim()}`)
    if (email.trim()) lines.push(`EMAIL:${email.trim()}`)
    if (url.trim()) lines.push(`URL:${url.trim()}`)
    if (address.trim()) lines.push(`ADR:${address.trim()}`)
    lines.push('END:VCARD')
    return lines.join('\n')
  }, [name, org, title, phone, email, url, address])

  useEffect(() => {
    const run = async () => {
      setBusy(true)
      setError('')
      try {
        const url = await QRCode.toDataURL(vcard, {
          width: 420,
          margin: 2,
          errorCorrectionLevel: 'M',
          color: { dark: '#000000', light: '#ffffff' },
        })
        setDataUrl(url)
      } catch (e) {
        setError(e instanceof Error ? e.message : '生成失败')
        setDataUrl('')
      } finally {
        setBusy(false)
      }
    }
    run()
  }, [vcard])

  const copy = async () => {
    await navigator.clipboard.writeText(vcard)
  }

  const download = async () => {
    if (!dataUrl) return
    const blob = await (await fetch(dataUrl)).blob()
    downloadFile(blob, 'visit-card-qrcode.png')
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">姓名</div>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]" />
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">公司/组织</div>
                <input value={org} onChange={(e) => setOrg(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">职位</div>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]" />
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">手机</div>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-gray-600">邮箱</div>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]" />
              </div>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">网址</div>
                <input value={url} onChange={(e) => setUrl(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-600">地址</div>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]" />
            </div>

            <div className="flex flex-wrap gap-3">
              <ActionButton variant="secondary" onClick={copy}>
                复制vCard
              </ActionButton>
              <ActionButton onClick={download} disabled={!dataUrl || busy}>
                下载二维码
              </ActionButton>
            </div>

            {error ? <div className="text-sm text-red-600">{error}</div> : null}
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-gray-100 bg-white overflow-hidden flex items-center justify-center min-h-[320px]">
              {dataUrl ? (
                <img src={dataUrl} alt="visit-card-qrcode" className="max-w-full max-h-[520px] object-contain p-6" />
              ) : (
                <div className="text-sm text-gray-500">{busy ? '生成中...' : '请输入信息'}</div>
              )}
            </div>
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="text-sm text-gray-600">vCard 预览</div>
              <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-gray-800">{vcard}</pre>
            </div>
          </div>
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default VisitCard

