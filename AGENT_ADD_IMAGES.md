# 🎨 寵物樂園 — 放入寵物/頭像圖片並重新部署(給 Agent 執行)

你的任務:把使用者生成好的寵物與頭像 PNG 圖片,放進這台 EC2 上 KidsPet 專案的指定資料夾(檔名要正確),然後重新 build 與重啟伺服器。放好的圖會自動取代原本的 emoji;沒放到的會自動顯示 emoji,不會壞畫面。

- 專案位置:`~/kidspet`(若不在此,先 `cd` 到正確位置)
- 圖片目標資料夾:
  - 寵物:`~/kidspet/public/images/pets/`
  - 頭像:`~/kidspet/public/images/avatars/`

---

## 步驟 0:先確認專案是最新版

```bash
cd ~/kidspet
git pull origin main        # 取得最新程式(已包含圖片管道)
```

## 步驟 1:找出使用者提供的圖片來源

使用者會把生成好的圖片放在某處(請依實際情況擇一):
- 已上傳到主機某資料夾,例如 `~/uploads/`、`~/kidspet-images/`
- 是一個 zip 壓縮檔,例如 `~/images.zip`

先定位它們:

```bash
ls -la ~/uploads ~/kidspet-images 2>/dev/null
ls -la ~/*.zip 2>/dev/null
```

若是 zip,先解壓到暫存資料夾:

```bash
mkdir -p ~/img-src && unzip -o ~/images.zip -d ~/img-src && ls ~/img-src
```

把「圖片來源資料夾」記為 `SRC`(下面用 `~/img-src` 示範,請替換成實際路徑):

```bash
SRC=~/img-src
```

## 步驟 2:依檔名放到正確位置

圖片**必須**用下列檔名(大小寫需一致)。請把 `SRC` 中對應的檔案複製過去。

### 寵物 → `public/images/pets/`(最多 16 張)

```
egg.png
dog-baby.png      dog-child.png      dog-adult.png
cat-baby.png      cat-child.png      cat-adult.png
rabbit-baby.png   rabbit-child.png   rabbit-adult.png
dragon-baby.png   dragon-child.png   dragon-adult.png
unicorn-baby.png  unicorn-child.png  unicorn-adult.png
```

### 頭像 → `public/images/avatars/`(最多 8 張)

```
boy.png  girl.png  kid.png  baby.png  hero.png  heroine.png  astronaut.png  ninja.png
```

若 `SRC` 內的檔名**已經正確**,直接整批複製(只複製名單內的檔案):

```bash
cd ~/kidspet
PETS="egg dog-baby dog-child dog-adult cat-baby cat-child cat-adult rabbit-baby rabbit-child rabbit-adult dragon-baby dragon-child dragon-adult unicorn-baby unicorn-child unicorn-adult"
AVATARS="boy girl kid baby hero heroine astronaut ninja"
for n in $PETS;    do [ -f "$SRC/$n.png" ] && cp "$SRC/$n.png" public/images/pets/    && echo "pet  ✓ $n"; done
for n in $AVATARS; do [ -f "$SRC/$n.png" ] && cp "$SRC/$n.png" public/images/avatars/ && echo "ava  ✓ $n"; done
```

> 若 `SRC` 內檔名不同(例如 `puppy1.png`),請依「內容」對照上面名單**逐一改名複製**,例如:
> ```bash
> cp "$SRC/puppy1.png" public/images/pets/dog-baby.png
> ```

## 步驟 3(選用):壓圖確保不過大

若有安裝 ImageMagick,可把過大的圖統一縮到 512px 並確保是 PNG(沒裝就略過):

```bash
command -v convert >/dev/null && for f in public/images/pets/*.png public/images/avatars/*.png; do
  convert "$f" -resize '512x512>' -strip "$f"
done; echo "done"
```

## 步驟 4:檢查放了哪些、缺哪些

```bash
echo "=== 已放入的寵物圖 ==="; ls -1 public/images/pets/    | grep -v '^\.gitkeep$' || echo "(無)"
echo "=== 已放入的頭像圖 ==="; ls -1 public/images/avatars/ | grep -v '^\.gitkeep$' || echo "(無)"
```

(沒放到的檔名會在 App 自動顯示 emoji,屬正常。)

## 步驟 5:重新 build 並重啟

```bash
cd ~/kidspet && ./deploy.sh
```

> 注意:`deploy.sh` 第一步是 `git pull`。本步放入的圖片若**尚未 commit**,屬於 git 未追蹤檔案,`git pull` 不會刪除它們,可放心。圖片會被打包進 `dist/` 並生效。
> 若要讓圖片長期保存在版本庫(換機也帶著),且本機有 GitHub 推送權限,可額外:
> ```bash
> git add public/images && git commit -m "加入寵物/頭像圖片" && git push origin main
> ```
> 沒有推送權限就跳過,圖片仍會留在本機並正常顯示。

## 步驟 6:驗證與回報

```bash
# 確認其中一張圖可被伺服器取得(回 200)
curl -s -o /dev/null -w "dog-baby.png → %{http_code}\n" http://localhost:3000/images/pets/dog-baby.png
pm2 status kidspet
curl -s http://localhost:3000/api/version
```

請回報:
- 已放入的寵物圖、頭像圖清單(步驟 4 的輸出)
- 抽查圖片是否回 `200`
- `pm2 status` 是否 online、版本號

完成後,在手機重新整理頁面即可看到新圖。
