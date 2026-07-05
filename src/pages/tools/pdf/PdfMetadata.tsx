import { useState } from 'react'
import { PDFDocument } from '@maxwbh/pdf-lib'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { PdfFileHeader, PdfInfoCard, PdfTwoColumn } from '@/components/pdf/PdfToolUI'
import { getToolById } from '@/data/toolsFromJson'
import { downloadFile } from '@/utils/fileUtils'

const PdfMetadata: React.FC = () => {
  const tool = getToolById('pdf-metadata')
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [subject, setSubject] = useState('')
  const [keywords, setKeywords] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!tool) return null

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
      const pdf = await PDFDocument.load(await file.arrayBuffer())
      if (title.trim()) pdf.setTitle(title.trim())
      if (author.trim()) pdf.setAuthor(author.trim())
      if (subject.trim()) pdf.setSubject(subject.trim())
      if (keywords.trim()) pdf.setKeywords(keywords.split(',').map(s => s.trim()).filter(Boolean))
      pdf.setModificationDate(new Date())
      const bytes = await pdf.save()
      downloadFile(new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }), 'metadata.pdf')
    } catch {
      setError('处理失败（可能是加密PDF）')
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
                <PdfFileHeader fileName={file.name} subtitle="修改作者、主题、关键词等信息" onReselect={() => setFile(null)} disabled={busy} />

                <div className="space-y-6">
                  <div>
                    <div className="flex items-start gap-6">
                      <div className="w-16 text-right pt-2.5">
                        <span className="text-gray-600">字段</span>
                      </div>
                      <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600">标题</div>
                            <input
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600">作者</div>
                            <input
                              value={author}
                              onChange={(e) => setAuthor(e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600">主题</div>
                            <input
                              value={subject}
                              onChange={(e) => setSubject(e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm text-gray-600">关键词（逗号分隔）</div>
                            <input
                              value={keywords}
                              onChange={(e) => setKeywords(e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {error ? <div className="text-sm text-red-600">{error}</div> : null}

                  <div className="flex gap-3 flex-wrap">
                    <ActionButton onClick={run} loading={busy} disabled={busy}>
                      保存并下载
                    </ActionButton>
                  </div>
                </div>
              </div>
            }
            right={
              <div className="space-y-4">
                <PdfInfoCard title="提示">
                  <div className="text-sm text-gray-600 leading-relaxed">
                    修改后会更新 PDF 的元数据字段，并写入最新修改时间。
                  </div>
                </PdfInfoCard>
              </div>
            }
          />
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default PdfMetadata
