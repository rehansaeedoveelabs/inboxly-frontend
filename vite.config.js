import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '127.0.0.1',
    allowedHosts: ['liquid-salad-idealness.ngrok-free.dev'],
    proxy: {
      // Sanctum only starts a session when Origin/Referer matches
      // SANCTUM_STATEFUL_DOMAINS. Tunnel hosts change often, so normalize to
      // the local Vite origin Laravel already trusts.
      '/api': createSanctumProxy(),
      '/sanctum': createSanctumProxy(),
    },
  },
})

function createSanctumProxy() {
  const spaOrigin = 'http://127.0.0.1:5173'
  return {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
    configure(proxy) {
      proxy.on('proxyReq', (proxyReq) => {
        proxyReq.setHeader('Origin', spaOrigin)
        proxyReq.setHeader('Referer', `${spaOrigin}/`)
      })
    },
  }
}
