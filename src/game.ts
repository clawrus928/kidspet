// 寵物養成遊戲邏輯
import type { Pet, PetSpecies } from './types'

// 各種寵物在不同成長階段的外觀(蛋 → 寶寶 → 小孩 → 成年)
export const SPECIES: Record<PetSpecies, { label: string; stages: string[] }> = {
  dog: { label: '小狗', stages: ['🥚', '🐶', '🐕', '🦮'] },
  cat: { label: '小貓', stages: ['🥚', '🐱', '🐈', '🐈‍⬛'] },
  rabbit: { label: '兔兔', stages: ['🥚', '🐰', '🐇', '🌟🐇'] },
  dragon: { label: '小龍', stages: ['🥚', '🦎', '🐲', '🐉'] },
  unicorn: { label: '獨角獸', stages: ['🥚', '🐴', '🦄', '✨🦄'] },
}

export const STAGE_NAMES = ['蛋', '寶寶', '小孩', '成年']

// 餵食 / 玩耍的積分花費與效果
export const FEED_COST = 5
export const FEED_HUNGER = 30
export const FEED_XP = 10
export const PLAY_COST = 2
export const PLAY_HAPPINESS = 25
export const PLAY_XP = 5

// 每升一級需要的經驗
export const XP_PER_LEVEL = 50
// 進化階段所需等級
const STAGE_LEVELS = [1, 3, 6, 10]

// 飢餓/快樂隨時間下降(每小時)
const HUNGER_DECAY_PER_HOUR = 2
const HAPPINESS_DECAY_PER_HOUR = 1.5

export function petLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1
}

export function petStage(xp: number): number {
  const level = petLevel(xp)
  let stage = 0
  for (let i = 0; i < STAGE_LEVELS.length; i++) {
    if (level >= STAGE_LEVELS[i]) stage = i
  }
  return stage
}

export function xpProgress(xp: number): number {
  return (xp % XP_PER_LEVEL) / XP_PER_LEVEL
}

/** 根據經過的時間計算飢餓與快樂值的衰減 */
export function tickPet(pet: Pet, now: number = Date.now()): Pet {
  const hours = Math.max(0, (now - pet.updatedAt) / 3_600_000)
  if (hours < 0.01) return pet
  return {
    ...pet,
    hunger: clamp(pet.hunger - hours * HUNGER_DECAY_PER_HOUR),
    happiness: clamp(pet.happiness - hours * HAPPINESS_DECAY_PER_HOUR),
    updatedAt: now,
  }
}

export function feedPet(pet: Pet): Pet {
  return {
    ...pet,
    hunger: clamp(pet.hunger + FEED_HUNGER),
    xp: pet.xp + FEED_XP,
    updatedAt: Date.now(),
  }
}

export function playWithPet(pet: Pet): Pet {
  return {
    ...pet,
    happiness: clamp(pet.happiness + PLAY_HAPPINESS),
    xp: pet.xp + PLAY_XP,
    updatedAt: Date.now(),
  }
}

export function newPet(name: string, species: PetSpecies): Pet {
  return { name, species, xp: 0, hunger: 80, happiness: 80, updatedAt: Date.now() }
}

/** 寵物目前的心情描述 */
export function petMood(pet: Pet): { emoji: string; text: string } {
  if (pet.hunger < 25) return { emoji: '😫', text: '好餓喔…快餵我!' }
  if (pet.happiness < 25) return { emoji: '😢', text: '好無聊…陪我玩!' }
  if (pet.hunger > 70 && pet.happiness > 70) return { emoji: '🥰', text: '我好幸福!' }
  return { emoji: '😊', text: '今天也是好天氣~' }
}

function clamp(v: number): number {
  return Math.min(100, Math.max(0, Math.round(v * 10) / 10))
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
