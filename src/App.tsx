import { useEffect, useState } from 'react'
import type { AppData, Kid, PetSpecies } from './types'
import { emptyData } from './types'
import {
  FEED_COST,
  PLAY_COST,
  feedPet,
  newPet,
  playWithPet,
  tickPet,
  today,
  uid,
} from './game'
import { cloudEnabled, loadData, saveData, subscribeData } from './storage'
import { KidPicker } from './components/KidPicker'
import { KidView } from './components/KidView'
import { ParentPanel } from './components/ParentPanel'
import { PinDialog } from './components/PinDialog'

type View = { name: 'picker' } | { name: 'kid'; kidId: string } | { name: 'parent' }

export default function App() {
  const [data, setData] = useState<AppData>(emptyData)
  const [loaded, setLoaded] = useState(false)
  const [view, setView] = useState<View>({ name: 'picker' })
  const [askPin, setAskPin] = useState(false)

  // 載入資料 + 訂閱雲端同步
  useEffect(() => {
    loadData().then((d) => {
      setData(tickAll(d))
      setLoaded(true)
    })
    return subscribeData((d) => setData(tickAll(d)))
  }, [])

  // 每分鐘更新一次寵物狀態(飢餓/快樂隨時間下降)
  useEffect(() => {
    const t = setInterval(() => setData((d) => tickAll(d)), 60_000)
    return () => clearInterval(t)
  }, [])

  /** 更新狀態並寫入儲存 */
  function update(fn: (d: AppData) => AppData) {
    setData((d) => {
      const next = fn(d)
      saveData(next)
      return next
    })
  }

  function updateKid(kidId: string, fn: (k: Kid) => Kid) {
    update((d) => ({ ...d, kids: d.kids.map((k) => (k.id === kidId ? fn(k) : k)) }))
  }

  // ===== 小孩端動作 =====
  const actions = {
    completeTask(kidId: string, taskId: string) {
      update((d) => ({
        ...d,
        completions: [
          ...d.completions,
          { id: uid(), taskId, kidId, date: today(), status: 'pending' as const, createdAt: Date.now() },
        ],
      }))
    },
    redeem(kidId: string, rewardId: string) {
      update((d) => {
        const reward = d.rewards.find((r) => r.id === rewardId)
        const kid = d.kids.find((k) => k.id === kidId)
        if (!reward || !kid || kid.points < reward.cost) return d
        return {
          ...d,
          kids: d.kids.map((k) => (k.id === kidId ? { ...k, points: k.points - reward.cost } : k)),
          redemptions: [
            ...d.redemptions,
            { id: uid(), rewardId, kidId, status: 'pending' as const, createdAt: Date.now() },
          ],
        }
      })
    },
    feed(kidId: string) {
      updateKid(kidId, (k) =>
        k.points >= FEED_COST ? { ...k, points: k.points - FEED_COST, pet: feedPet(tickPet(k.pet)) } : k,
      )
    },
    play(kidId: string) {
      updateKid(kidId, (k) =>
        k.points >= PLAY_COST ? { ...k, points: k.points - PLAY_COST, pet: playWithPet(tickPet(k.pet)) } : k,
      )
    },
  }

  // ===== 家長端動作 =====
  const parentActions = {
    setPin(pin: string) {
      update((d) => ({ ...d, pin }))
    },
    addKid(name: string, avatar: string, petName: string, species: PetSpecies) {
      update((d) => ({
        ...d,
        kids: [...d.kids, { id: uid(), name, avatar, points: 20, pet: newPet(petName, species) }],
      }))
    },
    removeKid(kidId: string) {
      update((d) => ({
        ...d,
        kids: d.kids.filter((k) => k.id !== kidId),
        completions: d.completions.filter((c) => c.kidId !== kidId),
        redemptions: d.redemptions.filter((r) => r.kidId !== kidId),
      }))
    },
    adjustPoints(kidId: string, delta: number) {
      updateKid(kidId, (k) => ({ ...k, points: Math.max(0, k.points + delta) }))
    },
    addTask(title: string, icon: string, points: number) {
      update((d) => ({ ...d, tasks: [...d.tasks, { id: uid(), title, icon, points, active: true }] }))
    },
    removeTask(taskId: string) {
      update((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== taskId) }))
    },
    addReward(title: string, icon: string, cost: number) {
      update((d) => ({ ...d, rewards: [...d.rewards, { id: uid(), title, icon, cost, active: true }] }))
    },
    removeReward(rewardId: string) {
      update((d) => ({ ...d, rewards: d.rewards.filter((r) => r.id !== rewardId) }))
    },
    reviewCompletion(completionId: string, approve: boolean) {
      update((d) => {
        const c = d.completions.find((x) => x.id === completionId)
        if (!c || c.status !== 'pending') return d
        const task = d.tasks.find((t) => t.id === c.taskId)
        return {
          ...d,
          completions: d.completions.map((x) =>
            x.id === completionId ? { ...x, status: approve ? ('approved' as const) : ('rejected' as const) } : x,
          ),
          kids:
            approve && task
              ? d.kids.map((k) => (k.id === c.kidId ? { ...k, points: k.points + task.points } : k))
              : d.kids,
        }
      })
    },
    reviewRedemption(redemptionId: string, approve: boolean) {
      update((d) => {
        const r = d.redemptions.find((x) => x.id === redemptionId)
        if (!r || r.status !== 'pending') return d
        const reward = d.rewards.find((x) => x.id === r.rewardId)
        return {
          ...d,
          redemptions: d.redemptions.map((x) =>
            x.id === redemptionId ? { ...x, status: approve ? ('approved' as const) : ('rejected' as const) } : x,
          ),
          // 不核准時退回積分
          kids:
            !approve && reward
              ? d.kids.map((k) => (k.id === r.kidId ? { ...k, points: k.points + reward.cost } : k))
              : d.kids,
        }
      })
    },
  }

  function openParent() {
    if (data.pin) setAskPin(true)
    else setView({ name: 'parent' })
  }

  if (!loaded) {
    return (
      <div className="app loading-screen">
        <div className="big-emoji bounce">🐾</div>
        <p>載入中…</p>
      </div>
    )
  }

  const pendingCount =
    data.completions.filter((c) => c.status === 'pending').length +
    data.redemptions.filter((r) => r.status === 'pending').length

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => setView({ name: 'picker' })}>
          🐾 寵物樂園
        </button>
        <div className="topbar-right">
          {!cloudEnabled && (
            <span className="badge badge-local" title="尚未設定 Supabase,資料只存在這台裝置">
              本機模式
            </span>
          )}
          <button className="btn btn-ghost" onClick={openParent}>
            👨‍👩‍👧 家長
            {pendingCount > 0 && <span className="dot">{pendingCount}</span>}
          </button>
        </div>
      </header>

      {view.name === 'picker' && (
        <KidPicker
          kids={data.kids.map((k) => ({ ...k, pet: tickPet(k.pet) }))}
          onPick={(kidId) => setView({ name: 'kid', kidId })}
          onParent={openParent}
        />
      )}

      {view.name === 'kid' &&
        (() => {
          const kid = data.kids.find((k) => k.id === view.kidId)
          if (!kid) return null
          return (
            <KidView
              kid={{ ...kid, pet: tickPet(kid.pet) }}
              data={data}
              actions={actions}
              onBack={() => setView({ name: 'picker' })}
            />
          )
        })()}

      {view.name === 'parent' && (
        <ParentPanel data={data} actions={parentActions} onClose={() => setView({ name: 'picker' })} />
      )}

      {askPin && (
        <PinDialog
          expected={data.pin!}
          onSuccess={() => {
            setAskPin(false)
            setView({ name: 'parent' })
          }}
          onCancel={() => setAskPin(false)}
        />
      )}
    </div>
  )
}

function tickAll(d: AppData): AppData {
  return { ...d, kids: d.kids.map((k) => ({ ...k, pet: tickPet(k.pet) })) }
}
