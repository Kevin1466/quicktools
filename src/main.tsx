import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { loadUmami } from './utils/umami'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Failed to find the root element')

loadUmami()

const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)

if (rootElement.dataset.reactSsr === '1') {
  hydrateRoot(rootElement, app)
} else {
  const root = createRoot(rootElement)
  root.render(app)
}
