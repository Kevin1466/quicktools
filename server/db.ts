import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = process.env.FEEDBACK_DB_PATH
  ? path.resolve(process.env.FEEDBACK_DB_PATH)
  : path.resolve(__dirname, '../feedback.sqlite')

fs.mkdirSync(path.dirname(dbPath), { recursive: true })
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.exec(`
  CREATE TABLE IF NOT EXISTS feedbacks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    type TEXT NOT NULL,
    category_id TEXT,
    description TEXT NOT NULL,
    contact TEXT,
    user_agent TEXT,
    pathname TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_feedbacks_created_at ON feedbacks(created_at);
`)

export type FeedbackType = 'bug' | 'suggest' | 'other'

export interface CreateFeedbackInput {
  type: FeedbackType
  categoryId?: string
  description: string
  contact?: string
  userAgent?: string
  pathname?: string
}

export function insertFeedback(input: CreateFeedbackInput): number {
  const stmt = db.prepare(
    `INSERT INTO feedbacks
      (created_at, type, category_id, description, contact, user_agent, pathname)
     VALUES
      (@created_at, @type, @category_id, @description, @contact, @user_agent, @pathname)`,
  )

  const info = stmt.run({
    created_at: new Date().toISOString(),
    type: input.type,
    category_id: input.categoryId || null,
    description: input.description,
    contact: input.contact || null,
    user_agent: input.userAgent || null,
    pathname: input.pathname || null,
  })

  return Number(info.lastInsertRowid)
}

export function listFeedback(limit: number) {
  const safeLimit = Math.max(1, Math.min(200, Number.isFinite(limit) ? limit : 50))
  const stmt = db.prepare(
    `SELECT id, created_at, type, category_id, description, contact, user_agent, pathname
     FROM feedbacks
     ORDER BY id DESC
     LIMIT ?`,
  )
  return stmt.all(safeLimit)
}
