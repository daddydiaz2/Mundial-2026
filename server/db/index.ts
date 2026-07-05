import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'
import { mkdirSync } from 'fs'
import { dirname } from 'path'

let db: ReturnType<typeof drizzle>

export function useDb() {
  if (!db) {
    const dbPath = process.env.DATABASE_URL || './data/worldcup.db'
    mkdirSync(dirname(dbPath), { recursive: true })
    const sqlite = new Database(dbPath)
    sqlite.pragma('journal_mode = WAL')
    sqlite.pragma('synchronous = NORMAL')
    db = drizzle(sqlite, { schema })
  }
  return db
}

export { sql, eq, and, or, desc, asc, gt, lt, gte, lte, inArray, count } from 'drizzle-orm'
