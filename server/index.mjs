// 寵物樂園自建後端:一個 Node 伺服器同時做兩件事 ——
//   1. 派發 (serve) 已 build 的前端 (dist/)
//   2. 提供以「家庭代碼」為鍵的同步 API
// 資料只存在一個 JSON 檔,不需安裝任何資料庫。適合在 EC2 等小型主機跑。
import express from 'express'
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// 版本號(讀自 package.json),方便確認執行中的是哪一版
let VERSION = '0.0.0'
try {
  VERSION = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version
} catch {
  /* 找不到則用預設 */
}

const PORT = Number(process.env.PORT) || 3000
const DATA_FILE = process.env.DATA_FILE || join(ROOT, 'data', 'families.json')
const DIST = join(ROOT, 'dist')

// 記憶體中的資料:{ [家庭代碼]: { data, updatedAt } }
let store = {}

// ---- 寫檔(原子寫入 + 合併連續寫入,避免高頻 I/O)----
let writing = false
let writeAgain = false
async function persist() {
  if (writing) {
    writeAgain = true
    return
  }
  writing = true
  try {
    await mkdir(dirname(DATA_FILE), { recursive: true })
    const tmp = `${DATA_FILE}.tmp`
    await writeFile(tmp, JSON.stringify(store))
    await rename(tmp, DATA_FILE) // 原子替換,避免寫到一半當機壞檔
  } catch (err) {
    console.error('寫入資料失敗:', err)
  } finally {
    writing = false
    if (writeAgain) {
      writeAgain = false
      persist()
    }
  }
}

async function loadStore() {
  try {
    store = JSON.parse(await readFile(DATA_FILE, 'utf8'))
    console.log(`已載入 ${Object.keys(store).length} 個家庭的資料`)
  } catch {
    store = {} // 檔案不存在或損毀則由空開始
  }
}

const app = express()
app.use(express.json({ limit: '4mb' }))

const CODE_RE = /^[A-Z0-9-]{1,32}$/

// 版本資訊(可用 curl /api/version 確認部署版本)
app.get('/api/version', (_req, res) => {
  res.json({ version: VERSION })
})

// 讀取某家庭的資料
app.get('/api/family/:code', (req, res) => {
  const code = String(req.params.code).toUpperCase()
  if (!CODE_RE.test(code)) return res.status(400).json({ error: 'bad code' })
  const entry = store[code]
  res.json({ data: entry?.data ?? null, updatedAt: entry?.updatedAt ?? 0 })
})

// 寫入某家庭的資料(後寫者覆蓋,家用情境足夠)
app.put('/api/family/:code', (req, res) => {
  const code = String(req.params.code).toUpperCase()
  if (!CODE_RE.test(code)) return res.status(400).json({ error: 'bad code' })
  const data = req.body?.data
  if (data == null || typeof data !== 'object') return res.status(400).json({ error: 'bad data' })
  const updatedAt = Date.now()
  store[code] = { data, updatedAt }
  persist()
  res.json({ updatedAt })
})

// 派發前端靜態檔
app.use(express.static(DIST))

// 其餘路徑一律回 index.html(支援前端 SPA);Express 5 不支援 '*' 路由,改用 middleware
app.use((_req, res) => {
  const indexHtml = join(DIST, 'index.html')
  if (existsSync(indexHtml)) {
    res.sendFile(indexHtml)
  } else {
    res
      .status(503)
      .send('前端尚未 build。請先執行 `npm run build`,再啟動伺服器。')
  }
})

await loadStore()
app.listen(PORT, () => {
  console.log(`🐾 寵物樂園伺服器已啟動 v${VERSION}:http://0.0.0.0:${PORT}`)
  console.log(`   資料檔:${DATA_FILE}`)
})
