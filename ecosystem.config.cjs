// pm2 設定:固定此專案的程序名稱與埠號。
// 同一台主機放多個專案時,每個專案用不同的 name 與 PORT(例如 3000、3001…),
// 再由 nginx 依域名轉發到對應埠號。
module.exports = {
  apps: [
    {
      name: 'kidspet',
      script: 'server/index.mjs',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
