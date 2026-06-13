import { useState } from 'react'
import type { AppData, ParentActions, PetSpecies } from '../types'
import { SPECIES } from '../game'
import { getFamilyCode, setFamilyCode } from '../storage'

interface Props {
  data: AppData
  actions: ParentActions
  onClose: () => void
}

type Tab = 'review' | 'kids' | 'tasks' | 'rewards' | 'settings'

const AVATARS = ['👦', '👧', '🧒', '👶', '🦸', '🦸‍♀️', '🧑‍🚀', '🥷']
const TASK_ICONS = ['🧹', '📚', '🦷', '🛏️', '🥗', '🐕', '🧸', '✏️']
const REWARD_ICONS = ['📺', '🍦', '🎮', '🧸', '🎬', '🍕', '🚲', '🎨']

/** 家長管理面板 */
export function ParentPanel({ data, actions, onClose }: Props) {
  const pendingReviews =
    data.completions.filter((c) => c.status === 'pending').length +
    data.redemptions.filter((r) => r.status === 'pending').length
  const [tab, setTab] = useState<Tab>(pendingReviews > 0 ? 'review' : 'kids')

  return (
    <main className="parent-panel">
      <div className="parent-header">
        <h2>👨‍👩‍👧 家長設定</h2>
        <button className="btn btn-ghost" onClick={onClose}>
          完成 ✓
        </button>
      </div>

      <nav className="tabs">
        <button className={tab === 'review' ? 'tab active' : 'tab'} onClick={() => setTab('review')}>
          📋 審核{pendingReviews > 0 && <span className="dot">{pendingReviews}</span>}
        </button>
        <button className={tab === 'kids' ? 'tab active' : 'tab'} onClick={() => setTab('kids')}>
          🧒 小孩
        </button>
        <button className={tab === 'tasks' ? 'tab active' : 'tab'} onClick={() => setTab('tasks')}>
          ✅ 任務
        </button>
        <button className={tab === 'rewards' ? 'tab active' : 'tab'} onClick={() => setTab('rewards')}>
          🎁 獎勵
        </button>
        <button className={tab === 'settings' ? 'tab active' : 'tab'} onClick={() => setTab('settings')}>
          ⚙️ 設定
        </button>
      </nav>

      {tab === 'review' && <ReviewTab data={data} actions={actions} />}
      {tab === 'kids' && <KidsTab data={data} actions={actions} />}
      {tab === 'tasks' && <TasksTab data={data} actions={actions} />}
      {tab === 'rewards' && <RewardsTab data={data} actions={actions} />}
      {tab === 'settings' && <SettingsTab data={data} actions={actions} />}
    </main>
  )
}

function ReviewTab({ data, actions }: { data: AppData; actions: ParentActions }) {
  const pendingTasks = data.completions.filter((c) => c.status === 'pending')
  const pendingRedeems = data.redemptions.filter((r) => r.status === 'pending')

  const kidName = (id: string) => data.kids.find((k) => k.id === id)?.name ?? '?'

  if (pendingTasks.length === 0 && pendingRedeems.length === 0) {
    return <p className="empty-hint">目前沒有等待審核的項目 🎉</p>
  }

  return (
    <section className="card-list">
      {pendingTasks.map((c) => {
        const task = data.tasks.find((t) => t.id === c.taskId)
        return (
          <div key={c.id} className="item-card">
            <span className="item-icon">{task?.icon ?? '✅'}</span>
            <div className="item-body">
              <div className="item-title">
                {kidName(c.kidId)} 完成了「{task?.title ?? '任務'}」
              </div>
              <div className="item-sub">
                {c.date} · 核准後 +⭐{task?.points ?? 0}
              </div>
            </div>
            <div className="review-buttons">
              <button className="btn btn-primary" onClick={() => actions.reviewCompletion(c.id, true)}>
                核准
              </button>
              <button className="btn btn-ghost" onClick={() => actions.reviewCompletion(c.id, false)}>
                退回
              </button>
            </div>
          </div>
        )
      })}
      {pendingRedeems.map((r) => {
        const reward = data.rewards.find((x) => x.id === r.rewardId)
        return (
          <div key={r.id} className="item-card">
            <span className="item-icon">{reward?.icon ?? '🎁'}</span>
            <div className="item-body">
              <div className="item-title">
                {kidName(r.kidId)} 想兌換「{reward?.title ?? '獎勵'}」
              </div>
              <div className="item-sub">已扣 ⭐{reward?.cost ?? 0},退回會還積分</div>
            </div>
            <div className="review-buttons">
              <button className="btn btn-primary" onClick={() => actions.reviewRedemption(r.id, true)}>
                核准
              </button>
              <button className="btn btn-ghost" onClick={() => actions.reviewRedemption(r.id, false)}>
                退回
              </button>
            </div>
          </div>
        )
      })}
    </section>
  )
}

function KidsTab({ data, actions }: { data: AppData; actions: ParentActions }) {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [petName, setPetName] = useState('')
  const [species, setSpecies] = useState<PetSpecies>('dog')

  function add() {
    if (!name.trim() || !petName.trim()) return
    actions.addKid(name.trim(), avatar, petName.trim(), species)
    setName('')
    setPetName('')
  }

  return (
    <section>
      <div className="card-list">
        {data.kids.map((k) => (
          <div key={k.id} className="item-card">
            <span className="item-icon">{k.avatar}</span>
            <div className="item-body">
              <div className="item-title">
                {k.name} · ⭐{k.points}
              </div>
              <div className="item-sub">
                寵物:{SPECIES[k.pet.species].label} {k.pet.name}
              </div>
            </div>
            <div className="review-buttons">
              <button className="btn btn-ghost" title="加 10 分" onClick={() => actions.adjustPoints(k.id, 10)}>
                +10
              </button>
              <button className="btn btn-ghost" title="扣 10 分" onClick={() => actions.adjustPoints(k.id, -10)}>
                −10
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  if (confirm(`確定要刪除 ${k.name} 嗎?寵物和積分都會消失喔!`)) actions.removeKid(k.id)
                }}
              >
                刪除
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="form-card">
        <h3>➕ 新增小孩</h3>
        <input placeholder="小孩名字" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="emoji-row">
          {AVATARS.map((a) => (
            <button key={a} className={a === avatar ? 'emoji-pick active' : 'emoji-pick'} onClick={() => setAvatar(a)}>
              {a}
            </button>
          ))}
        </div>
        <input placeholder="寵物名字" value={petName} onChange={(e) => setPetName(e.target.value)} />
        <div className="emoji-row">
          {(Object.keys(SPECIES) as PetSpecies[]).map((s) => (
            <button
              key={s}
              className={s === species ? 'emoji-pick active' : 'emoji-pick'}
              title={SPECIES[s].label}
              onClick={() => setSpecies(s)}
            >
              {SPECIES[s].stages[1]}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={add} disabled={!name.trim() || !petName.trim()}>
          建立(送 20 起始積分)
        </button>
      </div>
    </section>
  )
}

function TasksTab({ data, actions }: { data: AppData; actions: ParentActions }) {
  const [title, setTitle] = useState('')
  const [icon, setIcon] = useState(TASK_ICONS[0])
  const [points, setPoints] = useState(10)

  return (
    <section>
      <div className="card-list">
        {data.tasks.map((t) => (
          <div key={t.id} className="item-card">
            <span className="item-icon">{t.icon}</span>
            <div className="item-body">
              <div className="item-title">{t.title}</div>
              <div className="item-sub">⭐ {t.points} 分</div>
            </div>
            <button className="btn btn-danger" onClick={() => actions.removeTask(t.id)}>
              刪除
            </button>
          </div>
        ))}
      </div>

      <div className="form-card">
        <h3>➕ 新增任務</h3>
        <input placeholder="任務名稱(例:收玩具)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="emoji-row">
          {TASK_ICONS.map((i) => (
            <button key={i} className={i === icon ? 'emoji-pick active' : 'emoji-pick'} onClick={() => setIcon(i)}>
              {i}
            </button>
          ))}
        </div>
        <label className="number-row">
          積分:
          <input
            type="number"
            min={1}
            max={999}
            value={points}
            onChange={(e) => setPoints(Math.max(1, Number(e.target.value) || 1))}
          />
        </label>
        <button
          className="btn btn-primary"
          disabled={!title.trim()}
          onClick={() => {
            actions.addTask(title.trim(), icon, points)
            setTitle('')
          }}
        >
          新增任務
        </button>
      </div>
    </section>
  )
}

function RewardsTab({ data, actions }: { data: AppData; actions: ParentActions }) {
  const [title, setTitle] = useState('')
  const [icon, setIcon] = useState(REWARD_ICONS[0])
  const [cost, setCost] = useState(50)

  return (
    <section>
      <div className="card-list">
        {data.rewards.map((r) => (
          <div key={r.id} className="item-card">
            <span className="item-icon">{r.icon}</span>
            <div className="item-body">
              <div className="item-title">{r.title}</div>
              <div className="item-sub">⭐ {r.cost} 分</div>
            </div>
            <button className="btn btn-danger" onClick={() => actions.removeReward(r.id)}>
              刪除
            </button>
          </div>
        ))}
      </div>

      <div className="form-card">
        <h3>➕ 新增獎勵</h3>
        <input placeholder="獎勵名稱(例:看卡通 30 分鐘)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="emoji-row">
          {REWARD_ICONS.map((i) => (
            <button key={i} className={i === icon ? 'emoji-pick active' : 'emoji-pick'} onClick={() => setIcon(i)}>
              {i}
            </button>
          ))}
        </div>
        <label className="number-row">
          所需積分:
          <input
            type="number"
            min={1}
            max={9999}
            value={cost}
            onChange={(e) => setCost(Math.max(1, Number(e.target.value) || 1))}
          />
        </label>
        <button
          className="btn btn-primary"
          disabled={!title.trim()}
          onClick={() => {
            actions.addReward(title.trim(), icon, cost)
            setTitle('')
          }}
        >
          新增獎勵
        </button>
      </div>
    </section>
  )
}

function SettingsTab({ data, actions }: { data: AppData; actions: ParentActions }) {
  const [pin, setPin] = useState('')
  const [code, setCode] = useState(getFamilyCode())
  const [copied, setCopied] = useState(false)

  function copyCode() {
    navigator.clipboard?.writeText(getFamilyCode()).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      },
      () => {},
    )
  }

  return (
    <section>
      <div className="form-card">
        <h3>🔒 家長 PIN 碼</h3>
        <p className="form-hint">{data.pin ? '已設定 PIN 碼,進入家長設定需要輸入。' : '尚未設定,任何人都能進入家長設定。'}</p>
        <input
          placeholder="輸入 4 位數字"
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
        />
        <button
          className="btn btn-primary"
          disabled={pin.length !== 4}
          onClick={() => {
            actions.setPin(pin)
            setPin('')
          }}
        >
          {data.pin ? '更新 PIN 碼' : '設定 PIN 碼'}
        </button>
        {data.pin && (
          <button className="btn btn-ghost" onClick={() => actions.setPin('')}>
            移除 PIN 碼
          </button>
        )}
      </div>

      <div className="form-card">
        <h3>📲 多裝置同步</h3>
        <p className="form-hint">
          換手機或多裝置共用時,在新裝置首頁點「📲 輸入家庭代碼同步」,輸入下面這組代碼即可。
        </p>
        <div className="code-box">
          <span className="code-value">{getFamilyCode()}</span>
          <button className="btn btn-ghost" onClick={copyCode}>
            {copied ? '已複製 ✓' : '複製'}
          </button>
        </div>
        <details className="advanced">
          <summary>進階:改用其他家庭代碼</summary>
          <label className="number-row">
            家庭代碼:
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
          </label>
          <button
            className="btn btn-primary"
            onClick={() => {
              setFamilyCode(code)
              location.reload()
            }}
          >
            儲存並重新載入
          </button>
        </details>
      </div>
    </section>
  )
}
