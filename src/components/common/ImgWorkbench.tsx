import { useState } from 'react'
import type { Tool } from '@/types'
import ActionButton from '@/components/common/ActionButton'
import FileUploader from '@/components/common/FileUploader'

type ImgToolType = 
  | 'img-compress' | 'id-photo' | 'ocr' | 'img-edit' | 'img-convert'
  | 'img-enlarge' | 'img-filter' | 'gif-tool' | 'qrcode' | 'img-anime'
  | 'img-face' | 'img-beauty' | 'img-repair' | 'img-pixel' | 'img-grid'
  | 'img-secret' | 'biaoqing' | 'img-scan' | 'img-visit-card'
  | 'img-canvas' | 'img-text' | 'img-split' | 'img-cartoon'
  | 'img-watercolor' | 'img-painting' | 'img-human' | 'img-enhance'
  | 'img-jordan' | 'img-fix' | 'img-wrap' | 'img-fade' | 'img-pixelate'
  | 'img-9grid' | 'img-secret-msg' | 'face-age' | 'face-gender'
  | 'avatar-pendant' | 'img-ai-face' | 'img-ai-cartoon'

const getToolType = (tool: Tool): ImgToolType => {
  const id = tool.id.toLowerCase()
  const name = tool.name.toLowerCase()
  
  // 图片压缩
  if (id.includes('compress') || id.includes('yasuo') || id.includes('slim')) return 'img-compress'
  
  // 证件照
  if (id.includes('id_photo') || id.includes('证件照')) return 'id-photo'
  
  // OCR识别类
  if (id.includes('ocr') || id.includes('identification') || id.includes('recognize') || 
      id.includes('识别') || id.includes('提取文字') || id.includes('bankcard') || 
      id.includes('passport') || id.includes('waybill') || id.includes('container') ||
      id.includes('businesscard') || id.includes('bizlicense') || id.includes('bankslip') ||
      id.includes('medical') || id.includes('taxi') || id.includes('dutypaid') ||
      id.includes('permit') || id.includes('carcard') || id.includes('basic') ||
      id.includes('handwriting') || id.includes('advertise') || id.includes('english')) return 'ocr'
  
  // 图片编辑
  if (id.includes('edit') || id.includes('canvas')) return 'img-edit'
  
  // 图片格式转换
  if (id.includes('convert') || id.includes('format')) return 'img-convert'
  
  // 图片放大
  if (id.includes('enlarge') || id.includes('放大')) return 'img-enlarge'
  
  // 滤镜
  if (id.includes('filter') || id.includes('anime') || id.includes('painting') || 
      id.includes('滤镜') || id.includes('动漫') || id.includes('油画')) return 'img-filter'
  
  // GIF工具
  if (id.includes('gif') || id.includes('splitter') || id.includes('create')) return 'gif-tool'
  
  // 二维码
  if (id.includes('qrcode') || id.includes('qr') || id.includes('二维码') || id.includes('扫描')) return 'qrcode'
  
  // 动漫/卡通
  if (id.includes('cartoon') || id.includes('anime') || id.includes('二次元') || id.includes('卡通')) return 'img-anime'
  
  // 人脸相关
  if (id.includes('face') || id.includes('人脸') || id.includes('头像')) return 'img-face'
  
  // 美化
  if (id.includes('beauty') || id.includes('美化')) return 'img-beauty'
  
  // 修复
  if (id.includes('repair') || id.includes('fix') || id.includes('修复') || id.includes('去摩尔纹') || id.includes('enhance')) return 'img-repair'
  
  // 像素化
  if (id.includes('pixel') || id.includes('像素')) return 'img-pixel'
  
  // 九宫格
  if (id.includes('9grid') || id.includes('grid') || id.includes('九宫格')) return 'img-grid'
  
  // 隐写
  if (id.includes('secret') || id.includes('隐写')) return 'img-secret'
  
  // 表情包
  if (id.includes('biaoqing') || id.includes('表情')) return 'biaoqing'
  
  // 名片
  if (id.includes('visit') || id.includes('card') || id.includes('名片')) return 'img-visit-card'
  
  // 年龄变换
  if (id.includes('age') || id.includes('年龄')) return 'face-age'
  
  // 性别变换
  if (id.includes('gender') || id.includes('性别')) return 'face-gender'
  
  // 挂件
  if (id.includes('pendant') || id.includes('挂件')) return 'avatar-pendant'
  
  return 'img-edit'
}

const ImgWorkbench: React.FC<{ tool: Tool }> = ({ tool }) => {
  const toolType = getToolType(tool)
  
  const [files, setFiles] = useState<File[]>([])
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  
  // 压缩级别/质量
  const [quality, setQuality] = useState(80)
  
  // 尺寸设置
  const [targetWidth, setTargetWidth] = useState('')
  const [targetHeight, setTargetHeight] = useState('')
  
  // 滤镜/效果选择
  const [selectedEffect, setSelectedEffect] = useState('')
  
  // 文字输入（水印、表情包等）
  const [textInput, setTextInput] = useState('')
  
  // 颜色选择
  const [selectedColor, setSelectedColor] = useState('#000000')

  const handleFilesSelect = (newFiles: FileList) => {
    const filesArray = Array.from(newFiles)
    
    // 根据工具类型验证文件
    const isImageTool = !toolType.includes('gif') && !toolType.includes('qrcode')
    const isGifTool = toolType.includes('gif')
    
    if (isImageTool || isGifTool) {
      const imageFiles = filesArray.filter(f => f.type.startsWith('image/'))
      if (imageFiles.length !== filesArray.length) {
        alert('请选择图片文件')
      }
      setFiles(prev => [...prev, ...imageFiles])
    } else {
      setFiles(prev => [...prev, ...filesArray])
    }
    setResult(null)
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const showUnsupported = async () => {
    if (files.length === 0 && !toolType.includes('qrcode')) {
      alert('请先上传图片')
      return
    }

    setResult({
      success: false,
      message:
        '该工具需要真实的图像处理/模型推理能力（或服务端处理）。当前版本不提供“模拟处理/虚假下载”。请使用已实现的专用工具页面，或接入后端后再启用。'
    })
  }

  const getToolTitle = () => {
    const titles: Record<ImgToolType, string> = {
      'img-compress': '图片压缩',
      'id-photo': '证件照生成',
      'ocr': '文字识别',
      'img-edit': '图片编辑',
      'img-convert': '图片格式转换',
      'img-enlarge': '图片放大',
      'img-filter': '滤镜效果',
      'gif-tool': 'GIF工具',
      'qrcode': '二维码生成',
      'img-anime': '动漫风格',
      'img-face': '人脸处理',
      'img-beauty': '图片美化',
      'img-repair': '图片修复',
      'img-pixel': '像素化',
      'img-grid': '九宫格',
      'img-secret': '图片隐写',
      'biaoqing': '表情包制作',
      'img-scan': '二维码扫描',
      'img-visit-card': '二维码名片',
      'img-canvas': '图片编辑器',
      'img-text': '图片转字符画',
      'img-split': '人像分割',
      'img-cartoon': '卡通画',
      'img-watercolor': '水彩风',
      'img-painting': '油画滤镜',
      'img-human': '人像分割',
      'img-enhance': '图片增强',
      'img-jordan': '乔丹风格',
      'img-fix': '图片修复',
      'img-wrap': '扭曲恢复',
      'img-fade': '黑白化',
      'img-pixelate': '像素化',
      'img-9grid': '九宫格',
      'img-secret-msg': '隐写',
      'face-age': '年龄变换',
      'face-gender': '性别转换',
      'avatar-pendant': '头像挂件',
      'img-ai-face': '童话脸',
      'img-ai-cartoon': '卡通画'
    }
    return titles[toolType] || '图片处理工具'
  }

  const getToolDescription = () => {
    const descriptions: Record<ImgToolType, string> = {
      'img-compress': '智能压缩图片，减小文件大小同时保持画质',
      'id-photo': '一键生成标准证件照，支持多种规格',
      'ocr': '识别图片中的文字，支持多种语言和证件类型',
      'img-edit': '在线编辑图片，裁剪、旋转、调整参数',
      'img-convert': '转换图片格式，支持 JPG、PNG、WebP 等',
      'img-enlarge': '智能放大图片，保持清晰度',
      'img-filter': '应用滤镜效果，美化图片',
      'gif-tool': 'GIF 制作与分解，创建动态图片',
      'qrcode': '生成二维码，支持文本、链接、名片等',
      'img-anime': '将照片转换为动漫风格',
      'img-face': '人脸处理与变换',
      'img-beauty': '一键美化图片',
      'img-repair': '修复损坏或老化的照片',
      'img-pixel': '像素化图片，创建复古效果',
      'img-grid': '九宫格切图，适合社交媒体',
      'img-secret': '图片隐写，隐藏信息在图片中',
      'biaoqing': '制作表情包，添加文字到图片',
      'img-scan': '扫描二维码和条形码',
      'img-visit-card': '生成二维码名片',
      'img-canvas': '高级图片编辑器',
      'img-text': '将图片转换为字符画',
      'img-split': '人像分割，抠出人物',
      'img-cartoon': '卡通风格转换',
      'img-watercolor': '水彩风格转换',
      'img-painting': '油画风格滤镜',
      'img-human': '人像分割与处理',
      'img-enhance': '图片增强与去噪',
      'img-jordan': '乔丹风格滤镜',
      'img-fix': '图片修复与去摩尔纹',
      'img-wrap': '文档扭曲恢复',
      'img-fade': '图片黑白化',
      'img-pixelate': '图片像素化',
      'img-9grid': '九宫格切图',
      'img-secret-msg': '图片隐写信息',
      'face-age': '人脸年龄变换',
      'face-gender': '人脸性别转换',
      'avatar-pendant': '头像挂件装饰',
      'img-ai-face': 'AI童话脸',
      'img-ai-cartoon': 'AI卡通画'
    }
    return descriptions[toolType] || '图片处理工具'
  }

  // 获取接受的文件类型
  const getAcceptTypes = () => {
    if (toolType === 'gif-tool') return 'image/gif'
    if (toolType === 'qrcode' || toolType === 'img-scan') return 'image/*'
    return 'image/*'
  }

  // 判断是否显示文件上传
  const shouldShowUploader = () => {
    // 二维码生成不需要上传文件
    if (toolType === 'qrcode' && !tool.id.includes('scan')) return false
    return true
  }

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
        <div className="font-medium text-gray-900 mb-1">{getToolTitle()}</div>
        <div className="text-sm text-gray-600">{getToolDescription()}</div>
      </div>

      {shouldShowUploader() && (
        <FileUploader
          onFilesSelect={handleFilesSelect}
          accept={getAcceptTypes()}
          placeholder="点击或拖拽图片到此处"
          multiple={toolType === 'gif-tool' || toolType === 'img-grid'}
        />
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">已选择的文件</div>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="p-3 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🖼️</span>
                  <div>
                    <div className="font-medium text-gray-900">{file.name}</div>
                    <div className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  移除
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 压缩质量设置 */}
      {toolType === 'img-compress' && (
        <div className="space-y-3">
          <label className="text-sm text-gray-600">压缩质量: {quality}%</label>
          <input
            type="range"
            min="10"
            max="100"
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>低质量（文件小）</span>
            <span>高质量（文件大）</span>
          </div>
        </div>
      )}

      {/* 尺寸设置 */}
      {(toolType === 'img-enlarge' || toolType === 'img-edit') && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">目标宽度 (px)</label>
            <input
              type="number"
              value={targetWidth}
              onChange={(e) => setTargetWidth(e.target.value)}
              placeholder="自动"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">目标高度 (px)</label>
            <input
              type="number"
              value={targetHeight}
              onChange={(e) => setTargetHeight(e.target.value)}
              placeholder="自动"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3]"
            />
          </div>
        </div>
      )}

      {/* 滤镜/效果选择 */}
      {(toolType === 'img-filter' || toolType === 'img-anime' || toolType === 'img-cartoon' || 
        toolType === 'img-watercolor' || toolType === 'img-painting' || toolType === 'img-jordan') && (
        <div className="space-y-2">
          <label className="text-sm text-gray-600">选择效果</label>
          <div className="grid grid-cols-3 gap-2">
            {['原图', '效果1', '效果2', '效果3', '效果4', '效果5'].map((effect, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedEffect(effect)}
                className={`p-3 rounded-xl border text-sm transition ${
                  selectedEffect === effect
                    ? 'border-[#3b6de3] bg-[#eef4ff] text-[#3b6de3]'
                    : 'border-gray-200 hover:border-[#3b6de3]'
                }`}
              >
                {effect}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 文字输入（水印、表情包等） */}
      {(toolType === 'biaoqing' || toolType === 'img-secret-msg') && (
        <div className="space-y-2">
          <label className="text-sm text-gray-600">
            {toolType === 'biaoqing' ? '输入文字' : '要隐藏的信息'}
          </label>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={toolType === 'biaoqing' ? '输入表情包文字...' : '输入要隐藏的信息...'}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] resize-none"
          />
        </div>
      )}

      {/* 颜色选择 */}
      {(toolType === 'biaoqing' || toolType === 'img-edit') && (
        <div className="space-y-2">
          <label className="text-sm text-gray-600">选择颜色</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer"
            />
            <span className="text-sm text-gray-500">{selectedColor}</span>
          </div>
        </div>
      )}

      {/* 二维码输入区域 */}
      {toolType === 'qrcode' && !tool.id.includes('scan') && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">输入内容</label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="输入文本、URL、联系方式等..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] resize-none"
            />
          </div>
        </div>
      )}

      <ActionButton 
        onClick={showUnsupported}
        disabled={files.length === 0 && !toolType.includes('qrcode')}
      >
        查看说明
      </ActionButton>

      {result && (
        <div className={`p-4 rounded-xl border ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <div className="flex items-center gap-3">
            <span className={`text-2xl ${result.success ? 'text-green-600' : 'text-red-600'}`}>
              {result.success ? '✓' : '✗'}
            </span>
            <div>
              <div className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.message}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImgWorkbench
