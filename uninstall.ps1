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
    [System.IO.File]::WriteAllText($targetJs, $existing, [System.Text.Encoding]::UTF8)
    Write-Host "[+] 卸载完成，已清理注入代码。" -ForegroundColor Green
} else {
    Write-Host "[!] 未检测到当前文件中有安装标记。" -ForegroundColor Yellow
}

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  请刷新或重启 Antigravity 客户端生效    " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Yellow
