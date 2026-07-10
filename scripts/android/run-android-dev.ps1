# Build & install Expo Dev Client on Android emulator/device
# Run this in Windows PowerShell OUTSIDE Cursor.
# Uses a SUBST drive to avoid Windows MAX_PATH errors in native C++ builds.

$ErrorActionPreference = "Stop"

$AvdName = "Pixel_9_Pro_XL"

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
Write-Host "GRADLE_USER_HOME: $env:GRADLE_USER_HOME"

# Emulator uses x86_64 — skip arm64 to speed up and reduce path issues
$env:ORG_GRADLE_PROJECT_reactNativeArchitectures = "x86_64"

function Get-SdkRoot {
  if ($env:ANDROID_HOME) { return $env:ANDROID_HOME }
  if ($env:ANDROID_SDK_ROOT) { return $env:ANDROID_SDK_ROOT }
  return Join-Path $env:LOCALAPPDATA "Android\Sdk"
}

# Ensure emulator is running (same flags as scripts/android/lib/emulator-common.bat)
$sdkRoot = Get-SdkRoot
$emulatorExe = Join-Path $sdkRoot "emulator\emulator.exe"
$devices = adb devices 2>&1 | Out-String
if ($devices -notmatch "device\s*$" -and $devices -notmatch "emulator-\d+\s+device") {
    Write-Host "Starting emulator $AvdName (cold boot)..."
    Start-Process -FilePath $emulatorExe -ArgumentList @(
        "-avd", $AvdName,
        "-gpu", "host",
        "-no-snapshot-load",
        "-no-boot-anim"
    )
    $deadline = (Get-Date).AddMinutes(4)
    do {
        Start-Sleep -Seconds 5
        $devices = adb devices 2>&1 | Out-String
        if ($devices -match "emulator-\d+\s+device") { break }
        Write-Host "Waiting for emulator..."
    } while ((Get-Date) -lt $deadline)
}

Write-Host "Building Dev Client (first run may take 10-20 min)..."
Set-Location "$ShortProjectRoot\android"
.\gradlew.bat app:assembleDebug -x lint -x test --configure-on-demand -PreactNativeDevServerPort=8081 -PreactNativeArchitectures=x86_64

$apk = "$ShortProjectRoot\android\app\build\outputs\apk\debug\app-debug.apk"
if (!(Test-Path $apk)) {
  throw "APK not found at: $apk"
}
adb install -r $apk | Out-Host
adb shell monkey -p com.skps00.earthonline -c android.intent.category.LAUNCHER 1 | Out-Host

Set-Location $ShortProjectRoot

Write-Host "Done. Next time use: npx expo start --dev-client"
