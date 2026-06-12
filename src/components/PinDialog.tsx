import { useState } from 'react'

interface Props {
  expected: string
  onSuccess: () => void
  onCancel: () => void
}

/** 家長 PIN 碼輸入視窗 */
export function PinDialog({ expected, onSuccess, onCancel }: Props) {
  const [input, setInput] = useState('')
  const [shake, setShake] = useState(false)

  function press(digit: string) {
    const next = input + digit
    setInput(next)
    if (next.length === expected.length) {
      if (next === expected) {
        onSuccess()
      } else {
        setShake(true)
        setTimeout(() => {
          setInput('')
          setShake(false)
        }, 500)
      }
    }
  }

  return (
    <div className="overlay" onClick={onCancel}>
      <div className={`pin-dialog ${shake ? 'shake' : ''}`} onClick={(e) => e.stopPropagation()}>
        <h3>🔒 家長密碼</h3>
        <div className="pin-dots">
          {Array.from({ length: expected.length }, (_, i) => (
            <span key={i} className={i < input.length ? 'pin-dot filled' : 'pin-dot'} />
          ))}
        </div>
        <div className="pin-pad">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((key, i) =>
            key === '' ? (
              <span key={i} />
            ) : (
              <button
                key={i}
                className="pin-key"
                onClick={() => (key === '⌫' ? setInput(input.slice(0, -1)) : press(key))}
              >
                {key}
              </button>
            ),
          )}
        </div>
        <button className="btn btn-ghost" onClick={onCancel}>
          取消
        </button>
      </div>
    </div>
  )
}
