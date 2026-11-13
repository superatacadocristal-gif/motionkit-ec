@echo off
setlocal
cd /d "%~dp0"
echo Salve o projeto e feche o EffectCraft antes de instalar.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Instalar-EdyTools.ps1"
if errorlevel 1 (
  echo Falha na instalacao. Confira a mensagem acima.
) else (
  echo Instalacao concluida.
)
pause
