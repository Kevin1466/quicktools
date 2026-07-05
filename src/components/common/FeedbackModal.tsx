import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, Send, CheckCircle, MessageSquare, Bug, Lightbulb, HelpCircle } from 'lucide-react'
import { getCategories } from '@/data/toolsFromJson'
import { umamiTrackEvent } from '@/utils/umami'

type FeedbackType = 'bug' | 'suggest' | 'other'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const categories = getCategories()
  const dialogRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  const [feedbackType, setFeedbackType] = useState<FeedbackType>('bug')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [description, setDescription] = useState('')
  const [contact, setContact] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // ESC 键关闭弹框
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !submitSuccess) onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      // 锁定背景滚动
      const original = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleEsc)
        document.body.style.overflow = original
      }
    }
  }, [isOpen, onClose, submitSuccess])

  // 重置表单
  useEffect(() => {
    if (isOpen) {
      setSubmitSuccess(false)
      setDescription('')
      setContact('')
      setSelectedCategory('')
      setFeedbackType('bug')
      setAttemptedSubmit(false)
      setSubmitError('')
      requestAnimationFrame(() => descriptionRef.current?.focus())
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e?: React.SyntheticEvent) => {
    e?.preventDefault()
    setAttemptedSubmit(true)
    setSubmitError('')
    if (!description.trim()) {
      descriptionRef.current?.focus()
      return
    }

    setIsSubmitting(true)

    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: feedbackType,
        categoryId: selectedCategory || undefined,
        description,
        contact: contact || undefined,
        pathname: window.location.pathname,
      }),
    })
      .then(async (r) => {
        if (!r.ok) {
          const data = (await r.json().catch(() => null)) as any
          throw new Error(data?.message || '提交失败')
        }
        return r.json()
      })
      .then(() => {
        umamiTrackEvent('feedback_submit', {
          type: feedbackType,
          categoryId: selectedCategory || undefined,
          hasContact: Boolean(contact),
        })
        setSubmitSuccess(true)
      })
      .catch((err) => {
        setSubmitError(err instanceof Error ? err.message : '提交失败')
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const typeOptions: Array<{
    value: FeedbackType
    label: string
    icon: React.ReactNode
    desc: string
  }> = [
    {
      value: 'bug',
      label: '问题反馈',
      icon: <Bug size={18} />,
      desc: '功能异常、错误或不符合预期',
    },
    {
      value: 'suggest',
      label: '功能建议',
      icon: <Lightbulb size={18} />,
      desc: '新功能或改进建议',
    },
    {
      value: 'other',
      label: '其他',
      icon: <MessageSquare size={18} />,
      desc: '其他任何想法或疑问',
    },
  ]

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-gray-900/30 via-gray-800/20 to-gray-900/30 backdrop-blur-sm transition-opacity"
        onClick={submitSuccess ? undefined : onClose}
      />

      {/* 弹框主体 */}
      <div
        ref={dialogRef}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {submitSuccess ? (
          /* 提交成功界面 */
          <div className="px-8 py-12 flex flex-col items-center text-center">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-50" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">提交成功</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              感谢您的反馈，我们已收到并会认真处理。<br />
              您可以继续使用其他工具。
            </p>
            <button
              onClick={onClose}
              className="px-8 py-2.5 bg-gradient-to-r from-[#3b6de3] to-[#5b7de3] text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium"
            >
              我知道了
            </button>
          </div>
        ) : (
          <>
            {/* 顶部标题栏 */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#eef4ff] to-[#dde7ff] rounded-xl">
                  <HelpCircle className="w-5 h-5 text-[#3b6de3]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">意见反馈</h2>
                  <p className="text-xs text-gray-500">您的建议对我们非常重要</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 表单内容 */}
            <form onSubmit={(e) => handleSubmit(e)} className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* 反馈类型 - 单选框 */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-900 mb-3">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  <span>反馈类型</span>
                </label>
                <div className="space-y-2.5">
                  {typeOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                        feedbackType === opt.value
                          ? 'border-[#3b6de3] bg-[#f5f8ff]'
                          : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="feedbackType"
                        value={opt.value}
                        checked={feedbackType === opt.value}
                        onChange={() => setFeedbackType(opt.value)}
                        className="sr-only"
                      />
                      {/* 自定义单选框样式 */}
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          feedbackType === opt.value
                            ? 'border-[#3b6de3]'
                            : 'border-gray-300'
                        }`}
                      >
                        {feedbackType === opt.value && (
                          <div className="w-2 h-2 bg-[#3b6de3] rounded-full" />
                        )}
                      </div>
                      <div
                        className={`flex-shrink-0 ${
                          feedbackType === opt.value ? 'text-[#3b6de3]' : 'text-gray-500'
                        }`}
                      >
                        {opt.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm font-medium ${
                            feedbackType === opt.value ? 'text-[#3b6de3]' : 'text-gray-800'
                          }`}
                        >
                          {opt.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 所属类目 - 下拉框 */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  所属类目
                  <span className="text-gray-400 text-xs ml-1 font-normal">（选填）</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b6de3]/20 focus:border-[#3b6de3] focus:bg-white transition-all text-sm appearance-none cursor-pointer"
                  >
                    <option value="">请选择类目</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 详细描述 */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-900 mb-2">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  <span>详细描述</span>
                </label>
                <textarea
                  ref={descriptionRef}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={`请详细描述${feedbackType === 'bug' ? '您遇到的问题' : '您的建议'}，以便我们更好地处理。`}
                  rows={4}
                  maxLength={500}
                  className={`w-full px-4 py-3 bg-gray-50/50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all text-sm resize-none ${
                    attemptedSubmit && !description.trim()
                      ? 'border-red-300 focus:ring-red-200/50 focus:border-red-400'
                      : 'border-gray-200 focus:ring-[#3b6de3]/20 focus:border-[#3b6de3]'
                  }`}
                />
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-red-500">
                    {attemptedSubmit && !description.trim() ? '请填写详细描述' : null}
                  </span>
                  <span className="text-xs text-gray-400">{description.length} / 500</span>
                </div>
              </div>

              {/* 联系方式 */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  联系方式
                  <span className="text-gray-400 text-xs ml-1 font-normal">（选填）</span>
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="邮箱或手机号，方便我们与您联系"
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b6de3]/20 focus:border-[#3b6de3] focus:bg-white transition-all text-sm"
                />
              </div>

            </form>

            {/* 底部按钮区 */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/30">
              <div className="text-xs text-red-500">{submitError || null}</div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || !description.trim()}
                  onClick={() => handleSubmit()}
                  className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-[#3b6de3] to-[#5b7de3] text-white text-sm rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>提交中</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>提交反馈</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}

export default FeedbackModal
