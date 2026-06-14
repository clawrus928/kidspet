import { useState } from 'react'
import type { AppData, Kid, KidActions } from '../types'
import {
  FEED_COST,
  PLAY_COST,
  SPECIES,
  STAGE_NAMES,
  petLevel,
  petMood,
  petStage,
  today,
  xpProgress,
} from '../game'
import { avatarImage, petImage } from '../sprites'
import { Sprite } from './Sprite'

interface Props {
  kid: Kid
  data: AppData
  actions: KidActions
  onBack: () => void
}

type Tab = 'pet' | 'tasks' | 'shop'

/** 小孩主畫面:寵物 / 任務 / 商店 */
export function KidView({ kid, data, actions, onBack }: Props) {
  const [tab, setTab] = useState<Tab>('pet')
  const [fx, setFx] = useState<string | null>(null) // 餵食/玩耍的視覺回饋

  function showFx(emoji: string) {
    setFx(emoji)
    setTimeout(() => setFx(null), 900)
  }

  const pet = kid.pet
  const stage = petStage(pet.xp)
  const level = petLevel(pet.xp)
  const mood = petMood(pet)

  return (
    <main className="kid-view">
      <div className="kid-header">
        <button className="btn btn-ghost" onClick={onBack}>
          ← 換人
        </button>
        <div className="kid-header-info">
          <Sprite src={avatarImage(kid.avatar)} emoji={kid.avatar} className="kid-avatar-sm" />
          <strong>{kid.name}</strong>
        </div>
        <div className="points-pill">⭐ {kid.points}</div>
      </div>

      <nav className="tabs">
        <button className={tab === 'pet' ? 'tab active' : 'tab'} onClick={() => setTab('pet')}>
          🐾 寵物
        </button>
        <button className={tab === 'tasks' ? 'tab active' : 'tab'} onClick={() => setTab('tasks')}>
          ✅ 任務
        </button>
        <button className={tab === 'shop' ? 'tab active' : 'tab'} onClick={() => setTab('shop')}>
          🎁 商店
        </button>
      </nav>

      {tab === 'pet' && (
        <section className="pet-zone">
          <div className="pet-stage-label">
            {STAGE_NAMES[stage]}期 · Lv.{level}
          </div>
          <div className="pet-display">
            <Sprite
              src={petImage(pet.species, stage)}
              emoji={SPECIES[pet.species].stages[stage]}
              className={`pet-emoji ${pet.hunger < 25 || pet.happiness < 25 ? 'sad-wobble' : 'bounce'}`}
            />
            {fx && <span className="pet-fx">{fx}</span>}
          </div>
          <div className="pet-name-row">
            <strong className="pet-name">{pet.name}</strong>
            <span className="pet-mood">
              {mood.emoji} {mood.text}
            </span>
          </div>

          <div className="meters">
            <Meter label="🍖 飽足" value={pet.hunger} color="#ff9f43" />
            <Meter label="💖 快樂" value={pet.happiness} color="#ff6b81" />
            <Meter label="✨ 經驗" value={xpProgress(pet.xp) * 100} color="#54a0ff" />
          </div>

          <div className="pet-actions">
            <button
              className="btn btn-primary btn-lg"
              disabled={kid.points < FEED_COST}
              onClick={() => {
                actions.feed(kid.id)
                showFx('🍖')
              }}
            >
              🍖 餵食(⭐{FEED_COST})
            </button>
            <button
              className="btn btn-pink btn-lg"
              disabled={kid.points < PLAY_COST}
              onClick={() => {
                actions.play(kid.id)
                showFx('🎾')
              }}
            >
              🎾 玩耍(⭐{PLAY_COST})
            </button>
          </div>
          {kid.points < PLAY_COST && <p className="hint">積分不夠了,快去完成任務賺積分吧!</p>}
        </section>
      )}

      {tab === 'tasks' && <TaskList kid={kid} data={data} actions={actions} />}

      {tab === 'shop' && <Shop kid={kid} data={data} actions={actions} />}
    </main>
  )
}

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="meter">
      <span className="meter-label">{label}</span>
      <div className="meter-track">
        <div className="meter-fill" style={{ width: `${Math.round(value)}%`, background: color }} />
      </div>
      <span className="meter-value">{Math.round(value)}</span>
    </div>
  )
}

function TaskList({ kid, data, actions }: { kid: Kid; data: AppData; actions: KidActions }) {
  const tasks = data.tasks.filter((t) => t.active)
  const todayStr = today()

  function statusOf(taskId: string) {
    // 今天這個任務最近一次的紀錄
    const records = data.completions.filter(
      (c) => c.taskId === taskId && c.kidId === kid.id && c.date === todayStr,
    )
    return records.length ? records[records.length - 1].status : null
  }

  if (tasks.length === 0) {
    return <p className="empty-hint">還沒有任務,請爸媽到家長設定新增~</p>
  }

  return (
    <section className="card-list">
      {tasks.map((task) => {
        const status = statusOf(task.id)
        return (
          <div key={task.id} className="item-card">
            <span className="item-icon">{task.icon}</span>
            <div className="item-body">
              <div className="item-title">{task.title}</div>
              <div className="item-sub">⭐ {task.points} 分</div>
            </div>
            {status === 'pending' ? (
              <span className="status-chip waiting">等爸媽確認</span>
            ) : status === 'approved' ? (
              <span className="status-chip done">今天完成 ✔</span>
            ) : (
              <button className="btn btn-primary" onClick={() => actions.completeTask(kid.id, task.id)}>
                我做完了!
              </button>
            )}
          </div>
        )
      })}
    </section>
  )
}

function Shop({ kid, data, actions }: { kid: Kid; data: AppData; actions: KidActions }) {
  const rewards = data.rewards.filter((r) => r.active)
  const pendingIds = new Set(
    data.redemptions.filter((r) => r.kidId === kid.id && r.status === 'pending').map((r) => r.rewardId),
  )

  if (rewards.length === 0) {
    return <p className="empty-hint">商店還沒有獎勵,請爸媽到家長設定新增~</p>
  }

  return (
    <section className="card-list">
      {rewards.map((reward) => (
        <div key={reward.id} className="item-card">
          <span className="item-icon">{reward.icon}</span>
          <div className="item-body">
            <div className="item-title">{reward.title}</div>
            <div className="item-sub">⭐ {reward.cost} 分</div>
          </div>
          {pendingIds.has(reward.id) ? (
            <span className="status-chip waiting">等爸媽確認</span>
          ) : (
            <button
              className="btn btn-pink"
              disabled={kid.points < reward.cost}
              onClick={() => actions.redeem(kid.id, reward.id)}
            >
              兌換
            </button>
          )}
        </div>
      ))}
    </section>
  )
}
