import { useState } from 'react'
import { ChevronLeft, Send, CheckCircle, MessageSquare, Bug, Lightbulb, Info } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getCategories } from '@/data/toolsFromJson'

const FeedbackPage: React.FC = () => {
  const navigate = useNavigate()
  const categories = getCategories()
  
  const [feedbackType, setFeedbackType] = useState<'bug' | 'suggest' | 'other'>('bug')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [description, setDescription] = useState('')
  const [contact, setContact] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return

    setIsSubmitting(true)
    
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitSuccess(true)
    }, 1500)
  }

  const handleBack = () => {
    if (submitSuccess) {
      setSubmitSuccess(false)
      setDescription('')
      setContact('')
      setSelectedCategory('')
      setFeedbackType('bug')
    } else {
      navigate('/')
    }
  }

  if (submitSuccess) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-12">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">提交成功</h2>
        <p className="text-gray-600 text-center max-w-md mb-8">
          感谢您的反馈，我们会尽快处理。
        </p>
        <button
          onClick={handleBack}
          className="px-8 py-3 bg-[#3b6de3] text-white rounded-lg hover:bg-[#2a52c2] transition-all font-medium"
        >
          返回首页
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] py-8 px-6 max-w-3xl mx-auto">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition mb-8"
      >
        <ChevronLeft size={20} />
        <span>返回</span>
      </button>

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">意见反馈</h1>
        <p className="text-gray-600">
          我们非常重视您的反馈，请留下您宝贵的意见，帮助我们做得更好。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            反馈类型
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setFeedbackType('bug')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                feedbackType === 'bug'
                  ? 'border-[#3b6de3] bg-[#eef4ff] text-[#3b6de3]'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Bug size={18} />
              <span>问题反馈</span>
            </button>
            <button
              type="button"
              onClick={() => setFeedbackType('suggest')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                feedbackType === 'suggest'
                  ? 'border-[#3b6de3] bg-[#eef4ff] text-[#3b6de3]'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Lightbulb size={18} />
              <span>功能建议</span>
            </button>
            <button
              type="button"
              onClick={() => setFeedbackType('other')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                feedbackType === 'other'
                  ? 'border-[#3b6de3] bg-[#eef4ff] text-[#3b6de3]'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <MessageSquare size={18} />
              <span>其他</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            所属类目
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b6de3]/30 focus:border-[#3b6de3] transition-all"
          >
            <option value="">请选择类目</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            详细描述 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`请详细描述您的${feedbackType === 'bug' ? '问题' : '建议'}，以便我们更好地理解和处理。`}
            rows={8}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b6de3]/30 focus:border-[#3b6de3] transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            联系方式（选填）
          </label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="请留下您的邮箱或手机号，方便我们与您联系"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b6de3]/30 focus:border-[#3b6de3] transition-all"
          />
        </div>

        <div className="flex items-start gap-3 p-4 bg-[#f6f7fb] rounded-xl">
          <Info className="w-5 h-5 text-[#3b6de3] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">
            您的所有反馈都会被认真对待，我们会定期整理和处理，
            感谢您对百宝箱的支持！
          </p>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !description.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#3b6de3] text-white rounded-xl hover:bg-[#2a52c2] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>提交中...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>提交反馈</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default FeedbackPage
