// 資料儲存層:與自建的同步伺服器溝通(以「家庭代碼」為鍵)。
// 整份狀態存成單一 JSON,多裝置輸入同一組家庭代碼即可同步。
// 連不上伺服器時(離線)自動退回本機 localStorage 快取。
import type { AppData } from './types'
import { emptyData } from './types'

const LOCAL_KEY = 'kidspet-data'
const FAMILY_CODE_KEY = 'kidspet-family-code'

// API 位置:預設與前端同源(同一台伺服器同時派發前端),
// 需要時可用 VITE_API_BASE 指向別台主機。
const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ?? ''

// 與舊版相容的旗標:同步永遠開啟(後端就是我們自己的伺服器)
export const cloudEnabled = true

let lastUpdatedAt = 0 // 目前持有資料的伺服器版本時間
let pendingSave = false // 有未送出的本機變更時,暫停套用輪詢結果以免覆蓋

export function getFamilyCode(): string {
  let code = localStorage.getItem(FAMILY_CODE_KEY)
  if (!code) {
    // 產生好記的家庭代碼,例如 PET-X7K2M9(去掉易混淆的 0/O、1/I)
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
    code = 'PET-' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    localStorage.setItem(FAMILY_CODE_KEY, code)
  }
  return code
}

export function setFamilyCode(code: string) {
  localStorage.setItem(FAMILY_CODE_KEY, code.trim().toUpperCase())
}

function apiUrl() {
  return `${API_BASE}/api/family/${encodeURIComponent(getFamilyCode())}`
}

export async function loadData(): Promise<AppData> {
  try {
    const res = await fetch(apiUrl())
    if (res.ok) {
      const json = (await res.json()) as { data: AppData | null; updatedAt: number }
      lastUpdatedAt = json.updatedAt || 0
      if (json.data) {
        const merged = { ...emptyData, ...json.data }
        localStorage.setItem(LOCAL_KEY, JSON.stringify(merged))
        return merged
      }
      // 伺服器上這組代碼還沒有資料 → 用本機快取(首次從本機模式接上時會在第一次儲存時上傳)
    }
  } catch {
    /* 連不上伺服器 → 退回本機快取 */
  }
  const raw = localStorage.getItem(LOCAL_KEY)
  if (raw) {
    try {
      return { ...emptyData, ...(JSON.parse(raw) as AppData) }
    } catch {
      /* 快取損毀則重新開始 */
    }
  }
  return structuredClone(emptyData)
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

/** 儲存:先寫本機快取,再防抖動上傳伺服器 */
export function saveData(data: AppData) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data))
  pendingSave = true
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    try {
      const res = await fetch(apiUrl(), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      })
      if (res.ok) {
        const json = (await res.json()) as { updatedAt: number }
        lastUpdatedAt = json.updatedAt || Date.now()
      }
    } catch {
      /* 離線:保留本機快取,下次儲存會再試 */
    } finally {
      pendingSave = false
    }
  }, 600)
}

/** 訂閱其他裝置的變更:每 4 秒輪詢一次,並在視窗重新聚焦時立即拉取 */
export function subscribeData(onChange: (data: AppData) => void): () => void {
  let stopped = false

  async function poll() {
    if (stopped || pendingSave) return // 有本機未送出的變更時先不要覆蓋
    try {
      const res = await fetch(apiUrl())
      if (!res.ok) return
      const json = (await res.json()) as { data: AppData | null; updatedAt: number }
      if (json.data && (json.updatedAt || 0) > lastUpdatedAt) {
        lastUpdatedAt = json.updatedAt
        const merged = { ...emptyData, ...json.data }
        localStorage.setItem(LOCAL_KEY, JSON.stringify(merged))
        onChange(merged)
      }
    } catch {
      /* 忽略單次輪詢失敗 */
    }
  }

  const interval = setInterval(poll, 4000)
  const onFocus = () => poll()
  window.addEventListener('focus', onFocus)
  document.addEventListener('visibilitychange', onFocus)

  return () => {
    stopped = true
    clearInterval(interval)
    window.removeEventListener('focus', onFocus)
    document.removeEventListener('visibilitychange', onFocus)
  }
}
