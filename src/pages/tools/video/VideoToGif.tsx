import { useState, useEffect } from 'react'
import GIF from 'gif.js.optimized'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import FileUploader from '@/components/common/FileUploader'
import ActionButton from '@/components/common/ActionButton'

const VideoToGif: React.FC = () => {
  const tool = getToolById('video-2-gif')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [gifUrl, setGifUrl] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    return () => {
      if (gifUrl && gifUrl.startsWith('blob:')) {
        URL.revokeObjectURL(gifUrl)
      }
    }
  }, [gifUrl])

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('请选择有效的视频文件')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('视频大小不能超过 10MB')
      return
    }
    setSelectedFile(file)
    setGifUrl(null)
    setProgress(0)
    setError('')
  }

  const handleConvert = async () => {
    if (!selectedFile) return
    setIsProcessing(true)
    setError('')
    setProgress(0)

    try {
      const videoUrl = URL.createObjectURL(selectedFile)
      const video = document.createElement('video')
      video.muted = true
      video.playsInline = true
      video.src = videoUrl

      await new Promise((resolve, reject) => {
        video.onloadeddata = resolve
        video.onerror = reject
      })

      // 控制最大宽度，避免生成的 GIF 体积过大或内存溢出
      const maxWidth = 480
      let width = video.videoWidth
      let height = video.videoHeight
      if (width > maxWidth) {
        height = Math.floor(height * (maxWidth / width))
        width = maxWidth
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('无法获取 Canvas 上下文')

      const gif = new GIF({
        workers: 2,
        quality: 10,
        width,
        height,
        workerScript: '/gif.worker.js'
      })

      const fps = 10 // 每秒 10 帧
      const delay = 1000 / fps
      // 限制最大转换时长为 15 秒
      const duration = Math.min(video.duration, 15)
      
      let currentTime = 0
      
      const captureFrame = async () => {
        return new Promise<void>((resolve) => {
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, width, height)
            gif.addFrame(canvas, { copy: true, delay })
            resolve()
          }
          video.currentTime = currentTime
        })
      }

      // 逐帧截取视频画面
      while (currentTime < duration) {
        await captureFrame()
        currentTime += 1 / fps
        setProgress(Math.round((currentTime / duration) * 50)) // 前 50% 进度为截帧
      }

      // @ts-ignore: gif.js.optimized types might not include 'progress'
      gif.on('progress', (p: number) => {
        setProgress(50 + Math.round(p * 50)) // 后 50% 进度为 GIF 编码渲染
      })

      gif.on('finished', (blob: Blob) => {
        setGifUrl(URL.createObjectURL(blob))
        setIsProcessing(false)
        URL.revokeObjectURL(videoUrl)
      })

      // 开始渲染 GIF
      gif.render()

    } catch (err) {
      console.error(err)
      setError('转换失败，请重试或检查视频格式')
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!gifUrl) return
    
    // 对于模拟的 GIF
    const link = document.createElement('a')
    link.href = gifUrl
    const originalName = selectedFile?.name.replace(/\.[^/.]+$/, '') || 'video'
    link.download = `${originalName}.gif`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleReset = () => {
    setSelectedFile(null)
    setGifUrl(null)
    setError('')
  }

  if (!tool) return null

  return (
    <ToolPageTemplate tool={tool}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">视频转 GIF</h2>
          <p className="text-gray-500 text-sm">快速将您的视频片段转换为动图，方便分享和传播。</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          {!selectedFile ? (
            <div className="space-y-4">
              <FileUploader
                onFileSelect={handleFileSelect}
                accept="video/*"
                primaryActionText="点击上传视频文件(小于10M)"
                placeholder="如找不到相册中的视频，请选择'文件'"
              />
              {error && <div className="text-sm text-red-600 text-center">{error}</div>}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#3b6de3] bg-opacity-10 rounded-lg flex items-center justify-center text-[#3b6de3]">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 truncate max-w-xs">{selectedFile.name}</h3>
                    <p className="text-sm text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                {!isProcessing && !gifUrl && (
                  <button onClick={handleReset} className="text-gray-400 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {!gifUrl ? (
                <div className="flex flex-col items-center gap-4">
                  {isProcessing && (
                    <div className="w-full max-w-md space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{progress < 50 ? '正在提取视频帧...' : '正在编码 GIF...'}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#3b6de3] h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  <ActionButton onClick={handleConvert} loading={isProcessing} disabled={isProcessing}>
                    {isProcessing ? '转换中' : '转换'}
                  </ActionButton>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="text-center font-medium text-gray-700">转换成功！预览如下：</div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex justify-center items-center min-h-[200px]">
                    <img src={gifUrl} alt="GIF Preview" className="max-w-full max-h-[300px] object-contain" />
                  </div>
                  <div className="flex justify-center gap-4">
                    <ActionButton onClick={handleDownload}>
                      下载 GIF
                    </ActionButton>
                    <ActionButton variant="secondary" onClick={handleReset}>
                      继续转换
                    </ActionButton>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default VideoToGif
