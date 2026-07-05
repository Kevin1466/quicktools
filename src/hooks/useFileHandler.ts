import { useState, useCallback, useRef } from 'react'

export const useFileHandler = () => {
  const [file, setFile] = useState<File | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((selectedFile: File) => {
    setError(null)
    setFile(selectedFile)
    setFiles([selectedFile])
  }, [])

  const handleFilesSelect = useCallback((fileList: FileList) => {
    setError(null)
    const fileArray = Array.from(fileList)
    setFiles(fileArray)
    setFile(fileArray[0] || null)
  }, [])

  const clearFiles = useCallback(() => {
    setFile(null)
    setFiles([])
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const validateFile = useCallback((selectedFile: File, options: {
    maxSize?: number
    allowedTypes?: string[]
  } = {}) => {
    const { maxSize, allowedTypes } = options

    if (maxSize && selectedFile.size > maxSize) {
      setError(`文件大小超过限制，最大允许 ${maxSize / 1024 / 1024}MB`)
      return false
    }

    if (allowedTypes && !allowedTypes.includes(selectedFile.type)) {
      setError('不支持的文件类型')
      return false
    }

    return true
  }, [])

  return {
    file,
    files,
    error,
    fileInputRef,
    handleFileSelect,
    handleFilesSelect,
    clearFiles,
    validateFile,
    setError
  }
}

export default useFileHandler
