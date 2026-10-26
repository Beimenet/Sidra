/**
 * SocketContext.jsx — Single, shared Socket.IO connection for the app
 *
 * One socket is created when the user is authenticated and destroyed on
 * logout. Components consume it via useSocket().
 *
 * The socket authenticates by sending the HttpOnly session cookie
 * (credentials: 'include' / withCredentials: true) — the same mechanism
 * used by all REST API calls. No separate token is needed.
 *
 * Development:
 *   Vite's proxy does NOT forward WebSocket upgrades by default for
 *   socket.io-client. We bypass the proxy for WebSocket connections by
 *   connecting directly to the backend URL stored in VITE_SOCKET_URL
 *   (defaults to http://localhost:5000 in dev).
 *
 * Production (Render backend + Vercel frontend):
 *   Set VITE_SOCKET_URL=https://your-render-service.onrender.com in Vercel.
 *   Socket.IO will use the HTTPS/WSS URL directly.
 */

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext.jsx'

const SocketContext = createContext(null)

// Direct backend URL — bypasses Vite proxy for WebSocket upgrades.
// In dev: connect directly to http://localhost:5000 (Vite proxy doesn't forward WS).
// In production: if VITE_SOCKET_URL is set use it; otherwise use the current
// window origin so the Vercel /socket.io/* rewrite handles the connection.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  ?? (import.meta.env.PROD ? window.location.origin : 'http://localhost:5000')

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [socket, setSocket] = useState(null)   // reactive — triggers re-render for consumers

  useEffect(() => {
    // Only connect when there is a logged-in user
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setSocket(null)
        setConnected(false)
        setAuthError(null)
      }
      return
    }

    // Avoid duplicate connections on hot-module reload
    if (socketRef.current?.connected) return

    const sock = io(SOCKET_URL, {
      path: '/socket.io',
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
      reconnectionAttempts: 10,
    })

    sock.on('connect', () => {
      setConnected(true)
      setAuthError(null)
    })

    sock.on('disconnect', () => {
      setConnected(false)
    })

    sock.on('connect_error', (err) => {
      setConnected(false)
      if (['AUTH_REQUIRED', 'SESSION_EXPIRED', 'USER_INACTIVE', 'AUTH_ERROR'].includes(err.message)) {
        setAuthError(err.message)
        sock.disconnect()
      }
    })

    socketRef.current = sock
    setSocket(sock)   // expose to context consumers

    return () => {
      sock.disconnect()
      socketRef.current = null
      setSocket(null)
      setConnected(false)
    }
  }, [user])

  return (
    <SocketContext.Provider value={{ socket, connected, authError }}>
      {children}
    </SocketContext.Provider>
  )
}

/**
 * useSocket() — access the shared socket instance and connection state.
 *
 * @returns {{ socket: import('socket.io-client').Socket|null, connected: boolean, authError: string|null }}
 */
export function useSocket() {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be used inside <SocketProvider>')
  return ctx
}
