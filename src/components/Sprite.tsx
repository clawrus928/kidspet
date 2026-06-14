import { useState } from 'react'

interface Props {
  src: string | null
  emoji: string
  className?: string
}

/**
 * 顯示圖片;若沒有提供圖片或圖片載入失敗,則退回顯示對應的 emoji。
 * 圖片以 1em 尺寸呈現,沿用原本用 font-size 控制大小的版面,
 * 因此可直接把生成好的圖檔丟進 public/images,無需改動樣式。
 */
export function Sprite({ src, emoji, className }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  if (!src || failedSrc === src) {
    return <span className={className}>{emoji}</span>
  }

  return (
    <img
      src={src}
      alt=""
      draggable={false}
      className={`sprite ${className ?? ''}`.trim()}
      onError={() => setFailedSrc(src)}
    />
  )
}
