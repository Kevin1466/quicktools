import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, QrCode } from 'lucide-react'

interface ExchangeModalProps {
  isOpen: boolean
  onClose: () => void
}

const ExchangeModal: React.FC<ExchangeModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      const original = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleEsc)
        document.body.style.overflow = original
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-gradient-to-br from-gray-900/30 via-gray-800/20 to-gray-900/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#eef4ff] to-[#dde7ff] rounded-xl">
              <QrCode className="w-5 h-5 text-[#3b6de3]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">交流</h2>
              <p className="text-xs text-gray-500">扫码关注，方便后续联系</p>
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

        <div className="px-6 py-6">
          <div className="bg-gradient-to-br from-[#f6f7fb] to-white rounded-2xl border border-gray-100 p-4">
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-3">
              <img
                src="/imgs/xhs.jpg"
                alt="小红书二维码"
                className="w-full aspect-square object-contain rounded-xl"
                draggable={false}
              />
            </div>
            <div className="mt-4 text-center">
              <div className="text-sm font-medium text-gray-900">小红书</div>
              <div className="mt-1 text-xs text-gray-500">打开小红书扫一扫</div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default ExchangeModal

