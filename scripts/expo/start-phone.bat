@echo off
REM Start Metro for physical phone (same Wi-Fi as PC).
chcp 65001 >nul
cd /d "%~dp0..\.."

echo.
echo  Phone dev: Metro + Dev Client
echo  =============================
echo  - Phone and PC must be on the SAME Wi-Fi
echo  - Open "地球 Online" on your phone after Metro starts
echo  - If it does not connect, shake phone ^> Enter URL manually
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  set "IP=%%a"
  goto :found_ip
)
:found_ip
set IP=%IP: =%
if defined IP echo  Your PC IP (try this in app): %IP%:8081
echo.

npx expo start --dev-client --lan
pause
