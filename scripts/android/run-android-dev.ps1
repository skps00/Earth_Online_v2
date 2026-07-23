# Build & install Expo Dev Client on Android emulator/device
# Source of truth: this repo under Documents. Native build syncs to C:\eo (Windows MAX_PATH).

$ErrorActionPreference = "Stop"

$AvdName = "Pixel_9_Pro_XL"
$BuildRoot = "C:\eo"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

New-Item -ItemType Directory -Force -Path "C:\gradle-eo", "C:\tmp" | Out-Null
$env:GRADLE_USER_HOME = "C:\gradle-eo"
$env:TEMP = "C:\tmp"
$env:TMP = "C:\tmp"

Write-Host "Source:  $ProjectRoot"
Write-Host "Build:   $BuildRoot (sync for native compile only)"
Write-Host "GRADLE_USER_HOME: $env:GRADLE_USER_HOME"

robocopy $ProjectRoot $BuildRoot /E /XD ".git" "android\app\.cxx" "android\app\build" "android\build" /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
if ($LASTEXITCODE -gt 8) { throw "robocopy failed with exit $LASTEXITCODE" }

Set-Location $BuildRoot
$env:ORG_GRADLE_PROJECT_reactNativeArchitectures = "x86_64"

function Get-SdkRoot {
  if ($env:ANDROID_HOME) { return $env:ANDROID_HOME }
  if ($env:ANDROID_SDK_ROOT) { return $env:ANDROID_SDK_ROOT }
  return Join-Path $env:LOCALAPPDATA "Android\Sdk"
}

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
Set-Location "$BuildRoot\android"
.\gradlew.bat app:assembleDebug -x lint -x test --configure-on-demand -PreactNativeDevServerPort=8081 -PreactNativeArchitectures=x86_64

$apk = "$BuildRoot\android\app\build\outputs\apk\debug\app-debug.apk"
if (!(Test-Path $apk)) {
  throw "APK not found at: $apk"
}
adb reverse tcp:8081 tcp:8081 | Out-Null
adb install -r $apk | Out-Host
adb shell am start -a android.intent.action.VIEW -d "exp+earth-online://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8081" -p com.skps00.earthonline | Out-Host

Write-Host "Done. Start Metro from build path (matches installed native binary):"
Write-Host "  cd C:\eo"
Write-Host "  npx expo start --dev-client --localhost --android"
