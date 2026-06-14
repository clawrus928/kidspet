# 🐾 寵物樂園 — 切換到 main 分支並更新部署(給 Agent 執行)

你的任務:這台 EC2 上已部署「寵物樂園 KidsPet」(目前可能在 `claude/progress-check-5n6gzi` 分支)。請把它切換到 `main` 分支、拉取最新程式碼、用內建的一鍵腳本重新部署,最後回報版本與運行狀態。

- **GitHub repo**:`https://github.com/clawrus928/kidspet.git`
- **目標分支**:`main`
- **預設埠號**:`3000`

請依序執行,每步成功再進行下一步;遇錯先診斷再繼續。

---

## 步驟 1:進入專案目錄

```bash
cd ~/kidspet || cd /home/*/kidspet || { echo "找不到 kidspet 目錄,請確認部署位置"; exit 1; }
pwd
```

> 若這台機器**從未部署過**(沒有 kidspet 目錄),改用全新安裝:
> ```bash
> cd ~ && git clone https://github.com/clawrus928/kidspet.git && cd kidspet
> npm install && npm run build
> npm install -g pm2 2>/dev/null || true
> pm2 start server/index.mjs --name kidspet && pm2 save
> ```
> 然後直接跳到「步驟 4 驗證」。

## 步驟 2:切換到 main 分支

```bash
git fetch origin
git checkout main 2>/dev/null || git checkout -b main origin/main
git pull origin main
git rev-parse --abbrev-ref HEAD   # 應顯示 main
```

> 若 `git checkout` 因本機有未提交變更而失敗,先丟棄本機改動(資料檔不受影響,它在 `data/` 已被 gitignore):
> ```bash
> git stash --include-untracked 2>/dev/null || true
> git checkout main && git pull origin main
> ```

## 步驟 3:一鍵部署

```bash
./deploy.sh
```

這個腳本會自動:`git pull` → `npm install` → `npm run build` → `pm2 restart`(若沒在跑會自動 start),完成後印出版本與 git 短碼。

> 若 `./deploy.sh` 沒有執行權限:`chmod +x deploy.sh && ./deploy.sh`,或改用 `npm run deploy`。

## 步驟 4:驗證

```bash
pm2 status kidspet                              # 應為 online
curl -s http://localhost:3000/api/version       # 回傳目前版本,例如 {"version":"1.0.0"}
curl -s http://localhost:3000/ | grep -o '<title>[^<]*</title>'   # 應為寵物樂園標題
curl -s http://169.254.169.254/latest/meta-data/public-ipv4; echo  # 對外 IP
```

App 畫面最底會顯示 `🐾 寵物樂園 v<版本> · <git短碼>`,git 短碼即目前部署的 commit。

## 步驟 5:回報

請回報:
- 目前分支(應為 `main`)
- `curl /api/version` 的版本號
- `pm2 status` 是否 online
- 對外網址:`http://<公開IP>:3000`

---

## 之後每次更新(記住即可)

開發端 push 到 GitHub 後,這台機器只要:

```bash
cd ~/kidspet && ./deploy.sh
```

就會自動拉 main 最新版、重建、重啟。資料存在 `~/kidspet/data/families.json`(已 gitignore,不會被覆蓋)。
