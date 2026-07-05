import { useMemo, useRef, useState } from 'react'
import { PDFDocument } from '@maxwbh/pdf-lib'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { PdfFileHeader, PdfInfoCard, PdfTwoColumn } from '@/components/pdf/PdfToolUI'
import { getToolById } from '@/data/toolsFromJson'
import { downloadFile } from '@/utils/fileUtils'

const PdfMerge: React.FC = () => {
  const tool = getToolById('pdf-merge')
  const [files, setFiles] = useState<File[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const addInputRef = useRef<HTMLInputElement>(null)

  if (!tool) return null

  const total = useMemo(() => files.length, [files])

  const onFilesSelect = (list: FileList) => {
    const pdfs = Array.from(list).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))
    setFiles(pdfs)
    setError(pdfs.length ? '' : '请选择PDF文件')
  }

  const addFiles = (list: FileList) => {
    const pdfs = Array.from(list).filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))
    if (!pdfs.length) {
      setError('请选择PDF文件')
      return
    }
    setFiles(prev => [...prev, ...pdfs])
    setError('')
  }

  const move = (idx: number, dir: -1 | 1) => {
    setFiles(prev => {
      const next = [...prev]
      const j = idx + dir
      if (j < 0 || j >= next.length) return prev
      const t = next[idx]
      next[idx] = next[j]
      next[j] = t
      return next
    })
  }

  const remove = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx))

  const merge = async () => {
    if (files.length < 2) return
    setBusy(true)
    setError('')
    try {
      const out = await PDFDocument.create()
      for (const f of files) {
        const buf = await f.arrayBuffer()
        const doc = await PDFDocument.load(buf)
        const pages = await out.copyPages(doc, doc.getPageIndices())
        pages.forEach(p => out.addPage(p))
      }
      const bytes = await out.save()
      downloadFile(new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }), 'merged.pdf')
    } catch {
      setError('合并失败')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        {total === 0 ? (
          <div className="space-y-4">
            <FileUploader
              onFilesSelect={onFilesSelect}
              multiple
              accept="application/pdf"
              placeholder="将文件拖拽到虚框内"
              primaryActionText="点击上传文件(小于20M)"
              showFormatHint={false}
            />
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
          </div>
        ) : (
          <PdfTwoColumn
            left={
              <div>
                <input
                  ref={addInputRef}
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) addFiles(e.target.files)
                    e.currentTarget.value = ''
                  }}
                />

                <PdfFileHeader
                  fileName={`已选择 ${files.length} 个文件`}
                  subtitle="合并顺序按列表从上到下"
                  onReselect={() => addInputRef.current?.click()}
                  disabled={busy}
                  actionText="添加文件"
                />

                <div className="space-y-4">
                  <div className="space-y-2">
                    {files.map((f, idx) => (
                      <div key={`${f.name}-${idx}`} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
                        <div className="min-w-0 text-sm text-gray-900 truncate">{f.name}</div>
                        <div className="flex gap-2">
                          <ActionButton size="sm" variant="secondary" onClick={() => move(idx, -1)} disabled={idx === 0 || busy}>
                            上移
                          </ActionButton>
                          <ActionButton size="sm" variant="secondary" onClick={() => move(idx, 1)} disabled={idx === files.length - 1 || busy}>
                            下移
                          </ActionButton>
                          <ActionButton size="sm" variant="danger" onClick={() => remove(idx)} disabled={busy}>
                            删除
                          </ActionButton>
                        </div>
                      </div>
                    ))}
                  </div>

                  {error ? <div className="text-sm text-red-600">{error}</div> : null}

                  <div className="flex flex-wrap gap-3">
                    <ActionButton onClick={merge} loading={busy} disabled={files.length < 2 || busy}>
                      合并并下载
                    </ActionButton>
                    <ActionButton variant="secondary" onClick={() => setFiles([])} disabled={!files.length || busy}>
                      清空
                    </ActionButton>
                  </div>
                </div>
              </div>
            }
            right={
              <div className="space-y-4">
                <PdfInfoCard title="当前信息">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500">文件数</div>
                      <div className="text-lg font-semibold text-gray-900">{files.length}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">可合并</div>
                      <div className="text-lg font-semibold text-gray-900">{files.length >= 2 ? '是' : '否'}</div>
                    </div>
                  </div>
                </PdfInfoCard>
                <div className="text-sm text-gray-500 leading-relaxed">至少选择 2 个文件才能合并。</div>
              </div>
            }
          />
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default PdfMerge
