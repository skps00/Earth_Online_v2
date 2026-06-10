# 代碼變更與問題日誌

## [2026-06-10 10:15:00] 操作類型：新增
- **文件路徑**：src/utils/haversine.ts
- **變更摘要**：新增 Haversine 距離計算工具函數
- **遇到的問題**：無
- **備註**：Task 9 Location & Check-in Service，用於計算兩個經緯度座標之間的地表距離

## [2026-06-10 10:15:00] 操作類型：新增
- **文件路徑**：src/utils/continentMapper.ts
- **變更摘要**：新增國家到洲別對照表工具函數
- **遇到的問題**：無
- **備註**：Task 9，內建 15 個主要國家的對照，用於反向地理編碼後推斷使用者在哪個洲

## [2026-06-10 10:15:00] 操作類型：新增
- **文件路徑**：src/utils/logger.ts
- **變更摘要**：新增開發環境日誌工具
- **遇到的問題**：無
- **備註**：Task 9，使用 __DEV__ 判斷是否輸出 log，支援 error/warn/info/debug 四個層級

## [2026-06-10 10:15:00] 操作類型：新增
- **文件路徑**：src/services/LocationService.ts
- **變更摘要**：新增 GPS 定位服務，包裝 expo-location 進行位置獲取與反向地理編碼
- **遇到的問題**：無
- **備註**：Task 9，包含權限請求、經緯度獲取、國家/洲別/地址解析

## [2026-06-10 10:15:00] 操作類型：新增
- **文件路徑**：src/services/SunriseService.ts
- **變更摘要**：新增日出日落判斷服務，使用 suncalc 計算當前是否在日出/日落 30 分鐘內
- **遇到的問題**：無
- **備註**：Task 9，用於簽到時觸發 sunrise/sunset 成就

## [2026-06-10 10:15:00] 操作類型：新增
- **文件路徑**：src/services/CheckInCoordinator.ts
- **變更摘要**：新增簽到協調器，整合定位、日出日落、成就解鎖流程
- **遇到的問題**：無
- **備註**：Task 9，支援依賴注入 initCheckIn()，無注入時自動建立預設實例；完成簽到後觸發 checkin_completed、checkin_count、country_count、continent_count、sunrise_sunset 等多種事件

## [2026-06-10 10:17:00] 操作類型：新增
- **文件路徑**：src/components/ProgressBar.tsx
- **變更摘要**：新增通用進度條元件，支援自訂最大值與高度
- **遇到的問題**：無
- **備註**：Task 10 Shared UI Components，使用 ThemeProvider 取得 secondary 顏色

## [2026-06-10 10:17:00] 操作類型：新增
- **文件路徑**：src/components/EmptyState.tsx
- **變更摘要**：新增空狀態佔位元件
- **遇到的問題**：無
- **備註**：Task 10，支援自訂訊息或使用 i18n common.empty 預設值

## [2026-06-10 10:17:00] 操作類型：新增
- **文件路徑**：src/components/ErrorState.tsx
- **變更摘要**：新增錯誤狀態元件，含重試按鈕
- **遇到的問題**：無
- **備註**：Task 10，預設顯示網路離線錯誤訊息，可選 onRetry 回調

## [2026-06-10 10:17:00] 操作類型：新增
- **文件路徑**：src/components/LoadingSkeleton.tsx
- **變更摘要**：新增骨架屏載入動畫元件
- **遇到的問題**：無
- **備註**：Task 10，使用 Animated API 實現呼吸燈效果，支援自訂行數

## [2026-06-10 10:17:00] 操作類型：新增
- **文件路徑**：src/components/ConfirmDialog.tsx
- **變更摘要**：新增確認對話框元件（Modal）
- **遇到的問題**：無
- **備註**：Task 10，使用 React Native Modal 實現半透明遮罩對話框

## [2026-06-10 10:17:00] 操作類型：新增
- **文件路徑**：src/components/RarityBadge.tsx
- **變更摘要**：新增稀有度徽章元件
- **遇到的問題**：無
- **備註**：Task 10，使用 rarityColors 函數動態設定邊框與背景色

## [2026-06-10 10:17:00] 操作類型：新增
- **文件路徑**：src/components/CategoryChip.tsx
- **變更摘要**：新增類別篩選晶片元件
- **遇到的問題**：無
- **備註**：Task 10，支援 active/inactive 狀態切換與 i18n 翻譯

## [2026-06-10 10:25:00] 操作類型：新增
- **文件路徑**：src/stores/checkInStore.ts
- **變更摘要**：新增簽到狀態 Jotai atoms（isCheckingIn、lastCheckIn、checkInError）
- **遇到的問題**：無
- **備註**：Task 11 Home Screen Dashboard，為簽到流程提供全域狀態管理

## [2026-06-10 10:25:00] 操作類型：新增
- **文件路徑**：src/stores/photoPromptStore.ts
- **變更摘要**：新增拍照提示 Jotai atom，用於成就解鎖後觸發拍照流程
- **遇到的問題**：無
- **備註**：Task 11，PhotoPrompt 包含 achievementId 與 achievementTitle

## [2026-06-10 10:25:00] 操作類型：新增
- **文件路徑**：src/hooks/useCheckIn.ts
- **變更摘要**：新增簽到自訂 Hook，封裝 performCheckIn 呼叫與狀態管理
- **遇到的問題**：無
- **備註**：Task 11，整合 checkInStore 與 photoPromptStore atoms，錯誤時寫入 Logger

## [2026-06-10 10:25:00] 操作類型：修改
- **文件路徑**：app/(tabs)/index.tsx
- **變更摘要**：將首頁 stub 取代為完整 Dashboard，含寵物預覽、簽到按鈕、活動與螢幕時間區塊
- **遇到的問題**：無
- **備註**：Task 11，使用 ScrollView 佈局，整合 useCheckIn Hook 與 i18n 翻譯

## [2026-06-10 11:05:00] 操作類型：修改
- **文件路徑**：app/(tabs)/trophies.tsx
- **變更摘要**：將 Trophies stub 取代為完整成就頁面，含類別篩選、成就列表、載入/空狀態
- **遇到的問題**：無
- **備註**：Task 13 Remaining Screens，整合 achievementStore atoms、CategoryChip、EmptyState、LoadingSkeleton

## [2026-06-10 11:05:00] 操作類型：修改
- **文件路徑**：app/(tabs)/quest.tsx
- **變更摘要**：將 Quest stub 取代為完整任務頁面，含每日任務列表、進度條、XP 獎勵顯示
- **遇到的問題**：無
- **備註**：Task 13，整合 questStore atoms、ProgressBar、EmptyState、LoadingSkeleton

## [2026-06-10 11:05:00] 操作類型：修改
- **文件路徑**：app/(tabs)/companion.tsx
- **變更摘要**：將 Companion stub 取代為完整夥伴頁面，含進化進度、四維屬性列表
- **遇到的問題**：無
- **備註**：Task 13，整合 companionStore atoms、ProgressBar、LoadingSkeleton

## [2026-06-10 11:05:00] 操作類型：修改
- **文件路徑**：app/(tabs)/profile.tsx
- **變更摘要**：將 Profile stub 取代為完整設定頁面，含主題/語言/音效切換、備份與回憶區塊
- **遇到的問題**：無
- **備註**：Task 13，整合 settingsStore atoms（themeAtom、langAtom、soundEnabledAtom）
