@echo off
REM Start Expo Metro on LAN (Expo Go / physical device on same Wi-Fi).
chcp 65001 >nul
cd /d "%~dp0..\.."
echo Starting Expo (LAN)...
echo Scan QR code in Expo Go, or press a for Android.
echo.
npx expo start --lan
pause
