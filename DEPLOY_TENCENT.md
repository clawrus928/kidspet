# 🐾 寵物樂園 — 部署到騰訊雲輕量應用伺服器(香港)

這份文件分兩部分:

- **A. 你在騰訊雲控制台做的事**(買機、開防火牆),約 5 分鐘
- **B. 交給主機上的 Agent 執行的部署任務**

主機的目錄與埠號按「一台主機放多個專案」規劃,之後搬其他專案過來可直接沿用(見 C)。

---

## A. 控制台操作(你來做)

1. 騰訊雲控制台 → **輕量應用伺服器** → **新建**
   - **地域**:中國香港(不需 ICP 備案,連 GitHub / npm 順暢)
   - **鏡像**:系統鏡像 → **Ubuntu Server 24.04 LTS**
   - **套餐**:之後要放多個專案,建議 **2 核 4GB** 起(只放寵物樂園 2 核 2GB 也夠)
   - 設定登入密碼或 SSH 金鑰
2. 建好後進入該實例 → **防火牆**,確認已放通:
   - `22`(SSH)、`80`(HTTP);之後上 HTTPS 再放通 `443`
   - **不用**開 `3000`,外部一律經 nginx 的 80 埠進入
3. 記下實例的**公網 IP**
4. 用控制台的「登入」(OrcaTerm)或 `ssh ubuntu@公網IP` 登入,把下面 **B 部分**交給 Agent 執行

---

## B. 部署任務(給 Agent 執行)

你的任務:在這台全新的騰訊雲輕量伺服器(Ubuntu 24.04,香港)上部署「寵物樂園 KidsPet」:Node 伺服器由 pm2 常駐,nginx 在 80 埠轉發,讓手機用 `http://公網IP/` 直接開啟。請依序執行,每步驗證成功再繼續;遇錯先診斷。最後回報對外網址與運行狀態。

- **GitHub repo**:`https://github.com/clawrus928/kidspet.git`(分支 `main`)
- **專案目錄**:`~/apps/kidspet`
- **內部埠號**:`3000`(只給 nginx 用,不對外)

### 步驟 1:系統更新與基本工具

```bash
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y git curl nginx
```

### 步驟 2:安裝 Node.js 22(LTS)與 pm2

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v    # 應為 v22.x
sudo npm install -g pm2
```

### 步驟 3:取得程式碼

```bash
mkdir -p ~/apps && cd ~/apps
git clone https://github.com/clawrus928/kidspet.git
cd kidspet
git rev-parse --abbrev-ref HEAD    # 應為 main
```

> 若 clone 要求帳密(repo 為私有),請停下並回報,需要使用者提供 GitHub 存取權杖或部署金鑰。

### 步驟 4:安裝、build 並用 pm2 啟動

```bash
cd ~/apps/kidspet
chmod +x deploy.sh
./deploy.sh
```

`deploy.sh` 會 `git pull` → `npm install` → `npm run build` → 依 `ecosystem.config.cjs` 啟動 pm2(程序名 `kidspet`、埠號 3000)。

設定開機自動啟動:

```bash
pm2 startup systemd
# ↑ 會印出一行以 sudo 開頭的指令,請照印出的內容完整執行一次
pm2 save
```

驗證:

```bash
pm2 status                                  # kidspet 應為 online
curl -s http://localhost:3000/api/version   # 應回 {"version":"..."}
```

### 步驟 5:設定 nginx(80 → 3000)

```bash
sudo cp ~/apps/kidspet/deploy/nginx/kidspet.conf /etc/nginx/sites-available/kidspet
sudo ln -sf /etc/nginx/sites-available/kidspet /etc/nginx/sites-enabled/kidspet
sudo rm -f /etc/nginx/sites-enabled/default    # 移除 nginx 預設歡迎頁,避免搶走 80 埠
sudo nginx -t && sudo systemctl reload nginx
sudo systemctl enable nginx
```

### 步驟 6:驗證

```bash
curl -s http://localhost/api/version                                    # 經 nginx 取得版本
curl -s -o /dev/null -w "首頁 %{http_code}\n" http://localhost/          # 應為 200
curl -s -o /dev/null -w "圖片 %{http_code}\n" http://localhost/images/pets/dog-baby.png   # 應為 200
curl -s http://metadata.tencentyun.com/latest/meta-data/public-ipv4 || curl -s ifconfig.me; echo   # 公網 IP
```

### 步驟 7:回報

- 對外網址:`http://<公網IP>/`
- `pm2 status` 是否 online、`/api/version` 版本號
- 步驟 6 三個檢查是否都通過

---

## 日常更新

開發端推到 GitHub `main` 後,在主機執行:

```bash
cd ~/apps/kidspet && ./deploy.sh
```

完成後畫面最底的版本號(`v<版本> · <git短碼>`)會更新。

## 資料與備份

- 家庭資料只有一個檔:`~/apps/kidspet/data/families.json`(已被 gitignore,更新不會覆蓋)
- 備份:複製此檔即可。也可在騰訊雲控制台為實例建立**快照**
- 查看日誌:`pm2 logs kidspet --lines 50 --nostream`

---

## C. 之後搬其他專案過來

每個專案沿用同一套規則:

| 專案 | 目錄 | pm2 名稱 | 內部埠號 | nginx 設定檔 |
|------|------|----------|----------|--------------|
| 寵物樂園 | `~/apps/kidspet` | `kidspet` | 3000 | `/etc/nginx/sites-available/kidspet` |
| 下一個專案 | `~/apps/<名稱>` | `<名稱>` | 3001 | `/etc/nginx/sites-available/<名稱>` |
| 再下一個 | `~/apps/<名稱>` | `<名稱>` | 3002 | … |

**域名很重要**:沒有域名時,80 埠只能給一個專案(目前是寵物樂園,用 `default_server`)。
要多個專案同時用 80/443,需要一個域名,用子域名區分,例如:

- `pet.你的域名.com` → 3000
- `shop.你的域名.com` → 3001

屆時把各專案 nginx 設定裡的 `server_name` 改成各自的子域名,並把寵物樂園設定中的 `default_server` 拿掉。
伺服器在香港,**不需要 ICP 備案**;域名本身仍需依註冊商要求完成實名認證。有了域名就能用 Let's Encrypt 免費上 HTTPS。
