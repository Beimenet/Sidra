/**
 * db.js — PostgreSQL connection pool
 *
 * Uses the `pg` package (node-postgres) with a connection pool so that
 * multiple concurrent requests can each borrow a client without opening
 * a new TCP connection every time.
 *
 * All connection parameters are read from environment variables via env.js.
 * Never hardcode passwords or hostnames here.
 *
 * Usage in route handlers and middleware:
 *
 *   import { pool } from '../config/db.js'
 *
 *   const result = await pool.query('SELECT * FROM users WHERE id = $1', [id])
 *
 * Always use parameterised queries ($1, $2, …) to prevent SQL injection.
 * Never interpolate user input directly into a query string.
 */

import pg from 'pg'
import { env } from './env.js'

const { Pool } = pg

export const pool = new Pool({
    host: env.DB_HOST,
    port: Number(env.DB_PORT),
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,

    // SSL: disabled locally; enable for hosted databases in production
    ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,

    // Pool sizing — sensible defaults for a development / small-scale deployment
    max: 10,   // maximum number of clients in the pool
    idleTimeoutMillis: 30000, // close idle clients after 30 s
    connectionTimeoutMillis: 5000, // error if no client available within 5 s
})

// Propagate pool-level errors to the console so they are never silently swallowed
pool.on('error', (err) => {
    console.error('[db] Unexpected PostgreSQL pool error:', err.message)
})

/**
 * testConnection
 *
 * Borrows one client from the pool, runs a trivial query, and releases
 * the client back. Used at startup to confirm the database is reachable.
 *
 * Throws if the connection cannot be established.
 */
export async function testConnection() {
    const client = await pool.connect()
    try {
        await client.query('SELECT 1')
    } finally {
        client.release()
    }
}
