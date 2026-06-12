# 🐾 寵物樂園 KidsPet

給小孩的積分獎勵系統 — 完成任務賺積分,用積分養出可愛的虛擬寵物!

## ✨ 功能

- **多小孩支援**:每個小孩有自己的頭像、積分和寵物
- **任務系統**:家長設定任務(收玩具、刷牙、寫作業…),小孩按「我做完了」後由家長核准才入帳
- **虛擬寵物養成**:用積分餵食 🍖 / 玩耍 🎾,寵物獲得經驗值升級,從 🥚 蛋 → 寶寶 → 小孩 → 成年 一路進化;飽足和快樂值會隨時間下降,要記得照顧!
- **獎勵商店**:積分可兌換真實獎勵(看卡通 30 分鐘、吃冰淇淋…),由家長核准
- **家長 PIN 碼**:4 位數密碼保護家長設定,小孩不能自己加分
- **雲端同步(選用)**:接上 Supabase 後,爸媽手機與小孩平板輸入同一組「家庭代碼」即可即時同步

## 🚀 快速開始

```bash
npm install
npm run dev
```

打開瀏覽器即可使用。**未設定 Supabase 時自動以「本機模式」運作**(資料存在瀏覽器 localStorage),單一裝置可直接使用。

### 第一次使用

1. 點右上角「👨‍👩‍👧 家長」進入家長設定
2. 在「🧒 小孩」分頁建立小孩帳號並領養寵物(小狗/小貓/兔兔/小龍/獨角獸)
3. 在「✅ 任務」「🎁 獎勵」分頁設定任務與獎勵
4. 在「⚙️ 設定」分頁設定 4 位數家長 PIN 碼
5. 回到首頁讓小孩選擇自己的頭像開始玩!

## ☁️ 啟用雲端同步(多裝置)

1. 到 [supabase.com](https://supabase.com) 免費建立專案
2. 在 SQL Editor 執行 [`supabase/schema.sql`](supabase/schema.sql)
3. 複製 `.env.example` 為 `.env`,填入專案的 URL 與 anon key:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
4. 重新啟動 / 重新部署。第一台裝置會自動產生「家庭代碼」(家長設定 → ⚙️ 設定 可查看),其他裝置輸入同一組代碼即可同步

> 安全性說明:採「家庭代碼即金鑰」的簡化設計,知道隨機代碼的人可讀寫該家庭資料,適合家庭自用。需要更嚴格的權限控管時可改接 Supabase Auth。

## 🛠 技術

- React 19 + TypeScript + Vite
- Supabase(Postgres + Realtime)做雲端儲存與多裝置即時同步
- 無 UI 框架,純手寫 CSS,行動裝置優先

## 📁 結構

```
src/
  types.ts              資料型別
  game.ts               寵物養成邏輯(等級、進化、飢餓/快樂衰減)
  storage.ts            儲存層(localStorage / Supabase 自動切換)
  App.tsx               主程式與所有狀態操作
  components/
    KidPicker.tsx       首頁選人
    KidView.tsx         小孩畫面(寵物/任務/商店)
    ParentPanel.tsx     家長面板(審核/小孩/任務/獎勵/設定)
    PinDialog.tsx       PIN 碼輸入
supabase/schema.sql     雲端資料表建置 SQL
```
