@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Instalar-EdyMotion.ps1"
if errorlevel 1 echo Falha ao instalar. Confira a mensagem acima.
pause
