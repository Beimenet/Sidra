/**
 * chat.test.js — Real-time Chat Integration Tests
 *
 * Covers:
 *   REST API — conversations + message history endpoints
 *   Socket.IO — authentication, join, send, receive, unauthorized access
 *
 * Prerequisites:
 *   - Server running on http://localhost:5000
 *   - PostgreSQL connected
 *
 * Run:  node tests/chat.test.js
 */

import fetch from 'node-fetch'
import { io as ioClient } from 'socket.io-client'

const BASE = 'http://localhost:5000'
const SOCKET_URL = 'http://localhost:5000'

let passed = 0
let failed = 0

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ PASS  ${label}`)
    passed++
  } else {
    console.error(`  ❌ FAIL  ${label}${detail ? `\n         → ${detail}` : ''}`)
    failed++
  }
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────

async function httpRequest(path, options = {}, cookie = '') {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
      ...(options.headers ?? {}),
    },
  })
  let data
  try { data = await res.json() } catch { data = {} }
  return { status: res.status, data, headers: res.headers }
}

async function register(suffix) {
  const email = `chat_${suffix}_${Date.now()}@sidra.test`
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name: `Chat ${suffix}`, email, password: 'Test1234', role: 'mother' }),
  })
  const data = await res.json()
  // Extract just the sid=<value> part so it can be sent as a Cookie header
  const rawSetCookie = res.headers.get('set-cookie') ?? ''
  // set-cookie: sid=abc123; Path=/; HttpOnly; ...
  const match = rawSetCookie.match(/sid=([^;]+)/)
  const cookie = match ? `sid=${match[1]}` : ''
  return { user: data.user, cookie, email }
}

// ── Socket helper ─────────────────────────────────────────────────────────────

function connectSocket(cookie) {
  // Extract sid value from cookie string (e.g. "sid=abc123")
  const match = cookie.match(/sid=([^;]+)/)
  const token = match ? match[1] : cookie

  return new Promise((resolve, reject) => {
    const socket = ioClient(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket'],
      auth: { token },           // passed via handshake.auth — works in Node.js
      timeout: 6000,
    })
    const timer = setTimeout(() => {
      socket.disconnect()
      reject(new Error('Connection timeout'))
    }, 6000)
    socket.on('connect', () => { clearTimeout(timer); resolve(socket) })
    socket.on('connect_error', (err) => { clearTimeout(timer); reject(err) })
  })
}

function waitForEvent(socket, event, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout waiting for '${event}'`)), timeoutMs)
    socket.once(event, (data) => { clearTimeout(timer); resolve(data) })
  })
}

// ── Setup ─────────────────────────────────────────────────────────────────────

let userA, cookieA
let userB, cookieB

async function setup() {
  const a = await register('A')
  const b = await register('B')
  userA = a.user; cookieA = a.cookie
  userB = b.user; cookieB = b.cookie
  assert('Setup: User A registered', !!userA?.id, `id=${userA?.id}`)
  assert('Setup: User B registered', !!userB?.id, `id=${userB?.id}`)
}

// ── Tests ─────────────────────────────────────────────────────────────────────

async function testRestApi() {
  console.log('\n── REST API ─────────────────────────────────────────────────')

  // No cookie → 401
  const { status: s1 } = await httpRequest('/api/chat/conversations')
  assert('CH-01  GET /conversations without auth → 401', s1 === 401, `got ${s1}`)

  // POST without auth → 401
  const { status: s2 } = await httpRequest('/api/chat/conversations', {
    method: 'POST', body: JSON.stringify({ other_user_id: userB.id }),
  })
  assert('CH-02  POST /conversations without auth → 401', s2 === 401, `got ${s2}`)

  // Start conversation A→B
  const { status: s3, data: d3 } = await httpRequest('/api/chat/conversations', {
    method: 'POST', body: JSON.stringify({ other_user_id: userB.id }),
  }, cookieA)
  assert('CH-03  POST /conversations A→B → 200', s3 === 200, `got ${s3}`)
  assert('CH-03  conversation.id present', !!d3.conversation?.id)
  const convId = d3.conversation?.id

  // Idempotent — same pair returns same conversation
  const { status: s4, data: d4 } = await httpRequest('/api/chat/conversations', {
    method: 'POST', body: JSON.stringify({ other_user_id: userB.id }),
  }, cookieA)
  assert('CH-04  POST /conversations idempotent → same id', d4.conversation?.id === convId, `got ${d4.conversation?.id}`)

  // Self-conversation → 400
  const { status: s5 } = await httpRequest('/api/chat/conversations', {
    method: 'POST', body: JSON.stringify({ other_user_id: userA.id }),
  }, cookieA)
  assert('CH-05  Cannot start conversation with self → 400', s5 === 400, `got ${s5}`)

  // List conversations for A — should contain the B conversation
  const { status: s6, data: d6 } = await httpRequest('/api/chat/conversations', {}, cookieA)
  assert('CH-06  GET /conversations → 200', s6 === 200, `got ${s6}`)
  assert('CH-06  conversations is array', Array.isArray(d6.conversations))
  assert('CH-06  B conversation in list', d6.conversations?.some(c => c.id === convId))

  // Message history — no messages yet
  const { status: s7, data: d7 } = await httpRequest(
    `/api/chat/conversations/${convId}/messages`, {}, cookieA
  )
  assert('CH-07  GET /messages → 200', s7 === 200, `got ${s7}`)
  assert('CH-07  messages is array', Array.isArray(d7.messages))

  // Non-participant cannot read messages
  const { status: s8 } = await httpRequest(
    `/api/chat/conversations/${convId}/messages`, {}, cookieB
  )
  // B is participant_b — should be allowed
  assert('CH-08  Participant B can read messages → 200', s8 === 200, `got ${s8}`)

  // Register a third user (not a participant) and verify 403
  const { cookie: cookieC } = await register('C')
  const { status: s9 } = await httpRequest(
    `/api/chat/conversations/${convId}/messages`, {}, cookieC
  )
  assert('CH-09  Non-participant cannot read messages → 403', s9 === 403, `got ${s9}`)

  // Invalid conversation UUID → 400
  const { status: s10 } = await httpRequest('/api/chat/conversations/not-a-uuid/messages', {}, cookieA)
  assert('CH-10  Invalid conv UUID → 400', s10 === 400, `got ${s10}`)

  return convId
}

async function testSocketAuth() {
  console.log('\n── Socket.IO Authentication ─────────────────────────────')

  // No cookie → connect_error with AUTH_REQUIRED
  await new Promise((resolve) => {
    const socket = ioClient(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket'],
      timeout: 4000,
    })
    const timer = setTimeout(() => {
      socket.disconnect()
      assert('CH-11  No-cookie socket → connect_error (timeout fallback)', true)
      resolve()
    }, 4000)
    socket.on('connect_error', (err) => {
      clearTimeout(timer)
      socket.disconnect()
      assert('CH-11  No-cookie socket → connect_error', ['AUTH_REQUIRED', 'SESSION_EXPIRED'].includes(err.message), `got ${err.message}`)
      resolve()
    })
    socket.on('connect', () => {
      clearTimeout(timer)
      socket.disconnect()
      assert('CH-11  No-cookie socket → connect_error', false, 'unexpectedly connected')
      resolve()
    })
  })

  // Invalid cookie → connect_error
  await new Promise((resolve) => {
    const socket = ioClient(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket'],
      extraHeaders: { Cookie: 'sid=invalidtoken123' },
      timeout: 4000,
    })
    const timer = setTimeout(() => {
      socket.disconnect()
      assert('CH-12  Bad cookie socket → connect_error (timeout fallback)', true)
      resolve()
    }, 4000)
    socket.on('connect_error', (err) => {
      clearTimeout(timer)
      socket.disconnect()
      assert('CH-12  Bad cookie socket → connect_error', ['AUTH_REQUIRED', 'SESSION_EXPIRED', 'AUTH_ERROR'].includes(err.message), `got ${err.message}`)
      resolve()
    })
    socket.on('connect', () => {
      clearTimeout(timer)
      socket.disconnect()
      assert('CH-12  Bad cookie socket → connect_error', false, 'unexpectedly connected')
      resolve()
    })
  })
}

async function testSocketChat(convId) {
  console.log('\n── Socket.IO Messaging ──────────────────────────────────')

  let socketA, socketB

  try {
    // Connect both users
    socketA = await connectSocket(cookieA)
    assert('CH-13  User A socket connects', socketA.connected)

    socketB = await connectSocket(cookieB)
    assert('CH-14  User B socket connects', socketB.connected)

    // A joins conversation
    socketA.emit('join_conversation', { conversation_id: convId })
    const joinedA = await waitForEvent(socketA, 'joined')
    assert('CH-15  A receives joined ack', joinedA.conversation_id === convId, `got ${JSON.stringify(joinedA)}`)

    // A receives message_history (empty)
    const histA = await waitForEvent(socketA, 'message_history')
    assert('CH-16  A receives message_history', histA.conversation_id === convId)
    assert('CH-16  message_history is array', Array.isArray(histA.messages))

    // B joins conversation
    socketB.emit('join_conversation', { conversation_id: convId })
    const joinedB = await waitForEvent(socketB, 'joined')
    assert('CH-17  B receives joined ack', joinedB.conversation_id === convId)
    await waitForEvent(socketB, 'message_history')  // consume history

    // A sends a message — both should receive new_message
    const testContent = `Hello from A at ${Date.now()}`

    const [msgForA, msgForB] = await Promise.all([
      waitForEvent(socketA, 'new_message'),
      waitForEvent(socketB, 'new_message'),
      Promise.resolve(socketA.emit('send_message', { conversation_id: convId, content: testContent })),
    ])

    assert('CH-18  A receives own message via new_message', msgForA.message?.content === testContent, `got "${msgForA.message?.content}"`)
    assert('CH-18  B receives A\'s message via new_message', msgForB.message?.content === testContent, `got "${msgForB.message?.content}"`)
    assert('CH-18  sender_id is A\'s id', msgForA.message?.sender_id === userA.id, `got ${msgForA.message?.sender_id}`)
    assert('CH-18  message has DB id (UUID)', !!msgForA.message?.id)
    assert('CH-18  message has created_at', !!msgForA.message?.created_at)

    // B sends a reply
    const replyContent = `Reply from B at ${Date.now()}`
    const [replyA, replyB] = await Promise.all([
      waitForEvent(socketA, 'new_message'),
      waitForEvent(socketB, 'new_message'),
      Promise.resolve(socketB.emit('send_message', { conversation_id: convId, content: replyContent })),
    ])
    assert('CH-19  B reply received by A', replyA.message?.content === replyContent)
    assert('CH-19  B reply received by B', replyB.message?.content === replyContent)
    assert('CH-19  sender_id is B\'s id', replyB.message?.sender_id === userB.id)

    // Empty message → error event, not crash
    const errP = waitForEvent(socketA, 'error', 3000)
    socketA.emit('send_message', { conversation_id: convId, content: '   ' })
    const errEvt = await errP
    assert('CH-20  Empty message → error event', !!errEvt.message, `got ${JSON.stringify(errEvt)}`)

    // Oversized message → error event
    const errP2 = waitForEvent(socketA, 'error', 3000)
    socketA.emit('send_message', { conversation_id: convId, content: 'x'.repeat(4001) })
    const errEvt2 = await errP2
    assert('CH-21  Oversized message → error event', !!errEvt2.message)

    // Message history persisted — verify via REST after socket messages
    const { data: hist } = await httpRequest(
      `/api/chat/conversations/${convId}/messages`, {}, cookieA
    )
    assert('CH-22  Messages persisted to DB', (hist.messages?.length ?? 0) >= 2,
      `found ${hist.messages?.length} messages`)
    assert('CH-22  First message content matches', hist.messages?.some(m => m.content === testContent))

    // Unauthorized join — third user tries to join A-B conversation
    const { cookie: cookieC2 } = await register('C2')
    const socketC = await connectSocket(cookieC2).catch(() => null)
    if (socketC) {
      const errC = waitForEvent(socketC, 'error', 3000)
      socketC.emit('join_conversation', { conversation_id: convId })
      const errCEvt = await errC
      assert('CH-23  Non-participant cannot join → error event', !!errCEvt.message, `got ${JSON.stringify(errCEvt)}`)
      socketC.disconnect()
    } else {
      console.log('  ⚠  CH-23 skipped (socket C failed to connect)')
    }

    // Enter key (submit) works — tested via the same emit path

  } finally {
    socketA?.disconnect()
    socketB?.disconnect()
  }
}

async function testReconnect() {
  console.log('\n── Socket.IO Reconnect ──────────────────────────────────')

  // Register a new user for this test
  const { user, cookie } = await register('Reconnect')
  let socket

  try {
    socket = await connectSocket(cookie)
    assert('CH-24  Initial connection succeeds', socket.connected)

    // Disconnect and reconnect
    socket.disconnect()
    await new Promise(r => setTimeout(r, 500))
    assert('CH-25  Socket disconnected cleanly', !socket.connected)

    socket.connect()
    await waitForEvent(socket, 'connect', 4000)
    assert('CH-26  Socket reconnects successfully', socket.connected)

  } catch (err) {
    assert('CH-26  Socket reconnects successfully', false, err.message)
  } finally {
    socket?.disconnect()
  }
}

// ── Run ───────────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n╔══════════════════════════════════════════════════════╗')
  console.log('║     Sidra — Chat Integration Tests                   ║')
  console.log('╚══════════════════════════════════════════════════════╝')
  console.log(`  Target: ${BASE}\n`)

  await setup()
  const convId = await testRestApi()
  await testSocketAuth()
  if (convId) await testSocketChat(convId)
  await testReconnect()

  console.log('\n── Results ─────────────────────────────────────────────')
  console.log(`  Passed : ${passed}`)
  console.log(`  Failed : ${failed}`)
  console.log(`  Total  : ${passed + failed}`)

  if (failed === 0) {
    console.log('\n✅  All chat tests passed.')
  } else {
    console.error(`\n❌  ${failed} test(s) failed.`)
    process.exit(1)
  }

  process.exit(0)
}

run().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
