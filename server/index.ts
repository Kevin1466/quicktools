import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { insertFeedback, listFeedback, type FeedbackType } from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/feedback', (req, res) => {
  const body = (req.body || {}) as {
    type?: FeedbackType
    categoryId?: string
    description?: string
    contact?: string
    pathname?: string
  }

  const type = body.type
  const categoryId = typeof body.categoryId === 'string' ? body.categoryId : undefined
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const contact = typeof body.contact === 'string' ? body.contact.trim() : undefined
  const pathname = typeof body.pathname === 'string' ? body.pathname : undefined

  if (!type || !['bug', 'suggest', 'other'].includes(type)) {
    res.status(400).json({ ok: false, message: '反馈类型不合法' })
    return
  }

  if (!description) {
    res.status(400).json({ ok: false, message: '请填写详细描述' })
    return
  }

  if (description.length > 2000) {
    res.status(400).json({ ok: false, message: '详细描述过长' })
    return
  }

  if (categoryId && categoryId.length > 64) {
    res.status(400).json({ ok: false, message: '所属类目不合法' })
    return
  }

  if (contact && contact.length > 128) {
    res.status(400).json({ ok: false, message: '联系方式过长' })
    return
  }

  const id = insertFeedback({
    type,
    categoryId,
    description,
    contact,
    userAgent: req.headers['user-agent'],
    pathname,
  })

  res.json({ ok: true, id })
})

app.get('/api/feedback/recent', (req, res) => {
  const limit = Number(req.query.limit || 50)
  const rows = listFeedback(limit)
  res.json({ ok: true, rows })
})

const distDir = path.resolve(__dirname, '../dist')
app.use(express.static(distDir))

app.get(/.*/, (req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ ok: false, message: 'Not Found' })
    return
  }
  res.sendFile(path.join(distDir, 'index.html'))
})

const port = Number(process.env.PORT || 5175)
app.listen(port, () => {
  console.log(`[server] listening on http://localhost:${port}`)
})
