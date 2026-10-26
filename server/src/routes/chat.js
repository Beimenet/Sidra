/**
 * chat.js — REST endpoints for chat conversations and message history
 *
 * Mounts under /api/chat in app.js.
 * All routes require authentication via session cookie.
 *
 * ── Conversations ─────────────────────────────────────────────────────────
 *   GET  /api/chat/conversations
 *     List all conversations for the authenticated user.
 *
 *   POST /api/chat/conversations
 *     Find or create a direct conversation with another user.
 *     Body: { other_user_id: UUID }
 *
 * ── Messages ──────────────────────────────────────────────────────────────
 *   GET  /api/chat/conversations/:conversationId/messages
 *     Paginated message history. Verifies the caller is a participant.
 *     Query: ?limit=50&before=<ISO timestamp>
 *
 * Security:
 *   - authenticate middleware enforces valid session cookie.
 *   - isParticipant is checked server-side before returning any messages.
 *   - User IDs are taken from req.user.id (session), never from the body.
 */

import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { findUserById } from '../models/userModel.js'
import { pool } from '../config/db.js'
import {
  findOrCreateConversation,
  listConversationsForUser,
  findConversationById,
  isParticipant,
  listMessages,
} from '../models/chatModel.js'

const router = Router()
router.use(authenticate)

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const isUUID = (v) => UUID_RE.test(v)

// ── GET /api/chat/conversations ───────────────────────────────────────────────
router.get('/conversations', async (req, res, next) => {
  try {
    const conversations = await listConversationsForUser(req.user.id)
    return res.status(200).json({ conversations })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/chat/users/search ────────────────────────────────────────────────
// Search for users to start a conversation with.
// Returns up to 10 matching active users, excluding the caller.
// Query: ?q=name_or_email (min 2 chars)
router.get('/users/search', async (req, res, next) => {
  try {
    const q = (req.query.q ?? '').trim()
    if (q.length < 2) {
      return res.status(400).json({ error: { message: 'Search query must be at least 2 characters.' } })
    }
    const pattern = `%${q}%`
    const { rows } = await pool.query(
      `SELECT id, full_name, role
       FROM   users
       WHERE  is_active = TRUE
         AND  id <> $1
         AND  (full_name ILIKE $2 OR email ILIKE $2)
       ORDER  BY full_name ASC
       LIMIT  10`,
      [req.user.id, pattern]
    )
    return res.status(200).json({ users: rows })
  } catch (err) {
    next(err)
  }
})

// ── POST /api/chat/conversations ──────────────────────────────────────────────
router.post('/conversations', async (req, res, next) => {
  try {
    const { other_user_id } = req.body

    if (!other_user_id || !isUUID(other_user_id)) {
      return res.status(400).json({ error: { message: 'other_user_id must be a valid UUID.' } })
    }

    if (other_user_id === req.user.id) {
      return res.status(400).json({ error: { message: 'You cannot start a conversation with yourself.' } })
    }

    const other = await findUserById(other_user_id)
    if (!other || !other.is_active) {
      return res.status(404).json({ error: { message: 'User not found.' } })
    }

    const conversation = await findOrCreateConversation(req.user.id, other_user_id)
    return res.status(200).json({ conversation })
  } catch (err) {
    next(err)
  }
})

// ── GET /api/chat/conversations/:conversationId/messages ─────────────────────
router.get('/conversations/:conversationId/messages', async (req, res, next) => {
  try {
    const { conversationId } = req.params
    if (!isUUID(conversationId)) {
      return res.status(400).json({ error: { message: 'Invalid conversation ID.' } })
    }

    const conversation = await findConversationById(conversationId)
    if (!conversation) {
      return res.status(404).json({ error: { message: 'Conversation not found.' } })
    }

    if (!(await isParticipant(conversationId, req.user.id))) {
      return res.status(403).json({ error: { message: 'You are not a participant in this conversation.' } })
    }

    const { limit, before } = req.query
    const messages = await listMessages(conversationId, { limit, before })
    return res.status(200).json({ messages })
  } catch (err) {
    next(err)
  }
})

export default router
