# 🎨 寵物樂園 — 圖片生成 Prompt 清單

給 GPT Image 2 / Seedream 等模型生成寵物與頭像圖片。共 **16 張寵物 + 8 張頭像**。
生成後依檔名放進 `public/images/pets/` 與 `public/images/avatars/`(對照表見 `public/images/README.md`),App 會自動使用。

## ✅ 共用規格(每張都要)

- **正方形 1:1,1024×1024**
- **透明背景(transparent background, PNG, no background)** ← 很重要
- 角色**置中、完整入鏡**,四周留少許空白
- 統一畫風(把下面這段「風格」貼在每個 prompt 前面)

### 風格段落(複製貼在每個主體前面)

```
Cute kawaii 3D mascot character, soft rounded shapes, glossy smooth shading,
thick clean outlines, big friendly sparkly eyes, cheerful expression,
vibrant pastel colors, soft studio lighting, mobile game character asset,
centered, full body, transparent background, high quality, no text, no watermark.
Subject:
```

> 一致性技巧:同一批用**同一個 seed / 同一張風格參考圖**;頭像那批維持同樣的臉部比例與構圖。
> 若模型無法輸出透明背景,改用**純白背景**也可(App 卡片底色為白色,影響不大),但透明最佳。

---

## 🐾 寵物(16 張)

成長階段:**蛋 → 寶寶(baby)→ 小孩(child)→ 成年(adult)**。
同一隻寵物三個階段要**看得出是同一隻、逐漸長大**(體型變大、特徵更明顯)。

### 蛋(所有寵物共用 1 張)→ `egg.png`
```
Subject: a cute glossy pet egg, pastel cream shell with soft speckles,
tiny crack with a little sparkle of light, sitting upright, adorable.
```

### 小狗 dog
- `dog-baby.png` → `Subject: a tiny chubby puppy baby, oversized round head, floppy ears, golden-cream fur, sitting, super adorable.`
- `dog-child.png` → `Subject: a playful young puppy, golden-cream fur, floppy ears, wagging tail, standing happily.`
- `dog-adult.png` → `Subject: a friendly grown dog, golden-cream fur, sleek and proud but still cute, standing tall.`

### 小貓 cat
- `cat-baby.png` → `Subject: a tiny kitten baby, huge round head, big eyes, soft grey-and-white fur, curled up, adorable.`
- `cat-child.png` → `Subject: a playful young kitten, grey-and-white fur, perky ears, curious pose.`
- `cat-adult.png` → `Subject: an elegant grown cat, grey-and-white fur, graceful sitting pose, cute and refined.`

### 兔兔 rabbit
- `rabbit-baby.png` → `Subject: a tiny baby bunny, oversized head, long droopy ears, fluffy white fur, pink nose, adorable.`
- `rabbit-child.png` → `Subject: a young bunny, fluffy white fur, tall ears, hopping pose, cheerful.`
- `rabbit-adult.png` → `Subject: a grown fluffy rabbit, white fur, long ears upright, sitting proudly, very cute.`

### 小龍 dragon
- `dragon-baby.png` → `Subject: a tiny baby dragon, oversized head, stubby wings, mint-green scales, round belly, friendly, adorable.`
- `dragon-child.png` → `Subject: a young dragon, mint-green scales, small open wings, tiny horns, playful pose.`
- `dragon-adult.png` → `Subject: a majestic but cute grown dragon, mint-green scales, spread wings, small flame, friendly smile.`

### 獨角獸 unicorn
- `unicorn-baby.png` → `Subject: a tiny baby unicorn, oversized head, soft white coat, tiny golden horn, pastel rainbow mane, adorable.`
- `unicorn-child.png` → `Subject: a young unicorn, white coat, golden horn, flowing pastel rainbow mane and tail, prancing.`
- `unicorn-adult.png` → `Subject: a graceful grown unicorn, white coat, shining golden horn, long pastel rainbow mane, magical sparkles, elegant.`

---

## 🧒 頭像(8 張)

頭像建議用**圓形半身肖像(head-and-shoulders)**,所有頭像保持同樣構圖與比例。
把上面的「風格段落」前面再加一句:`circular bust portrait, head and shoulders, facing forward.`

- `boy.png` → `Subject: a happy young boy, short dark hair, bright smile.`
- `girl.png` → `Subject: a happy young girl, shoulder-length hair with a hair clip, bright smile.`
- `kid.png` → `Subject: a cheerful child, neutral look, short tidy hair, big smile.`
- `baby.png` → `Subject: an adorable baby, one curl of hair, rosy cheeks, giggling.`
- `hero.png` → `Subject: a young boy superhero, simple eye mask, red cape, confident smile.`
- `heroine.png` → `Subject: a young girl superhero, simple eye mask, purple cape, confident smile.`
- `astronaut.png` → `Subject: a kid astronaut wearing a white space helmet, visor up showing a smiling face.`
- `ninja.png` → `Subject: a cute kid ninja, dark hood and mask showing only smiling eyes, headband.`

---

## 放好之後

1. 把 PNG 依檔名丟進 `public/images/pets/` 和 `public/images/avatars/`
2. `npm run build`(或在 EC2 跑 `./deploy.sh`)
3. 重新整理畫面即可看到新圖;沒放的那張會自動顯示原本的 emoji
