// 資料儲存層:支援「本機模式」與「Supabase 雲端同步模式」
// 整個 App 的狀態存成單一 JSON 文件,以「家庭代碼」為鍵,
// 多裝置只要輸入同一組家庭代碼即可同步。
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { AppData } from './types'
import { emptyData } from './types'

const LOCAL_KEY = 'kidspet-data'
const FAMILY_CODE_KEY = 'kidspet-family-code'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const cloudEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

let supabase: SupabaseClient | null = null
if (cloudEnabled) {
  supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!)
}

export function getFamilyCode(): string {
  let code = localStorage.getItem(FAMILY_CODE_KEY)
  if (!code) {
    // 產生好記的家庭代碼,例如 PET-X7K2M9
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
    code = 'PET-' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    localStorage.setItem(FAMILY_CODE_KEY, code)
  }
  return code
}

export function setFamilyCode(code: string) {
  localStorage.setItem(FAMILY_CODE_KEY, code.trim().toUpperCase())
}

export async function loadData(): Promise<AppData> {
  if (supabase) {
    const { data, error } = await supabase
      .from('kidspet_families')
      .select('data')
      .eq('code', getFamilyCode())
      .maybeSingle()
    if (!error && data?.data) return { ...emptyData, ...(data.data as AppData) }
    // 雲端讀取失敗時退回本機快取
  }
  const raw = localStorage.getItem(LOCAL_KEY)
  if (raw) {
    try {
      return { ...emptyData, ...(JSON.parse(raw) as AppData) }
    } catch {
      /* 資料損毀則重新開始 */
    }
  }
  return structuredClone(emptyData)
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

/** 儲存(雲端模式下做防抖動,避免連續操作狂打 API) */
export function saveData(data: AppData) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data)) // 永遠保留本機快取
  if (!supabase) return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    await supabase!
      .from('kidspet_families')
      .upsert({ code: getFamilyCode(), data, updated_at: new Date().toISOString() })
  }, 800)
}

/** 訂閱雲端變更(其他裝置更新時即時反映) */
export function subscribeData(onChange: (data: AppData) => void): () => void {
  if (!supabase) return () => {}
  const channel = supabase
    .channel('kidspet-sync')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'kidspet_families', filter: `code=eq.${getFamilyCode()}` },
      (payload) => {
        const row = payload.new as { data?: AppData } | null
        if (row?.data) onChange({ ...emptyData, ...row.data })
      },
    )
    .subscribe()
  return () => {
    supabase!.removeChannel(channel)
  }
}
