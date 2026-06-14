# 圖片資源(寵物 & 頭像)

把生成好的圖片用**下面指定的檔名**放進對應資料夾即可,App 會自動使用;
缺少的圖檔會自動退回顯示 emoji,不會壞畫面。

- 格式:**PNG,透明背景**
- 尺寸:正方形,建議 **512×512 或 1024×1024**
- 內容置中、四周留少許空白

## 寵物 `public/images/pets/`(共 16 張)

蛋階段所有寵物共用一張:

| 檔名 | 內容 |
|------|------|
| `egg.png` | 寵物蛋(所有寵物共用) |

各寵物的 寶寶 / 小孩 / 成年 三階段:

| 寵物 | 寶寶 | 小孩 | 成年 |
|------|------|------|------|
| 小狗 dog | `dog-baby.png` | `dog-child.png` | `dog-adult.png` |
| 小貓 cat | `cat-baby.png` | `cat-child.png` | `cat-adult.png` |
| 兔兔 rabbit | `rabbit-baby.png` | `rabbit-child.png` | `rabbit-adult.png` |
| 小龍 dragon | `dragon-baby.png` | `dragon-child.png` | `dragon-adult.png` |
| 獨角獸 unicorn | `unicorn-baby.png` | `unicorn-child.png` | `unicorn-adult.png` |

## 頭像 `public/images/avatars/`(共 8 張)

| 檔名 | 內容 |
|------|------|
| `boy.png` | 男孩 |
| `girl.png` | 女孩 |
| `kid.png` | 小孩(中性) |
| `baby.png` | 嬰兒 |
| `hero.png` | 男超級英雄 |
| `heroine.png` | 女超級英雄 |
| `astronaut.png` | 太空人小孩 |
| `ninja.png` | 忍者小孩 |

> 對應生成用的 prompt 見專案根目錄的 `IMAGE_PROMPTS.md`。
