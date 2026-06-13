import { useState } from 'react'
import { getFamilyCode, setFamilyCode } from '../storage'

interface Props {
  onClose: () => void
}

/**
 * 換裝置同步用:輸入在原裝置看到的「家庭代碼」,
 * 即可把這台新裝置接到同一份雲端資料。
 */
export function JoinFamilyDialog({ onClose }: Props) {
  const [code, setCode] = useState('')
  const current = getFamilyCode()

  function join() {
    const clean = code.trim().toUpperCase()
    if (!clean) return
    setFamilyCode(clean)
    // 換了家庭代碼,重新載入讓資料以新代碼重新從雲端抓取
    location.reload()
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="join-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>📲 換裝置同步</h3>
        <p className="form-hint">
          在原本的裝置打開「家長設定 → ⚙️ 設定 → 雲端同步」就能看到家庭代碼,
          在這裡輸入同一組代碼即可把資料同步過來。
        </p>
        <input
          placeholder="例:PET-X7K2M9"
          value={code}
          autoFocus
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && join()}
        />
        <p className="form-hint">這台裝置目前的代碼是 {current}(輸入新代碼會取代它)。</p>
        <div className="join-buttons">
          <button className="btn btn-ghost" onClick={onClose}>
            取消
          </button>
          <button className="btn btn-primary" disabled={!code.trim()} onClick={join}>
            同步資料
          </button>
        </div>
      </div>
    </div>
  )
}
