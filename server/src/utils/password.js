/**
 * password.js — bcrypt helpers
 *
 * Uses bcryptjs (pure JS — no native bindings required).
 * Work factor 12 balances security and performance.
 * NEVER log or return plaintext passwords or hashes to clients.
 */

import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

/**
 * Hash a plaintext password.
 * @param {string} plaintext
 * @returns {Promise<string>} bcrypt hash
 */
export async function hashPassword(plaintext) {
  return bcrypt.hash(plaintext, SALT_ROUNDS)
}

/**
 * Compare a plaintext password against a stored hash.
 * Always called even when the user was not found, so response
 * timing is identical regardless of whether the email exists
 * (prevents email-enumeration via timing differences).
 *
 * @param {string} plaintext   — password submitted by the client
 * @param {string} hash        — stored bcrypt hash (or DUMMY_HASH)
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(plaintext, hash) {
  return bcrypt.compare(plaintext, hash)
}

/**
 * A pre-computed valid bcrypt hash used when no user was found during login.
 * Running bcrypt.compare against this keeps the response time
 * consistent with a real login attempt, preventing timing attacks.
 * This is a real bcrypt hash (cost 12) — bcrypt.compare requires a valid hash.
 */
export const DUMMY_HASH =
  '$2a$12$cW.W3m8gc6oKpdG4HHVMrOBZwf5Z.dhkvAXdQ6ArNn/ys5CRYsdYC'
