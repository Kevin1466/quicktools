import { Upload } from 'lucide-react'
import { useRef, useState } from 'react'

interface FileUploaderProps {
  onFileSelect?: (file: File) => void
  onFilesSelect?: (files: FileList) => void
  accept?: string
  multiple?: boolean
  className?: string
  placeholder?: string
  primaryActionText?: string
  showFormatHint?: boolean
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  onFilesSelect,
  accept = '*/*',
  multiple = false,
  className = '',
  placeholder = '点击或拖拽文件到此处',
  primaryActionText,
  showFormatHint = true
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (multiple && onFilesSelect) {
      onFilesSelect(files)
    } else if (onFileSelect) {
      onFileSelect(files[0])
    }
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    if (multiple && onFilesSelect) {
      onFilesSelect(files)
    } else if (onFileSelect) {
      onFileSelect(files[0])
    }
  }

  return (
    <div className={className}>
      <div
        onClick={handleClick}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragOver ? 'border-[#3b6de3] bg-[#eef4ff]' : 'border-gray-200 hover:border-[#3b6de3] hover:bg-[#eef4ff]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
        {primaryActionText ? (
          <div className="flex flex-col items-center justify-center gap-3">
            <p className="text-gray-500 text-sm">{placeholder}</p>
            <p className="text-gray-400 text-sm">或者</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleClick()
              }}
              className="px-8 py-2.5 bg-[#3b6de3] text-white rounded-lg hover:bg-[#2a52c2] transition"
            >
              {primaryActionText}
            </button>
            {showFormatHint ? <p className="text-gray-400 text-xs">支持的格式：{accept}</p> : null}
          </div>
        ) : (
          <>
            <Upload size={40} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 text-sm">{placeholder}</p>
            {showFormatHint ? <p className="text-gray-400 text-xs mt-1">支持的格式：{accept}</p> : null}
          </>
        )}
      </div>
    </div>
  )
}

export default FileUploader
