import { useEffect, useMemo, useRef, useState } from 'react'
import { PDFDocument } from '@maxwbh/pdf-lib'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { PdfFileHeader, PdfInfoCard, PdfTwoColumn } from '@/components/pdf/PdfToolUI'
import { getToolById } from '@/data/toolsFromJson'
import { downloadFile } from '@/utils/fileUtils'

type Position = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'

const positions: Array<{ key: Position; name: string }> = [
  { key: 'bottom-right', name: '右下角' },
  { key: 'bottom-left', name: '左下角' },
  { key: 'top-right', name: '右上角' },
  { key: 'top-left', name: '左上角' },
  { key: 'center', name: '居中' },
]

const parsePages = (text: string, total: number): number[] => {
  const t = text.trim()
  if (!t || t.toLowerCase() === 'all') return Array.from({ length: total }, (_, i) => i)
  const out = new Set<number>()
  const parts = t.split(',').map(s => s.trim()).filter(Boolean)
  for (const p of parts) {
    const m = p.match(/^(\d+)\s*-\s*(\d+)$/)
    if (m) {
      const a = Math.max(1, Number(m[1]))
      const b = Math.min(total, Number(m[2]))
      for (let i = Math.min(a, b); i <= Math.max(a, b); i++) out.add(i - 1)
      continue
    }
    const n = Number(p)
    if (Number.isFinite(n) && n >= 1 && n <= total) out.add(n - 1)
  }
  return Array.from(out).sort((a, b) => a - b)
}

const PdfSign: React.FC = () => {
  const tool = getToolById('pdf-sign')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [sigFile, setSigFile] = useState<File | null>(null)
  const [sigDataUrl, setSigDataUrl] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const [pageText, setPageText] = useState('all')
  const [position, setPosition] = useState<Position>('bottom-right')
  const [widthPercent, setWidthPercent] = useState(28)
  const [margin, setMargin] = useState(24)
  const [opacity, setOpacity] = useState(0.9)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [signModalOpen, setSignModalOpen] = useState(false)
  const [penColor, setPenColor] = useState('#111827')
  const [penSize, setPenSize] = useState(4)
  const [isDrawing, setIsDrawing] = useState(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sigInputRef = useRef<HTMLInputElement>(null)
  const [sigObjectUrl, setSigObjectUrl] = useState('')

  if (!tool) return null

  const safe = useMemo(() => {
    return {
      w: Math.max(8, Math.min(80, Number(widthPercent) || 28)),
      m: Math.max(0, Math.min(120, Number(margin) || 24)),
      o: Math.max(0.05, Math.min(1, Number(opacity) || 0.9)),
    }
  }, [widthPercent, margin, opacity])

  const safePen = useMemo(() => {
    return {
      s: Math.max(1, Math.min(24, Number(penSize) || 4)),
    }
  }, [penSize])

  const onPdfSelect = (f: File) => {
    if (!(f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))) return
    setPdfFile(f)
    setError('')
  }

  const onSigSelect = (f: File) => {
    if (!f.type.startsWith('image/')) return
    setSigFile(f)
    setSigDataUrl('')
    setError('')
  }

  useEffect(() => {
    if (!sigFile) {
      setSigObjectUrl('')
      return
    }
    const url = URL.createObjectURL(sigFile)
    setSigObjectUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [sigFile])

  const sigPreview = useMemo(() => sigDataUrl || sigObjectUrl, [sigDataUrl, sigObjectUrl])

  const clearCanvas = () => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, c.width, c.height)
  }

  const openSignModal = () => {
    setSignModalOpen(true)
    setError('')
    setTimeout(() => {
      clearCanvas()
    }, 0)
  }

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current
    if (!c) return null
    const rect = c.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * c.width
    const y = ((e.clientY - rect.top) / rect.height) * c.height
    return { x, y }
  }

  const saveSignature = () => {
    const c = canvasRef.current
    if (!c) return
    const url = c.toDataURL('image/png')
    setSigDataUrl(url)
    setSigFile(null)
    setSignModalOpen(false)
  }

  const run = async () => {
    if (!pdfFile || (!sigFile && !sigDataUrl)) return
    setBusy(true)
    setError('')
    try {
      const pdfBytes = await pdfFile.arrayBuffer()
      const doc = await PDFDocument.load(pdfBytes)
      const pages = doc.getPages()

      const idxs = parsePages(pageText, pages.length)
      if (!idxs.length) {
        setError('页码为空或不合法')
        return
      }

      const imgBytes = sigFile
        ? new Uint8Array(await sigFile.arrayBuffer())
        : new Uint8Array(await (await fetch(sigDataUrl)).arrayBuffer())

      const isPng = sigFile
        ? sigFile.type === 'image/png' || sigFile.name.toLowerCase().endsWith('.png')
        : true

      const img = isPng ? await doc.embedPng(imgBytes) : await doc.embedJpg(imgBytes)

      for (const i of idxs) {
        const p = pages[i]
        const { width, height } = p.getSize()
        const targetW = (safe.w / 100) * width
        const targetH = (img.height / img.width) * targetW

        let x = safe.m
        let y = safe.m

        if (position.includes('right')) x = width - targetW - safe.m
        if (position.includes('top')) y = height - targetH - safe.m
        if (position === 'center') {
          x = (width - targetW) / 2
          y = (height - targetH) / 2
        }

        p.drawImage(img, { x, y, width: targetW, height: targetH, opacity: safe.o })
      }

      const outBytes = await doc.save()
      downloadFile(new Blob([outBytes as unknown as BlobPart], { type: 'application/pdf' }), 'signed.pdf')
    } catch (e) {
      setError(e instanceof Error ? e.message : '签名失败')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        {!pdfFile ? (
          <FileUploader
            onFileSelect={onPdfSelect}
            accept="application/pdf"
            placeholder="将文件拖拽到虚框内"
            primaryActionText="点击上传文件(小于20M)"
            showFormatHint={false}
          />
        ) : (
          <PdfTwoColumn
            left={
              <div>
                <PdfFileHeader fileName={pdfFile.name} subtitle="先准备签名，再生成带签名的PDF" onReselect={() => setPdfFile(null)} disabled={busy} />

                <input
                  ref={sigInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) onSigSelect(e.target.files[0])
                    e.currentTarget.value = ''
                  }}
                />

                <div className="space-y-6">
                  <div>
                    <div className="flex items-start gap-6">
                      <div className="w-16 text-right pt-2.5">
                        <span className="text-gray-600">签名</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-3 items-center">
                          <ActionButton variant="secondary" onClick={openSignModal} disabled={busy}>
                            新建签名
                          </ActionButton>
                          <ActionButton variant="secondary" onClick={() => sigInputRef.current?.click()} disabled={busy}>
                            上传签名图片
                          </ActionButton>
                          <ActionButton
                            variant="secondary"
                            onClick={() => {
                              setSigDataUrl('')
                              setSigFile(null)
                              setError('')
                            }}
                            disabled={busy || (!sigFile && !sigDataUrl)}
                          >
                            清除签名
                          </ActionButton>
                          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" checked={showAdvanced} onChange={(e) => setShowAdvanced(e.target.checked)} />
                            高级设置
                          </label>
                        </div>
                        {sigFile ? <div className="text-xs text-gray-500 mt-2 truncate">{sigFile.name}</div> : null}
                      </div>
                    </div>
                  </div>

                  {showAdvanced ? (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-6">
                          <div className="w-16 text-right">
                            <span className="text-gray-600">页码</span>
                          </div>
                          <div className="flex-1">
                            <input
                              value={pageText}
                              onChange={(e) => setPageText(e.target.value)}
                              placeholder="all 或 1,3,5-7"
                              className="w-full max-w-2xl px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-6">
                          <div className="w-16 text-right">
                            <span className="text-gray-600">位置</span>
                          </div>
                          <div className="flex-1">
                            <select
                              value={position}
                              onChange={(e) => setPosition(e.target.value as Position)}
                              className="w-full max-w-xs px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] bg-white"
                            >
                              {positions.map((p) => (
                                <option key={p.key} value={p.key}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-start gap-6">
                          <div className="w-16 text-right pt-2.5">
                            <span className="text-gray-600">参数</span>
                          </div>
                          <div className="flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
                              <div className="space-y-2">
                                <div className="text-sm text-gray-600">宽度（%）</div>
                                <input
                                  type="number"
                                  value={widthPercent}
                                  onChange={(e) => setWidthPercent(Number(e.target.value))}
                                  min={8}
                                  max={80}
                                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="text-sm text-gray-600">边距（pt）</div>
                                <input
                                  type="number"
                                  value={margin}
                                  onChange={(e) => setMargin(Number(e.target.value))}
                                  min={0}
                                  max={120}
                                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="text-sm text-gray-600">透明度</div>
                                <input
                                  type="number"
                                  value={opacity}
                                  onChange={(e) => setOpacity(Number(e.target.value))}
                                  min={0.05}
                                  max={1}
                                  step={0.05}
                                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {error ? <div className="text-sm text-red-600">{error}</div> : null}

                  <div className="flex gap-3 flex-wrap">
                    <ActionButton onClick={run} loading={busy} disabled={!pdfFile || (!sigFile && !sigDataUrl) || busy}>
                      生成并下载PDF
                    </ActionButton>
                    <ActionButton
                      variant="secondary"
                      onClick={() => {
                        setPdfFile(null)
                        setSigFile(null)
                        setSigDataUrl('')
                        setError('')
                      }}
                      disabled={busy}
                    >
                      清空
                    </ActionButton>
                  </div>
                </div>
              </div>
            }
            right={
              <div className="space-y-4">
                <PdfInfoCard title="签名预览">
                  <div className="w-full aspect-[3/2] border border-gray-200 rounded-lg flex items-center justify-center bg-white overflow-hidden">
                    {sigPreview ? (
                      <img src={sigPreview} alt="signature" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <div className="text-sm text-gray-400">未选择签名</div>
                    )}
                  </div>
                </PdfInfoCard>

                <PdfInfoCard title="当前参数">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      位置：<span className="font-mono">{position}</span>
                    </div>
                    <div>
                      宽度：<span className="font-mono">{safe.w}%</span>
                    </div>
                    <div>
                      边距：<span className="font-mono">{safe.m}</span>
                    </div>
                    <div>
                      透明度：<span className="font-mono">{safe.o}</span>
                    </div>
                    <div>
                      页码：<span className="font-mono">{pageText || 'all'}</span>
                    </div>
                  </div>
                </PdfInfoCard>
              </div>
            }
          />
        )}
      </div>

      {signModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">新建签名</h2>
              <button
                onClick={() => setSignModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600">颜色</div>
                  <input type="color" value={penColor} onChange={(e) => setPenColor(e.target.value)} className="h-10 w-10 p-1 rounded-lg border border-gray-200 bg-white" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600">粗细</div>
                  <input
                    type="number"
                    value={penSize}
                    onChange={(e) => setPenSize(Number(e.target.value))}
                    min={1}
                    max={24}
                    className="w-28 px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                  />
                </div>
                <ActionButton variant="secondary" onClick={clearCanvas}>
                  清空画布
                </ActionButton>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={900}
                  height={320}
                  className="w-full h-[240px] touch-none"
                  onPointerDown={(e) => {
                    const c = canvasRef.current
                    const ctx = c?.getContext('2d')
                    const p = getCanvasPoint(e)
                    if (!c || !ctx || !p) return
                    c.setPointerCapture(e.pointerId)
                    setIsDrawing(true)
                    lastPointRef.current = p
                    ctx.lineCap = 'round'
                    ctx.lineJoin = 'round'
                    ctx.strokeStyle = penColor
                    ctx.lineWidth = safePen.s
                    ctx.beginPath()
                    ctx.moveTo(p.x, p.y)
                  }}
                  onPointerMove={(e) => {
                    if (!isDrawing) return
                    const ctx = canvasRef.current?.getContext('2d')
                    const p = getCanvasPoint(e)
                    if (!ctx || !p) return
                    const last = lastPointRef.current
                    if (!last) {
                      lastPointRef.current = p
                      return
                    }
                    ctx.lineTo(p.x, p.y)
                    ctx.stroke()
                    lastPointRef.current = p
                  }}
                  onPointerUp={() => {
                    setIsDrawing(false)
                    lastPointRef.current = null
                  }}
                  onPointerCancel={() => {
                    setIsDrawing(false)
                    lastPointRef.current = null
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-6 border-t border-gray-200">
              <button
                onClick={() => setSignModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition text-sm"
              >
                取消
              </button>
              <div className="flex gap-3">
                <button
                  onClick={saveSignature}
                  className="px-5 py-2.5 bg-[#3b6de3] text-white rounded-lg hover:bg-[#2a52c2] transition"
                >
                  保存签名
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </ToolPageTemplate>
  )
}

export default PdfSign
