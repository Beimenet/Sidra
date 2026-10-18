/**
 * db.js — PostgreSQL connection configuration
 *
 * STATUS: Not yet connected.
 *
 * PostgreSQL integration is planned but has not been implemented.
 * When ready:
 *   1. Install the pg package:   npm install pg
 *   2. Set DATABASE_URL in your .env file.
 *   3. Uncomment the code below and remove this notice.
 *
 * Recommended next steps:
 *   - Design the database schema (users, courses, enrollments, professionals).
 *   - Choose a migration tool (e.g. node-postgres with SQL files, or Knex.js).
 *   - Create a migrations/ directory at the project root or inside server/.
 *   - Add a seed script for development data.
 */

// import pg from 'pg'
// import { env } from './env.js'
//
// const { Pool } = pg
//
// export const pool = new Pool({
//   connectionString: env.DATABASE_URL,
//   ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
// })
//
// export async function testConnection() {
//   const client = await pool.connect()
//   await client.query('SELECT 1')
//   client.release()
//   console.log('PostgreSQL connected successfully.')
// }

export const pool = null // Replace with pool instance when PostgreSQL is configured.
