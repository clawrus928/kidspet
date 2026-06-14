#!/usr/bin/env bash
# 寵物樂園一鍵部署:在 EC2 上執行即可拉取最新程式碼、重建前端、重啟伺服器。
# 用法:cd ~/kidspet && ./deploy.sh   (或 npm run deploy)
set -e
cd "$(dirname "$0")"

echo "→ 1/4 拉取最新程式碼(目前分支:$(git rev-parse --abbrev-ref HEAD))…"
git pull

echo "→ 2/4 安裝相依套件…"
npm install

echo "→ 3/4 build 前端…"
npm run build

echo "→ 4/4 重啟伺服器…"
# 已在跑就 restart,未跑過就第一次 start
pm2 restart kidspet 2>/dev/null || pm2 start server/index.mjs --name kidspet
pm2 save >/dev/null 2>&1 || true

echo ""
echo "✓ 部署完成 — 版本 v$(node -e "process.stdout.write(require('./package.json').version)") · $(git rev-parse --short HEAD)"
pm2 status kidspet 2>/dev/null || true
