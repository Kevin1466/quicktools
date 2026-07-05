import { useState, useEffect } from 'react'
import { FileDown, Eye } from 'lucide-react'
import { pdfUtils } from '@/utils/pdfUtils'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'
import { PdfFileHeader, PdfInfoCard, PdfTwoColumn } from '@/components/pdf/PdfToolUI'

const PdfWatermark: React.FC = () => {
  const tool = getToolById('pdf-watermark')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isWatermarked, setIsWatermarked] = useState(false)
  const [watermarkedBlob, setWatermarkedBlob] = useState<Blob | null>(null)
  const [previewImage, setPreviewImage] = useState<string>('')
  const [error, setError] = useState('')
  
  const [watermarkText, setWatermarkText] = useState('')
  const [fontSize, setFontSize] = useState(48)
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [opacity, setOpacity] = useState(30)
  const [position, setPosition] = useState<'tile' | 'center'>('tile')
  const [rotation, setRotation] = useState<'45' | '-45' | '0'>('45')

  const colorOptions = [
    { name: '黑色', value: '#000000' },
    { name: '深灰', value: '#333333' },
    { name: '灰色', value: '#666666' },
    { name: '浅灰', value: '#999999' },
    { name: '红色', value: '#FF0000' },
    { name: '蓝色', value: '#0000FF' },
    { name: '绿色', value: '#008000' },
  ]

  const fontSizeOptions = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96, 112, 128]

  const getColorRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    return { r, g, b }
  }

  useEffect(() => {
    try {
      const rotationAngle = rotation === '45' ? 45 : rotation === '-45' ? -45 : 0
      const preview = pdfUtils.generateWatermarkPreview(
        watermarkText || 'WATERMARK',
        fontSize,
        getColorRgb(selectedColor),
        opacity / 100,
        rotationAngle
      )
      setPreviewImage(preview)
    } catch {
      setPreviewImage('')
    }
  }, [watermarkText, fontSize, selectedColor, opacity, rotation])

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setSelectedFile(file)
      setIsWatermarked(false)
      setWatermarkedBlob(null)
      setError('')
    } else {
      setError('请选择PDF文件')
    }
  }

  const handleAddWatermark = async () => {
    if (!selectedFile) return
    
    setIsProcessing(true)
    setError('')
    
    try {
      const rotationAngle = rotation === '45' ? 45 : rotation === '-45' ? -45 : 0
      
      const result = await pdfUtils.addWatermark(selectedFile, {
        text: watermarkText || 'WATERMARK',
        fontSize: fontSize,
        opacity: opacity / 100,
        rotation: rotationAngle,
        color: getColorRgb(selectedColor),
        position: position
      })
      
      setWatermarkedBlob(result)
      setIsWatermarked(true)
    } catch (error) {
      let errorMessage = '添加水印失败，请重试'
      
      if (error instanceof Error) {
        errorMessage = `添加水印失败: ${error.message}`
      }
      
      if (error && typeof error === 'object' && 'message' in error) {
        const err = error as { message: string }
        if (err.message.includes('encrypted') || err.message.includes('加密')) {
          errorMessage = '该PDF文件已加密，无法添加水印'
        } else if (err.message.includes('load') || err.message.includes('加载')) {
          errorMessage = '无法加载PDF文件，请确保文件格式正确'
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!watermarkedBlob || !selectedFile) return
    
    pdfUtils.downloadPdf(watermarkedBlob, `watermarked_${selectedFile.name}`)
  }

  const handleReset = () => {
    setSelectedFile(null)
    setIsWatermarked(false)
    setWatermarkedBlob(null)
    setError('')
  }

  if (!tool) {
    return <div className="p-8 text-center">工具不存在</div>
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        {!selectedFile ? (
          <FileUploader
            onFileSelect={handleFileSelect}
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
                  fileName={selectedFile.name}
                  subtitle="支持平铺/居中水印，并提供实时预览"
                  onReselect={handleReset}
                  disabled={isProcessing}
                />

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-6">
                      <div className="w-16 text-right">
                        <span className="text-gray-600">文字</span>
                      </div>
                      <div className="flex-1 flex flex-wrap items-center gap-4">
                        <input
                          type="text"
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                          className="w-full max-w-xs px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
                          placeholder="在此输入文本"
                        />
                        <select
                          value={fontSize}
                          onChange={(e) => setFontSize(parseInt(e.target.value))}
                          className="appearance-none px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3] bg-white cursor-pointer"
                        >
                          {fontSizeOptions.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                        <select
                          value={selectedColor}
                          onChange={(e) => setSelectedColor(e.target.value)}
                          className="appearance-none px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3] bg-white cursor-pointer"
                        >
                          {colorOptions.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                <div>
                  <div className="flex items-center gap-6">
                    <div className="w-16 text-right">
                      <span className="text-gray-600">透明</span>
                    </div>
                    <div className="flex-1 flex items-center gap-4">
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={opacity}
                        onChange={(e) => setOpacity(parseInt(e.target.value))}
                        className="flex-1 max-w-xs h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#3b6de3]"
                      />
                      <div className="w-16 px-3 py-2 border border-gray-200 rounded-lg text-center">
                        <span className="text-gray-700 font-mono text-sm">{opacity}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-6">
                    <div className="w-16 text-right">
                      <span className="text-gray-600">位置</span>
                    </div>
                    <div className="flex-1 flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="position"
                          checked={position === 'tile'}
                          onChange={() => setPosition('tile')}
                          className="w-4 h-4 text-[#3b6de3] focus:ring-[#3b6de3]"
                        />
                        <span className="text-gray-700">平铺</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="position"
                          checked={position === 'center'}
                          onChange={() => setPosition('center')}
                          className="w-4 h-4 text-[#3b6de3] focus:ring-[#3b6de3]"
                        />
                        <span className="text-gray-700">居中</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-6">
                    <div className="w-16 text-right">
                      <span className="text-gray-600">旋转</span>
                    </div>
                    <div className="flex-1 flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="rotation"
                          checked={rotation === '45'}
                          onChange={() => setRotation('45')}
                          className="w-4 h-4 text-[#3b6de3] focus:ring-[#3b6de3]"
                        />
                        <span className="text-gray-700">45°</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="rotation"
                          checked={rotation === '-45'}
                          onChange={() => setRotation('-45')}
                          className="w-4 h-4 text-[#3b6de3] focus:ring-[#3b6de3]"
                        />
                        <span className="text-gray-700">-45°</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="rotation"
                          checked={rotation === '0'}
                          onChange={() => setRotation('0')}
                          className="w-4 h-4 text-[#3b6de3] focus:ring-[#3b6de3]"
                        />
                        <span className="text-gray-700">不旋转</span>
                      </label>
                    </div>
                  </div>
                </div>

                {error ? <div className="text-sm text-red-600">{error}</div> : null}

                <div className="flex gap-3 flex-wrap">
                  <ActionButton onClick={handleAddWatermark} loading={isProcessing} disabled={isProcessing}>
                    添加水印
                  </ActionButton>
                  {isWatermarked ? (
                    <ActionButton
                      variant="secondary"
                      onClick={handleDownload}
                      disabled={!watermarkedBlob || isProcessing}
                      leftIcon={<FileDown size={18} />}
                    >
                      下载文件
                    </ActionButton>
                  ) : null}
                </div>
              </div>
            </div>
            }
            right={
              <div className="space-y-4">
                <PdfInfoCard
                  title="效果预览"
                  rightSlot={
                    isWatermarked ? <div className="px-2 py-1 bg-green-500 text-white text-xs rounded">已完成</div> : null
                  }
                >
                  <div className="w-full aspect-[3/4] border border-gray-200 rounded-lg flex items-center justify-center bg-white overflow-hidden">
                    {previewImage ? (
                      <img src={previewImage} alt="水印效果预览" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <div className="text-gray-400 text-center">
                        <Eye size={32} className="mx-auto mb-2 opacity-50" />
                        <div className="text-sm">实时预览</div>
                      </div>
                    )}
                  </div>
                </PdfInfoCard>
                <div className="text-sm text-gray-500 leading-relaxed">预览仅用于参考，实际效果以下载文件为准。</div>
              </div>
            }
          />
        )}
      </div>
    </ToolPageTemplate>
  )
}

export default PdfWatermark
