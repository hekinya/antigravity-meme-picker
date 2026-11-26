@echo off
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$appDir = @('D:\Antigravity', \"$env:LOCALAPPDATA\Programs\Antigravity\", 'C:\Program Files\Antigravity') | Where-Object { Test-Path (Join-Path $_ 'resources\app.asar.pre-custom-theme.bak') } | Select-Object -First 1;" ^
  "if (-not $appDir) { Write-Host '[X] 未找到 app.asar.pre-custom-theme.bak 备份文件' -ForegroundColor Red; pause; exit 1 }" ^
  "$asar = Join-Path $appDir 'resources\app.asar';" ^
  "$bak = Join-Path $appDir 'resources\app.asar.pre-custom-theme.bak';" ^
  "$exe = Join-Path $appDir 'Antigravity.exe';" ^
  "Get-Process -Name 'Antigravity' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue;" ^
  "Start-Sleep -Seconds 2;" ^
  "Copy-Item -Path $bak -Destination $asar -Force;" ^
  "Write-Host \"[+] 已回滚恢复原 app.asar: $asar\" -ForegroundColor Green;" ^
  "if (Test-Path $exe) { Start-Process -FilePath $exe }"
