@echo off
REM Shared emulator launch logic. Called by start-emulator*.bat launchers.
setlocal EnableDelayedExpansion

set "MODE=%~1"
if "%MODE%"=="" set "MODE=normal"

call "%~dp0emulator-config.bat"

if defined ANDROID_HOME (
  set "SDK_ROOT=%ANDROID_HOME%"
) else if defined ANDROID_SDK_ROOT (
  set "SDK_ROOT=%ANDROID_SDK_ROOT%"
) else (
  set "SDK_ROOT=%LOCALAPPDATA%\Android\Sdk"
)

set "EMULATOR=%SDK_ROOT%\emulator\emulator.exe"
set "ADB=%SDK_ROOT%\platform-tools\adb.exe"

if not exist "%EMULATOR%" (
  echo [ERROR] emulator.exe not found:
  echo   %EMULATOR%
  echo.
  echo Install Android Studio SDK, or set ANDROID_HOME.
  pause
  exit /b 1
)

if not exist "%ADB%" (
  echo [ERROR] adb.exe not found:
  echo   %ADB%
  pause
  exit /b 1
)

"%ADB%" devices 2>nul | findstr /R /C:"emulator-[0-9]* device" >nul
if %ERRORLEVEL%==0 (
  echo Emulator is already running.
  "%ADB%" devices
  echo.
  pause
  exit /b 0
)

if /I "%MODE%"=="safe" (
  set "GPU_FLAG=-gpu angle_indirect"
  set "MODE_LABEL=SAFE (software GPU)"
) else (
  set "GPU_FLAG=-gpu host"
  set "MODE_LABEL=NORMAL"
)

echo Starting Android emulator: %AVD_NAME%
echo Mode: %MODE_LABEL%
echo SDK: %SDK_ROOT%
echo.
if /I "%MODE%"=="safe" (
  echo Tip: If it still crashes, open Android Studio ^> Device Manager ^> Wipe Data on this AVD.
  echo.
)

start "Android Emulator" "%EMULATOR%" -avd %AVD_NAME% %GPU_FLAG% -no-snapshot-load -no-boot-anim

echo Waiting for emulator to boot (up to 4 minutes)...
set /a COUNT=0

:wait_loop
timeout /t %BOOT_WAIT_SECONDS% /nobreak >nul
"%ADB%" devices 2>nul | findstr /R /C:"emulator-[0-9]* device" >nul
if %ERRORLEVEL%==0 goto ready

set /a COUNT+=1
if !COUNT! GEQ %BOOT_TIMEOUT_LOOPS% (
  echo.
  echo [WARN] Emulator is still booting after 4 minutes.
  echo If the emulator window closed/crashed, try start-emulator-safe.bat
  pause
  exit /b 1
)

echo   ... booting (!COUNT!/%BOOT_TIMEOUT_LOOPS%)
goto wait_loop

:ready
echo.
echo Emulator is ready.
"%ADB%" devices
echo.
pause
exit /b 0
