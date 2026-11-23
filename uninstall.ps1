# Antigravity Meme Picker - One-Click Uninstaller
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  Antigravity Meme Picker 卸载程序      " -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

$candidates = @(
    "D:\Antigravity\resources\custom-theme\current.js",
    "$env:LOCALAPPDATA\Programs\Antigravity\resources\custom-theme\current.js",
    "C:\Program Files\Antigravity\resources\custom-theme\current.js"
)

$targetJs = $null
foreach ($path in $candidates) {
    if (Test-Path $path) {
        $targetJs = $path
        break
    }
}

if (-not $targetJs -or -not (Test-Path $targetJs)) {
    Write-Host "[X] 未找到已安装的目标文件。" -ForegroundColor Red
    pause
    exit 1
}

$existing = Get-Content -Path $targetJs -Raw -Encoding UTF8
$changed = $false
$startTag = "// === AG_MEME_PICKER_START ==="
$endTag = "// === AG_MEME_PICKER_END ==="

if ($existing.Contains($startTag) -and $existing.Contains($endTag)) {
    $regex = "(?s)\r?\n?" + [regex]::Escape($startTag) + ".*?" + [regex]::Escape($endTag) + "\r?\n?"
    $existing = [regex]::Replace($existing, $regex, "")
    $changed = $true
}

$legacyStartTag = "// === CASEY MEME INJECTOR START ==="
$legacyEndTag = "// === CASEY MEME INJECTOR END ==="
if ($existing.Contains($legacyStartTag) -and $existing.Contains($legacyEndTag)) {
    $legacyRegex = "(?s)\r?\n?" + [regex]::Escape($legacyStartTag) + ".*?" + [regex]::Escape($legacyEndTag) + "\r?\n?"
    $existing = [regex]::Replace($existing, $legacyRegex, "")
    $changed = $true
}

if ($changed) {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupPath = "$targetJs.bak.$timestamp"
    Copy-Item -Path $targetJs -Destination $backupPath -Force
    Write-Host "[+] 已生成卸载前备份: $backupPath" -ForegroundColor DarkGray
    try {
        [System.IO.File]::WriteAllText($targetJs, $existing, [System.Text.Encoding]::UTF8)
        Write-Host "[+] 卸载完成，已清理注入代码。" -ForegroundColor Green
    } catch {
        Write-Host "[X] 卸载写入失败: $_" -ForegroundColor Red
        if (Test-Path $backupPath) {
            Copy-Item -Path $backupPath -Destination $targetJs -Force
            Write-Host "[!] 已从备份自动回滚恢复: $targetJs" -ForegroundColor Yellow
        }
        pause
        exit 1
    }
} else {
    Write-Host "[!] 未检测到当前文件中有安装标记。" -ForegroundColor Yellow
}

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  请刷新或重启 Antigravity 客户端生效    " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Yellow
