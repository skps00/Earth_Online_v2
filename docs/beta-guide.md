# Earth Online v2.0 — 封測指南（極簡）

完整測試者手冊（含範圍、NDA、回報格式、FAQ）：  
→ [`mvp-beta-tester-handbook.md`](./mvp-beta-tester-handbook.md)

開發者 USB／EAS 建置：  
→ [`mvp-beta-testing-guide.md`](./mvp-beta-testing-guide.md)

## 安裝

1. 從開發者取得 **APK**（EAS internal / preview build）
2. Android：允許「安裝未知來源應用」
3. 安裝後開啟「地球 Online」

```powershell
cd Earth_Online_v.2.0
eas build --platform android --profile preview
```

## 首次使用

1. 可 **Skip** Google 登入（雲端同步需登入）
2. 完成 **Onboarding** 三屏引導
3. 授予 **定位權限**（打卡必需）
4. 首頁點 **打卡** 開始

## 已知限制（封測版）

| 項目 | 說明 |
|------|------|
| 多數成就 | 需到 **獎盃** 頁點開成就 →「我完成了」手動確認 |
| 天氣成就 | 需 OWM key；不一定當場觸發 |
| POI／五大洋自動 | 尚未實作 |
| IAP | 未連接 Play Billing |
| 成就數量異常偏少 | **設定 → 清除資料** 或重新安裝 |

## 回報 Bug

格式與管道見測試者手冊第 6 節。可暫用：  
https://github.com/skps00/Earth_Online_v2/issues
