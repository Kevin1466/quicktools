import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'

const sourcesDir = path.resolve(__dirname, './sources')
const publicDir = path.resolve(__dirname, './public')

function copyLogoImages() {
  const logoImgsSrc = path.join(sourcesDir, 'logo_imgs')
  const logoImgsDest = path.join(publicDir, 'logo_imgs')
  
  if (fs.existsSync(logoImgsSrc)) {
    if (!fs.existsSync(logoImgsDest)) {
      fs.mkdirSync(logoImgsDest, { recursive: true })
    }
    
    const files = fs.readdirSync(logoImgsSrc)
    files.forEach(file => {
      const srcFile = path.join(logoImgsSrc, file)
      const destFile = path.join(logoImgsDest, file)
      if (fs.statSync(srcFile).isFile()) {
        fs.copyFileSync(srcFile, destFile)
      }
    })
  }
}

copyLogoImages()

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5175',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
