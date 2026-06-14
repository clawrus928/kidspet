# 🐾 寵物樂園 KidsPet — EC2 部署任務(給 Agent 執行)

你的任務:在這台 EC2 主機上,把「寵物樂園 KidsPet」這個 Node 應用部署起來並保持常駐運行,讓手機瀏覽器可以連上使用。請依序執行下列步驟,每步驗證成功再進行下一步;遇到錯誤先診斷再繼續,最後回報「對外網址 + 運行狀態」。

- **GitHub repo**:`https://github.com/clawrus928/kidspet.git`
- **要部署的分支**:`claude/progress-check-5n6gzi`
- **預設對外埠號**:`3000`
- **架構**:單一 Node(Express)伺服器,同時派發前端與同步 API,資料存單一 JSON 檔,**不需任何資料庫**。

---

## 步驟 1:確認 / 安裝 Node.js(需 v18 以上,建議 v20+)

```bash
node -v || true
```

若沒有 Node 或版本低於 18,安裝 Node 20(Amazon Linux 2023 / 2 用 nvm 最穩):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install 20 && nvm use 20
node -v   # 應顯示 v20.x
```

> Ubuntu 系統也可用:`curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs`

## 步驟 2:取得程式碼(指定分支)

```bash
cd ~
git clone -b claude/progress-check-5n6gzi https://github.com/clawrus928/kidspet.git
cd kidspet
```

> 若 `~/kidspet` 已存在,改為更新:
> ```bash
> cd ~/kidspet && git fetch origin && git checkout claude/progress-check-5n6gzi && git pull origin claude/progress-check-5n6gzi
> ```

## 步驟 3:安裝相依套件並 build 前端

```bash
npm install
npm run build      # 產生 dist/(前端靜態檔)
```

驗證:`ls dist/index.html` 應存在。

## 步驟 4:用 pm2 啟動並設定常駐(開機自動啟動)

```bash
npm install -g pm2

# 啟動(資料檔放在 ~/kidspet/data/families.json,會自動建立)
pm2 start server/index.mjs --name kidspet

pm2 save           # 記住目前程序清單
pm2 startup        # 依輸出指示執行它印出的那行 sudo 指令,設定開機自動啟動
```

驗證程序在跑:

```bash
pm2 status         # kidspet 應為 online
pm2 logs kidspet --lines 20 --nostream   # 應看到「伺服器已啟動:http://0.0.0.0:3000」
```

## 步驟 5:本機自我測試(確認 API 與前端都正常)

```bash
# 前端首頁應回 HTML(含 <title>寵物樂園…）
curl -s http://localhost:3000/ | grep -o '<title>[^<]*</title>'

# 寫入測試家庭
curl -s -X PUT http://localhost:3000/api/family/PET-DEPLOYTEST \
  -H 'Content-Type: application/json' \
  -d '{"data":{"kids":[{"name":"測試","points":1}]}}'

# 讀回應看到剛剛的資料
curl -s http://localhost:3000/api/family/PET-DEPLOYTEST

# 確認版本(也會顯示在 App 畫面最底)
curl -s http://localhost:3000/api/version
```

讀回若包含 `"name":"測試"` 即代表前後端與存檔都正常。
App 畫面最底會顯示「🐾 寵物樂園 v1.0.0 · <git短碼>」,可用來確認跑的是哪一版。

## 步驟 6:開放對外連線

1. **EC2 安全群組(Security Group)**:在 AWS Console → EC2 → 該執行個體 → Security → 對應的 Security Group → Inbound rules,新增一條:
   - Type: Custom TCP,Port: `3000`,Source: `0.0.0.0/0`(或限制成你家的 IP 更安全)
   > ⚠️ 這一步通常要在 AWS Console 操作。若你(agent)有 AWS CLI 權限,可用:
   > ```bash
   > # 先找出執行個體的 security group id,再開 port(請替換 sg-xxxx)
   > aws ec2 authorize-security-group-ingress --group-id sg-xxxx --protocol tcp --port 3000 --cidr 0.0.0.0/0
   > ```

2. **主機防火牆**(若有啟用 ufw/firewalld):
   ```bash
   sudo ufw allow 3000/tcp 2>/dev/null || sudo firewall-cmd --add-port=3000/tcp --permanent 2>/dev/null; sudo firewall-cmd --reload 2>/dev/null || true
   ```

3. 取得對外 IP:
   ```bash
   curl -s http://169.254.169.254/latest/meta-data/public-ipv4; echo
   ```

## 步驟 7:回報

請回報以下資訊:
- 對外可用網址:`http://<上一步的公開IP>:3000`
- `pm2 status` 的結果(kidspet 是否 online)
- 步驟 5 的測試是否通過

---

## 之後要更新程式時(一鍵)

開發端 push 到 GitHub 後,在 EC2 只需:

```bash
cd ~/kidspet && ./deploy.sh
```

`deploy.sh` 會自動:`git pull` → `npm install` → `npm run build` → `pm2 restart`(首次會自動 start),最後印出部署的版本與 git 短碼。

> 也可用 `npm run deploy`,效果相同。
> 畫面最底的版本號會顯示 `v<版本> · <git短碼>`,git 短碼即當下部署的 commit,可確認是否已是最新。

## 資料與備份

- 所有家庭資料存在單一檔案:`~/kidspet/data/families.json`
- 備份只需複製此檔;搬機只需把此檔放到新主機同位置
- 此檔已被 `.gitignore` 排除,不會被 `git pull` 覆蓋

## 可調整的環境變數(如需)

| 變數 | 預設 | 說明 |
|------|------|------|
| `PORT` | `3000` | 對外埠號 |
| `DATA_FILE` | `~/kidspet/data/families.json` | 資料檔位置 |

用 pm2 改埠號範例:
```bash
pm2 delete kidspet
PORT=8080 pm2 start server/index.mjs --name kidspet
pm2 save
```

## 疑難排解

- **`pm2 logs kidspet` 顯示「前端尚未 build」** → 在專案目錄執行 `npm run build` 後 `pm2 restart kidspet`。
- **手機連不上但 `curl localhost:3000` 正常** → 是對外連線問題,回到步驟 6 檢查 Security Group 是否開了該 port、用的是不是「公開 IP」。
- **想要 `https://` 與「加到主畫面當 App」** → 需另外配域名 + nginx 反向代理 + Let's Encrypt 憑證(本任務不含,可後續再做)。
