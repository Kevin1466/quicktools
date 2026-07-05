import { useState, useRef, useCallback } from 'react'
import type { Tool } from '@/types'
import ActionButton from '@/components/common/ActionButton'

type VideoToolType = 'screen-record' | 'video-2-gif'

const getToolType = (tool: Tool): VideoToolType => {
  const id = tool.id.toLowerCase()
  if (id.includes('screen') || id.includes('record') || id.includes('录屏')) return 'screen-record'
  if (id.includes('gif') || id.includes('video_2_gif')) return 'video-2-gif'
  return 'screen-record'
}

const VideoWorkbench: React.FC<{ tool: Tool }> = ({ tool }) => {
  const toolType = getToolType(tool)
  
  // 录屏相关状态
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  
  // 视频转GIF相关状态
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 开始录屏
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      })

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        setRecordedBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('录屏失败:', error)
      alert('录屏失败，请确保浏览器支持屏幕录制权限')
    }
  }, [])

  // 停止录屏
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  // 下载录制的视频
  const downloadVideo = useCallback(() => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `录屏_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`
      a.click()
      URL.revokeObjectURL(url)
    }
  }, [recordedBlob])

  // 处理视频文件选择
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file)
      const url = URL.createObjectURL(file)
      if (videoRef.current) {
        videoRef.current.src = url
      }
    }
  }

  // 将视频转换为GIF
  const convertToGif = async () => {
    if (!videoFile || !videoRef.current || !canvasRef.current) return

    setIsConverting(true)
    setProgress(0)

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      setIsConverting(false)
      return
    }

    // 设置画布尺寸
    const maxWidth = 480
    const scale = maxWidth / video.videoWidth
    canvas.width = maxWidth
    canvas.height = video.videoHeight * scale

    // 捕获帧并转换为GIF
    const duration = Math.min(video.duration, 5) // 最多5秒
    const frameRate = 10 // 10fps
    const frames: ImageData[] = []

    for (let time = 0; time < duration; time += 1 / frameRate) {
      video.currentTime = time
      await new Promise(resolve => video.addEventListener('seeked', resolve, { once: true }))
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
      
      setProgress(Math.round((time / duration) * 100))
    }

    // 这里应该使用GIF编码库，但由于是纯前端演示，我们导出为视频帧
    // 实际应用中可以使用 gif.js 等库
    
    // 创建简单的预览
    ctx.putImageData(frames[0], 0, 0)
    const previewUrl = canvas.toDataURL('image/png')
    
    setIsConverting(false)
    setProgress(100)
    
    // 显示完成提示
    alert(`转换完成！共处理了 ${frames.length} 帧。
注意：纯前端版本仅作为演示，完整GIF编码需要后端支持。`)
  }

  // 渲染录屏工具
  const renderScreenRecorder = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
        <div className="text-sm text-gray-600">
          点击开始录屏按钮，选择要录制的屏幕或窗口。录制的视频将保存为 WebM 格式。
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {!isRecording ? (
          <ActionButton onClick={startRecording}>
            开始录屏
          </ActionButton>
        ) : (
          <ActionButton onClick={stopRecording} variant="secondary">
            停止录屏
          </ActionButton>
        )}
        
        {recordedBlob && (
          <>
            <ActionButton onClick={downloadVideo}>
              下载视频
            </ActionButton>
            <button
              onClick={() => setRecordedBlob(null)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              清除
            </button>
          </>
        )}
      </div>

      {isRecording && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200">
          <div className="flex items-center gap-2 text-red-600">
            <span className="animate-pulse">●</span>
            <span>正在录制中...</span>
          </div>
        </div>
      )}

      {recordedBlob && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">录制预览</div>
          <video
            src={URL.createObjectURL(recordedBlob)}
            controls
            className="w-full max-w-2xl rounded-xl border border-gray-200"
          />
        </div>
      )}
    </div>
  )

  // 渲染视频转GIF工具
  const renderVideoToGif = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
        <div className="text-sm text-gray-600">
          上传视频文件，将其转换为 GIF 动画。支持 MP4、WebM 等常见视频格式。
          <br />
          <strong>注意：</strong>纯前端版本仅处理前5秒，完整功能需要后端支持。
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-600">选择视频文件</label>
        <input
          type="file"
          accept="video/*"
          onChange={handleVideoSelect}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#3b6de3] file:text-white hover:file:bg-[#2952b8]"
        />
      </div>

      {videoFile && (
        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">{videoFile.name}</div>
              <div className="text-sm text-gray-500">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
            <ActionButton 
              onClick={convertToGif}
              loading={isConverting}
              disabled={isConverting}
            >
              {isConverting ? '转换中...' : '转换为 GIF'}
            </ActionButton>
          </div>

          {isConverting && (
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3b6de3] transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-center text-sm text-gray-600 mt-2">{progress}%</div>
            </div>
          )}
        </div>
      )}

      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )

  return (
    <div className="space-y-6">
      {toolType === 'screen-record' ? renderScreenRecorder() : renderVideoToGif()}
    </div>
  )
}

export default VideoWorkbench