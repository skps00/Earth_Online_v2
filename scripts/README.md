# Earth Online v2.0 — 開發腳本

所有 Windows 啟動腳本集中在此。專案根目錄只需雙擊 **`dev.bat`**。

## 目錄結構

```
Earth_Online_v.2.0/
├── dev.bat                 ← ★ 雙擊這個（開發選單）
├── app/  src/  assets/     ← App 原始碼
├── android/                ← 原生專案（prebuild 產生）
├── docs/dev/               ← 開發備忘、本機變更日誌
├── logs/                   ← 建置 log（build-log.txt 等）
├── backups/                ← package.json 備份
├── credentials/            ← 簽章金鑰（.jks，勿提交 git）
└── scripts/
    ├── emulator/           ← 模擬器啟動
    │   ├── start.bat
    │   ├── start-safe.bat
    │   └── lib/
    ├── expo/               ← Metro / 建置
    │   ├── start-dev-client.bat
    │   ├── start-lan.bat
    │   └── build-phone.bat
    ├── android/
    │   └── run-android-dev.ps1
    └── _legacy/            ← 從根目錄搬過來的舊檔（保留）
```

## 實機測試（Android 手機）

**不能用 Expo Go**（有原生模組）。需要 Dev Client APK。

### 第一次（USB 安裝）

1. 手機：**設定 → 關於手機 → 連點版本號 7 次** → 開啟開發者選項  
2. **開發者選項 → USB 偵錯** 開啟  
3. USB 連接電腦，手機上按 **允許**  
4. 電腦執行 `adb devices` 應看到 `device`（不是 `unauthorized`）  
5. 雙擊 **`dev.bat` → 選 `7`**（建置並安裝到手機，約 15–25 分鐘）

### 每次開發

1. 手機與電腦連 **同一個 Wi-Fi**  
2. **`dev.bat` → 選 `8`**（啟動 Metro，會顯示電腦 IP）  
3. 手機打開 **地球 Online** App  
4. 若連不上：搖晃手機 → Dev Menu → 輸入 `你的電腦IP:8081`

### Google 登入（實機）

Debug 建置用的 SHA-1 若與模擬器相同，Google Cloud 已登記即可；否則需再新增手機 debug 指紋。

## 日常流程（模擬器）

1. 雙擊 **`dev.bat`** → 選 `1` 開模擬器（崩潰則選 `2`）
2. 再選 `3` 啟動 Expo Dev Client
3. 第一次需選 `5` 建置並安裝 Dev Client APK

## 模擬器設定

- AVD：`Pixel_9_Pro_XL` → 編輯 `scripts/emulator/lib/emulator-config.bat`
