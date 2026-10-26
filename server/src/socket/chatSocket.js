/**
 * chatSocket.js — Socket.IO event handlers for real-time chat
 *
 * Architecture:
 *   Each conversation gets its own Socket.IO room named by its UUID.
 *   Only verified participants can join a room.
 *   Messages are persisted to PostgreSQL before being broadcast.
 *
 * Socket events (client → server):
 *   join_conversation   { conversation_id }   → join the room, receive history
 *   send_message        { conversation_id, content }  → persist + broadcast
 *   leave_conversation  { conversation_id }   → leave the room
 *
 * Socket events (server → client):
 *   new_message         { message }           → broadcast to all room members
 *   message_history     { conversation_id, messages }  → joining client only
 *   error               { message }           → offending client only
 *   joined              { conversation_id }   → acknowledgement to joining client
 *
 * Security:
 *   - Authentication is enforced in the IO handshake middleware.
 *   - isParticipant is re-checked from DB on every join and send.
 *   - User IDs come from socket.data.user (session), never from client payloads.
 *   - Content is trimmed and length-validated before any DB write.
 */

import { Server } from 'socket.io'
import { findSession } from '../utils/session.js'
import { findUserById } from '../models/userModel.js'
import {
  findConversationById,
  isParticipant,
  createMessage,
  listMessages,
} from '../models/chatModel.js'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const isUUID = (v) => UUID_RE.test(v)

/**
 * Parse the `sid` HttpOnly cookie from the raw Cookie header string.
 */
function parseSidCookie(cookieHeader) {
  if (!cookieHeader) return null
  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=')
    if (name.trim() === 'sid') return rest.join('=').trim()
  }
  return null
}

/**
 * Attach Socket.IO to an existing Node.js HTTP server and register all
 * event handlers.
 *
 * Call this AFTER app.listen() returns an http.Server instance.
 *
 * @param {import('http').Server} httpServer
 * @param {string | string[]} allowedOrigins — one URL or an array (e.g. ["https://sidra-pi-one.vercel.app","http://localhost:5173"])
 * @returns {import('socket.io').Server}
 */
export function initSocket(httpServer, allowedOrigins) {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,   // Socket.IO accepts a string or string[]
      credentials: true,
      methods: ['GET', 'POST'],
    },
    path: '/socket.io',
    // Engine.IO transport settings
    transports: ['websocket', 'polling'],
    // Disconnect a client that fails the handshake quickly
    connectTimeout: 10_000,
  })

  // ── Handshake authentication ───────────────────────────────────────────────
  // Reject unauthenticated sockets before they reach any handler.
  //
  // Two auth paths:
  //   1. Browser: HttpOnly sid cookie (primary, production path)
  //   2. auth.token: sid value passed explicitly via socket.auth — used by
  //      server-side test clients that cannot set cookies on WebSocket
  //      upgrades. Both paths validate against the same sessions table.
  io.use(async (socket, next) => {
    try {
      // Path 1: cookie (browser)
      const cookieHeader = socket.handshake.headers.cookie ?? ''
      let sessionId = parseSidCookie(cookieHeader)

      // Path 2: explicit token (test clients / non-browser)
      if (!sessionId && socket.handshake.auth?.token) {
        sessionId = socket.handshake.auth.token
      }

      if (!sessionId) return next(new Error('AUTH_REQUIRED'))

      const session = await findSession(sessionId)
      if (!session) return next(new Error('SESSION_EXPIRED'))

      const user = await findUserById(session.user_id)
      if (!user || !user.is_active) return next(new Error('USER_INACTIVE'))

      socket.data.user = user
      next()
    } catch {
      next(new Error('AUTH_ERROR'))
    }
  })

  // ── Connection ─────────────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const { user } = socket.data

    // ── join_conversation ──────────────────────────────────────────────────
    socket.on('join_conversation', async (payload) => {
      const conversation_id = payload?.conversation_id
      try {
        if (!conversation_id || !isUUID(conversation_id)) {
          return socket.emit('error', { message: 'Invalid conversation ID.' })
        }

        const conversation = await findConversationById(conversation_id)
        if (!conversation) {
          return socket.emit('error', { message: 'Conversation not found.' })
        }

        if (!(await isParticipant(conversation_id, user.id))) {
          return socket.emit('error', { message: 'Not authorised for this conversation.' })
        }

        // Leave any previous conversation rooms (keep only one active)
        for (const room of socket.rooms) {
          if (room !== socket.id && isUUID(room)) {
            socket.leave(room)
          }
        }

        await socket.join(conversation_id)
        socket.emit('joined', { conversation_id })

        // Deliver history (last 50) to this client only
        const messages = await listMessages(conversation_id, { limit: 50 })
        socket.emit('message_history', { conversation_id, messages })

      } catch {
        socket.emit('error', { message: 'Could not join conversation. Please try again.' })
      }
    })

    // ── send_message ───────────────────────────────────────────────────────
    socket.on('send_message', async (payload) => {
      const { conversation_id, content } = payload ?? {}
      try {
        if (!conversation_id || !isUUID(conversation_id)) {
          return socket.emit('error', { message: 'Invalid conversation ID.' })
        }

        const trimmed = typeof content === 'string' ? content.trim() : ''
        if (!trimmed) {
          return socket.emit('error', { message: 'Message cannot be empty.' })
        }
        if (trimmed.length > 4000) {
          return socket.emit('error', { message: 'Message too long (max 4,000 characters).' })
        }

        // Always re-authorise from DB — never trust client-side state
        if (!(await isParticipant(conversation_id, user.id))) {
          return socket.emit('error', { message: 'Not authorised for this conversation.' })
        }

        const message = await createMessage({
          conversation_id,
          sender_id: user.id,   // from session, not client payload
          content: trimmed,
        })

        // Emit to all members of the room (including the sender for echo)
        io.to(conversation_id).emit('new_message', { message })

      } catch {
        socket.emit('error', { message: 'Message could not be sent. Please try again.' })
      }
    })

    // ── leave_conversation ─────────────────────────────────────────────────
    socket.on('leave_conversation', (payload) => {
      const { conversation_id } = payload ?? {}
      if (conversation_id && isUUID(conversation_id)) {
        socket.leave(conversation_id)
      }
    })

    // ── disconnect ─────────────────────────────────────────────────────────
    // Nothing to clean up — Socket.IO removes the socket from all rooms.
    // socket.on('disconnect', () => { ... })
  })

  return io
}
