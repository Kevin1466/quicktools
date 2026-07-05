import { FileText } from 'lucide-react'
import ActionButton from '@/components/common/ActionButton'

export const PdfTwoColumn: React.FC<{ left: React.ReactNode; right?: React.ReactNode }> = ({ left, right }) => {
  return (
    <div className="flex flex-col md:flex-row gap-0">
      <div className="flex-1 md:pr-8 md:border-r border-gray-200">{left}</div>
      {right ? <div className="w-full md:w-[320px] md:pl-8 pt-8 md:pt-0">{right}</div> : null}
    </div>
  )
}

export const PdfFileHeader: React.FC<{
  fileName: string
  subtitle?: string
  onReselect: () => void
  disabled?: boolean
  actionText?: string
}> = ({ fileName, subtitle, onReselect, disabled = false, actionText = '重新选择' }) => {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
        <FileText size={18} className="text-red-500" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-gray-900 font-medium truncate">{fileName}</div>
        {subtitle ? <div className="text-xs text-gray-500">{subtitle}</div> : null}
      </div>
      <ActionButton variant="secondary" size="sm" onClick={onReselect} disabled={disabled}>
        {actionText}
      </ActionButton>
    </div>
  )
}

export const PdfInfoCard: React.FC<{ title: string; rightSlot?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  rightSlot,
  children
}) => {
  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-gray-600">{title}</div>
        {rightSlot ? rightSlot : null}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  )
}

