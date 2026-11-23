@echo off
chcp 65001 >nul
title Antigravity Meme Picker 卸载程序
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0uninstall.ps1"
pause
