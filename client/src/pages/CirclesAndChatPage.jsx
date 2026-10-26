/**
 * CirclesAndChatPage.jsx — Live Chat with Socket.IO
 *
 * Layout and design are preserved from the original.
 * Real-time flow:
 *   1. User searches for another user via the sidebar search box
 *   2. Clicking a search result opens/creates the conversation (REST)
 *   3. Socket joins the room and server pushes message_history
 *   4. User types and sends → send_message event → persisted + broadcast
 *   5. Both participants receive new_message and append to local state
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useSocket } from '../context/SocketContext.jsx'
import { chatApi } from '../services/api.js'

// ── Static community circles ──────────────────────────────────────────────────
const COMMUNITY_CIRCLES = [
  { id: 'c1', name: 'Toddler Years (1–4 Yrs)', members: '1.2k parents active', preview: 'Meron: Has anyone tried the 2-choice…', time: '4m', color: 'bg-terracotta/15 text-terracotta', initial: 'T' },
  { id: 'c2', name: "Fathers' Parenting Circle", members: '650 active dads', preview: 'Yonas: Organizing a weekend soccer g…', time: '15m', color: 'bg-sage/30 text-charcoal', initial: 'F' },
  { id: 'c3', name: 'School Readiness & Anxiety', members: '820 members · Counselors', preview: '', time: '2h', color: 'bg-blue-100 text-blue-700', initial: 'S' },
  { id: 'c4', name: 'Diaspora Ethiopian Families', members: '1.4k members · Multilingual', preview: '', time: '1d', color: 'bg-amber-100 text-amber-700', initial: 'D' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function Avatar({ name = '?', size = 9, color = 'bg-terracotta/10 text-terracotta' }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <div
      className={`w-${size} h-${size} ${color} rounded-full font-bold text-sm flex items-center justify-center flex-shrink-0`}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}

function OnlineDot({ className = '' }) {
  return <span className={`w-2.5 h-2.5 rounded-full bg-sage border-2 border-white ${className}`} aria-label="Online" />
}

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function roleLabel(role) {
  const map = {
    mother: 'Mother', father: 'Father', legal_guardian: 'Guardian',
    other_caregiver: 'Caregiver', professional: 'Professional', admin: 'Admin'
  }
  return map[role] ?? role
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg, currentUserId, contactName }) {
  const isMe = msg.sender_id === currentUserId
  return (
    <div className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
      {!isMe && <Avatar name={msg.sender_name ?? contactName} size={8} />}
      <div className={`max-w-xs sm:max-w-md flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe
            ? 'bg-terracotta text-white rounded-tr-sm'
            : 'bg-white border border-border text-charcoal rounded-tl-sm'
          }`}>
          {msg.content}
        </div>
        <p className="text-[10px] text-warm-gray px-1">{formatTime(msg.created_at)}</p>
      </div>
    </div>
  )
}

// ── Message skeleton ──────────────────────────────────────────────────────────
function MessageSkeleton() {
  return (
    <div className="flex flex-col gap-5 px-5 py-6 animate-pulse">
      {[false, true, false].map((isRight, i) => (
        <div key={i} className={`flex gap-3 ${isRight ? 'flex-row-reverse' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-border/60 flex-shrink-0" />
          <div className="h-10 bg-border/60 rounded-2xl w-48" />
        </div>
      ))}
    </div>
  )
}

// ── User search dropdown ──────────────────────────────────────────────────────
function UserSearch({ onSelect }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef(null)

  function handleChange(e) {
    const val = e.target.value
    setQ(val)
    clearTimeout(debounceRef.current)
    if (val.trim().length < 2) { setResults([]); setOpen(false); return }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await chatApi.searchUsers(val.trim())
        setResults(data.users ?? [])
        setOpen(true)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  function handleSelect(user) {
    setQ('')
    setResults([])
    setOpen(false)
    onSelect(user)
  }

  return (
    <div className="relative px-3 py-2.5 border-b border-border">
      <div className="relative">
        {/* Search / loading icon */}
        {loading ? (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-terracotta/40 border-t-terracotta rounded-full animate-spin" />
        ) : (
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warm-gray/50 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        )}
        <input
          type="search"
          value={q}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search people to message…"
          className="w-full pl-9 pr-3 py-2 text-xs bg-cream border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-terracotta placeholder:text-warm-gray/60"
          aria-label="Search users to start a conversation"
          aria-autocomplete="list"
          aria-controls="user-search-results"
          aria-expanded={open}
        />
      </div>

      {/* Dropdown results */}
      {open && results.length > 0 && (
        <ul
          id="user-search-results"
          role="listbox"
          className="absolute left-3 right-3 top-full mt-1 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden"
        >
          {results.map(u => (
            <li key={u.id} role="option">
              <button
                type="button"
                onMouseDown={() => handleSelect(u)}
                className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 hover:bg-cream transition-colors"
              >
                <Avatar name={u.full_name} size={7} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-charcoal truncate">{u.full_name}</p>
                  <p className="text-[10px] text-warm-gray">{roleLabel(u.role)}</p>
                </div>
                <svg className="w-3.5 h-3.5 text-warm-gray/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && q.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute left-3 right-3 top-full mt-1 bg-white border border-border rounded-xl shadow-lg z-50 px-3 py-2.5">
          <p className="text-xs text-warm-gray">No users found for "{q}"</p>
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CirclesAndChatPage() {
  const { user } = useAuth()
  const { socket, connected } = useSocket()

  // UI
  const [activeTab, setActiveTab] = useState('1-on-1')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [doctorOpen, setDoctorOpen] = useState(true)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [messageInput, setMessageInput] = useState('')

  // Chat
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingConvs, setLoadingConvs] = useState(false)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [openingConv, setOpeningConv] = useState(false)
  const [socketError, setSocketError] = useState('')
  const [convError, setConvError] = useState('')

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Load conversation list ────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    if (!user) return
    setLoadingConvs(true)
    setConvError('')
    try {
      const data = await chatApi.listConversations()
      setConversations(data.conversations ?? [])
    } catch (err) {
      setConvError(err.message ?? 'Could not load conversations.')
    } finally {
      setLoadingConvs(false)
    }
  }, [user])

  useEffect(() => { loadConversations() }, [loadConversations])

  // ── Socket event listeners ────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return

    function onHistory({ conversation_id, messages: history }) {
      if (activeConv?.id === conversation_id) {
        setMessages(history ?? [])
        setLoadingMsgs(false)
      }
    }

    function onNewMessage({ message }) {
      if (message.conversation_id === activeConv?.id) {
        setMessages(prev =>
          prev.some(m => m.id === message.id) ? prev : [...prev, message]
        )
      }
      // Re-sort conversation list (new activity bubbles to top)
      loadConversations()
    }

    function onError({ message: msg }) {
      setSocketError(msg ?? 'An error occurred.')
      setLoadingMsgs(false)
    }

    socket.on('message_history', onHistory)
    socket.on('new_message', onNewMessage)
    socket.on('error', onError)

    return () => {
      socket.off('message_history', onHistory)
      socket.off('new_message', onNewMessage)
      socket.off('error', onError)
    }
  }, [socket, activeConv?.id, loadConversations])

  // ── Open / switch to a conversation ──────────────────────────────────────
  const openConversation = useCallback(async (otherUserId, displayName, role) => {
    setSocketError('')
    setMessages([])
    setLoadingMsgs(true)
    setOpeningConv(true)
    try {
      const data = await chatApi.openConversation(otherUserId)
      const conv = {
        id: data.conversation.id,
        other_user_id: otherUserId,
        other_user_name: displayName,
        other_user_role: role,
      }
      setActiveConv(conv)
      setSidebarOpen(false) // close mobile sidebar

      if (socket?.connected) {
        socket.emit('join_conversation', { conversation_id: data.conversation.id })
        // message_history event will clear loadingMsgs
      } else {
        // Socket not ready — load history via REST as fallback
        const hist = await chatApi.getMessages(data.conversation.id)
        setMessages(hist.messages ?? [])
        setLoadingMsgs(false)
      }
    } catch (err) {
      setConvError(err.message ?? 'Could not open conversation.')
      setLoadingMsgs(false)
    } finally {
      setOpeningConv(false)
    }
  }, [socket])

  // Called when user picks from search dropdown
  function handleSearchSelect(u) {
    openConversation(u.id, u.full_name, u.role)
  }

  // Called when user clicks an existing conversation in the list
  function handleSelectConv(conv) {
    if (activeConv?.id === conv.id) return
    openConversation(conv.other_user_id, conv.other_user_name, conv.other_user_role)
  }

  // ── Send message ──────────────────────────────────────────────────────────
  function handleSend(e) {
    e.preventDefault()
    const content = messageInput.trim()
    if (!content || !activeConv || !socket?.connected) return
    setSocketError('')
    socket.emit('send_message', { conversation_id: activeConv.id, content })
    setMessageInput('')
    inputRef.current?.focus()
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const contactName = activeConv?.other_user_name ?? ''
  const contactRole = activeConv?.other_user_role ?? ''
  const canSend = socket?.connected && !!activeConv && messageInput.trim().length > 0
  const connColor = connected ? 'bg-sage' : 'bg-amber-400'

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <main id="main-content" tabIndex={-1} className="flex items-center justify-center bg-cream" style={{ height: 'calc(100vh - 64px)' }}>
        <div className="text-center max-w-sm px-4">
          <div className="w-16 h-16 rounded-full bg-terracotta/10 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
            <svg className="w-8 h-8 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-charcoal mb-2">Live Chat &amp; Circles</h1>
          <p className="text-warm-gray text-sm mb-6 leading-relaxed">
            Log in to message other parents and connect with specialists in real time.
          </p>
          <div className="flex flex-col gap-3">
            <Link to="/login" className="btn-primary w-full">Log In</Link>
            <Link to="/register" className="btn-secondary w-full">Create Account</Link>
          </div>
        </div>
      </main>
    )
  }

  // ── Logged-in layout ──────────────────────────────────────────────────────
  return (
    <main id="main-content" tabIndex={-1} className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>

      {/* ── Status bar ──────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-border px-5 py-2 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${connColor} ${connected ? 'animate-pulse' : ''}`} aria-hidden="true" />
          <span className="text-xs text-warm-gray">
            {connected ? 'Connected' : 'Connecting…'} · Sidra Live Chat
            {activeConv && <span className="hidden sm:inline"> · <span className="font-medium text-charcoal">{contactName}</span></span>}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-warm-gray">
            <svg className="w-3.5 h-3.5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
            End-to-end Encrypted
          </span>
          <button type="button" className="text-xs text-warm-gray hover:text-charcoal border border-border px-3 py-1 rounded-lg hover:bg-cream transition-colors">
            Schedule
          </button>
        </div>
      </div>

      {/* ── Three-column layout ──────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ═══ LEFT SIDEBAR ════════════════════════════════════════════════════ */}
        <aside
          className={`${sidebarOpen ? 'flex' : 'hidden'} md:flex flex-col w-60 lg:w-64 bg-white border-r border-border flex-shrink-0`}
          aria-label="Conversations"
        >
          {/* Tabs */}
          <div className="p-3 border-b border-border">
            <div className="flex bg-cream rounded-xl p-1 gap-1">
              {[{ id: '1-on-1', label: '1-on-1 Care' }, { id: 'circles', label: 'Circles' }].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${activeTab === tab.id ? 'bg-white text-charcoal shadow-sm' : 'text-warm-gray hover:text-charcoal'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search / New chat */}
          {activeTab === '1-on-1' && (
            <UserSearch onSelect={handleSearchSelect} />
          )}

          {/* Circle tab search (static) */}
          {activeTab === 'circles' && (
            <div className="px-3 py-2.5 border-b border-border">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-warm-gray/50 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input type="search" placeholder="Search circles…" className="w-full pl-9 pr-3 py-2 text-xs bg-cream border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-terracotta placeholder:text-warm-gray/60" aria-label="Search circles" />
              </div>
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === '1-on-1' ? (
              <>
                {convError && <p className="px-4 py-2 text-xs text-red-600">{convError}</p>}

                {loadingConvs ? (
                  <div className="flex justify-center py-8">
                    <div className="w-5 h-5 rounded-full border-2 border-terracotta/30 border-t-terracotta animate-spin" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="px-4 py-5 flex flex-col gap-2">
                    <p className="text-xs font-semibold text-charcoal">No conversations yet</p>
                    <p className="text-[11px] text-warm-gray leading-relaxed">
                      Use the search box above to find someone and start a real-time chat.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold text-warm-gray uppercase tracking-wider">Recent</p>
                    <ul role="list">
                      {conversations.map(conv => (
                        <li key={conv.id}>
                          <button
                            type="button"
                            onClick={() => handleSelectConv(conv)}
                            className={`w-full text-left px-4 py-3 flex gap-3 transition-colors border-l-2 ${activeConv?.id === conv.id
                                ? 'border-terracotta bg-terracotta/5'
                                : 'border-transparent hover:bg-cream'
                              }`}
                            aria-current={activeConv?.id === conv.id ? 'true' : undefined}
                          >
                            <div className="relative flex-shrink-0">
                              <Avatar name={conv.other_user_name ?? 'User'} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <p className="text-xs font-semibold text-charcoal truncate">{conv.other_user_name}</p>
                                <span className="text-[10px] text-warm-gray flex-shrink-0">{formatTime(conv.last_message_at)}</span>
                              </div>
                              <p className="text-[11px] text-warm-gray truncate">
                                {conv.last_message ?? <span className="italic">No messages yet</span>}
                              </p>
                            </div>
                            {conv.unread_count > 0 && (
                              <span className="w-4 h-4 rounded-full bg-terracotta text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5" aria-label={`${conv.unread_count} unread`}>
                                {conv.unread_count}
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            ) : (
              <>
                <p className="px-4 pt-4 pb-2 text-[10px] font-bold text-warm-gray uppercase tracking-wider">Community Circles</p>
                <ul role="list">
                  {COMMUNITY_CIRCLES.map(circle => (
                    <li key={circle.id}>
                      <button type="button" className="w-full text-left px-4 py-3 flex gap-3 hover:bg-cream transition-colors">
                        <div className={`w-9 h-9 rounded-xl ${circle.color} font-bold text-xs flex items-center justify-center flex-shrink-0`} aria-hidden="true">
                          {circle.initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <p className="text-xs font-semibold text-charcoal truncate">{circle.name}</p>
                            <span className="text-[10px] text-warm-gray flex-shrink-0">{circle.time}</span>
                          </div>
                          <p className="text-[11px] text-warm-gray truncate">{circle.members}</p>
                          {circle.preview && <p className="text-[11px] text-warm-gray/70 truncate">{circle.preview}</p>}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* User bar */}
          <div className="border-t border-border px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-sage/20 text-sage font-bold text-xs flex items-center justify-center" aria-hidden="true">
                  {(user.name ?? 'U')[0].toUpperCase()}
                </div>
                {connected && <OnlineDot className="absolute -bottom-0.5 -right-0.5" />}
              </div>
              <span className="text-xs text-warm-gray font-medium truncate max-w-[80px]">{user.name}</span>
            </div>
            <button type="button" aria-label="Settings" className="text-warm-gray hover:text-charcoal transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.764-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
          </div>
        </aside>

        {/* ═══ CENTRE: Chat ════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col min-w-0 bg-cream">

          {/* Chat header */}
          <div className="bg-white border-b border-border px-5 py-3 flex items-center gap-3 flex-shrink-0">
            {/* Mobile hamburger */}
            <button type="button" onClick={() => setSidebarOpen(o => !o)} className="md:hidden p-1.5 rounded-lg text-warm-gray hover:bg-cream" aria-label="Toggle sidebar">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {activeConv ? (
              <>
                <div className="relative flex-shrink-0">
                  <Avatar name={contactName} size={10} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-sm font-bold text-charcoal">{contactName}</h1>
                    {contactRole === 'professional' && (
                      <svg className="w-3.5 h-3.5 text-sage flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-label="Verified professional" role="img">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-warm-gray">
                    {connected ? 'Live · End-to-end encrypted' : 'Reconnecting…'}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1">
                <h1 className="text-sm font-bold text-charcoal">Sidra Live Chat</h1>
                <p className="text-xs text-warm-gray">
                  Search for a user in the sidebar to begin
                </p>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <button type="button" disabled={!activeConv} className="hidden sm:flex items-center gap-1.5 bg-terracotta text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-terracotta-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                Video Call
              </button>
              <button type="button" onClick={() => setDoctorOpen(o => !o)} aria-label="Toggle details" className="hidden xl:flex p-2 text-warm-gray hover:text-charcoal hover:bg-cream rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto" role="log" aria-label="Chat messages" aria-live="polite">
            {!activeConv ? (
              /* Empty state */
              <div className="h-full flex flex-col items-center justify-center px-6 text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-terracotta/10 flex items-center justify-center" aria-hidden="true">
                  <svg className="w-8 h-8 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal mb-1">Start a conversation</p>
                  <p className="text-xs text-warm-gray leading-relaxed max-w-xs">
                    Type a name in the search box on the left to find someone and begin chatting in real time.
                  </p>
                </div>
              </div>

            ) : loadingMsgs || openingConv ? (
              <MessageSkeleton />

            ) : (
              <div className="px-5 py-6 space-y-5">
                {socketError && (
                  <div role="alert" className="flex justify-center">
                    <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-full">
                      {socketError}
                    </span>
                  </div>
                )}

                {messages.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10">
                    <div className="w-10 h-10 rounded-full bg-terracotta/10 flex items-center justify-center" aria-hidden="true">
                      <Avatar name={contactName} size={8} />
                    </div>
                    <p className="text-xs font-semibold text-charcoal">{contactName}</p>
                    <p className="text-xs text-warm-gray">Say hello to start the conversation.</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <MessageBubble
                      key={msg.id}
                      msg={msg}
                      currentUserId={user.id}
                      contactName={contactName}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message input */}
          <div className="bg-white border-t border-border px-5 py-3 flex-shrink-0">
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <button type="button" aria-label="Attach file" className="p-2 text-warm-gray hover:text-charcoal hover:bg-cream rounded-lg transition-colors flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                </svg>
              </button>
              <button type="button" aria-label="Voice message" className="p-2 text-warm-gray hover:text-charcoal hover:bg-cream rounded-lg transition-colors flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
              </button>
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  placeholder={activeConv ? `Message ${contactName.split(' ')[0]}…` : 'Select a conversation to start chatting'}
                  disabled={!activeConv || !connected}
                  maxLength={4000}
                  className="w-full px-4 py-2.5 pr-12 text-sm bg-cream border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-terracotta placeholder:text-warm-gray/60 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Message input"
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-terracotta text-white rounded-lg flex items-center justify-center hover:bg-terracotta-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </form>
            <p className="text-[10px] text-warm-gray/50 mt-1.5 px-1">
              {activeConv
                ? `End-to-end encrypted · ${connected ? 'Live' : 'Reconnecting…'}`
                : 'Search for someone above to start chatting'}
            </p>
          </div>
        </div>

        {/* ═══ RIGHT: Details panel ════════════════════════════════════════════ */}
        {doctorOpen && (
          <aside className="hidden xl:flex flex-col w-60 bg-white border-l border-border flex-shrink-0 overflow-y-auto" aria-label="Session details">
            <div className="p-5 space-y-5">
              {activeConv ? (
                <>
                  <div className="text-center">
                    <div className="flex justify-center mb-3">
                      <Avatar name={contactName} size={14} color="bg-terracotta/10 text-terracotta" />
                    </div>
                    <h2 className="text-sm font-bold text-charcoal">{contactName}</h2>
                    <p className="text-xs text-terracotta font-medium mt-0.5 capitalize">{roleLabel(contactRole)}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-sage bg-sage/10 px-3 py-1 rounded-full">
                      <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-sage' : 'bg-warm-gray'}`} aria-hidden="true" />
                      {connected ? 'Live Session' : 'Offline'}
                    </span>
                  </div>
                  <hr className="border-border" />
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-warm-gray">Select a conversation to see details</p>
                </div>
              )}

              {/* Upcoming session */}
              <details open>
                <summary className="flex items-center justify-between cursor-pointer list-none text-xs font-bold text-charcoal uppercase tracking-wider mb-3">
                  <span>Upcoming Session</span>
                  <svg className="w-3.5 h-3.5 text-warm-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="bg-cream rounded-xl p-3 flex gap-3 items-start mb-2">
                  <div className="w-10 h-10 rounded-xl bg-terracotta/10 flex flex-col items-center justify-center text-terracotta flex-shrink-0">
                    <span className="text-[9px] font-semibold uppercase leading-none">Thu</span>
                    <span className="text-lg font-bold leading-tight">21</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-charcoal">Thursday, Nov 21</p>
                    <p className="text-[11px] text-warm-gray">4:00 – 4:45 PM (EAT)</p>
                    <p className="text-[11px] text-sage mt-0.5">Video confirmed</p>
                  </div>
                </div>
                <button type="button" className="w-full text-xs font-medium text-warm-gray border border-border rounded-lg py-1.5 hover:bg-cream transition-colors">
                  Reschedule
                </button>
              </details>

              <hr className="border-border" />

              <div>
                <p className="text-xs font-bold text-charcoal uppercase tracking-wider mb-2">Session Notes</p>
                <p className="text-xs text-warm-gray italic leading-relaxed">
                  Session notes will appear here when a specialist adds them.
                </p>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* ── Bottom banner ─────────────────────────────────────────────────────── */}
      {!bannerDismissed && (
        <div className="bg-white border-t border-border px-5 py-3 flex items-center gap-3 flex-shrink-0">
          <div className="w-7 h-7 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <svg className="w-3.5 h-3.5 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-charcoal truncate">Live circle: "Navigating Big Feelings Without Shouting" · Fri 7 PM</p>
            <p className="text-[11px] text-warm-gray truncate">Hosted by the Toddler Circle</p>
          </div>
          <button type="button" className="flex-shrink-0 text-xs font-semibold border border-terracotta text-terracotta px-3 py-1.5 rounded-lg hover:bg-terracotta/5 transition-colors">
            RSVP
          </button>
          <button type="button" onClick={() => setBannerDismissed(true)} aria-label="Dismiss banner" className="p-1 text-warm-gray hover:text-charcoal transition-colors flex-shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

    </main>
  )
}
