import { useMemo, useRef, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'
import { downloadFile } from '@/utils/fileUtils'

type Status = 'idle' | 'recording' | 'stopped'

const ScreenRecord: React.FC = () => {
  const tool = getToolById('screen-record')
  const [withSystemAudio, setWithSystemAudio] = useState(true)
  const [withMic, setWithMic] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [blob, setBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const micRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  if (!tool) return null

  const supported = useMemo(() => typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getDisplayMedia, [])

  const stopTracks = (stream: MediaStream | null) => {
    if (!stream) return
    stream.getTracks().forEach(t => t.stop())
  }

  const cleanup = () => {
    recorderRef.current = null
    chunksRef.current = []
    stopTracks(streamRef.current)
    stopTracks(micRef.current)
    streamRef.current = null
    micRef.current = null
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error)
      audioContextRef.current = null
    }
  }

  const start = async () => {
    if (!supported) {
      setError('当前浏览器不支持录屏能力')
      return
    }
    setError('')
    setBlob(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: withSystemAudio,
      })
      streamRef.current = displayStream

      let mixStream = displayStream

      if (withMic) {
        const mic = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        micRef.current = mic

        const sysAudioTracks = displayStream.getAudioTracks()
        const micAudioTracks = mic.getAudioTracks()

        if (sysAudioTracks.length > 0 && micAudioTracks.length > 0) {
          // 如果系统声音和麦克风声音都有，使用 AudioContext 进行混音，防止 MediaRecorder 报错
          const audioContext = new AudioContext()
          audioContextRef.current = audioContext
          const dest = audioContext.createMediaStreamDestination()

          const sysSource = audioContext.createMediaStreamSource(new MediaStream(sysAudioTracks))
          sysSource.connect(dest)

          const micSource = audioContext.createMediaStreamSource(new MediaStream(micAudioTracks))
          micSource.connect(dest)

          mixStream = new MediaStream([
            ...displayStream.getVideoTracks(),
            ...dest.stream.getAudioTracks()
          ])
        } else if (micAudioTracks.length > 0) {
          mixStream = new MediaStream([
            ...displayStream.getVideoTracks(),
            ...micAudioTracks
          ])
        }
      }

      const mimeCandidates = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ]
      const mimeType = mimeCandidates.find(t => MediaRecorder.isTypeSupported(t)) || ''

      const recorder = new MediaRecorder(mixStream, mimeType ? { mimeType } : undefined)
      recorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const out = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' })
        setBlob(out)
        setPreviewUrl(URL.createObjectURL(out))
        setStatus('stopped')
        cleanup()
      }

      recorder.start(1000)
      setStatus('recording')

      const videoTrack = displayStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.onended = () => {
          if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop()
        }
      }
    } catch (e) {
      cleanup()
      setStatus('idle')
      setError(e instanceof Error ? e.message : '启动录屏失败')
    }
  }

  const stop = () => {
    const recorder = recorderRef.current
    if (recorder && recorder.state !== 'inactive') recorder.stop()
  }

  const download = () => {
    if (!blob) return
    downloadFile(blob, `screen_record_${Date.now()}.webm`)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        {!supported && (
          <div className="p-4 rounded-xl border border-amber-100 bg-amber-50 text-sm text-amber-800">
            当前浏览器不支持录屏（需要 Chromium 内核并允许 getDisplayMedia）。
          </div>
        )}
        {error && (
          <div className="p-4 rounded-xl border border-red-100 bg-red-50 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={withSystemAudio}
              onChange={(e) => setWithSystemAudio(e.target.checked)}
              className="h-4 w-4"
            />
            <span>系统声音</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={withMic}
              onChange={(e) => setWithMic(e.target.checked)}
              className="h-4 w-4"
            />
            <span>麦克风</span>
          </label>

          {status !== 'recording' ? (
            <ActionButton onClick={start} disabled={!supported}>
              开始录制
            </ActionButton>
          ) : (
            <ActionButton variant="danger" onClick={stop}>
              停止录制
            </ActionButton>
          )}

          <ActionButton variant="secondary" onClick={download} disabled={!blob}>
            下载视频
          </ActionButton>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          {previewUrl ? (
            <video src={previewUrl} controls className="w-full max-h-[520px] bg-black" />
          ) : (
            <div className="h-[260px] flex items-center justify-center text-sm text-gray-500 bg-[#f6f7fb]">
              录制预览区
            </div>
          )}
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default ScreenRecord
