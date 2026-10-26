import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.PNG'],

  server: {
    // Forward all /api/* requests to the Express backend during development.
    // This means the browser sends requests to the same origin (port 5173),
    // so the HttpOnly session cookie works without any cross-origin complexity.
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Forward Socket.IO long-polling requests through Vite's proxy.
      // WebSocket upgrades connect directly to VITE_SOCKET_URL (default: http://localhost:5000).
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
