@echo off
REM Start Android emulator (safe mode: software GPU).
chcp 65001 >nul
call "%~dp0lib\emulator-common.bat" safe
exit /b %ERRORLEVEL%
