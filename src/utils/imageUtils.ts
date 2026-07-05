import { formatFileSize } from './fileUtils'

const checkImageHasTransparency = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): boolean => {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) {
      return true
    }
  }
  return false
}

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
): Promise<Blob | null> => {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      mimeType,
      quality
    )
  })
}

export const compressImage = async (
  file: File,
  quality: number = 0.8,
  maxWidth?: number,
  maxHeight?: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      img.onload = async () => {
        try {
          let width = img.width
          let height = img.height
          
          if (maxWidth && width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
          
          if (maxHeight && height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
          
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }
          
          if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
            ctx.fillStyle = '#FFFFFF'
            ctx.fillRect(0, 0, width, height)
          }
          
          ctx.drawImage(img, 0, 0, width, height)
          
          let resultBlob: Blob | null = null
          
          if (file.type === 'image/png') {
            const hasTransparency = checkImageHasTransparency(canvas, ctx, width, height)
            
            if (hasTransparency) {
              const webpBlob = await canvasToBlob(canvas, 'image/webp', quality)
              
              if (webpBlob && webpBlob.size < file.size) {
                resultBlob = webpBlob
              } else {
                const pngBlob = await canvasToBlob(canvas, 'image/png')
                if (pngBlob && pngBlob.size < file.size) {
                  resultBlob = pngBlob
                } else {
                  resultBlob = file
                }
              }
            } else {
              let bestBlob: Blob = file
              let bestSize = file.size
              
              const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', quality)
              if (jpegBlob && jpegBlob.size < bestSize) {
                bestBlob = jpegBlob
                bestSize = jpegBlob.size
              }
              
              const webpBlob = await canvasToBlob(canvas, 'image/webp', quality)
              if (webpBlob && webpBlob.size < bestSize) {
                bestBlob = webpBlob
              }
              
              resultBlob = bestBlob
            }
          } else if (file.type === 'image/webp') {
            const webpBlob = await canvasToBlob(canvas, 'image/webp', quality)
            if (webpBlob && webpBlob.size < file.size) {
              resultBlob = webpBlob
            } else {
              resultBlob = file
            }
          } else {
            const jpegBlob = await canvasToBlob(canvas, 'image/jpeg', quality)
            
            if (jpegBlob && jpegBlob.size < file.size) {
              resultBlob = jpegBlob
            } else {
              const webpBlob = await canvasToBlob(canvas, 'image/webp', quality)
              if (webpBlob && webpBlob.size < file.size) {
                resultBlob = webpBlob
              } else {
                resultBlob = file
              }
            }
          }
          
          if (resultBlob) {
            resolve(resultBlob)
          } else {
            resolve(file)
          }
        } catch (error) {
          console.error('Compression error, using original file:', error)
          resolve(file)
        }
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const getImageInfo = (file: File): Promise<{
  width: number
  height: number
  type: string
  size: number
  formattedSize: string
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          type: file.type,
          size: file.size,
          formattedSize: formatFileSize(file.size)
        })
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const convertImageFormat = (
  file: File,
  targetFormat: 'image/jpeg' | 'image/png' | 'image/webp',
  quality: number = 0.9
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        
        if (targetFormat === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
        
        ctx.drawImage(img, 0, 0)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create blob from canvas'))
            }
          },
          targetFormat,
          quality
        )
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export const resizeImage = (
  file: File,
  options: {
    width?: number
    height?: number
    maxWidth?: number
    maxHeight?: number
    maintainAspectRatio?: boolean
  }
): Promise<Blob> => {
  const { width, height, maxWidth, maxHeight, maintainAspectRatio = true } = options
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let targetWidth = width || img.width
        let targetHeight = height || img.height
        
        if (maintainAspectRatio) {
          const aspectRatio = img.width / img.height
          
          if (maxWidth && targetWidth > maxWidth) {
            targetWidth = maxWidth
            targetHeight = targetWidth / aspectRatio
          }
          
          if (maxHeight && targetHeight > maxHeight) {
            targetHeight = maxHeight
            targetWidth = targetHeight * aspectRatio
          }
          
          if (width && !height) {
            targetWidth = width
            targetHeight = width / aspectRatio
          }
          
          if (height && !width) {
            targetHeight = height
            targetWidth = height * aspectRatio
          }
        }
        
        const canvas = document.createElement('canvas')
        canvas.width = targetWidth
        canvas.height = targetHeight
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create blob from canvas'))
            }
          },
          file.type,
          0.95
        )
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
