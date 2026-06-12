// 資料型別定義

export type PetSpecies = 'dog' | 'cat' | 'rabbit' | 'dragon' | 'unicorn'

export interface Pet {
  name: string
  species: PetSpecies
  xp: number
  hunger: number // 0-100,越高越飽
  happiness: number // 0-100,越高越開心
  updatedAt: number // 上次狀態計算時間(ms)
}

export interface Kid {
  id: string
  name: string
  avatar: string // emoji
  points: number
  pet: Pet
}

export interface Task {
  id: string
  title: string
  icon: string
  points: number
  active: boolean
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface TaskCompletion {
  id: string
  taskId: string
  kidId: string
  date: string // YYYY-MM-DD
  status: ApprovalStatus
  createdAt: number
}

export interface Reward {
  id: string
  title: string
  icon: string
  cost: number
  active: boolean
}

export interface Redemption {
  id: string
  rewardId: string
  kidId: string
  status: ApprovalStatus
  createdAt: number
}

export interface AppData {
  pin: string | null
  kids: Kid[]
  tasks: Task[]
  completions: TaskCompletion[]
  rewards: Reward[]
  redemptions: Redemption[]
}

// 小孩端可執行的動作
export interface KidActions {
  completeTask(kidId: string, taskId: string): void
  redeem(kidId: string, rewardId: string): void
  feed(kidId: string): void
  play(kidId: string): void
}

// 家長端可執行的動作
export interface ParentActions {
  setPin(pin: string): void
  addKid(name: string, avatar: string, petName: string, species: PetSpecies): void
  removeKid(kidId: string): void
  adjustPoints(kidId: string, delta: number): void
  addTask(title: string, icon: string, points: number): void
  removeTask(taskId: string): void
  addReward(title: string, icon: string, cost: number): void
  removeReward(rewardId: string): void
  reviewCompletion(completionId: string, approve: boolean): void
  reviewRedemption(redemptionId: string, approve: boolean): void
}

export const emptyData: AppData = {
  pin: null,
  kids: [],
  tasks: [],
  completions: [],
  rewards: [],
  redemptions: [],
}
