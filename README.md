# 🐾 寵物樂園 KidsPet

給小孩的積分獎勵系統 — 完成任務賺積分,用積分養出可愛的虛擬寵物!

## ✨ 功能

- **多小孩支援**:每個小孩有自己的頭像、積分和寵物
- **任務系統**:家長設定任務(收玩具、刷牙、寫作業…),小孩按「我做完了」後由家長核准才入帳
- **虛擬寵物養成**:用積分餵食 🍖 / 玩耍 🎾,寵物獲得經驗值升級,從 🥚 蛋 → 寶寶 → 小孩 → 成年 一路進化;飽足和快樂值會隨時間下降,要記得照顧!
- **獎勵商店**:積分可兌換真實獎勵(看卡通 30 分鐘、吃冰淇淋…),由家長核准
- **家長 PIN 碼**:4 位數密碼保護家長設定,小孩不能自己加分
- **多裝置同步**:自帶的小型 Node 伺服器,爸媽手機與小孩平板輸入同一組「家庭代碼」即可同步(每幾秒自動更新)

## 🏗 架構

整個系統只有 **一個 Node 伺服器**,同時做兩件事:

1. 派發(serve)已 build 的 React 前端
2. 提供以「家庭代碼」為鍵的同步 API(`GET/PUT /api/family/:code`)

資料只存在 **一個 JSON 檔**(預設 `data/families.json`),**不需安裝任何資料庫**。多裝置同步用輕量輪詢(前端每 4 秒拉一次,視窗重新聚焦時立即拉)。

## 🚀 本機開發

需要兩個終端機:

```bash
npm install

# 終端機 1:後端 API 伺服器(port 3000)
npm run server

# 終端機 2:前端開發伺服器(會自動把 /api 轉到 3000)
npm run dev
```

打開 Vite 給的網址即可。

### 第一次使用

1. 點右上角「👨‍👩‍👧 家長」進入家長設定
2. 在「🧒 小孩」分頁建立小孩帳號並領養寵物(小狗/小貓/兔兔/小龍/獨角獸)
3. 在「✅ 任務」「🎁 獎勵」分頁設定任務與獎勵
4. 在「⚙️ 設定」分頁設定 4 位數家長 PIN 碼
5. 回到首頁讓小孩選擇自己的頭像開始玩!

## 🌐 部署到 EC2(或任何 Linux 主機)

```bash
# 1. 取得程式碼
git clone <repo> kidspet && cd kidspet

# 2. 安裝相依套件
npm install

# 3. build 前端 + 啟動伺服器(預設 port 3000)
npm start
```

`npm start` = `npm run build && node server/index.mjs`,會 build 前端再啟動伺服器,同時派發前端與 API。

開好之後,在 EC2 **安全群組(Security Group)開放對應的 port**(例如 3000),手機瀏覽器打開 `http://你的EC2_IP:3000` 即可使用。

### 保持常駐(開機自動啟動)

用 pm2 最簡單:

```bash
npm install -g pm2
npm run build
pm2 start server/index.mjs --name kidspet
pm2 save && pm2 startup   # 設定開機自動啟動
```

### 可調整的環境變數(啟動伺服器時)

| 變數 | 預設 | 說明 |
|------|------|------|
| `PORT` | `3000` | 伺服器埠號 |
| `DATA_FILE` | `./data/families.json` | 資料檔位置(建議放在會備份的目錄) |

> 想要 `https://` 與「加到主畫面當 App」,可在前面架 nginx 反向代理 + Let's Encrypt 免費憑證,並指定一個域名。

## 📲 換手機 / 多裝置共用

1. 在**原本的裝置**:家長設定 → ⚙️ 設定 → 多裝置同步,會看到一組「家庭代碼」(例 `PET-X7K2M9`),點「複製」
2. 在**新裝置**:打開同一個網址,首頁點「📲 輸入家庭代碼同步」,貼上同一組代碼 → 資料立刻同步過來

之後任一台裝置的操作(完成任務、餵寵物、核准…)幾秒內就會反映到其他裝置。

> 安全性說明:採「家庭代碼即金鑰」的簡化設計,知道隨機代碼的人可讀寫該家庭資料,適合家庭自用。代碼是隨機產生的,正常情況不會被猜中。

## 🛠 技術

- **前端**:React 19 + TypeScript + Vite,無 UI 框架、純手寫 CSS,行動裝置優先
- **後端**:Node + Express,單一 JSON 檔儲存,輪詢同步

## 📁 結構

```
server/
  index.mjs             後端伺服器(派發前端 + 同步 API + JSON 檔儲存)
src/
  types.ts              資料型別
  game.ts               寵物養成邏輯(等級、進化、飢餓/快樂衰減)
  storage.ts            前端儲存層(呼叫 /api,離線退回 localStorage)
  App.tsx               主程式與所有狀態操作
  components/
    KidPicker.tsx       首頁選人
    KidView.tsx         小孩畫面(寵物/任務/商店)
    ParentPanel.tsx     家長面板(審核/小孩/任務/獎勵/設定)
    PinDialog.tsx       PIN 碼輸入
    JoinFamilyDialog.tsx 換裝置輸入家庭代碼
data/families.json      執行時產生的資料檔(已被 gitignore)
```
