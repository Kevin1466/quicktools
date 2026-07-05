import { useMemo, useState } from 'react'
import { PDFDocument } from '@maxwbh/pdf-lib'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { PdfFileHeader, PdfInfoCard, PdfTwoColumn } from '@/components/pdf/PdfToolUI'
import { getToolById } from '@/data/toolsFromJson'
import { downloadFile } from '@/utils/fileUtils'

type Preset = 'a4' | 'letter' | 'a3' | 'a5' | 'custom'

const presets: Array<{ key: Preset; name: string; w: number; h: number }> = [
  { key: 'a4', name: 'A4 (595×842)', w: 595, h: 842 },
  { key: 'letter', name: 'Letter (612×792)', w: 612, h: 792 },
  { key: 'a3', name: 'A3 (842×1191)', w: 842, h: 1191 },
  { key: 'a5', name: 'A5 (420×595)', w: 420, h: 595 },
  { key: 'custom', name: '自定义', w: 595, h: 842 },
]

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, Number(n) || 0))

const PdfPageSize: React.FC = () => {
  const tool = getToolById('pdf-pagesize')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const [preset, setPreset] = useState<Preset>('a4')
  const [landscape, setLandscape] = useState(false)
  const [fitContent, setFitContent] = useState(true)
  const [customW, setCustomW] = useState(595)
  const [customH, setCustomH] = useState(842)

  if (!tool) return null

  const target = useMemo(() => {
    const p = presets.find(x => x.key === preset) || presets[0]
    const w = preset === 'custom' ? clamp(customW, 100, 4000) : p.w
    const h = preset === 'custom' ? clamp(customH, 100, 4000) : p.h
    return landscape ? { w: Math.max(w, h), h: Math.min(w, h) } : { w: Math.min(w, h), h: Math.max(w, h) }
  }, [preset, landscape, customW, customH])

  const onFileSelect = (f: File) => {
    if (!(f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))) return
    setFile(f)
    setError('')
  }

  const run = async () => {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const buf = await file.arrayBuffer()
      const doc = await PDFDocument.load(buf)
      const pages = doc.getPages()

      for (const p of pages) {
        const { width, height } = p.getSize()
        const newW = target.w
        const newH = target.h

        if (fitContent) {
          const s = Math.min(newW / width, newH / height)
          const dx = (newW - width * s) / 2
          const dy = (newH - height * s) / 2
          p.scaleContent(s, s)
          p.translateContent(dx, dy)
        }

        p.setSize(newW, newH)
      }

      const outBytes = await doc.save()
      downloadFile(new Blob([outBytes as unknown as BlobPart], { type: 'application/pdf' }), 'pagesize.pdf')
    } catch (e) {
      setError(e instanceof Error ? e.message : '处理失败')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        {!file ? (
          <FileUploader
            onFileSelect={onFileSelect}
            accept="application/pdf"
            placeholder="将文件拖拽到虚框内"
            primaryActionText="点击上传文件(小于20M)"
            showFormatHint={false}
          />
        ) : (
          <PdfTwoColumn
            left={
              <div>
                <PdfFileHeader
                  fileName={file.name}
                  subtitle="统一修改页面尺寸，可选等比缩放并居中适配"
                  onReselect={() => setFile(null)}
                  disabled={busy}
                />

                <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-6">
                    <div className="w-16 text-right">
                      <span className="text-gray-600">尺寸</span>
                    </div>
                    <div className="flex-1">
                      <select
                        value={preset}
                        onChange={(e) => setPreset(e.target.value as Preset)}
                        className="w-full max-w-md px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] bg-white"
                      >
                        {presets.map((p) => (
                          <option key={p.key} value={p.key}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {preset === 'custom' ? (
                  <div>
                    <div className="flex items-start gap-6">
                      <div className="w-16 text-right pt-2.5">
                        <span className="text-gray-600">自定义</span>
                      </div>
                      <div className="flex-1">
                        <div className="grid grid-cols-2 gap-4 max-w-md">
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600">宽（pt）</div>
                            <input
                              type="number"
                              value={customW}
                              onChange={(e) => setCustomW(Number(e.target.value))}
                              min={100}
                              max={4000}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600">高（pt）</div>
                            <input
                              type="number"
                              value={customH}
                              onChange={(e) => setCustomH(Number(e.target.value))}
                              min={100}
                              max={4000}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div>
                  <div className="flex items-center gap-6">
                    <div className="w-16 text-right">
                      <span className="text-gray-600">方向</span>
                    </div>
                    <div className="flex-1">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={landscape} onChange={(e) => setLandscape(e.target.checked)} />
                        横向
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-6">
                    <div className="w-16 text-right">
                      <span className="text-gray-600">适配</span>
                    </div>
                    <div className="flex-1">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={fitContent} onChange={(e) => setFitContent(e.target.checked)} />
                        内容等比缩放并居中适配
                      </label>
                    </div>
                  </div>
                </div>

                {error ? <div className="text-sm text-red-600">{error}</div> : null}

                <div className="flex gap-3 flex-wrap">
                  <ActionButton onClick={run} loading={busy} disabled={busy}>
                    生成并下载PDF
                  </ActionButton>
                </div>
                </div>
              </div>
            }
            right={
              <div className="space-y-4">
                <PdfInfoCard title="输出尺寸">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">宽</div>
                      <div className="text-lg font-semibold text-gray-900">{Math.round(target.w)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">高</div>
                      <div className="text-lg font-semibold text-gray-900">{Math.round(target.h)}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">单位：pt</div>
                </PdfInfoCard>
                <div className="text-sm text-gray-500 leading-relaxed">勾选“适配”后会缩放并居中页面内容；不勾选则只改页面画布大小。</div>
              </div>
            }
          />
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default PdfPageSize
