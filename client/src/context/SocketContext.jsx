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
// In dev this is http://localhost:5000; in production set VITE_SOCKET_URL.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000'

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    // Only connect when there is a logged-in user
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setConnected(false)
        setAuthError(null)
      }
      return
    }

    // Avoid duplicate connections on hot-module reload
    if (socketRef.current?.connected) return

    const socket = io(SOCKET_URL, {
      path:             '/socket.io',
      withCredentials:  true,   // send the HttpOnly sid cookie
      transports:       ['websocket', 'polling'],
      autoConnect:      true,
      reconnection:     true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
      reconnectionAttempts: 10,
    })

    socket.on('connect', () => {
      setConnected(true)
      setAuthError(null)
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    socket.on('connect_error', (err) => {
      setConnected(false)
      // AUTH_REQUIRED / SESSION_EXPIRED errors come from our handshake middleware
      if (['AUTH_REQUIRED', 'SESSION_EXPIRED', 'USER_INACTIVE', 'AUTH_ERROR'].includes(err.message)) {
        setAuthError(err.message)
        socket.disconnect()
      }
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [user])

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, authError }}>
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
