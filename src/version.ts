// App 版本資訊(build 時由 vite.config.ts 注入)
export const APP_VERSION = __APP_VERSION__
export const GIT_SHA = __GIT_SHA__
export const BUILD_TIME = __BUILD_TIME__

/** 給畫面顯示用的簡短版本字串,例如 v1.0.0 · a721f1e */
export const VERSION_LABEL = `v${APP_VERSION} · ${GIT_SHA}`
