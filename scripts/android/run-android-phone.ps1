# Build & install Expo Dev Client on a physical Android phone (USB).
# Prerequisites: USB debugging ON, phone authorized on this PC.
# Run in PowerShell OUTSIDE Cursor.

$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Force -Path "C:\gradle", "C:\tmp" | Out-Null
$env:GRADLE_USER_HOME = "C:\gradle"
$env:TEMP = "C:\tmp"
$env:TMP = "C:\tmp"

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$WorkspaceRoot = Split-Path -Parent $ProjectRoot
$SubstDrive = "X:"

try { subst $SubstDrive /D | Out-Null } catch {}
subst $SubstDrive $WorkspaceRoot | Out-Null
$ShortProjectRoot = Join-Path $SubstDrive "Earth_Online_v.2.0"
Set-Location $ShortProjectRoot

Write-Host "Project: $ProjectRoot"
Write-Host "Short path: $ShortProjectRoot"

# Real phones use arm64 (not emulator x86_64)
$env:ORG_GRADLE_PROJECT_reactNativeArchitectures = "arm64-v8a"

$deviceLines = @(adb devices | Select-Object -Skip 1 | Where-Object { $_ -match "\tdevice\s*$" })
$physicalLines = @($deviceLines | Where-Object { $_ -notmatch "^emulator-" })

if ($deviceLines.Count -eq 0) {
  Write-Host ""
  Write-Host "[ERROR] No Android device found."
  Write-Host "  1. Enable Developer options + USB debugging on your phone"
  Write-Host "  2. Connect USB cable (file transfer mode)"
  Write-Host "  3. Tap 'Allow' on the phone when prompted"
  Write-Host "  4. Run: adb devices"
  exit 1
}

if ($physicalLines.Count -eq 0) {
  Write-Host "[WARN] Only emulator detected. This script is for a physical phone."
  Write-Host "       Disconnect emulator or use run-android-dev.ps1 instead."
  exit 1
}

Write-Host ""
Write-Host "Connected devices:"
adb devices
Write-Host ""
Write-Host "Building Dev Client for phone (arm64, first run may take 15-25 min)..."

npx expo run:android --device

Write-Host ""
Write-Host "Done. Next:"
Write-Host "  1. Run dev.bat -> option 7 (Start Expo for Phone)"
Write-Host "  2. Open '地球 Online' on your phone"
Write-Host "  3. Phone and PC must be on the SAME Wi-Fi"
