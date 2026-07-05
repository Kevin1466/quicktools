import { useState, useEffect, useRef } from 'react'
import { getToolById } from '@/data/toolsFromJson'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import { useAIConfigContext } from '@/contexts/AIConfigContext'
import { callTTS, textToSpeechWithWebAPI } from '@/utils/aiService'

type TTSMode = 'web' | 'ai'

const TextToSpeech: React.FC = () => {
  const tool = getToolById('tts')
  const { config, hasConfig, openModal } = useAIConfigContext()
  
  const [inputText, setInputText] = useState('')
  const [mode, setMode] = useState<TTSMode>('web')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState('')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices().filter(
        v => v.lang.startsWith('zh')
      )
      setVoices(availableVoices)
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0].name)
      }
    }

    loadVoices()
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices
    }

    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [selectedVoice])

  const handlePlayWithWebAPI = () => {
    if (!inputText.trim()) return

    if (speechSynthesis.speaking) {
      speechSynthesis.cancel()
    }

    const utterance = textToSpeechWithWebAPI(inputText, {
      lang: 'zh-CN',
      rate: 1.0,
      pitch: 1.0,
    })

    const voice = voices.find(v => v.name === selectedVoice)
    if (voice) {
      utterance.voice = voice
    }

    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)

    utteranceRef.current = utterance
    speechSynthesis.speak(utterance)
  }

  const handlePlayWithAI = async () => {
    if (!inputText.trim()) return
    if (!hasConfig) {
      openModal()
      return
    }

    setIsLoading(true)
    try {
      const blob = await callTTS(inputText, config, {
        voice: 'alloy',
        speed: 1.0,
      })

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }

      const url = URL.createObjectURL(blob)
      setAudioUrl(url)

      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error('AI TTS 失败:', error)
      alert('AI 语音合成失败: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStop = () => {
    if (mode === 'web') {
      speechSynthesis.cancel()
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
    setIsPlaying(false)
  }

  const handleDownload = () => {
    if (!audioUrl) return
    
    const a = document.createElement('a')
    a.href = audioUrl
    a.download = 'speech.mp3'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (!tool) {
    return <div className="p-8 text-center">工具不存在</div>
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('web')}
              className={`px-4 py-2 text-sm rounded-lg transition ${
                mode === 'web'
                  ? 'bg-[#3b6de3] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              浏览器 TTS
            </button>
            <button
              onClick={() => setMode('ai')}
              className={`px-4 py-2 text-sm rounded-lg transition ${
                mode === 'ai'
                  ? 'bg-[#3b6de3] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              AI TTS
            </button>
          </div>

          {mode === 'web' && voices.length > 0 && (
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#3b6de3]"
            >
              {voices.map(voice => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          )}

          {mode === 'ai' && !hasConfig && (
            <button
              onClick={openModal}
              className="text-sm text-[#3b6de3]"
            >
              配置 API
            </button>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">请输入文本</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="请输入文本"
            className="w-full h-48 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3]"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {!isPlaying ? (
            <button
              onClick={mode === 'web' ? handlePlayWithWebAPI : handlePlayWithAI}
              disabled={!inputText.trim() || (mode === 'ai' && isLoading)}
              className="px-6 py-2.5 bg-[#3b6de3] text-white rounded-lg hover:bg-[#2a52c2] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {isLoading ? '生成中...' : '开始转换'}
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
            >
              停止
            </button>
          )}

          {mode === 'ai' && audioUrl && (
            <button
              onClick={handleDownload}
              className="px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
            >
              下载音频
            </button>
          )}
        </div>

        {mode === 'ai' && (
          <audio
            ref={audioRef}
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            className="w-full"
            controls
          />
        )}

        <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
          <p><strong>{mode === 'web' ? '浏览器 TTS：' : 'AI TTS：'}</strong>
            {mode === 'web' 
              ? '使用浏览器内置的 Web Speech API，免费且无需配置，语音质量取决于浏览器支持。'
              : '使用 OpenAI TTS API，语音质量更高，但需要配置 API Key。'
            }
          </p>
        </div>
      </div>
    </ToolPageTemplate>
  )
}

export default TextToSpeech
