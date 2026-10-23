/**
 * migrate.js — Apply the Sidra database schema
 *
 * Reads schema.sql and executes it against the configured PostgreSQL
 * database. Safe to run multiple times — every statement uses
 * CREATE TABLE IF NOT EXISTS, so existing tables and data are never
 * dropped or overwritten.
 *
 * Usage (from the server/ directory):
 *   npm run migrate
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import pg from 'pg'
import 'dotenv/config'

// ── Resolve the path to schema.sql relative to this file ─────────────────────
const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)
const schemaPath = join(__dirname, 'schema.sql')

// ── Build connection config directly from env vars ───────────────────────────
// We do not use env.js here so the migrate script can be run independently
// without the full app module graph loading.
const { Pool } = pg

const pool = new Pool({
  host:     process.env.DB_HOST     ?? 'localhost',
  port:     Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  ...(process.env.DB_PASSWORD ? { password: process.env.DB_PASSWORD } : {}),
  ssl: false,
  connectionTimeoutMillis: 8000,
})

async function migrate() {
  const sql = readFileSync(schemaPath, 'utf8')

  console.log('╔══════════════════════════════════════════╗')
  console.log('║       Sidra — Database Migration         ║')
  console.log('╚══════════════════════════════════════════╝')
  console.log(`  Database : ${process.env.DB_NAME}`)
  console.log(`  Host     : ${process.env.DB_HOST ?? 'localhost'}`)
  console.log(`  Schema   : ${schemaPath}`)
  console.log('')

  const client = await pool.connect()

  try {
    console.log('  Applying schema…')
    await client.query(sql)
    console.log('  ✅  Schema applied successfully.\n')

    // ── Verify: list every table that now exists ──────────────────────────
    const result = await client.query(`
      SELECT table_name
      FROM   information_schema.tables
      WHERE  table_schema = 'public'
        AND  table_type   = 'BASE TABLE'
      ORDER  BY table_name
    `)

    const expected = [
      'courses',
      'enrollments',
      'lesson_progress',
      'lessons',
      'professional_profiles',
      'users',
    ]

    console.log('  Tables found in sidra_db:')
    const found = result.rows.map(r => r.table_name)
    found.forEach(t => {
      const ok = expected.includes(t)
      console.log(`    ${ok ? '✅' : '⚠️ '} ${t}`)
    })

    const missing = expected.filter(t => !found.includes(t))
    if (missing.length > 0) {
      console.log('\n  ⚠️  Missing tables:')
      missing.forEach(t => console.log(`    ✗ ${t}`))
      process.exit(1)
    }

    console.log('\n  All 6 tables are present. Migration complete.')

  } catch (err) {
    console.error('\n  ❌  Migration failed:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
