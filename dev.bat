@echo off
REM Earth Online v2.0 — single dev launcher (double-click this).
chcp 65001 >nul
cd /d "%~dp0"

:menu
cls
echo.
echo   Earth Online v2.0 — Dev Menu
echo   ============================
echo   1. Start Android Emulator
echo   2. Start Emulator (Safe — if qemu crashes)
echo   3. Start Expo Dev Client
echo   4. Start Expo LAN (Expo Go / phone)
echo   5. Build + Install Dev Client (emulator, first time)
echo   6. Build Phone APK (expo run:android)
echo   7. Build + Install on Phone (USB, first time)
echo   8. Start Expo for Phone (same Wi-Fi)
echo   0. Exit
echo.
set /p choice=Select [0-8]:

if "%choice%"=="1" goto emu
if "%choice%"=="2" goto emu_safe
if "%choice%"=="3" goto expo_dev
if "%choice%"=="4" goto expo_lan
if "%choice%"=="5" goto android_dev
if "%choice%"=="6" goto build_phone
if "%choice%"=="7" goto android_phone
if "%choice%"=="8" goto expo_phone
if "%choice%"=="0" exit /b 0
goto menu

:emu
call "%~dp0scripts\emulator\start.bat"
goto menu

:emu_safe
call "%~dp0scripts\emulator\start-safe.bat"
goto menu

:expo_dev
call "%~dp0scripts\expo\start-dev-client.bat"
goto menu

:expo_lan
call "%~dp0scripts\expo\start-lan.bat"
goto menu

:android_dev
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\android\run-android-dev.ps1"
goto menu

:build_phone
call "%~dp0scripts\expo\build-phone.bat"
goto menu

:android_phone
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\android\run-android-phone.ps1"
goto menu

:expo_phone
call "%~dp0scripts\expo\start-phone.bat"
goto menu
