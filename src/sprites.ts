// 圖片資源對應:把寵物階段、頭像 emoji 對應到打包在 public/images 下的圖檔。
// 圖檔不存在時,畫面會自動退回顯示原本的 emoji(見 Sprite 元件)。
import type { PetSpecies } from './types'

// 寵物成長階段對應的檔名片段(對應 game.ts 的 STAGE_NAMES:蛋/寶寶/小孩/成年)
const STAGE_FILE = ['egg', 'baby', 'child', 'adult']

/** 寵物圖片路徑。蛋階段(stage 0)所有寵物共用一張 egg.png。 */
export function petImage(species: PetSpecies, stage: number): string {
  if (stage <= 0) return '/images/pets/egg.png'
  return `/images/pets/${species}-${STAGE_FILE[stage]}.png`
}

// 頭像 emoji → 圖檔名(對應 ParentPanel 的 AVATARS 清單)
export const AVATAR_FILE: Record<string, string> = {
  '👦': 'boy',
  '👧': 'girl',
  '🧒': 'kid',
  '👶': 'baby',
  '🦸': 'hero',
  '🦸‍♀️': 'heroine',
  '🧑‍🚀': 'astronaut',
  '🥷': 'ninja',
}

/** 頭像圖片路徑;沒有對應圖檔(例如自訂 emoji)時回傳 null,改顯示 emoji。 */
export function avatarImage(emoji: string): string | null {
  const file = AVATAR_FILE[emoji]
  return file ? `/images/avatars/${file}.png` : null
}
