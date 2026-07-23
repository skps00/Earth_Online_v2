# 地球 Online v2.0 — MVP 封測操作手冊（開發者）

> **版本：** 2026-07-14  
> **適用階段：** MVP 封測 Beta（非 Play Store 上架）  
> **專案目錄：** `Earth_Online_v.2.0/`  
> **給測試者看的完整手冊（概述／範圍／安裝／回報／NDA／FAQ）：** [`mvp-beta-tester-handbook.md`](./mvp-beta-tester-handbook.md)  
> **官方參考：** [EAS Build](https://docs.expo.dev/build/setup/) · [Internal distribution](https://docs.expo.dev/build/internal-distribution/) · [Development builds](https://docs.expo.dev/develop/development-builds/introduction/) · [EAS 環境變數](https://docs.expo.dev/eas/environment-variables/)

---

## 1. 目前階段

```
✅ Phase 1 核心          完成
✅ 擴充 MVP（成就/寵物）  大部分完成
🔄 封測 Beta             ← 你在這裡
⏸ Play Store 正式上架    還沒到
⏸ Phase 3 進階           更後面
```

**封測目標：** 在自己手機（及 1–3 位測試者）上跑完整流程、找 bug、驗證成就。**不是**上架 Play Store。

**追蹤清單：** 專案根目錄 `TODO.md` → **F.1–F.5**（封測主線）

---

## 2. 重要前提

| 項目 | 說明 |
|------|------|
| **不能用 Expo Go** | 專案含 Google Sign-In、Skia 等原生模組，必須用 Dev Client 或 preview APK |
| **Package 名稱** | `com.skps00.earthonline`（舊版 `com.anonymous.earthonline` 需先卸載） |
| **探索方式** | 維持**主動打卡**；不使用 Google Maps Timeline |
| **天氣 API** | 本機 `.env` 已有 key；EAS 雲端建置需另設環境變數（見 §5） |
| **不要現在跑** | `eas build --profile production`（上架用 AAB，非封測） |

---

## 3. 兩條封測路線

| | 路線 A：本機 USB（建議先做） | 路線 B：EAS Preview APK |
|---|---------------------------|-------------------------|
| **用途** | 自己開發 + 第一輪封測 | 把 APK 連結給遠端測試者 |
| **工具** | `dev.bat` | `eas build --profile preview` |
| **OWM key** | `.env` 自動生效 | 需 `eas env:create` + `eas.json` |
| **JS 更新** | Hot reload（Metro） | 改 code 需重新 build |
| **第一次耗時** | 約 15–25 分鐘 | 雲端約 10–20 分鐘 |

**建議順序：** 路線 A 全流程測完 → 路線 B 邀人測。

---

## 4. 路線 A — 本機 USB 封測

### 4.1 開發機準備

**必要軟體**

- Android Studio（含 Android SDK）
- Node.js 20.x
- Git

**安裝依賴**

```powershell
cd C:\Users\skps9\Documents\Code_Project\Earth_Online_App\Earth_Online_v.2.0
npm ci --legacy-peer-deps
```

**天氣 API（`.env`）**

1. 複製 `.env.example` 為 `.env`（若尚未建立）
2. 填入：`OPENWEATHERMAP_API_KEY=你的金鑰`
3. **切勿** commit `.env`（已在 `.gitignore`）

**可選自測**

```powershell
npm test
npx tsc --noEmit
npm run test:play-compliance
```

---

### 4.2 手機準備（第一次）

1. **設定 → 關於手機 → 版本號連點 7 次** → 開啟開發者選項
2. **開發者選項 → USB 偵錯** → 開啟
3. USB 連接電腦，手機上點 **允許 USB 偵錯**
4. 電腦驗證：

```powershell
adb devices
```

應顯示 `xxxx    device`（不是 `unauthorized`）。

---

### 4.3 第一次：建置並安裝 Dev Client

1. 雙擊 `Earth_Online_v.2.0\dev.bat`
2. 選 **`7`** — Build + Install on Phone (USB)
3. 等待 Gradle 建置完成（約 15–25 分鐘）
4. 手機出現 **「地球 Online」** 圖示

**建置失敗時：** 查看 `Earth_Online_v.2.0\logs\build-log.txt` 末尾錯誤訊息。

**dev.bat 選單對照**

| 選項 | 用途 |
|------|------|
| 1 / 2 | 啟動 Android 模擬器 |
| 3 | 啟動 Expo Dev Client（模擬器） |
| 5 | 模擬器第一次建置 Dev Client |
| **7** | **手機 USB 第一次建置安裝** |
| **8** | **手機同 Wi-Fi 啟動 Metro** |
| 6 | 本機 `expo run:android` 建 APK |

---

### 4.4 每次開發：啟動 Metro

1. 手機與電腦連 **同一個 Wi-Fi**
2. `dev.bat` → 選 **`8`**
3. 記下終端機顯示的 **電腦 IP**（例如 `192.168.1.10:8081`）
4. 手機打開 **地球 Online**
5. 若連不上：搖晃手機 → Dev Menu → 輸入 `你的IP:8081`

> 修改 `.env` 或 `app.config.js` 後，需重啟 Metro（再選 8）並重開 App。

---

### 4.5 完整流程測試清單（對應 TODO F.2）

> 測試者友善版清單亦見 [`mvp-beta-tester-handbook.md`](./mvp-beta-tester-handbook.md) 第 5 節。

依序操作，每步打勾：

| # | 操作 | 預期結果 | ✓ |
|---|------|----------|---|
| 1 | 開 App | Google 登入或 Skip 畫面 | |
| 2 | 點 **Skip** | 進入 onboarding | |
| 3 | 完成 onboarding 三屏 | 請求定位 → 允許 | |
| 4 | 首頁 → **打卡** | 成功，顯示地點/國家 | |
| 5 | 獎盃 Tab | 顯示完整成就列表（約 128） | |
| 6 | 任務 Tab | 3 個每日任務 | |
| 7 | 夥伴 Tab | 寵物、XP、五維雷達圖 | |
| 8 | 設定 Tab | 主題/語言/備份/隱私政策連結 | |
| 9 | 相機（任務或成就觸發） | 允許相機 → 拍照成功 | |
| 10 | 設定 → **匯出備份** | 顯示成功路徑 | |
| 11 | 設定 → **清除所有資料** | App 重置，可再 onboarding | |

**獎盃數量異常偏少？** → 設定 → 清除資料，或卸載重裝（種子會 backfill）。

---

### 4.6 自動成就驗證（含於 F.2 抽測）

| 類型 | 測法 | 備註 |
|------|------|------|
| 打卡數 / 國家 / 洲 | 多次打卡 | 探索／旅行類進度增加 |
| 海拔 `explore_mountain` | 高海拔打卡 | 模擬器有 dev mock 台北 |
| 早起 `daily_earlybird` | 清晨打卡 | |
| 下雪 `explore_snow` | 下雪天氣打卡 | 需 OWM |
| 跨境／換日線／首度出國 | 跨國打卡序列 | 需真實移動或可接受之測試條件 |
| 天氣 | 打卡 + 等背景同步 | 需 `.env` OWM key + 定位 |
| 地震 `epic_earthquake` | 自動背景檢查 | 僅 USGS 近距 M4+ 時觸發 |
| 多數成就 | 獎盃 → 詳情 → **我完成了** | 手動確認，設計如此 |
| 螢幕時間 | 凌晨開本 App | 僅偵測**本 App**，非全機 |

---

### 4.7 Google 登入（可選；正式 SHA-1 見上架 TODO P.4）

封測可全程 **Skip**。若要測雲端同步：

1. 設定 → Sign in with Google
2. 若 `DEVELOPER_ERROR`：
   - [Google Cloud Console](https://console.cloud.google.com/)
   - 為 `com.skps00.earthonline` 新增 **debug SHA-1**
   - 取得 SHA-1：`cd android` 後 `.\gradlew signingReport`

封測階段**不必**設定 release SHA-1（上架前再做）。

---

### 4.8 Bug 回報格式（對應 TODO F.3）

完整測試者說明見手冊第 6–7 節。開發向摘要：

```
標題：（一句話）
手機：（型號 + Android 版本）
語言：zh-TW / en
步驟：1. 2. 3.
預期：
實際：
截圖：（附件）
```

回報管道：GitHub Issues — https://github.com/skps00/Earth_Online_v2/issues ；對外測試者另用【待填】Google 表單（見測試者手冊）。

---

### 4.9 修 Bug 後重測（對應 TODO F.4）

1. 修改程式碼
2. `dev.bat` → **8** 重啟 Metro
3. 手機 App hot reload（或 Dev Menu → Reload）
4. **僅在**改原生碼 / 權限 / 新增 native 套件時，才需再跑 **7** 重裝

---

## 5. 路線 B — EAS Preview APK（分發給測試者）

依 [Expo Internal distribution](https://docs.expo.dev/build/internal-distribution/)：`preview` + `distribution: internal` 產出**可直接安裝的 APK**。

### 5.1 安裝 EAS CLI 並登入

```powershell
npm install -g eas-cli
cd C:\Users\skps9\Documents\Code_Project\Earth_Online_App\Earth_Online_v.2.0
eas login
eas whoami
```

需有 [expo.dev](https://expo.dev) 帳號（免費方案可建置）。

### 5.2 確認 EAS 專案

`app.json` 已含：

```json
"eas": { "projectId": "bd47dc4a-b3f5-4360-b32c-1fa701d18e85" }
```

若從未設定過，執行：`eas build:configure`

### 5.3 天氣 API — 雲端建置（重要）

`.env` **不會**上傳到 EAS。Preview APK 若要天氣成就，需：

**步驟 1 — 建立 EAS 環境變數**

```powershell
eas env:create --name OPENWEATHERMAP_API_KEY --value "你的OWM金鑰" --environment preview --visibility secret
```

**步驟 2 — 在 `eas.json` 的 `preview` profile 加上**

```json
"preview": {
  "distribution": "internal",
  "environment": "preview",
  "android": { "buildType": "apk" }
}
```

> 若只做路線 A（USB + `.env`），可略過本節。

### 5.4 觸發建置

```powershell
cd Earth_Online_v.2.0
eas build --platform android --profile preview
```

- 第一次詢問 keystore → 選 **Generate new keystore**
- 完成後到 [expo.dev](https://expo.dev) → 專案 → Builds → 下載 APK

### 5.5 測試者安裝

1. 傳 APK 連結或檔案
2. 手機：**允許安裝未知來源**
3. 安裝後流程同 §4.5（Skip → onboarding → 打卡…）

Preview APK **不連**開發者 Metro；更新需重新 `eas build` 再發新版。

### 5.6 邀請試玩（B.8）

- 建議 1–3 人
- 附上「首次使用」與「已知限制」（§7）
- 收集 feedback 格式同 §4.8

---

## 6. 封測完成標準

- [ ] 路線 A：§4.5 全流程至少跑通 **2 次**（含清除資料）
- [ ] 打卡、129 成就、任務、夥伴、相機、備份無 blocker
- [ ] Bug 清單已建立，嚴重項已修
- [ ] （可選）路線 B：至少 1 位外部測試者成功安裝並打卡

完成後 → 見 `TODO.md`「封測後、上架前」與「Play Store 正式上架（L.x）」。

---

## 7. 已知限制（封測版）

| 項目 | 說明 |
|------|------|
| Social 成就 | 多數需獎盃頁 **手動確認**「我完成了」 |
| 天氣成就 | 需 OWM key；背景約 30 分鐘檢查一次 |
| 螢幕時間 | AppState 啟發式（僅本 App）；非全系統 UsageStats |
| IAP 商店 | 已隱藏（`isIAPEnabled=false`） |
| 地震成就 | 需實際附近 M4+ 地震，多數時間無法觸發 |
| 背景定位 | **未使用**；僅前景 GPS 打卡 |
| 錄音 | **未使用**；相機只拍照 |
| Google Timeline | **不做**；探索靠打卡 |

---

## 8. 封測期「不要做」

| 項目 | 原因 |
|------|------|
| `eas build --profile production` | 上架 AAB，非封測 |
| Play Console 表單、商店素材 | 上架階段 |
| Google Drive OAuth 正式驗證 | 對外上架才需要 |
| 把 `.env` push 到 GitHub | API 金鑰外洩 |
| 用 Expo Go 測試 | 原生模組不支援 |

---

## 9. 隱私（給測試者）

- 成就判定在 **本機** 完成
- Google Drive 僅用於 **可選** 備份同步
- 分析事件暫存本機 SQLite（`analytics_events`），封測除錯用
- 隱私政策：https://skps00.github.io/Earth_Online_v2/privacy-policy.html

---

## 10. 立刻開始 — 最小步驟

```text
1. 確認 Earth_Online_v.2.0\.env 有 OPENWEATHERMAP_API_KEY
2. 手機 USB 偵錯 → adb devices 顯示 device
3. dev.bat → 7（第一次安裝）
4. dev.bat → 8（開 Metro）
5. 依 §4.5 表格逐項測試
6. 問題依 §4.8 回報
```

---

## 11. 相關文件

| 文件 | 路徑 |
|------|------|
| TODO 追蹤 | `TODO.md` |
| 簡版封測 | `docs/beta-guide.md` |
| 開發腳本 | `Earth_Online_v.2.0/scripts/README.md` |
| Play 上架（日後） | `docs/play-store-listing.md` |
| 隱私政策 | `docs/privacy-policy.html` |

---

*文件維護：封測流程或 `eas.json` / `dev.bat` 變更時請同步更新本檔。*
