import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 開發時把 /api 轉到本機後端伺服器(npm run server)
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
