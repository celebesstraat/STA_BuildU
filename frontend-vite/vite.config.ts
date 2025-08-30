import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['9b73da5c-32e1-4a80-a3e7-7b20d376ffe8-00-5em7vyrius9n.riker.replit.dev']
  },
  test: { // Add this test configuration
    globals: true,
    environment: 'jsdom',
    setupFiles: './setupTests.ts',
  },
})
