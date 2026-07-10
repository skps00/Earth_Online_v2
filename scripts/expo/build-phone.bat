@echo off
REM Build debug APK via expo run:android (logs saved to logs/).
chcp 65001 >nul
cd /d "%~dp0..\.."
if not exist logs mkdir logs
echo Building... output: logs\build-log.txt
call npx expo run:android > logs\build-log.txt 2>&1
echo BUILD COMPLETE >> logs\build-log.txt
echo Done. See logs\build-log.txt
pause
