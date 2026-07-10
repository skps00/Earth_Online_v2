@echo off
REM Start Android emulator (normal mode, cold boot).
chcp 65001 >nul
call "%~dp0lib\emulator-common.bat" normal
exit /b %ERRORLEVEL%
