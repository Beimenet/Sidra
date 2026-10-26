/**
 * chatModel.js — Queries for conversations and messages tables
 *
 * All authorization decisions are made by the callers (routes / socket
 * handlers). This module only provides the raw DB operations.
 */

import { pool } from '../config/db.js'

// ── Conversations ─────────────────────────────────────────────────────────────

/**
 * Find or create a direct conversation between two users.
 * Canonical order: smaller UUID goes in participant_a so the UNIQUE
 * constraint works correctly regardless of call order.
 *
 * @param {string} userA
 * @param {string} userB
 * @returns {Promise<object>} conversation row
 */
export async function findOrCreateConversation(userA, userB) {
  const [a, b] = [userA, userB].sort()   // lexicographic canonical order
  const { rows } = await pool.query(
    `INSERT INTO conversations (participant_a, participant_b)
     VALUES ($1, $2)
     ON CONFLICT (participant_a, participant_b) DO UPDATE
       SET updated_at = NOW()
     RETURNING *`,
    [a, b]
  )
  return rows[0]
}

/**
 * List all conversations for a user, most recently active first.
 * Joins with users to return the other participant's display name.
 *
 * @param {string} userId
 */
export async function listConversationsForUser(userId) {
  const { rows } = await pool.query(
    `SELECT
       c.id,
       c.type,
       c.updated_at,
       -- Other participant details
       CASE WHEN c.participant_a = $1 THEN c.participant_b ELSE c.participant_a END AS other_user_id,
       ou.full_name   AS other_user_name,
       ou.role        AS other_user_role,
       -- Latest message preview (subquery)
       (SELECT m.content
        FROM   messages m
        WHERE  m.conversation_id = c.id
        ORDER  BY m.created_at DESC
        LIMIT  1) AS last_message,
       (SELECT m.created_at
        FROM   messages m
        WHERE  m.conversation_id = c.id
        ORDER  BY m.created_at DESC
        LIMIT  1) AS last_message_at,
       -- Unread count (messages after last_read — placeholder, always 0 for now)
       0 AS unread_count
     FROM   conversations c
     JOIN   users ou ON ou.id = CASE WHEN c.participant_a = $1
                                     THEN c.participant_b
                                     ELSE c.participant_a END
     WHERE  c.participant_a = $1 OR c.participant_b = $1
     ORDER  BY c.updated_at DESC`,
    [userId]
  )
  return rows
}

/**
 * Get a single conversation by ID.
 * Returns null if not found.
 *
 * @param {string} conversationId
 */
export async function findConversationById(conversationId) {
  const { rows } = await pool.query(
    `SELECT * FROM conversations WHERE id = $1`,
    [conversationId]
  )
  return rows[0] ?? null
}

/**
 * Check whether userId is a participant in the given conversation.
 * Returns true / false.
 *
 * @param {string} conversationId
 * @param {string} userId
 */
export async function isParticipant(conversationId, userId) {
  const { rows } = await pool.query(
    `SELECT 1 FROM conversations
     WHERE id = $1 AND (participant_a = $2 OR participant_b = $2)`,
    [conversationId, userId]
  )
  return rows.length > 0
}

// ── Messages ──────────────────────────────────────────────────────────────────

/**
 * Persist a new message.
 * Caller must verify the sender is a conversation participant first.
 *
 * @param {{ conversation_id, sender_id, content }} params
 * @returns {Promise<object>} message row with sender full_name attached
 */
export async function createMessage({ conversation_id, sender_id, content }) {
  const { rows } = await pool.query(
    `WITH ins AS (
       INSERT INTO messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING *
     )
     SELECT ins.*, u.full_name AS sender_name, u.role AS sender_role
     FROM   ins
     JOIN   users u ON u.id = ins.sender_id`,
    [conversation_id, sender_id, content.trim()]
  )

  // Bump conversation updated_at so the list re-sorts correctly
  await pool.query(
    `UPDATE conversations SET updated_at = NOW() WHERE id = $1`,
    [conversation_id]
  )

  return rows[0]
}

/**
 * Load message history for a conversation, oldest first.
 * The caller must verify that the requesting user is a participant.
 *
 * @param {string} conversationId
 * @param {{ limit?, before? }} options
 *   limit  — max rows (default 50, max 200)
 *   before — load messages before this ISO timestamp (cursor pagination)
 */
export async function listMessages(conversationId, { limit = 50, before } = {}) {
  const safeLimit = Math.min(200, Math.max(1, Number(limit) || 50))

  if (before) {
    const { rows } = await pool.query(
      `SELECT m.*, u.full_name AS sender_name, u.role AS sender_role
       FROM   messages m
       JOIN   users u ON u.id = m.sender_id
       WHERE  m.conversation_id = $1 AND m.created_at < $2
       ORDER  BY m.created_at DESC
       LIMIT  $3`,
      [conversationId, before, safeLimit]
    )
    return rows.reverse()   // return oldest-first
  }

  const { rows } = await pool.query(
    `SELECT m.*, u.full_name AS sender_name, u.role AS sender_role
     FROM   messages m
     JOIN   users u ON u.id = m.sender_id
     WHERE  m.conversation_id = $1
     ORDER  BY m.created_at ASC
     LIMIT  $2`,
    [conversationId, safeLimit]
  )
  return rows
}
