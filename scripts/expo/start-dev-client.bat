@echo off
REM Start Expo Metro for Dev Client (daily development).
chcp 65001 >nul
cd /d "%~dp0..\.."
echo Starting Expo Dev Client...
echo.
npx expo start --dev-client
pause
