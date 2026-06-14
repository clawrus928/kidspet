import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

// build 時注入版本資訊,方便在執行中的 App 確認部署的是哪一版
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))
let gitSha = 'unknown'
try {
  gitSha = execSync('git rev-parse --short HEAD').toString().trim()
} catch {
  /* 非 git 環境(例如只下載了壓縮檔)則略過 */
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __GIT_SHA__: JSON.stringify(gitSha),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  // 開發時把 /api 轉到本機後端伺服器(npm run server)
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
