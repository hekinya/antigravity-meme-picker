# Antigravity Custom-Theme Loader Installer (Windows)
# 自动探测 Antigravity 安装目录，注入 current.js 并在 app.asar 中挂载轻量级加载器

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Antigravity Custom-Theme Loader Apply " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. 自动探测 Antigravity 安装目录
$appCandidates = @(
    "D:\Antigravity",
    "$env:LOCALAPPDATA\Programs\Antigravity",
    "C:\Program Files\Antigravity"
)

$appDir = $null
foreach ($dir in $appCandidates) {
    if (Test-Path (Join-Path $dir "resources\app.asar")) {
        $appDir = $dir
        break
    }
}

if (-not $appDir) {
    Write-Host "[X] 未能自动检测到 Antigravity 安装目录（未找到 resources\app.asar）！" -ForegroundColor Red
    pause
    exit 1
}

$resDir = Join-Path $appDir "resources"
$asar = Join-Path $resDir "app.asar"
$newAsar = Join-Path $resDir "app.asar.custom-theme-new"
$bakAsar = Join-Path $resDir "app.asar.pre-custom-theme.bak"
$exe = Join-Path $appDir "Antigravity.exe"
$memeInstallScript = Join-Path $PSScriptRoot "install.ps1"

Write-Host "[+] 检测到 Antigravity 目录: $appDir" -ForegroundColor Green

# 2. 注入或更新 resources\custom-theme\current.js
if (Test-Path $memeInstallScript) {
    Write-Host "[0/4] 正在注入/更新 resources\custom-theme\current.js..." -ForegroundColor Yellow
    powershell -NoProfile -ExecutionPolicy Bypass -File $memeInstallScript
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[X] install.ps1 执行失败。" -ForegroundColor Red
        pause
        exit 1
    }
}

# 3. 检查 Node.js 与 npx
if (-not (Get-Command node -ErrorAction SilentlyContinue) -or -not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Host "[X] 未检测到 Node.js / npx，请先安装 Node.js 后重试。" -ForegroundColor Red
    pause
    exit 1
}

# 4. 解包当前 app.asar、注入轻量级 customThemeLoader.js 并重新打包
Write-Host "[1/4] 正在为当前 app.asar 构建轻量加载器..." -ForegroundColor Yellow
$work = Join-Path $env:TEMP ("ag-asar-patch-" + [guid]::NewGuid().ToString("N").Substring(0, 8))
$needsSwap = $true
try {
    npx --yes @electron/asar extract $asar $work
    if ($LASTEXITCODE -ne 0) { throw "asar extract 失败" }

    $utilsPath = Join-Path $work "dist\utils.js"
    if (-not (Test-Path $utilsPath)) { throw "未找到 dist\utils.js，当前客户端结构可能不受支持" }
    $utilsText = [System.IO.File]::ReadAllText($utilsPath, [System.Text.Encoding]::UTF8)

    $loaderCode = @'
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachCustomThemeLoader = attachCustomThemeLoader;

const fs = require("fs");
const path = require("path");

function readTextNoBom(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    const raw = fs.readFileSync(filePath, "utf8");
    return raw.replace(/^\uFEFF/, "");
}

function attachCustomThemeLoader(win, hubContents) {
    if (!win || !hubContents) {
        return;
    }
    const inject = () => {
        try {
            if (win.isDestroyed?.() || hubContents.isDestroyed?.()) {
                return;
            }
            const resourcesDir = process.resourcesPath || "";
            if (!resourcesDir) {
                return;
            }
            const themeDir = path.join(resourcesDir, "custom-theme");
            const cssCode = readTextNoBom(path.join(themeDir, "current.css"));
            if (cssCode && cssCode.trim().length > 0) {
                void hubContents.insertCSS(cssCode).catch((err) => {
                    console.error("[custom-theme-loader] insertCSS failed:", err);
                });
            }
            const jsCode = readTextNoBom(path.join(themeDir, "current.js"));
            if (jsCode && jsCode.trim().length > 0) {
                void hubContents.executeJavaScript(jsCode, true).catch((err) => {
                    console.error("[custom-theme-loader] executeJavaScript failed:", err);
                });
            }
        } catch (err) {
            console.error("[custom-theme-loader] inject error:", err);
        }
    };

    hubContents.on("did-finish-load", inject);
    win.on("closed", () => {
        try {
            hubContents.off?.("did-finish-load", inject);
        } catch (_) {}
    });
}
'@
    $loaderPath = Join-Path $work "dist\customThemeLoader.js"
    $alreadyPatched = $utilsText.Contains("customThemeLoader") -and (Test-Path $loaderPath)
    if ($alreadyPatched) {
        Write-Host "[+] 检测到当前 app.asar 已挂载 customThemeLoader，无需重复替换！" -ForegroundColor Green
        Write-Host "    直接在 Antigravity 客户端按 Ctrl + R 刷新即可生效。" -ForegroundColor Cyan
        $needsSwap = $false
    } else {
        [System.IO.File]::WriteAllText($loaderPath, $loaderCode, (New-Object System.Text.UTF8Encoding($false)))

        if (-not $utilsText.Contains("customThemeLoader")) {
            $anchor = "(0, previewViewers_1.registerPreviewViewer)(hubContents);"
            if (-not $utilsText.Contains($anchor)) {
                throw "未在 dist\utils.js 中找到注入锚点（客户端版本结构可能已变化）"
            }
            $injectSnippet = $anchor + "`n    try {`n        require('./customThemeLoader').attachCustomThemeLoader(win, hubContents);`n    }`n    catch (err) {`n        console.error('[custom-theme-loader] attach failed:', err);`n    }"
            $utilsText = $utilsText.Replace($anchor, $injectSnippet)
            [System.IO.File]::WriteAllText($utilsPath, $utilsText, (New-Object System.Text.UTF8Encoding($false)))
        }

        node --check $loaderPath
        if ($LASTEXITCODE -ne 0) { throw "customThemeLoader.js 语法检查失败" }
        node --check $utilsPath
        if ($LASTEXITCODE -ne 0) { throw "utils.js 语法检查失败" }

        if (Test-Path $newAsar) { Remove-Item $newAsar -Force }
        npx --yes @electron/asar pack $work $newAsar
        if ($LASTEXITCODE -ne 0 -or -not (Test-Path $newAsar)) { throw "asar pack 失败" }
    }
} finally {
    Remove-Item $work -Recurse -Force -ErrorAction SilentlyContinue
}

if (-not $needsSwap) {
    Start-Sleep -Seconds 2
    exit 0
}

Write-Host "[2/4] 正在关闭运行中的 Antigravity 进程..." -ForegroundColor Yellow
Get-Process -Name "Antigravity" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 等待文件锁释放（最多 10 秒）
$unlocked = $false
for ($i = 0; $i -lt 10; $i++) {
    try {
        $fs = [System.IO.File]::Open($asar, 'Open', 'ReadWrite', 'None')
        $fs.Close()
        $unlocked = $true
        break
    } catch {
        Start-Sleep -Seconds 1
    }
}

if (-not $unlocked) {
    Write-Host "[X] app.asar 仍被占用，请先在系统托盘彻底退出 Antigravity 后重试。" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "[3/4] 备份并替换 app.asar..." -ForegroundColor Yellow
Copy-Item -Path $asar -Destination $bakAsar -Force
Write-Host "      已备份至: $bakAsar" -ForegroundColor DarkGray

try {
    Move-Item -Path $newAsar -Destination $asar -Force
} catch {
    Write-Host "[X] 替换失败: $_" -ForegroundColor Red
    if (Test-Path $bakAsar) {
        Copy-Item -Path $bakAsar -Destination $asar -Force
        Write-Host "[!] 已自动从备份恢复 app.asar" -ForegroundColor Yellow
    }
    pause
    exit 1
}

Write-Host "[4/4] 正在重新启动 Antigravity..." -ForegroundColor Green
if (Test-Path $exe) {
    Start-Process -FilePath $exe
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  完成！Antigravity 启动后将自动加载     " -ForegroundColor Green
Write-Host "  resources\custom-theme\current.js     " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Start-Sleep -Seconds 2
