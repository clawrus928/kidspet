import type { Kid } from '../types'
import { SPECIES, petStage, petLevel } from '../game'
import { cloudEnabled } from '../storage'
import { avatarImage, petImage } from '../sprites'
import { Sprite } from './Sprite'

interface Props {
  kids: Kid[]
  onPick: (kidId: string) => void
  onParent: () => void
  onJoin: () => void
}

/** 首頁:選擇是哪個小朋友 */
export function KidPicker({ kids, onPick, onParent, onJoin }: Props) {
  if (kids.length === 0) {
    return (
      <main className="picker empty-state">
        <div className="big-emoji">🐣</div>
        <h2>歡迎來到寵物樂園!</h2>
        <p>先請爸爸媽媽幫你建立帳號和領養寵物吧~</p>
        <button className="btn btn-primary btn-lg" onClick={onParent}>
          👨‍👩‍👧 進入家長設定
        </button>
        {cloudEnabled && (
          <p className="join-hint">
            已經在其他裝置用過?
            <button className="link-btn" onClick={onJoin}>
              📲 輸入家庭代碼同步
            </button>
          </p>
        )}
      </main>
    )
  }

  return (
    <main className="picker">
      <h2 className="picker-title">今天是誰要來照顧寵物呢?</h2>
      <div className="kid-grid">
        {kids.map((kid) => {
          const stage = petStage(kid.pet.xp)
          return (
            <button key={kid.id} className="kid-card" onClick={() => onPick(kid.id)}>
              <div className="kid-avatar">
                <Sprite src={avatarImage(kid.avatar)} emoji={kid.avatar} />
              </div>
              <div className="kid-name">{kid.name}</div>
              <div className="kid-points">⭐ {kid.points} 分</div>
              <div className="kid-pet">
                <Sprite src={petImage(kid.pet.species, stage)} emoji={SPECIES[kid.pet.species].stages[stage]} />{' '}
                {kid.pet.name} · Lv.{petLevel(kid.pet.xp)}
              </div>
            </button>
          )
        })}
      </div>
    </main>
  )
}
