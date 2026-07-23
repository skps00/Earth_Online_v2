@echo off

REM Start Expo Metro for Dev Client (daily development).

chcp 65001 >nul

cd /d "%~dp0..\.."

echo Starting Expo Dev Client...

adb reverse tcp:8081 tcp:8081 2>nul

echo.

npx expo start --dev-client --localhost --android

pause

