import { useEffect, useMemo, useRef, useState } from 'react'
import ToolPageTemplate from '@/components/common/ToolPageTemplate'
import ActionButton from '@/components/common/ActionButton'
import { getToolById } from '@/data/toolsFromJson'
import { textToSpeechWithWebAPI } from '@/utils/aiService'
import { textToPinyinLocal } from '@/utils/pinyinConverter'

const HanziFayinTool: React.FC = () => {
  const tool = getToolById('hanzifayin')
  const [text, setText] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  if (!tool) return null

  useEffect(() => {
    const load = () => {
      const v = speechSynthesis.getVoices().filter(voice => voice.lang.startsWith('zh'))
      setVoices(v)
    }
    load()
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = load
    }
    return () => {
      speechSynthesis.cancel()
    }
  }, [])

  const pinyin = useMemo(() => {
    const t = text.trim()
    if (!t) return ''
    return textToPinyinLocal(t, 'tone')
  }, [text])

  const speak = () => {
    const t = text.trim()
    if (!t) return
    speechSynthesis.cancel()
    const utterance = textToSpeechWithWebAPI(t, { lang: 'zh-CN', rate: 1.0, pitch: 1.0 })
    const voice = voices[0]
    if (voice) utterance.voice = voice
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    utteranceRef.current = utterance
    speechSynthesis.speak(utterance)
  }

  const stop = () => {
    speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  const copyPinyin = async () => {
    if (!pinyin) return
    await navigator.clipboard.writeText(pinyin)
  }

  return (
    <ToolPageTemplate tool={tool}>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="text-sm text-gray-600">请输入需要练习发音文字</div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="请输入需要练习发音文字"
            className="w-full min-h-[180px] p-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3b6de3] focus:ring-1 focus:ring-[#3b6de3] resize-y"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ActionButton onClick={speak} disabled={!text.trim() || isSpeaking}>
            标准发音
          </ActionButton>
          <ActionButton variant="secondary" onClick={stop} disabled={!isSpeaking}>
            停止
          </ActionButton>
        </div>

        {pinyin ? (
          <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-gray-600">拼音参考</div>
              <ActionButton variant="secondary" size="sm" onClick={copyPinyin}>
                复制
              </ActionButton>
            </div>
            <div className="mt-3 font-mono text-sm text-gray-900 whitespace-pre-wrap break-words">{pinyin}</div>
          </div>
        ) : null}
      </div>
    </ToolPageTemplate>
  )
}

export default HanziFayinTool

