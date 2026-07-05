import { Loader2 } from 'lucide-react'

interface ActionButtonProps {
  onClick?: () => void
  children: React.ReactNode
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  type?: 'button' | 'submit' | 'reset'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  children,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  leftIcon,
  rightIcon
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
  
  const variantClasses = {
    primary: 'bg-[#3b6de3] text-white hover:bg-[#2a52c2] active:bg-[#1f3f9e]',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 active:bg-gray-100',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {!loading && leftIcon ? <span className="mr-2 inline-flex">{leftIcon}</span> : null}
      {loading && <Loader2 size={18} className="mr-2 animate-spin" />}
      {children}
      {rightIcon ? <span className="ml-2 inline-flex">{rightIcon}</span> : null}
    </button>
  )
}

export default ActionButton
