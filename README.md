# 🌍 地球 Online v2.0

> 將現實生活遊戲化的 Android App — 你的人生 RPG 正在進行中

[![Expo](https://img.shields.io/badge/Expo%20SDK-54-000020?logo=expo)](https://docs.expo.dev/versions/v54.0.0/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

---

## 概述

「地球 Online」將現實生活轉化為 RPG 遊戲體驗。在任何地點打卡，自動解鎖成就，累積點數培養寵物，探索你的人生地圖。

---

## 核心功能

### 📍 打卡系統
- GPS 定位 + 反向地理編碼
- 自動辨識國家/洲別
- 每日打卡上限 10 次
- 打卡歷史按國家分組

### 🏆 成就系統（12 個成就，5 大分類）

| 分類 | 成就 | 觸發 |
|------|------|------|
| 🗺️ Exploration | 第一次打卡 / 探索者 / 冒險家 / 環遊世界 / 傳說探險家 | 打卡次數 |
| 🗺️ Exploration | 護照就緒 / 世界旅人 / 跨洲旅人 | 國家數 |
| 🗺️ Exploration | 新地平線 / 跨洲探險 / 征服全球 | 洲數 |
| 🗺️ Exploration | 早起鳥兒 | 日出時打卡 |

- 事件驅動架構（GameEvent → trigger_map → Engine）
- 前置成就鏈（解鎖前一個才能解鎖下一個）
- 四級稀有度（Common / Rare / Epic / Legendary）
- 加成就只需 INSERT 資料庫，不改程式碼

### 📋 每日任務
- 3 個每日任務（早起鳥兒、探索者之路、拍照獵人）
- 午夜自動重置
- 完成標籤 + 進度條

### 🐾 寵物系統（Coming Soon）
- 12 種寵物物種（龍、狐、貓、狗、獨角獸等）
- 5 維屬性（力量/敏捷/智力/魅力/體力）
- 等級/XP 系統
- Phase 2 實作

### 🌐 多語言
- 繁體中文 / English
- 跟隨裝置語言，可手動切換
- i18n-js + expo-localization

### 💾 備份系統
- JSON 匯出至本機儲存
- zod 驗證匯入資料
- 包含打卡、成就、寵物資料

### ⚙️ 設定
- 深色主題（Stitch 設計系統）
- 語言切換（Modal 下拉選單）
- 音效開關
- 清除所有資料（確認對話框）

---

## 技術棧

| 類別 | 技術 |
|------|------|
| 框架 | Expo SDK 54, React Native 0.81.5 |
| 語言 | TypeScript 5.9 (`strict: true`) |
| 導航 | expo-router (file-based, typed routes) |
| 狀態管理 | Jotai 2.x |
| 資料庫 | expo-sqlite |
| 動畫 | @shopify/react-native-skia 2.2 + react-native-reanimated 3.16 |
| 多語言 | i18n-js + expo-localization |
| 驗證 | zod 4.x |
| 其他 | suncalc, expo-sensors, expo-location, expo-camera, expo-av |

---

## 開發

### 環境需求
- Windows 11, PowerShell 5.1
- Node.js 18+
- Expo Go 54.08+（手機）

### 安裝

```powershell
cd Earth_Online_v.2.0
npm install --legacy-peer-deps
```

### 啟動

```powershell
# 方式 1：直接執行
npx expo start --lan

# 方式 2：使用 bat 腳本
.\start-expo.bat
```

### 型別檢查

```powershell
npx tsc --noEmit
```

---

## 專案結構

```
Earth_Online_v.2.0/
├── app/                           # Expo Router 頁面
│   ├── _layout.tsx                # Root: ThemeProvider + Jotai + SafeAreaProvider
│   ├── (tabs)/                    # 5 Tab: index | trophies | quest | companion | profile
│   ├── camera.tsx                 # Modal
│   └── onboarding.tsx
├── src/
│   ├── engine/                    # 事件驅動成就引擎
│   │   ├── triggerMap.ts          # trigger_map 查詢
│   │   ├── eventRules.ts          # 規則註冊表
│   │   ├── processEvent.ts        # 事件處理核心
│   │   └── reconcile.ts           # 啟動對帳
│   ├── stores/                    # Jotai atoms
│   ├── repositories/              # SQLite CRUD 封裝
│   ├── services/                  # 業務邏輯
│   ├── hooks/                     # React Custom Hooks
│   ├── components/                # 共享 UI 元件
│   ├── database/                  # connection / schema / seed
│   ├── i18n/                      # 翻譯檔 (en/ zh-TW/)
│   ├── theme/                     # colors / spacing / typography
│   ├── types/                     # TypeScript 型別定義
│   └── utils/
├── patches/                       # Metro ESM/CJS 相容性修補
├── docs/superpowers/
│   ├── specs/                     # 設計規格書
│   └── plans/                     # 實作計畫
└── TODO.md                        # 待辦清單
```

---

## 設計參考

- 設計規格書：`docs/superpowers/specs/2026-06-10-earth-online-v2-design.md`
- Phase 1 計畫：`docs/superpowers/plans/2026-06-10-earth-online-v2-phase1.md`
- 引擎重構計畫：`docs/superpowers/plans/2026-06-13-achievement-engine-refactor.md`

---

## 路線圖

| Phase | 內容 | 狀態 |
|-------|------|------|
| Phase 1 | 打卡系統、成就框架、每日任務、多語言、本地備份 | 🔄 進行中 |
| Phase 2 | 寵物系統、天氣/地震 API、活動識別、螢幕時間 | ⏸ 待開始 |
| Phase 3+ | 敘事任務、社群合養、自訂成就 | ⏸ 待開始 |

---

## License

Proprietary — All rights reserved.
