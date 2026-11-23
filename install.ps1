# Antigravity Meme Picker - One-Click Installer
# 自动寻找 Antigravity 安装路径并挂载表情包抽屉

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Antigravity Meme Picker Installer     " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$distFile = Join-Path $PSScriptRoot "dist\antigravity-meme-picker.bundle.js"
if (-not (Test-Path $distFile)) {
    Write-Host "[!] 未找到构建产物，正在自动执行打包构建..." -ForegroundColor Yellow
    python (Join-Path $PSScriptRoot "build.py")
}

$bundleContent = Get-Content -Path $distFile -Raw -Encoding UTF8

# 1. 探测 Antigravity 目录
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

if (-not $targetJs) {
    # 尝试查找 resources 目录
    $resCandidates = @(
        "D:\Antigravity\resources",
        "$env:LOCALAPPDATA\Programs\Antigravity\resources",
        "C:\Program Files\Antigravity\resources"
    )
    foreach ($res in $resCandidates) {
        if (Test-Path $res) {
            $themeDir = Join-Path $res "custom-theme"
            if (-not (Test-Path $themeDir)) { New-Item -ItemType Directory -Path $themeDir -Force }
            $targetJs = Join-Path $themeDir "current.js"
            if (-not (Test-Path $targetJs)) { "" | Out-File -FilePath $targetJs -Encoding UTF8 }
            break
        }
    }
}

if (-not $targetJs) {
    Write-Host "[X] 未能自动检测到 Antigravity 安装目录，请确认客户端已安装！" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "[+] 找到目标脚本: $targetJs" -ForegroundColor Green

$existing = ""
$backupPath = $null
if (Test-Path $targetJs) {
    $existing = Get-Content -Path $targetJs -Raw -Encoding UTF8
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupPath = "$targetJs.bak.$timestamp"
    Copy-Item -Path $targetJs -Destination $backupPath -Force
    Write-Host "[+] 已生成备份文件: $backupPath" -ForegroundColor DarkGray
}

$legacyStartTag = "// === CASEY MEME INJECTOR START ==="
$legacyEndTag = "// === CASEY MEME INJECTOR END ==="
if ($existing.Contains($legacyStartTag) -and $existing.Contains($legacyEndTag)) {
    $legacyRegex = "(?s)\r?\n?" + [regex]::Escape($legacyStartTag) + ".*?" + [regex]::Escape($legacyEndTag) + "\r?\n?"
    $existing = [regex]::Replace($existing, $legacyRegex, "`n")
    Write-Host "[!] 检测到历史旧版注入块，已自动清理迁移。" -ForegroundColor Yellow
}

$startTag = "// === AG_MEME_PICKER_START ==="
$endTag = "// === AG_MEME_PICKER_END ==="
$block = "`n`n$startTag`n$bundleContent`n$endTag`n"

if ($existing.Contains($startTag) -and $existing.Contains($endTag)) {
    $regex = "(?s)" + [regex]::Escape($startTag) + ".*?" + [regex]::Escape($endTag)
    $newContent = [regex]::Replace($existing, $regex, $block)
    Write-Host "[+] 检测到已有安装，已更新为最新版。" -ForegroundColor Yellow
} else {
    $newContent = $existing + $block
    Write-Host "[+] 成功注入表情包核心引擎。" -ForegroundColor Green
}

try {
    [System.IO.File]::WriteAllText($targetJs, $newContent, [System.Text.Encoding]::UTF8)
} catch {
    Write-Host "[X] 写入目标文件失败: $_" -ForegroundColor Red
    if ($backupPath -and (Test-Path $backupPath)) {
        Copy-Item -Path $backupPath -Destination $targetJs -Force
        Write-Host "[!] 已从备份自动回滚恢复: $targetJs" -ForegroundColor Yellow
    }
    pause
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  安装成功！请刷新或重启 Antigravity 客户端  " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
